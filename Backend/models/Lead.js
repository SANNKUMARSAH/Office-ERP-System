const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["New", "Contacted", "Qualified", "Won", "Lost"],
            default: "New"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
