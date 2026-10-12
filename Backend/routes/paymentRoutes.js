const express = require("express");
const router = express.Router();

const {
    createPaymentOrder,
    verifyPayment,
    getPayments
} = require("../controllers/paymentController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Customer payment order create karna
router.post(
    "/create-order",
    protect,
    createPaymentOrder
);

// Payment verify karna
router.post(
    "/verify",
    protect,
    verifyPayment
);

// Payment history sirf Admin dekh sakta hai
router.get(
    "/",
    protect,
    adminOnly,
    getPayments
);

module.exports = router;
