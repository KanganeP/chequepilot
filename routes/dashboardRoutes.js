const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const {
    getDashboardSummary
} = require("../controllers/dashboardController");

router.get(
    "/summary",
    verifyToken,
    getDashboardSummary
);

module.exports = router;