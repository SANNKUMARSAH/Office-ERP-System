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
        }
    },
    {
        timestamps: true
    }
);

const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;