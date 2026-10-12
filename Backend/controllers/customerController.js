const mongoose = require("mongoose");
const Customer = require("../models/Customer");

// ==========================================
// GET ALL CUSTOMERS
// ==========================================
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({
            createdAt: -1
        });

        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch customers",
            error: error.message
        });
    }
};

// ==========================================
// CREATE CUSTOMER
// ==========================================
const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, company } = req.body;

        if (!name || !name.trim() || !phone || !phone.trim()) {
            return res.status(400).json({
                message: "Customer name and phone are required"
            });
        }

        const customer = await Customer.create({
            name: name.trim(),
            email,
            phone: phone.trim(),
            company
        });

        res.status(201).json({
            message: "Customer created successfully",
            customer
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create customer",
            error: error.message
        });
    }
};

// ==========================================
// UPDATE CUSTOMER
// ==========================================
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        const allowedFields = ["name", "email", "phone", "company"];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const customer = await Customer.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.status(200).json({
            message: "Customer updated successfully",
            customer
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to update customer",
            error: error.message
        });
    }
};

// ==========================================
// DELETE CUSTOMER
// ==========================================
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.status(200).json({
            message: "Customer deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete customer",
            error: error.message
        });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
