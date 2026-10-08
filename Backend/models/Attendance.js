const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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

        date: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Present", "Absent", "Leave"],
            default: "Present"
        },

        checkIn: {
            type: String,
            default: ""
        },

        checkOut: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

module.exports = Attendance;