const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend funcionando correctamente",
  });
});

module.exports = router;