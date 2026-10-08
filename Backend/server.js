require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const Employee = require("./models/Employee");

// =========================
// ROUTES
// =========================
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// DATABASE
// =========================
connectDB().then(async () => {

    try {

        // Remove old empId index
        try {

            await Employee.collection.dropIndex("empId_1");

            console.log("Old empId index removed.");

        } catch (error) {

            if (error.codeName !== "IndexNotFound") {

                console.log(
                    "Index check:",
                    error.message
                );

            }

        }


        // Create / Update Default Admin
        let admin = await Employee.findOne({
            employeeId: "ADMIN001"
        });


        if (!admin) {

            admin = new Employee({

                employeeId: "ADMIN001",

                name: "System Admin",

                email: "admin@officeerp.com",

                password: "admin123",

                role: "Admin",

                department: "Management",

                designation: "Administrator",

                phone: "9999999999",

                status: "Active"

            });


            await admin.save();


            console.log("=================================");
            console.log("Default Admin Created Successfully");
            console.log("Employee ID: ADMIN001");
            console.log("Password: admin123");
            console.log("=================================");


        } else {

            admin.password = "admin123";

            admin.role = "Admin";

            admin.status = "Active";


            await admin.save();


            console.log("=================================");
            console.log("Default Admin Updated Successfully");
            console.log("Employee ID: ADMIN001");
            console.log("Password: admin123");
            console.log("=================================");

        }


    } catch (error) {

        console.error(
            "ADMIN SETUP ERROR:",
            error.message
        );

    }

});


// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Office ERP Backend is running..."

    });

});


// =========================
// API ROUTES
// =========================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/leaves",
    leaveRoutes
);

app.use(
    "/api/tasks",
    taskRoutes
);

app.use(
    "/api/payroll",
    payrollRoutes
);


// =========================
// START SERVER
// =========================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);