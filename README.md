# FreshMarket SCM — Backend API

REST API para gestión de cadena de suministro (Supply Chain Management) de una empresa de productos frescos. Administra órdenes, productos, clientes y KPIs de rendimiento logístico.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | Node.js | CommonJS |
| Framework | Express.js | 5.2.1 |
| Base de datos | PostgreSQL (driver `pg`) | 8.21.0 |
| HTTP logging | Morgan | 1.11.0 |
| CORS | cors | 2.8.6 |
| Config | dotenv | 17.4.2 |
| Dev server | nodemon | 3.1.14 |

**Sin ORM** — todas las queries son SQL crudo con `pool.query()` parametrizado.

---

## Requisitos Previos

- Node.js instalado
- PostgreSQL corriendo en `localhost:5432`
- Base de datos `freshmarket_scm` creada
- Schema `scm` con las tablas y vistas correspondientes

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env   # o crear manualmente (ver sección Variables de Entorno)

# 3. Iniciar servidor de desarrollo
npm run dev
```

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=freshmarket_scm
DB_SCHEMA=scm          # opcional — si se omite usa el search_path por defecto
```

---

## Comandos

```bash
npm run dev    # Desarrollo con hot-reload (nodemon)
npm start      # Producción
```

---

## Estructura del Proyecto

```
SCM_MORA_FINAL/
├── src/
│   ├── server.js                    # Entry point — levanta el servidor HTTP
│   ├── app.js                       # Configura Express: middlewares y rutas
│   ├── config/
│   │   └── db.js                    # Pool de conexión a PostgreSQL
│   ├── routes/
│   │   ├── health.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   └── customer.routes.js
│   └── controllers/
│       ├── dashboard.controller.js
│       ├── product.controller.js
│       ├── order.controller.js
│       └── customer.controller.js
├── .env                             # Variables de entorno (NO commitear)
├── package.json
└── README.md
```

### Convención de capas

| Archivo | Responsabilidad |
|---------|----------------|
| `*.routes.js` | Define endpoints Express y delega al controller |
| `*.controller.js` | Lógica de negocio, construcción de queries, respuesta HTTP |
| `config/db.js` | Pool de conexión compartido — se importa en cada controller |

---

## Base de Datos

- **Schema:** `scm`
- **Tablas:** `scm.orders`, `scm.customer`, `scm.product`, `scm.order_items`
- **Vistas:** `scm.vw_executive_dashboard`, `scm.vw_kpi_shipping_performance`, `scm.vw_sales_by_category`, `scm.vw_monthly_order_trend`, `scm.vw_kpi_by_market`
- **Queries:** siempre parametrizadas (`$1`, `$2`…) — nunca concatenación de strings

---

## Referencia de la API

Base URL: `http://localhost:3000/api`

Todas las respuestas son JSON. Los mensajes de estado están en español.

---

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Verificación de disponibilidad del servidor |

**Respuesta:**
```json
{
  "status": "OK",
  "message": "Backend funcionando correctamente"
}
```

---

### Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard/executive` | KPIs ejecutivos globales |
| GET | `/dashboard/shipping-performance` | Métricas de rendimiento logístico |
| GET | `/dashboard/sales-by-category` | Ventas agrupadas por categoría (top 20) |
| GET | `/dashboard/monthly-trend` | Tendencia de órdenes por mes |
| GET | `/dashboard/market` | KPIs segmentados por mercado |

Todas las rutas de dashboard leen desde vistas de PostgreSQL — no aceptan parámetros.

---

### Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/products` | Listado paginado de productos |
| GET | `/products/:id` | Detalle de un producto |

**Query params para listado:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 20 | Registros por página |

---

### Órdenes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/orders` | Listado paginado con filtros combinables |
| GET | `/orders/:id` | Detalle de orden con sus líneas (items) |

**Query params para listado:**

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `page` | number | `1` | Número de página |
| `limit` | number | `20` | Registros por página |
| `status` | string | `COMPLETE` | Estado de la orden (`order_status`) |
| `payment_type` | string | `DEBIT` | Tipo de pago |
| `late_delivery_risk` | number | `1` | Riesgo de entrega tardía (`0` o `1`) |
| `delivery_status` | string | `Late delivery` | Estado de entrega |
| `country` | string | `Ecuador` | País del pedido (insensible a mayúsculas) |
| `region` | string | `LATAM` | Región del pedido (insensible a mayúsculas) |
| `date_from` | string (ISO) | `2017-01-01` | Fecha de inicio del rango |
| `date_to` | string (ISO) | `2017-12-31` | Fecha de fin del rango |

Todos los filtros son opcionales y combinables.

**Ejemplo — órdenes tardías en LATAM durante 2017:**
```
GET /api/orders?late_delivery_risk=1&region=LATAM&date_from=2017-01-01&date_to=2017-12-31
```

**Respuesta de detalle (`/orders/:id`):**
```json
{
  "message": "Orden obtenida correctamente",
  "data": {
    "order_id": 123,
    "order_date": "2017-03-15",
    "delivery_status": "Late delivery",
    "items": [
      {
        "order_item_id": 1,
        "product_name": "Producto X",
        "quantity": 2,
        "unit_price": 49.99,
        "profit_margin_pct": 0.18
      }
    ]
  }
}
```

---

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/customers` | Listado paginado de clientes |
| GET | `/customers/:id` | Detalle de un cliente |

**Query params para listado:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 20 | Registros por página |

---

## Manejo de Errores

| Código HTTP | Situación |
|-------------|-----------|
| `200` | Operación exitosa |
| `404` | Recurso no encontrado (registro inexistente o ruta inválida) |
| `500` | Error interno — fallo en la query o conexión a BD |

Estructura de error estándar:
```json
{
  "message": "Descripción del error en español",
  "error": "detalle técnico del error"
}
```

---

## Arquitectura de Conexión a Base de Datos

`src/config/db.js` expone un `Pool` de `pg` que se reutiliza en todos los controllers. La configuración se inyecta exclusivamente desde variables de entorno — no hay credenciales en el código fuente.

```
[Request] → [Route] → [Controller] → [pool.query(sql, params)] → [PostgreSQL]
```

El pool emite eventos de log en `connect` y `error` para facilitar diagnóstico en consola.

---

## Estado del Proyecto

### Implementado
- Conexión a PostgreSQL con pool
- `GET /api/health`
- `GET /api/dashboard/*` (5 endpoints de KPIs y vistas)
- `GET /api/products` y `/api/products/:id`
- `GET /api/orders` con 8 filtros combinables
- `GET /api/orders/:id` con items de la orden
- `GET /api/customers` y `/api/customers/:id`
- Paginación en todos los listados
- CORS abierto para desarrollo local

### Pendiente (post-MVP)
- Autenticación JWT
- Endpoints de escritura (POST / PUT / DELETE)
- Middleware de autorización por roles
- Validación y sanitización de inputs
- Manejo de errores centralizado
- `.env.example`
