const pool = require("../config/db");

const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      payment_type,
      late_delivery_risk,
      delivery_status,
      country,
      region,
      date_from,
      date_to,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`o.order_status = $${params.length}`);
    }
    if (payment_type) {
      params.push(payment_type);
      conditions.push(`o.payment_type = $${params.length}`);
    }
    if (late_delivery_risk !== undefined) {
      params.push(Number(late_delivery_risk));
      conditions.push(`o.late_delivery_risk = $${params.length}`);
    }
    if (delivery_status) {
      params.push(delivery_status);
      conditions.push(`o.delivery_status = $${params.length}`);
    }
    if (country) {
      params.push(country);
      conditions.push(`o.order_country ILIKE $${params.length}`);
    }
    if (region) {
      params.push(region);
      conditions.push(`o.order_region ILIKE $${params.length}`);
    }
    if (date_from) {
      params.push(date_from);
      conditions.push(`o.order_date >= $${params.length}`);
    }
    if (date_to) {
      params.push(date_to);
      conditions.push(`o.order_date <= $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    params.push(Number(limit));
    const limitIndex = params.length;
    params.push(offset);
    const offsetIndex = params.length;

    const result = await pool.query(
      `
      SELECT
        o.order_id,
        o.customer_id,
        c.segment,
        c.city AS customer_city,
        c.country AS customer_country,
        o.order_date,
        o.shipping_date,
        o.order_status,
        o.payment_type,
        o.shipping_mode,
        o.delivery_status,
        o.late_delivery_risk,
        o.days_for_shipping_real,
        o.days_for_shipment_scheduled,
        o.shipping_delay_days,
        o.order_region,
        o.order_country,
        o.order_city
      FROM scm.orders o
      INNER JOIN scm.customer c ON o.customer_id = c.customer_id
      ${where}
      ORDER BY o.order_date DESC NULLS LAST
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
      `,
      params
    );

    res.json({
      message: "Órdenes obtenidas correctamente",
      page: Number(page),
      limit: Number(limit),
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);

    res.status(500).json({
      message: "Error al obtener órdenes",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `
      SELECT
        o.*,
        c.segment,
        c.city AS customer_city,
        c.state AS customer_state,
        c.country AS customer_country
      FROM scm.orders o
      INNER JOIN scm.customer c ON o.customer_id = c.customer_id
      WHERE o.order_id = $1
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: "Orden no encontrada",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        oi.order_item_id,
        oi.product_id,
        p.product_name,
        oi.quantity,
        oi.unit_price,
        oi.discount_amount,
        oi.sales,
        oi.profit,
        oi.profit_margin_pct
      FROM scm.order_items oi
      INNER JOIN scm.product p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
      `,
      [id]
    );

    res.json({
      message: "Orden obtenida correctamente",
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("Error al obtener orden:", error);

    res.status(500).json({
      message: "Error al obtener orden",
      error: error.message,
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
};