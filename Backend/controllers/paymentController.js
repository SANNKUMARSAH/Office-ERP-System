const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE CUSTOMER PAYMENT ORDER
const createPaymentOrder = async (req, res) => {
    try {
        const { customerName, customerEmail, amount, description } = req.body;

        if (
            !customerName?.trim() ||
            !description?.trim() ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message: "Customer name, description and valid amount are required."
            });
        }

        // Convert rupees to paise.
        const amountInPaise = Math.round(Number(amount) * 100);

        if (amountInPaise < 100) {
            return res.status(400).json({
                message: "Minimum payment amount is ₹1."
            });
        }

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `erp_${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`,
            notes: {
                customerName: customerName.trim(),
                description: description.trim().slice(0, 200)
            }
        });

        await Payment.create({
            customerName: customerName.trim(),
            customerEmail: customerEmail?.trim() || "",
            description: description.trim(),
            amount: amountInPaise / 100,
            currency: "INR",
            razorpayOrderId: order.id,
            status: "Pending"
        });

        return res.status(201).json({
            message: "Payment order created.",
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error("Create payment order error:", error.message);

        return res.status(500).json({
            message: "Unable to create payment order."
        });
    }
};

// VERIFY CUSTOMER PAYMENT
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment verification details are required."
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment order not found."
            });
        }

        if (payment.status === "Paid") {
            return res.json({
                message: "Payment already verified.",
                status: "Paid"
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${payment.razorpayOrderId}|${razorpay_payment_id}`)
            .digest();

        let receivedSignature;

        try {
            receivedSignature = Buffer.from(
                razorpay_signature,
                "hex"
            );
        } catch {
            return res.status(400).json({
                message: "Invalid payment signature."
            });
        }

        if (
            receivedSignature.length !== expectedSignature.length ||
            !crypto.timingSafeEqual(expectedSignature, receivedSignature)
        ) {
            return res.status(400).json({
                message: "Payment signature verification failed."
            });
        }

        // Verify payment status and amount with Razorpay's server.
        const razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            razorpayPayment.order_id !== payment.razorpayOrderId ||
            razorpayPayment.amount !== Math.round(payment.amount * 100) ||
            razorpayPayment.currency !== payment.currency ||
            razorpayPayment.status !== "captured"
        ) {
            return res.status(400).json({
                message: "Payment is not captured or payment details do not match."
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "Paid";
        await payment.save();

        return res.json({
            message: "Payment verified successfully.",
            status: payment.status
        });
    } catch (error) {
        console.error("Verify payment error:", error.message);

        return res.status(500).json({
            message: "Unable to verify payment."
        });
    }
};

// GET CUSTOMER PAYMENT RECORDS
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.json(payments);
    } catch (error) {
        console.error("Get payments error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch payment records."
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPayments
};
