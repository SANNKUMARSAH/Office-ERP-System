const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["Admin", "Employee"],
            default: "Employee"
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        designation: {
            type: String,
            required: true,
            trim: true
        },
                phone: {
            type: String,
            trim: true
        },

        // Employee bank details for salary transfer
        bankAccountHolderName: {
            type: String,
            trim: true
        },

        bankAccountNumber: {
            type: String,
            trim: true,
            select: false
        },

        bankIfscCode: {
            type: String,
            trim: true,
            uppercase: true
        },

        // Existing status field

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// HASH PASSWORD BEFORE SAVING
// ==========================================
employeeSchema.pre("save", async function (next) {

    // Password already hashed hai to dobara hash mat karo
    if (!this.isModified("password")) {
        return next();
    }

    try {

        const salt = await bcrypt.genSalt(10);

        this.password =
            await bcrypt.hash(
                this.password,
                salt
            );

        next();

    } catch (error) {

        next(error);

    }
});


const Employee =
    mongoose.model(
        "Employee",
        employeeSchema
    );

module.exports = Employee;

