const express = require("express");
const router = express.Router();

const {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerController");

// GET all customers
router.get("/", getCustomers);

// CREATE customer
router.post("/", createCustomer);

// UPDATE customer
router.put("/:id", updateCustomer);

// DELETE customer
router.delete("/:id", deleteCustomer);

module.exports = router;