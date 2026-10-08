const Leave = require("../models/Leave");


// ==========================================
// APPLY LEAVE
// ==========================================
const createLeave = async (req, res) => {
    try {

        const {
            employeeId,
            employeeName,
            leaveType,
            fromDate,
            toDate,
            reason
        } = req.body;

        if (
            !employeeId ||
            !employeeName ||
            !leaveType ||
            !fromDate ||
            !toDate ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all leave fields."
            });
        }

        // Employee can only apply for own ID
        if (
            req.user.role !== "Admin" &&
            employeeId.toUpperCase() !==
            req.user.employeeId.toUpperCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only apply leave for yourself."
            });
        }

        const leave = new Leave({
            employeeId: employeeId.toUpperCase(),
            employeeName,
            leaveType,
            fromDate,
            toDate,
            reason,
            status: "Pending"
        });

        await leave.save();

        res.status(201).json({
            success: true,
            message: "Leave applied successfully.",
            data: leave
        });

    } catch (error) {

        console.error(
            "CREATE LEAVE ERROR:",
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
// GET LEAVES
// ==========================================
const getLeaves = async (req, res) => {
    try {

        let filter = {};

        // Employee → own leaves only
        if (req.user.role !== "Admin") {
            filter.employeeId =
                req.user.employeeId.toUpperCase();
        }

        // Admin → all leaves
        const leaves =
            await Leave.find(filter)
                .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });

    } catch (error) {

        console.error(
            "GET LEAVES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


// ==========================================
// UPDATE LEAVE STATUS
// ==========================================
const updateLeaveStatus = async (req, res) => {
    try {

        // Only Admin
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Only Admin can approve or reject leave."
            });
        }

        const {
            status
        } = req.body;

        if (
            status !== "Approved" &&
            status !== "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave status."
            });
        }

        const leave =
            await Leave.findById(
                req.params.id
            );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found."
            });
        }

        leave.status = status;

        await leave.save();

        res.status(200).json({
            success: true,
            message:
                `Leave ${status.toLowerCase()} successfully.`,
            data: leave
        });

    } catch (error) {

        console.error(
            "UPDATE LEAVE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


// ==========================================
// DELETE LEAVE
// ==========================================
const deleteLeave = async (req, res) => {
    try {

        // Only Admin
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Only Admin can delete leave."
            });
        }

        const leave =
            await Leave.findById(
                req.params.id
            );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found."
            });
        }

        await leave.deleteOne();

        res.status(200).json({
            success: true,
            message: "Leave deleted successfully."
        });

    } catch (error) {

        console.error(
            "DELETE LEAVE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


module.exports = {
    createLeave,
    getLeaves,
    updateLeaveStatus,
    deleteLeave
};