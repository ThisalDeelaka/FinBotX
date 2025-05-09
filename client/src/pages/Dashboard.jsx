import { useState, useEffect } from "react";
import { getAuthHeaders, api } from "../utils/api";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  RefreshCw, CreditCard, PieChart as PieIcon, BarChart as BarIcon,
  TrendingDown, AlertCircle, Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiMode, setAiMode] = useState("balanced");
  const [debtAmount, setDebtAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [debtLoading, setDebtLoading] = useState(false);
  const [debtError, setDebtError] = useState("");
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState({ income: true, expenses: true });

  const transactions = [
    { id: 1, name: "Salary", amount: "+$4,500", date: "Today", category: "Income", aiFlag: "important" },
    { id: 2, name: "Rent", amount: "-$1,200", date: "Yesterday", category: "Housing", aiFlag: "recurring" },
    { id: 3, name: "Groceries", amount: "-$250", date: "Today", category: "Food", aiFlag: "normal" },
  ];

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const incomeResponse = await api.get('/income/summary', getAuthHeaders());
        setIncomeData(incomeResponse.data);
        setLoading(prev => ({ ...prev, income: false }));

        const expenseResponse = await api.get('/income/summary', getAuthHeaders());
        setExpenseData(expenseResponse.data);
        setLoading(prev => ({ ...prev, expenses: false }));
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setLoading({ income: false, expenses: false });
      }
    };

    fetchFinancialData();
  }, []);

  const handleDebtSimulationSubmit = async (e) => {
    e.preventDefault();
    if (debtAmount <= 0 || interestRate <= 0) {
      setDebtError("Please fill in all fields correctly.");
      return;
    }

    setDebtLoading(true);
    try {
      const response = await api.post(
        "/ai/debt-simulation",
        { debtAmount, interestRate },
        getAuthHeaders()
      );
      setSimulationResult(response.data);
      setDebtError("");
    } catch (error) {
      setDebtError("Failed to simulate debt payoff.");
    } finally {
      setDebtLoading(false);
    }
  };

  // Screen Reader Functionality
  const readPageContent = () => {
    const content = `
      Welcome to your Financial Dashboard.
      AI mode is set to ${aiMode}.
      Your total debt is $${debtAmount} with an interest rate of ${interestRate} percent.
      ${simulationResult ? `Based on the simulation, it will take ${simulationResult.months} months to pay off your debt.
      Total interest is $${simulationResult.totalInterest.toFixed(2)}.
      Monthly payment is $${simulationResult.monthlyPayment.toFixed(2)}.` : ''}
      Recent transactions are:
      ${transactions.map(t => `${t.name}, ${t.amount}, in category ${t.category}.`).join(" ")}
    `;
    const utterance = new SpeechSynthesisUtterance(content);
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
  };

  const IncomeChart = () => (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <PieIcon className="w-5 h-5 mr-2 text-blue-600" /> Income Distribution
      </h3>
      {loading.income ? (
        <div className="text-gray-500 flex items-center justify-center h-64">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Loading income data...
        </div>
      ) : (
        <div className="flex justify-center">
          <PieChart width={340} height={280}>
            <Pie
              data={incomeData}
              dataKey="total"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {incomeData.map((_, index) => (
                <Cell key={index} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
          </PieChart>
        </div>
      )}
    </div>
  );

  const ExpenseChart = () => (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarIcon className="w-5 h-5 mr-2 text-green-600" /> Expense Breakdown
      </h3>
      {loading.expenses ? (
        <div className="text-gray-500 flex items-center justify-center h-64">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Loading expense data...
        </div>
      ) : (
        <div className="flex justify-center">
          <BarChart width={460} height={280} data={expenseData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#10B981" />
          </BarChart>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="pt-16 flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 p-6 md:p-8 transition-all duration-300 md:ml-16 lg:ml-56">
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                  <Brain className="mr-3 text-blue-600" /> Financial Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive view of your finances</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="bg-white border border-gray-300 px-3 py-1 rounded"
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value)}
                >
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                <button
                  onClick={readPageContent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center text-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Read Aloud
                </button>
                <button
                  onClick={stopReading}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1.5" /> Stop
                </button>
              </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
              <IncomeChart />
              <ExpenseChart />
            </div>

            <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-5 flex items-center">
                <TrendingDown className="w-6 h-6 mr-2 text-red-600" /> Debt Payoff Calculator
              </h2>
              <form onSubmit={handleDebtSimulationSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Debt ($)</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={debtLoading}
                >
                  {debtLoading ? "Calculating..." : "Run Simulation"}
                </button>
              </form>

              {simulationResult && (
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <p className="text-sm text-gray-600">Months to Payoff</p>
                    <p className="text-2xl font-bold text-blue-600">{simulationResult.months}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${simulationResult.totalInterest.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${simulationResult.monthlyPayment.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {debtError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {debtError}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-5 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-purple-600" /> Recent Transactions
              </h2>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full mr-3 ${
                          transaction.amount.startsWith("+")
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>{transaction.date}</span>
                          <span className="mx-1">•</span>
                          <span>{transaction.category}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-medium ${
                        transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:underline text-sm">
                  View All Transactions
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;