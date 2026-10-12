const express = require("express");
const router = express.Router();

const {
    paySalary,
    refreshSalaryPayoutStatus
} = require("../controllers/payoutController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

router.post("/salary/:payrollId", protect, adminOnly, paySalary);

router.get(
    "/salary/:payrollId/status",
    protect,
    adminOnly,
    refreshSalaryPayoutStatus
);

module.exports = router;