const mongoose = require("mongoose");
const FollowUp = require("../models/FollowUp");

// ==========================================
// GET ALL FOLLOW-UPS
// ==========================================
const getFollowUps = async (req, res) => {
    try {
        const followUps = await FollowUp.find().sort({ date: 1 });

        res.status(200).json(followUps);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch follow-ups",
            error: error.message
        });
    }
};

// ==========================================
// CREATE FOLLOW-UP
// ==========================================
const createFollowUp = async (req, res) => {
    try {
        const { name, date, notes, status, lead, assignedTo } = req.body;

        if (!name || !name.trim() || !date) {
            return res.status(400).json({
                message: "Name and follow-up date are required"
            });
        }

        const followUp = await FollowUp.create({
            name: name.trim(),
            date,
            notes,
            status,
            lead: lead || null,
            assignedTo: assignedTo || null
        });

        res.status(201).json({
            message: "Follow-up created successfully",
            followUp
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to create follow-up",
            error: error.message
        });
    }
};

// ==========================================
// UPDATE FOLLOW-UP
// ==========================================
const updateFollowUp = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid follow-up ID"
            });
        }

        const allowedFields = [
            "name",
            "date",
            "notes",
            "status",
            "lead",
            "assignedTo"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const followUp = await FollowUp.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!followUp) {
            return res.status(404).json({
                message: "Follow-up not found"
            });
        }

        res.status(200).json({
            message: "Follow-up updated successfully",
            followUp
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to update follow-up",
            error: error.message
        });
    }
};

// ==========================================
// DELETE FOLLOW-UP
// ==========================================
const deleteFollowUp = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid follow-up ID"
            });
        }

        const followUp = await FollowUp.findByIdAndDelete(id);

        if (!followUp) {
            return res.status(404).json({
                message: "Follow-up not found"
            });
        }

        res.status(200).json({
            message: "Follow-up deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete follow-up",
            error: error.message
        });
    }
};

module.exports = {
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
};
