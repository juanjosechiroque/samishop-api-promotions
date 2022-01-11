const express = require("express")
const router = express.Router();

const promotionsRouter = require("../components/promotions/routes");

router.use("/promotions", promotionsRouter);

module.exports = router;
