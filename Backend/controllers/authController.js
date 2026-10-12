const bcrypt = require("bcrypt");
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");


// ==========================================
// LOGIN
// ==========================================
const login = async (req, res) => {
    try {

        const {
            employeeId,
            password
        } = req.body;

        if (!employeeId || !password) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and Password are required."
            });
        }

        const empId =
            employeeId.toUpperCase();

        // Find employee
        const employee =
            await Employee.findOne({
                employeeId: empId
            });

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Invalid Employee ID or Password."
            });
        }

        // Check account status
        if (employee.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });
        }

        // Compare entered password with hashed password
        const passwordMatch =
            await bcrypt.compare(
                password,
                employee.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Employee ID or Password."
            });
        }
        const token = jwt.sign(
    {
        id: employee._id,
        employeeId: employee.employeeId,
        role: employee.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token: token,

            data: {
                token: token,
                id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                department: employee.department,
                designation: employee.designation,
                phone: employee.phone,
                status: employee.status
            }
        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


// ==========================================
// CHANGE PASSWORD
// ==========================================
const changePassword = async (req, res) => {
    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters."
            });
        }

        const employee =
            await Employee.findById(
                req.user._id
            );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message:
                    "Employee not found."
            });
        }

        // Check current password
        const passwordMatch =
            await bcrypt.compare(
                currentPassword,
                employee.password
            );

        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password is incorrect."
            });
        }

        // Prevent same password
        const samePassword =
            await bcrypt.compare(
                newPassword,
                employee.password
            );

        if (samePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password."
            });
        }

        // Employee model pre-save hook
        // automatically hashes the new password
        employee.password = newPassword;

        await employee.save();

        res.status(200).json({
            success: true,
            message:
                "Password changed successfully."
        });

    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


module.exports = {
    login,
    changePassword
};

