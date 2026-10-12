const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Employee = require("./models/Employee");

const updateAdminPassword = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword =
            await bcrypt.hash("admin123", 10);

        const admin =
            await Employee.findOneAndUpdate(
                {
                    employeeId: "ADMIN001"
                },
                {
                    password: hashedPassword
                },
                {
                    new: true
                }
            );

        if (!admin) {
            console.log("ADMIN001 not found.");
        } else {
            console.log("Admin password hashed successfully.");
        }

        await mongoose.connection.close();

    } catch (error) {

        console.error(
            "ERROR:",
            error
        );

        process.exit(1);
    }
};

updateAdminPassword();
