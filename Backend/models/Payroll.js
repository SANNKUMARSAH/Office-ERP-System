
const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        month: {
            type: String,
            required: true,
            trim: true
        },

        basicSalary: {
            type: Number,
            required: true,
            min: 0
        },

        allowances: {
            type: Number,
            default: 0,
            min: 0
        },

        deductions: {
            type: Number,
            default: 0,
            min: 0
        },

        netSalary: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending"
        },

        payoutStatus: {
            type: String,
            enum: [
                "Not Started",
                "Processing",
                "Pending",
                "Processed",
                "Failed",
                "Reversed"
            ],
            default: "Not Started"
        },

        razorpayPayoutId: {
            type: String,
            default: null
        },

        payoutIdempotencyKey: {
            type: String,
            default: null
        },

        payoutUtr: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

payrollSchema.index(
    { employeeId: 1, month: 1 },
    { unique: true }
);

module.exports = mongoose.model("Payroll", payrollSchema);