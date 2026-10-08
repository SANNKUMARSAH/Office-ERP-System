const express = require("express");

const {
    createAttendance,
    getAttendance,
    deleteAttendance
} = require("../controllers/attendanceController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Employee + Admin
router.post(
    "/",
    protect,
    createAttendance
);


// Employee → own
// Admin → all
router.get(
    "/",
    protect,
    getAttendance
);


// Admin only
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteAttendance
);


module.exports = router;