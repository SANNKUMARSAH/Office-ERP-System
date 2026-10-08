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
            deductions,
            paymentStatus
        } = req.body;

        if (
            !employeeId ||
            !month ||
            basicSalary === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Employee ID, month and basic salary are required."
            });
        }

        const empId = employeeId.toUpperCase();

        // Check employee
        const employee = await Employee.findOne({
            employeeId: empId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        // Convert numbers
        const basic = Number(basicSalary);
        const allowance = Number(allowances || 0);
        const deduction = Number(deductions || 0);

        if (
            Number.isNaN(basic) ||
            Number.isNaN(allowance) ||
            Number.isNaN(deduction)
        ) {
            return res.status(400).json({
                success: false,
                message: "Salary values must be numbers."
            });
        }

        if (basic < 0 || allowance < 0 || deduction < 0) {
            return res.status(400).json({
                success: false,
                message: "Salary values cannot be negative."
            });
        }

        const netSalary =
            basic +
            allowance -
            deduction;

        if (netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Net salary cannot be negative."
            });
        }

        // Check duplicate payroll
        const existingPayroll = await Payroll.findOne({
            employeeId: empId,
            month: month
        });

        if (existingPayroll) {
            return res.status(400).json({
                success: false,
                message: "Payroll already exists for this employee and month."
            });
        }

        const payroll = new Payroll({
            employeeId: empId,
            month,
            basicSalary: basic,
            allowances: allowance,
            deductions: deduction,
            netSalary,
            paymentStatus:
                paymentStatus === "Paid"
                    ? "Paid"
                    : "Pending"
        });

        await payroll.save();

        res.status(201).json({
            success: true,
            message: "Payroll created successfully.",
            data: payroll
        });

    } catch (error) {

        console.error("CREATE PAYROLL ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
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

        let filter = {};

        if (req.user.role !== "Admin") {
            filter.employeeId =
                req.user.employeeId.toUpperCase();
        }

        const payrolls = await Payroll.find(filter)
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: payrolls.length,
            data: payrolls
        });

    } catch (error) {

        console.error("GET PAYROLL ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE PAYROLL - ADMIN ONLY
// ==========================================
const updatePayroll = async (req, res) => {
    try {

        const payroll =
            await Payroll.findById(
                req.params.id
            );

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found."
            });
        }

        const {
            month,
            basicSalary,
            allowances,
            deductions,
            paymentStatus
        } = req.body;

        if (month !== undefined) {
            payroll.month = month;
        }

        if (basicSalary !== undefined) {
            payroll.basicSalary =
                Number(basicSalary);
        }

        if (allowances !== undefined) {
            payroll.allowances =
                Number(allowances);
        }

        if (deductions !== undefined) {
            payroll.deductions =
                Number(deductions);
        }

        if (paymentStatus !== undefined) {

            if (
                !["Pending", "Paid"]
                    .includes(paymentStatus)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment status."
                });
            }

            payroll.paymentStatus =
                paymentStatus;
        }

        payroll.netSalary =
            payroll.basicSalary +
            payroll.allowances -
            payroll.deductions;

        if (payroll.netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Net salary cannot be negative."
            });
        }

        await payroll.save();

        res.status(200).json({
            success: true,
            message: "Payroll updated successfully.",
            data: payroll
        });

    } catch (error) {

        console.error("UPDATE PAYROLL ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


// ==========================================
// DELETE PAYROLL - ADMIN ONLY
// ==========================================
const deletePayroll = async (req, res) => {
    try {

        const payroll =
            await Payroll.findById(
                req.params.id
            );

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found."
            });
        }

        await payroll.deleteOne();

        res.status(200).json({
            success: true,
            message: "Payroll deleted successfully."
        });

    } catch (error) {

        console.error("DELETE PAYROLL ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


module.exports = {
    createPayroll,
    getPayroll,
    updatePayroll,
    deletePayroll
};