
const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
    {
        payrollId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payroll",
            required: true,
            index: true
        },

        employeeId: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        currency: {
            type: String,
            default: "INR"
        },

        provider: {
            type: String,
            default: "RazorpayX"
        },

        razorpayPayoutId: {
            type: String,
            default: null
        },

        idempotencyKey: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: [
                "Processing",
                "Pending",
                "Processed",
                "Failed",
                "Reversed"
            ],
            default: "Processing"
        },

        utr: {
            type: String,
            default: null
        },

        failureReason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payout", payoutSchema);