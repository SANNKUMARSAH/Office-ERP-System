
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// ==========================================
// PROTECT ROUTE - JWT AUTHENTICATION
// ==========================================
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                success: false,
                message: "Authentication server configuration error."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        const employee = await Employee.findById(decoded.id)
            .select("-password");

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
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

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
// OWN RECORD OR ADMIN
// ==========================================
const ownRecordOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (req.user.role === "Admin") {
        return next();
    }

    const requestedEmployeeId = String(
        req.params.employeeId ||
        req.body?.employeeId ||
        req.query.employeeId ||
        ""
    ).trim();

    const loggedInEmployeeId = String(
        req.user.employeeId || ""
    ).trim();

    if (!requestedEmployeeId) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    if (
        !loggedInEmployeeId ||
        requestedEmployeeId.toUpperCase() !==
        loggedInEmployeeId.toUpperCase()
    ) {
        return res.status(403).json({
            success: false,
            message: "You can only access your own data."
        });
    }

    next();
};

// ==========================================
// EXPORT MIDDLEWARE
// ==========================================
module.exports = {
    protect,
    adminOnly,
    ownRecordOrAdmin
};