const express = require("express");
const { getFinancialInsights, handleUserQuery, getSpendingHeatMap, debtSimulationWithIncomeExpenses } = require("../controllers/aiController");
const { handleGeneralFinanceQuery } = require("../controllers/aiController");  

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/insights", protect, getFinancialInsights);
router.post("/query", protect, handleUserQuery); 
router.post("/general", protect, handleGeneralFinanceQuery);
router.get("/spending-heatmap", protect, getSpendingHeatMap);
router.post("/debt-simulation", protect, debtSimulationWithIncomeExpenses);

module.exports = router;