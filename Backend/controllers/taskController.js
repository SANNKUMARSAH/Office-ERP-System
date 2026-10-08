const Task = require("../models/Task");
const Employee = require("../models/Employee");


// ==========================================
// CREATE TASK - ADMIN ONLY
// ==========================================
const createTask = async (req, res) => {
    try {

        const {
            title,
            description,
            assignedTo,
            dueDate,
            priority
        } = req.body;

        if (
            !title ||
            !assignedTo ||
            !dueDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, Employee ID and Due Date are required."
            });
        }

        const employeeId = assignedTo.toUpperCase();

        // Check employee exists
        const employee = await Employee.findOne({
            employeeId: employeeId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Assigned employee not found."
            });
        }

        if (employee.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Cannot assign task to inactive employee."
            });
        }

        const task = new Task({
            title,
            description,
            assignedTo: employeeId,
            dueDate,
            priority: priority || "Medium",
            status: "Pending"
        });

        await task.save();

        res.status(201).json({
            success: true,
            message: "Task created successfully.",
            data: task
        });

    } catch (error) {

        console.error("CREATE TASK ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


// ==========================================
// GET TASKS
// ADMIN = ALL
// EMPLOYEE = OWN
// ==========================================
const getTasks = async (req, res) => {
    try {

        let filter = {};

        if (req.user.role !== "Admin") {
            filter.assignedTo =
                req.user.employeeId.toUpperCase();
        }

        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });

    } catch (error) {

        console.error("GET TASKS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE TASK STATUS
// ADMIN + ASSIGNED EMPLOYEE
// ==========================================
const updateTask = async (req, res) => {
    try {

        const task = await Task.findById(
            req.params.id
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        // Employee can update ONLY own task
        if (
            req.user.role !== "Admin" &&
            task.assignedTo.toUpperCase() !==
            req.user.employeeId.toUpperCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own tasks."
            });
        }

        const {
            title,
            description,
            dueDate,
            priority,
            status
        } = req.body;

        if (title !== undefined) {
            task.title = title;
        }

        if (description !== undefined) {
            task.description = description;
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate;
        }

        if (priority !== undefined) {

            if (
                !["Low", "Medium", "High"]
                    .includes(priority)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority."
                });
            }

            task.priority = priority;
        }

        if (status !== undefined) {

            if (
                ![
                    "Pending",
                    "In Progress",
                    "Completed"
                ].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task status."
                });
            }

            task.status = status;
        }

        await task.save();

        res.status(200).json({
            success: true,
            message: "Task updated successfully.",
            data: task
        });

    } catch (error) {

        console.error("UPDATE TASK ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


// ==========================================
// DELETE TASK - ADMIN ONLY
// ==========================================
const deleteTask = async (req, res) => {
    try {

        const task = await Task.findById(
            req.params.id
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: "Task deleted successfully."
        });

    } catch (error) {

        console.error("DELETE TASK ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};