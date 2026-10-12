const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending"
        },
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead",
            default: null
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
    {
        timestamps: true
    }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
