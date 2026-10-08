const express = require("express");

const {
    login,
    changePassword
} = require("../controllers/authController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// LOGIN
// ======================================================

router.post("/login", login);


// ======================================================
// CHANGE PASSWORD
// ======================================================

router.put(
    "/change-password",
    protect,
    changePassword
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;