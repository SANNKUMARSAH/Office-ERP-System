const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        employeeName: {
            type: String,
            required: true,
            trim: true
        },

        leaveType: {
            type: String,
            enum: ["Casual Leave", "Sick Leave", "Earned Leave"],
            required: true
        },

        fromDate: {
            type: Date,
            required: true
        },

        toDate: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const Leave = mongoose.model("Leave", leaveSchema);

module.exports = Leave;