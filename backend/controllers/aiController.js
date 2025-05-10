const axios = require("axios");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const handleUserQuery = async (req, res) => {
  try {
    const { query, userId } = req.body; // Now includes userId
    console.log("Received Query:", query);

    // 1. Use Gemini to Understand the Intent
    const geminiPrompt = `
      You are a helpful financial chatbot.  A user has asked the following question:
      ${query}

      Your goal is to understand the user's intent and extract the relevant information.

      Specifically, try to identify the following:

      *   **Category:**  What financial category is the user asking about (e.g., "expenses", "income", "budget", "savings")? If it's an expense, what is the specific expense category (e.g., "coffee", "dining", "transportation")? Respond 'None', if it does not apply.
      *   **Time Period:**  Is the user asking about a specific time period (e.g., "last month", "this year", "today")? Respond 'None', if it does not apply.
      *   **Action:** What action is the user trying to take (e.g., "find out", "compare", "create", "recommend")? Respond 'None', if it does not apply.

      Respond with a JSON object containing the extracted information ONLY. Do not use markdown or backticks.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or a more powerful model
    const geminiResult = await model.generateContent(geminiPrompt);
    let geminiResponse = geminiResult.response.text();

    // **NEW CODE: Remove Markdown formatting**
    geminiResponse = geminiResponse.replace(/```(json)?\n/g, ""); // Remove ```json and ```
    geminiResponse = geminiResponse.replace(/```/g, ""); // Remove any remaining ```
    geminiResponse = geminiResponse.trim(); // Remove leading/trailing whitespace


    let intent;
    try {
      intent = JSON.parse(geminiResponse);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return res.status(500).json({ error: "Gemini returned an invalid response.", details: error.message });
    }

    console.log("Gemini Intent:", intent);

    // 2.  Handle Different Intents
    if (intent.category === "expenses") {
      // Handle expense-related queries
      const categoryName = intent.specificExpenseCategory || "all";  // Default to all expenses
      //Query the DB with the extracted parameter
      const expenses = await Expense.aggregate([
        { $match: { userId: req.user.id, category: { $regex: categoryName, $options: "i" } } },
        { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
      ]);

        if (expenses.length === 0 || !expenses[0].totalSpent) {
            return res.json({ message: `You haven't spent anything on ${categoryName}.` });
          }

          res.json({ totalSpent: expenses[0].totalSpent });
    } else if (intent.category === "income") {
      // Handle income-related queries (adapt to your Income model)
      const income = await Income.find({ userId: req.user.id });
      const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
      return res.json({ message: `Your total income is ${totalIncome}`});
    } else if (intent.category === "budget") {
      // Handle budget-related queries (adapt to your Budget model)
      return res.json({ message: `Sorry this service is not implementet yet, or you can ask with other words.`});
    } else if (intent.category === "savings") {
      // Handle savings-related queries
       return res.json({ message: `Sorry this service is not implementet yet, or you can ask with other words.`});
    } else if (intent.category === "Unknown") {
      // Handle unknown intent
      return res.json({ message: "I'm sorry, I didn't understand your question. Could you please rephrase it?" });
    } else {
      return res.json({ message: "I can only assist with a defined list, please check those options." });
    }
  } catch (error) {
    console.error("Query Error:", error);
    res.status(500).json({ error: "Failed to process user query.", details: error.message });
  }
};

const getFinancialInsights = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    const income = await Income.find({ userId: req.user.id });

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const prompt = `Based on the user's total income ($${totalIncome}) and total expenses ($${totalExpenses}), 
      provide financial insights including:
      1. Smart saving tips.
      2. Alternative expense suggestions.
      3. Investment recommendations.`;

    // Correctly structure the request body for generateContent
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Extract the generated text using the correct path
    const fullText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Basic parsing of the AI response
    const parseSection = (title, text) => {
      const regex = new RegExp(`${title}[:\\-\\n]*([^#\\n]+)`, "i");
      const match = text.match(regex);
      return match ? (match ? match[1].trim() : "No insights available") : "No insights available";
    };

    const smartSavingTips = parseSection("1. Smart saving tips", fullText);
    const alternativeExpenses = parseSection("2. Alternative expense suggestions", fullText);
    const investmentRecommendations = parseSection("3. Investment recommendations", fullText);

    res.json({
      smartSavingTips,
      alternativeExpenses,
      investmentRecommendations,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to generate financial insights.", details: error.message });
  }
};

const handleGeneralFinanceQuery = async (req, res) => {
  try {
    const { query } = req.body;
    console.log("Received General Finance Query:", query);

    const geminiPrompt = `
      You are a helpful and knowledgeable AI financial advisor.
      A user has asked the following question about general finance principles:
      ${query}

      Provide a clear, concise, and accurate response to the user's question in *no more than three lines*.
      Focus on providing the core financial idea, without asking for or using any personal user data.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const geminiResult = await model.generateContent(geminiPrompt);
    const geminiResponse = geminiResult.response.text();

    console.log("Gemini Response:", geminiResponse);

    res.json({ message: geminiResponse });

  } catch (error) {
    console.error("General Finance Query Error:", error);
    res.status(500).json({ error: "Failed to process general finance query.", details: error.message });
  }
};


const getSpendingHeatMap = async (req, res) => {
  try {
    console.log("Fetching heatmap for userId:", req.user.id); // Check if userId is correct

    // Convert userId to ObjectId using `new` keyword
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const expenses = await Expense.aggregate([
      { $match: { userId: userId } }, 
      { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } }, 
      { $sort: { totalSpent: -1 } }
    ]);
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    res.status(500).json({ error: "Error fetching heatmap data", details: error.message });
  }
};

const debtSimulationWithIncomeExpenses = async (req, res) => {
  const { debtAmount, interestRate } = req.body;

  const income = await Income.find({ userId: req.user.id });
  const expenses = await Expense.find({ userId: req.user.id });

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const availablePayment = totalIncome - totalExpenses;

  if (availablePayment <= 0) {
    return res.status(400).json({
      error: "Your income is not sufficient to cover your expenses. Consider reducing expenses.",
    });
  }

  const simulation = simulateDebtPayoff(debtAmount, interestRate, availablePayment);

  res.json({
    months: simulation.months,
    totalInterest: simulation.totalInterest,
    availablePayment: availablePayment,
  });
};

const simulateDebtPayoff = (debtAmount, annualInterestRate, monthlyPayment) => {
  const monthlyInterestRate = (annualInterestRate / 100) / 12;
  let balance = debtAmount;
  let months = 0;
  let totalInterest = 0;

  while (balance > 0) {
    const interest = balance * monthlyInterestRate;
    totalInterest += interest;
    const payment = Math.min(monthlyPayment, balance + interest);
    balance += interest - payment;
    months++;

    if (months > 600) break; // Cap at 50 years
  }

  return {
    months,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
};




module.exports = { handleUserQuery, getFinancialInsights,handleGeneralFinanceQuery,getSpendingHeatMap, debtSimulationWithIncomeExpenses };