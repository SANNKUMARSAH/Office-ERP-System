const express = require("express");

const {
    createLeave,
    getLeaves,
    updateLeaveStatus,
    deleteLeave
} = require("../controllers/leaveController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Employee + Admin
router.post(
    "/",
    protect,
    createLeave
);


// Employee → own
// Admin → all
router.get(
    "/",
    protect,
    getLeaves
);


// Admin only
router.put(
    "/:id",
    protect,
    adminOnly,
    updateLeaveStatus
);


// Admin only
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteLeave
);


module.exports = router;