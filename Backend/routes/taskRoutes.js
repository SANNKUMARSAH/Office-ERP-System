const express = require("express");

const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

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
    createTask
);


// ==========================================
// ADMIN = ALL
// EMPLOYEE = OWN
// ==========================================
router.get(
    "/",
    protect,
    getTasks
);


// ==========================================
// ADMIN + ASSIGNED EMPLOYEE
// ==========================================
router.put(
    "/:id",
    protect,
    updateTask
);


// ==========================================
// ADMIN ONLY
// ==========================================
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteTask
);


module.exports = router;