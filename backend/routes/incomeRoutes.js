const express = require("express");
const { addIncome, getIncome, updateIncome, deleteIncome, getIncomeSummary } = require("../controllers/incomeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addIncome);
router.get("/", protect, getIncome);
router.get("/summary", protect, getIncomeSummary);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

module.exports = router;
