const pool = require("../config/db");

const getExecutiveDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM scm.vw_executive_dashboard
    `);

    res.json({
      message: "Dashboard ejecutivo obtenido correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en dashboard ejecutivo:", error);

    res.status(500).json({
      message: "Error al obtener dashboard ejecutivo",
      error: error.message,
    });
  }
};

const getShippingPerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM scm.vw_kpi_shipping_performance
    `);

    res.json({
      message: "KPI de rendimiento logístico obtenido correctamente",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en KPI logístico:", error);

    res.status(500).json({
      message: "Error al obtener KPI logístico",
      error: error.message,
    });
  }
};

const getSalesByCategory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM scm.vw_sales_by_category
      LIMIT 20
    `);

    res.json({
      message: "Ventas por categoría obtenidas correctamente",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en ventas por categoría:", error);

    res.status(500).json({
      message: "Error al obtener ventas por categoría",
      error: error.message,
    });
  }
};

const getMonthlyTrend = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM scm.vw_monthly_order_trend
    `);

    res.json({
      message: "Tendencia mensual obtenida correctamente",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en tendencia mensual:", error);

    res.status(500).json({
      message: "Error al obtener tendencia mensual",
      error: error.message,
    });
  }
};

const getKpiByMarket = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM scm.vw_kpi_by_market
    `);

    res.json({
      message: "KPIs por mercado obtenidos correctamente",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en KPI por mercado:", error);

    res.status(500).json({
      message: "Error al obtener KPIs por mercado",
      error: error.message,
    });
  }
};

module.exports = {
  getExecutiveDashboard,
  getShippingPerformance,
  getSalesByCategory,
  getMonthlyTrend,
  getKpiByMarket,
};