const Lead = require("../models/Lead");

// GET ALL LEADS
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch leads",
            error: error.message
        });
    }
};

// CREATE LEAD
const createLead = async (req, res) => {
    try {
        const { name, email, phone, company, status } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                message: "Lead name and phone are required"
            });
        }

        const lead = await Lead.create({
            name,
            email,
            phone,
            company,
            status
        });

        res.status(201).json({
            message: "Lead created successfully",
            lead
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create lead",
            error: error.message
        });
    }
};

// UPDATE LEAD
const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({
            message: "Lead updated successfully",
            lead
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to update lead",
            error: error.message
        });
    }
};

// DELETE LEAD
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({
            message: "Lead deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to delete lead",
            error: error.message
        });
    }
};

module.exports = {
    getLeads,
    createLead,
    updateLead,
    deleteLead
};
