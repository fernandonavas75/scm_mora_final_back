const pool = require("../config/db");
const { getPagination } = require("../utils/pagination");

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      abc_class,
      market,
      category_id,
      search,
    } = req.query;

    const pagination = getPagination(page, limit);

    const conditions = [];
    const values = [];

    if (abc_class) {
      values.push(abc_class);
      conditions.push(`p.abc_class = $${values.length}`);
    }

    if (market) {
      values.push(market);
      conditions.push(`p.market = $${values.length}`);
    }

    if (category_id) {
      values.push(category_id);
      conditions.push(`p.category_id = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`p.product_name ILIKE $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    values.push(pagination.limit);
    const limitParam = values.length;

    values.push(pagination.offset);
    const offsetParam = values.length;

    const result = await pool.query(
      `
      SELECT
        p.product_id,
        p.product_name,
        p.product_price,
        p.market,
        p.abc_class,
        c.category_id,
        c.category_name,
        d.department_id,
        d.department_name
      FROM scm.product p
      INNER JOIN scm.category c ON p.category_id = c.category_id
      INNER JOIN scm.department d ON c.department_id = d.department_id
      ${whereClause}
      ORDER BY p.product_id
      LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      values
    );

    res.json({
      message: "Productos obtenidos correctamente",
      page: pagination.page,
      limit: pagination.limit,
      filters: {
        abc_class,
        market,
        category_id,
        search,
      },
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);

    res.status(500).json({
      message: "Error al obtener productos",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.product_id,
        p.product_name,
        p.product_price,
        p.market,
        p.abc_class,
        c.category_name,
        d.department_name
      FROM scm.product p
      INNER JOIN scm.category c ON p.category_id = c.category_id
      INNER JOIN scm.department d ON c.department_id = d.department_id
      WHERE p.product_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    res.json({
      message: "Producto obtenido correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);

    res.status(500).json({
      message: "Error al obtener producto",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
};