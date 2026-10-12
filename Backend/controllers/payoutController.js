
const crypto = require("crypto");
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");

const BASE_URL = "https://api.razorpay.com/v1";

// ==========================================
// RAZORPAYX API HELPER
// ==========================================
const razorpayRequest = async (endpoint, method, body, extraHeaders = {}) => {
    const keyId = process.env.RAZORPAYX_KEY_ID;
    const keySecret = process.env.RAZORPAYX_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("RazorpayX credentials are not configured.");
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            ...extraHeaders
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.error?.description || "RazorpayX API request failed."
        );
        error.status = response.status;
        throw error;
    }

    return data;
};

// ==========================================
// PAY EMPLOYEE SALARY - ADMIN ONLY
// POST /api/payouts/salary/:payrollId
// ==========================================
const paySalary = async (req, res) => {
    let payroll;
    let payoutRequestAttempted = false;

    try {
        const { payrollId } = req.params;

        if (!/^[a-f\d]{24}$/i.test(payrollId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID."
            });
        }

        payroll = await Payroll.findById(payrollId);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found."
            });
        }

        if (
            payroll.paymentStatus === "Paid" ||
            payroll.payoutStatus === "Processed"
        ) {
            return res.status(409).json({
                success: false,
                message: "This salary has already been paid."
            });
        }

        if (
            payroll.payoutStatus &&
            payroll.payoutStatus !== "Not Started"
        ) {
            return res.status(409).json({
                success: false,
                message: "A payout has already been started. Check its status before retrying.",
                payoutStatus: payroll.payoutStatus,
                payoutId: payroll.razorpayPayoutId || null
            });
        }

        if (
            !Number.isFinite(payroll.netSalary) ||
            payroll.netSalary < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Net salary must be at least ₹1."
            });
        }

        const employee = await Employee.findOne({
            employeeId: payroll.employeeId.toUpperCase(),
            status: "Active"
        }).select("+bankAccountNumber");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Active employee not found."
            });
        }

        if (
            !employee.bankAccountHolderName ||
            !employee.bankAccountNumber ||
            !employee.bankIfscCode
        ) {
            return res.status(400).json({
                success: false,
                message: "Employee bank details are incomplete."
            });
        }

        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(employee.bankIfscCode)) {
            return res.status(400).json({
                success: false,
                message: "Employee IFSC code format is invalid."
            });
        }

        const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;

        if (!accountNumber) {
            return res.status(500).json({
                success: false,
                message: "RazorpayX business account is not configured."
            });
        }

        // Atomically lock payroll against concurrent payout requests.
        const idempotencyKey = crypto.randomUUID();

        const lockedPayroll = await Payroll.findOneAndUpdate(
            {
                _id: payroll._id,
                paymentStatus: "Pending",
                payoutStatus: "Not Started"
            },
            {
                $set: {
                    payoutStatus: "Processing",
                    payoutIdempotencyKey: idempotencyKey
                }
            },
            { new: true }
        );

        if (!lockedPayroll) {
            return res.status(409).json({
                success: false,
                message: "Payroll is already being processed. Refresh and check its status."
            });
        }

        payroll = lockedPayroll;

        // Create RazorpayX contact.
        const contact = await razorpayRequest("/contacts", "POST", {
            name: employee.bankAccountHolderName,
            email: employee.email,
            contact: employee.phone || "",
            type: "employee",
            reference_id: `emp_${employee.employeeId}`.slice(0, 40)
        });

        // Create the beneficiary bank fund account.
        const fundAccount = await razorpayRequest("/fund_accounts", "POST", {
            contact_id: contact.id,
            account_type: "bank_account",
            bank_account: {
                name: employee.bankAccountHolderName,
                ifsc: employee.bankIfscCode,
                account_number: employee.bankAccountNumber
            }
        });

        const amountInPaise = Math.round(payroll.netSalary * 100);

        if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
            throw new Error("Invalid salary amount.");
        }

        // Once this call starts, an error could mean the provider
        // received the request but the response was lost.
        payoutRequestAttempted = true;

        const payout = await razorpayRequest(
            "/payouts",
            "POST",
            {
                account_number: accountNumber,
                fund_account_id: fundAccount.id,
                amount: amountInPaise,
                currency: "INR",
                mode: "NEFT",
                purpose: "salary",
                queue_if_low_balance: false,
                reference_id: `pay_${payroll._id}`.slice(0, 40),
                narration: "Employee Salary"
            },
            {
                "X-Payout-Idempotency": idempotencyKey
            }
        );

        const statusMap = {
            queued: "Pending",
            pending: "Pending",
            processing: "Processing",
            processed: "Processed",
            failed: "Failed",
            rejected: "Failed",
            cancelled: "Failed",
            reversed: "Reversed"
        };

        payroll.razorpayPayoutId = payout.id;
        payroll.payoutUtr = payout.utr || null;
        payroll.payoutStatus = statusMap[payout.status] || "Processing";
        payroll.paymentStatus =
            payout.status === "processed" ? "Paid" : "Pending";

        await payroll.save();

        return res.status(200).json({
            success: true,
            message: payroll.paymentStatus === "Paid"
                ? "Salary payout processed."
                : "Payout submitted. Check the payout status before taking further action.",
            data: {
                payrollId: payroll._id,
                employeeId: payroll.employeeId,
                amount: payroll.netSalary,
                paymentStatus: payroll.paymentStatus,
                payoutStatus: payroll.payoutStatus,
                payoutId: payroll.razorpayPayoutId,
                utr: payroll.payoutUtr
            }
        });
    } catch (error) {
        console.error("SALARY PAYOUT ERROR:", error.message);

        if (payroll?._id) {
            if (!payoutRequestAttempted) {
                // Contact/fund-account setup failed before payout submission.
                await Payroll.updateOne(
                    {
                        _id: payroll._id,
                        payoutStatus: "Processing",
                        razorpayPayoutId: null
                    },
                    {
                        $set: {
                            payoutStatus: "Not Started",
                            payoutIdempotencyKey: null
                        }
                    }
                ).catch(() => {});
            } else {
                // Outcome is uncertain: keep locked to prevent duplicate transfer.
                await Payroll.updateOne(
                    {
                        _id: payroll._id,
                        payoutStatus: "Processing",
                        razorpayPayoutId: null
                    },
                    {
                        $set: { payoutStatus: "Pending" }
                    }
                ).catch(() => {});
            }
        }

        return res.status(error.status || 500).json({
            success: false,
            message: payoutRequestAttempted
                ? "Payout outcome is uncertain. Check RazorpayX Dashboard before retrying."
                : "Unable to prepare the payout. Check employee bank details and RazorpayX configuration."
        });
    }
};

// ==========================================
// REFRESH SALARY PAYOUT STATUS - ADMIN ONLY
// GET /api/payouts/salary/:payrollId/status
// ==========================================
const refreshSalaryPayoutStatus = async (req, res) => {
    try {
        const { payrollId } = req.params;

        if (!/^[a-f\d]{24}$/i.test(payrollId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID."
            });
        }

        const payroll = await Payroll.findById(payrollId);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found."
            });
        }

        if (!payroll.razorpayPayoutId) {
            return res.status(400).json({
                success: false,
                message: "No payout ID is recorded. Check RazorpayX Dashboard if a previous request timed out."
            });
        }

        const payout = await razorpayRequest(
            `/payouts/${encodeURIComponent(payroll.razorpayPayoutId)}`,
            "GET"
        );

        const statusMap = {
            queued: "Pending",
            pending: "Pending",
            processing: "Processing",
            processed: "Processed",
            failed: "Failed",
            rejected: "Failed",
            cancelled: "Failed",
            reversed: "Reversed"
        };

        payroll.payoutStatus = statusMap[payout.status] || "Processing";
        payroll.payoutUtr = payout.utr || payroll.payoutUtr || null;

        payroll.paymentStatus =
            payout.status === "processed" ? "Paid" : "Pending";

        await payroll.save();

        return res.status(200).json({
            success: true,
            data: {
                payrollId: payroll._id,
                paymentStatus: payroll.paymentStatus,
                payoutStatus: payroll.payoutStatus,
                payoutId: payroll.razorpayPayoutId,
                utr: payroll.payoutUtr
            }
        });
    } catch (error) {
        console.error("REFRESH PAYOUT STATUS ERROR:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: "Unable to refresh payout status. Check RazorpayX Dashboard."
        });
    }
};

module.exports = {
    paySalary,
    refreshSalaryPayoutStatus
};