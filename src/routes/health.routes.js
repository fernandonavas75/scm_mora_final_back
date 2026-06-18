const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      status: "OK",
      message: "Backend FreshMarket SCM funcionando",
      database_time: result.rows[0].current_time,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "No se pudo conectar a PostgreSQL",
      error: error.message,
    });
  }
});

module.exports = router;