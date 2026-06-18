const express = require("express");

const {
  getOrders,
  getOrderById,
} = require("../controllers/order.controller");

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;