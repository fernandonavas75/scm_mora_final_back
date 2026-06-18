const express = require("express");

const {
  getCustomers,
} = require("../controllers/customer.controller");

const router = express.Router();

router.get("/", getCustomers);

module.exports = router;