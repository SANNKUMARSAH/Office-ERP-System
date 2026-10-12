const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        customerEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        description: {
            type: String,
            required: true,
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
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true
        },
        razorpayPaymentId: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
