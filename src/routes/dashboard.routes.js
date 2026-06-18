const express = require("express");

const {
  getExecutiveDashboard,
  getShippingPerformance,
  getSalesByCategory,
  getMonthlyTrend,
  getKpiByMarket,
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/executive", getExecutiveDashboard);
router.get("/shipping-performance", getShippingPerformance);
router.get("/sales-by-category", getSalesByCategory);
router.get("/monthly-trend", getMonthlyTrend);
router.get("/market", getKpiByMarket);

module.exports = router;