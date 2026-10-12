
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");

// ==========================================
// CREATE PAYROLL - ADMIN ONLY
// ==========================================
const createPayroll = async (req, res) => {
    try {
        const {
            employeeId,
            month,
            basicSalary,
            allowances,
            deductions
        } = req.body;

        if (!employeeId || !month || basicSalary === undefined) {
            return res.status(400).json({
                success: false,
                message: "Employee ID, month and basic salary are required."
            });
        }

        const empId = String(employeeId).trim().toUpperCase();
        const payrollMonth = String(month).trim();

        if (!empId || !payrollMonth) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and month cannot be empty."
            });
        }

        const employee = await Employee.findOne({
            employeeId: empId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        const basic = Number(basicSalary);
        const allowance = allowances === undefined || allowances === ""
            ? 0
            : Number(allowances);
        const deduction = deductions === undefined || deductions === ""
            ? 0
            : Number(deductions);

        if (
            !Number.isFinite(basic) ||
            !Number.isFinite(allowance) ||
            !Number.isFinite(deduction)
        ) {
            return res.status(400).json({
                success: false,
                message: "Salary values must be valid numbers."
            });
        }

        if (basic < 0 || allowance < 0 || deduction < 0) {
            return res.status(400).json({
                success: false,
                message: "Salary values cannot be negative."
            });
        }

        const netSalary = basic + allowance - deduction;

        if (!Number.isFinite(netSalary) || netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Net salary cannot be negative."
            });
        }

        const existingPayroll = await Payroll.findOne({
            employeeId: empId,
            month: payrollMonth
        });

        if (existingPayroll) {
            return res.status(409).json({
                success: false,
                message: "Payroll already exists for this employee and month."
            });
        }

        const payroll = await Payroll.create({
            employeeId: empId,
            month: payrollMonth,
            basicSalary: basic,
            allowances: allowance,
            deductions: deduction,
            netSalary,
            paymentStatus: "Pending",
            payoutStatus: "Not Started"
        });

        return res.status(201).json({
            success: true,
            message: "Payroll created successfully.",
            data: payroll
        });
    } catch (error) {
        console.error("CREATE PAYROLL ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Payroll already exists for this employee and month."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create payroll."
        });
    }
};

// ==========================================
// GET PAYROLL
// ADMIN = ALL
// EMPLOYEE = OWN
// ==========================================
const getPayroll = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role !== "Admin") {
            filter.employeeId = String(req.user.employeeId).toUpperCase();
        }

        const payrolls = await Payroll.find(filter).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: payrolls.length,
            data: payrolls
        });
    } catch (error) {
        console.error("GET PAYROLL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch payroll records."
        });
    }
};

// ==========================================
// UPDATE PAYROLL - ADMIN ONLY
// Payment status cannot be manually changed.
// ==========================================
const updatePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found."
            });
        }

        // Never edit salary after a payout has started.
        if (
            payroll.payoutStatus &&
            payroll.payoutStatus !== "Not Started"
        ) {
            return res.status(409).json({
                success: false,
                message: "Payroll cannot be edited after payout processing has started."
            });
        }

        const {
            month,
            basicSalary,
            allowances,
            deductions
        } = req.body;

        if (month !== undefined) {
            if (!String(month).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Month cannot be empty."
                });
            }

            payroll.month = String(month).trim();
        }

        if (basicSalary !== undefined) {
            payroll.basicSalary = Number(basicSalary);
        }

        if (allowances !== undefined) {
            payroll.allowances = Number(allowances);
        }

        if (deductions !== undefined) {
            payroll.deductions = Number(deductions);
        }

        const values = [
            payroll.basicSalary,
            payroll.allowances,
            payroll.deductions
        ];

        if (!values.every(Number.isFinite)) {
            return res.status(400).json({
                success: false,
                message: "Salary values must be valid numbers."
            });
        }

        if (values.some(value => value < 0)) {
            return res.status(400).json({
                success: false,
                message: "Salary values cannot be negative."
            });
        }

        payroll.netSalary =
            payroll.basicSalary +
            payroll.allowances -
            payroll.deductions;

        if (!Number.isFinite(payroll.netSalary) || payroll.netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Net salary cannot be negative."
            });
        }

        // Ignore paymentStatus/payoutStatus from req.body.
        await payroll.save();

        return res.status(200).json({
            success: true,
            message: "Payroll updated successfully.",
            data: payroll
        });
    } catch (error) {
        console.error("UPDATE PAYROLL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update payroll."
        });
    }
};

// ==========================================
// DELETE PAYROLL - ADMIN ONLY
// ==========================================
const deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found."
            });
        }

        if (
            payroll.paymentStatus === "Paid" ||
            (payroll.payoutStatus &&
             payroll.payoutStatus !== "Not Started")
        ) {
            return res.status(409).json({
                success: false,
                message: "Payroll cannot be deleted after payout processing has started."
            });
        }

        await payroll.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Payroll deleted successfully."
        });
    } catch (error) {
        console.error("DELETE PAYROLL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete payroll."
        });
    }
};

module.exports = {
    createPayroll,
    getPayroll,
    updatePayroll,
    deletePayroll
};