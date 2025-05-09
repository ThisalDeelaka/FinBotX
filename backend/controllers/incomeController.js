const Income = require("../models/Income");

// Add Income
const addIncome = async (req, res) => {
  const { source, amount } = req.body;
  const income = await Income.create({ userId: req.user.id, source, amount });
  res.status(201).json(income);
};

// Get Income
const getIncome = async (req, res) => {
  const income = await Income.find({ userId: req.user.id });
  res.json(income);
};

// Update Income
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount } = req.body;

    const income = await Income.findById(id);
    
    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }

    // Verify user owns the income record
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const updatedIncome = await Income.findByIdAndUpdate(
      id,
      { source, amount },
      { new: true }
    );

    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Income
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await Income.findById(id);
    
    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }

    // Verify user owns the income record
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Income.findByIdAndDelete(id);
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getIncomeSummary = async (req, res) => {
  try {
    const summary = await Income.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { addIncome, getIncome, updateIncome, deleteIncome, getIncomeSummary };
