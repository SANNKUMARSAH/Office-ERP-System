const Attendance = require("../models/Attendance");


// ==========================================
// CREATE ATTENDANCE
// ==========================================
const createAttendance = async (req, res) => {
    try {

        const {
            employeeId,
            date,
            status
        } = req.body;

        if (!employeeId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "Employee ID, date and status are required."
            });
        }

        // Employee can only create own attendance
        if (
            req.user.role !== "Admin" &&
            employeeId.toUpperCase() !==
            req.user.employeeId.toUpperCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only manage your own attendance."
            });
        }

const attendance = new Attendance({
    employeeId: employeeId.toUpperCase(),
    employeeName: req.user.name,
    date,
    status
});
        

        await attendance.save();

        res.status(201).json({
            success: true,
            message: "Attendance saved successfully.",
            data: attendance
        });

    } catch (error) {

        console.error(
            "CREATE ATTENDANCE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


// ==========================================
// GET ATTENDANCE
// ==========================================
const getAttendance = async (req, res) => {
    try {

        let filter = {};

        // Employee → only own records
        if (req.user.role !== "Admin") {
            filter.employeeId =
                req.user.employeeId.toUpperCase();
        }

        // Admin → all records
        const attendance =
            await Attendance.find(filter)
                .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });

    } catch (error) {

        console.error(
            "GET ATTENDANCE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


// ==========================================
// DELETE ATTENDANCE
// ==========================================
const deleteAttendance = async (req, res) => {
    try {

        // Only Admin can delete
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Only Admin can delete attendance."
            });
        }

        const attendance =
            await Attendance.findById(
                req.params.id
            );

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found."
            });
        }

        await attendance.deleteOne();

        res.status(200).json({
            success: true,
            message: "Attendance deleted successfully."
        });

    } catch (error) {

        console.error(
            "DELETE ATTENDANCE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


module.exports = {
    createAttendance,
    getAttendance,
    deleteAttendance
};