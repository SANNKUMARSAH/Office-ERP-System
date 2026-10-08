const Employee = require("../models/Employee");


// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
    try {

        const {
            employeeId,
            password
        } = req.body;


        // CHECK REQUIRED FIELDS
        if (!employeeId || !password) {

            return res.status(400).json({
                success: false,
                message: "Employee ID and Password are required."
            });

        }


        // FIND EMPLOYEE
        const employee = await Employee.findOne({
            employeeId: employeeId.toUpperCase().trim()
        });


        // EMPLOYEE NOT FOUND
        if (!employee) {

            return res.status(401).json({
                success: false,
                message: "Invalid Employee ID or Password."
            });

        }


        // CHECK PASSWORD
        if (employee.password !== password) {

            return res.status(401).json({
                success: false,
                message: "Invalid Employee ID or Password."
            });

        }


        // CHECK ACCOUNT STATUS
        if (employee.status !== "Active") {

            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });

        }


        // LOGIN SUCCESS
        return res.status(200).json({

            success: true,

            message: "Login successful.",

            data: {

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


        return res.status(500).json({

            success: false,

            message: "Server error.",

            error: error.message

        });

    }
};



// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        // CHECK REQUIRED FIELDS
        if (!currentPassword || !newPassword) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password and new password are required."

            });

        }


        // CHECK NEW PASSWORD LENGTH
        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be at least 6 characters."

            });

        }


        // CHECK LOGGED-IN USER
        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not authenticated."

            });

        }


        // CHECK CURRENT PASSWORD
        if (req.user.password !== currentPassword) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password is incorrect."

            });

        }


        // CHECK SAME PASSWORD
        if (currentPassword === newPassword) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be different from current password."

            });

        }


        // UPDATE PASSWORD
        req.user.password = newPassword;

        await req.user.save();


        // SUCCESS
        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully."

        });


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while changing password.",

            error:
                error.message

        });

    }

};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    login,

    changePassword

};