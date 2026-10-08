const express = require("express");

const {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// ADMIN ONLY
// ==========================================

// Create employee
router.post(
    "/",
    protect,
    adminOnly,
    createEmployee
);

// Get all employees
router.get(
    "/",
    protect,
    adminOnly,
    getEmployees
);

// Update employee
router.put(
    "/:id",
    protect,
    adminOnly,
    updateEmployee
);

// Delete employee
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteEmployee
);


// ==========================================
// ADMIN + OWN EMPLOYEE
// ==========================================

// Get single employee
router.get(
    "/:id",
    protect,
    getEmployee
);


module.exports = router;