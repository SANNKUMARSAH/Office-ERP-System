const express = require("express");

const {
    createPayroll,
    getPayroll,
    updatePayroll,
    deletePayroll
} = require("../controllers/payrollController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// ADMIN ONLY - CREATE
// ==========================================
router.post(
    "/",
    protect,
    adminOnly,
    createPayroll
);


// ==========================================
// ADMIN = ALL
// EMPLOYEE = OWN
// ==========================================
router.get(
    "/",
    protect,
    getPayroll
);


// ==========================================
// ADMIN ONLY - UPDATE
// ==========================================
router.put(
    "/:id",
    protect,
    adminOnly,
    updatePayroll
);


// ==========================================
// ADMIN ONLY - DELETE
// ==========================================
router.delete(
    "/:id",
    protect,
    adminOnly,
    deletePayroll
);


module.exports = router;