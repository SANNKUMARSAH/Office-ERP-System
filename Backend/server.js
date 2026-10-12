
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const Employee = require("./models/Employee");

const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Allow only configured frontend origins.
const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:5173"
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Requests without Origin can include server-to-server clients.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false
    })
);

// Limit request body size.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ==========================================
// ROUTES
// ==========================================

const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const leadRoutes = require("./routes/leadRoutes");
const customerRoutes = require("./routes/customerRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const payoutRoutes = require("./routes/payoutRoutes");

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Office ERP Backend is running..."
    });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);

// ==========================================
// NOT FOUND HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "This origin is not allowed."
        });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Request body is too large."
        });
    }

    console.error("SERVER ERROR:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from .env");
        }

        await connectDB();

        // Create the initial Admin only when explicitly configured.
        // Never reset an existing Admin password during startup.
        const initialAdminPassword =
            process.env.ADMIN_INITIAL_PASSWORD;

        if (initialAdminPassword) {
            let admin = await Employee.findOne({
                employeeId: "ADMIN001"
            });

            if (!admin) {
                admin = new Employee({
                    employeeId: "ADMIN001",
                    name: "System Admin",
                    email: "admin@officeerp.com",
                    password: initialAdminPassword,
                    role: "Admin",
                    department: "Management",
                    designation: "Administrator",
                    phone: "9999999999",
                    status: "Active"
                });

                await admin.save();

                console.log("Initial Admin account created.");
            } else {
                console.log(
                    "Existing Admin found. Password was not changed."
                );
            }
        } else {
            console.log(
                "ADMIN_INITIAL_PASSWORD not set; Admin bootstrap skipped."
            );
        }

        app.listen(PORT, () => {
            console.log(
                `Office ERP Backend running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error("SERVER STARTUP ERROR:", error.message);
        process.exit(1);
    }
};

startServer();