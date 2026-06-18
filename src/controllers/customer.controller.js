const pool = require("../config/db");

const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `
      SELECT
        customer_id,
        segment,
        city,
        state,
        country,
        zipcode,
        latitude,
        longitude
      FROM scm.customer
      ORDER BY customer_id
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.json({
      message: "Clientes obtenidos correctamente",
      page: Number(page),
      limit: Number(limit),
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);

    res.status(500).json({
      message: "Error al obtener clientes",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomers,
};
