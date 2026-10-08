const Employee = require("../models/Employee");

// ==========================================
// PROTECT ROUTE
// ==========================================
const protect = async (req, res, next) => {
    try {
        const employeeId = req.headers["employee-id"];

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const employee = await Employee.findOne({
            employeeId: employeeId.toUpperCase()
        }).select("-password");

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Employee not found."
            });
        }

        if (employee.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });
        }

        req.user = employee;

        next();

    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication server error."
        });
    }
};


// ==========================================
// ADMIN ONLY
// ==========================================
const adminOnly = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (req.user.role !== "Admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required."
        });
    }

    next();
};


// ==========================================
// CHECK OWN RECORD
// ==========================================
const ownRecordOrAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    // Admin can access everything
    if (req.user.role === "Admin") {
        return next();
    }

    // Get employee ID from request
    const requestedEmployeeId =
        req.params.employeeId ||
        req.body.employeeId ||
        req.query.employeeId;

    if (!requestedEmployeeId) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    if (
        requestedEmployeeId.toUpperCase() !==
        req.user.employeeId.toUpperCase()
    ) {
        return res.status(403).json({
            success: false,
            message: "You can only access your own data."
        });
    }

    next();
};


module.exports = {
    protect,
    adminOnly,
    ownRecordOrAdmin
};