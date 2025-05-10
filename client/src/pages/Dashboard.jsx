import { useState, useEffect } from "react";
import { getAuthHeaders, api } from "../utils/api";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  RefreshCw,
  CreditCard,
  PieChart as PieIcon,
  BarChart as BarIcon,
  TrendingDown,
  AlertCircle,
  Brain
} from "lucide-react";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiMode, setAiMode] = useState("balanced");

  // debt form state
  const [debtAmount, setDebtAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [debtLoading, setDebtLoading] = useState(false);
  const [debtError, setDebtError] = useState("");

  // chart data state
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState({ income: true, expenses: true });

  const transactions = [
    { id: 1, name: "Salary",    amount: "+$4,500", date: "Today",     category: "Income", aiFlag: "important" },
    { id: 2, name: "Rent",      amount: "-$1,200", date: "Yesterday", category: "Housing", aiFlag: "recurring" },
    { id: 3, name: "Groceries", amount: "-$250",   date: "Today",     category: "Food",    aiFlag: "normal" },
  ];

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  // fetch income & expenses summaries
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const incomeResponse = await api.get(
          "/income/summary",
          getAuthHeaders()
        );
        setIncomeData(incomeResponse.data);
        setLoading(prev => ({ ...prev, income: false }));

        const expenseResponse = await api.get(
          "/income/summary",
          getAuthHeaders()
        );
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
      const { data } = await api.post(
        "/ai/debt-simulation",
        { debtAmount, interestRate },
        getAuthHeaders()
      );
      // server returns { months, totalInterest, availablePayment }
      setSimulationResult(data);
      setDebtError("");
    } catch (error) {
      console.error(error);
      setDebtError("Failed to simulate debt payoff.");
    } finally {
      setDebtLoading(false);
    }
  };

  // Screen reader
  const readPageContent = () => {
    const content = `
      Welcome to your Financial Dashboard.
      AI mode is set to ${aiMode}.
      Your total debt is LKR ${debtAmount} at an annual rate of ${interestRate}%.
      ${
        simulationResult
          ? `Based on the simulation, it will take ${simulationResult.months} months to pay off your debt.
             Total interest paid will be LKR ${simulationResult.totalInterest.toFixed(2)}.
             Monthly payment is LKR ${simulationResult.availablePayment.toFixed(2)}.`
          : ""
      }
      Recent transactions are:
      ${transactions.map(t => `${t.name}, ${t.amount}, category ${t.category}.`).join(" ")}
    `;
    const utterance = new SpeechSynthesisUtterance(content);
    window.speechSynthesis.speak(utterance);
  };
  const stopReading = () => window.speechSynthesis.cancel();

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
            {incomeData.map((_, i) => (
              <Cell key={i} fill={chartColors[i % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={val => `LKR ${val}`} />
          <Legend />
        </PieChart>
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
        <BarChart
          width={460}
          height={280}
          data={expenseData}
          margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip formatter={val => `LKR ${val}`} />
          <Legend />
          <Bar dataKey="total" fill="#10B981" />
        </BarChart>
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
            {/* Header */}
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
                  onChange={e => setAiMode(e.target.value)}
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

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <IncomeChart />
              <ExpenseChart />
            </div>

            {/* Debt Simulation */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
  <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-200">
    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
      <TrendingDown className="h-6 w-6 mr-3 text-blue-600" />
      Debt Simulation Calculator
    </h3>
    <p className="text-gray-600 mt-1 text-sm">Estimate how long it will take to pay off your debt</p>
  </div>
  
  <form onSubmit={handleDebtSimulationSubmit} className="p-6 space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Debt Amount
        </label>
        <div className="relative rounded-lg shadow-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium">
            LKR
          </span>
          <input
            type="number"
            value={debtAmount || ''}
            onChange={e => setDebtAmount(Number(e.target.value))}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
            placeholder="Enter your total debt amount"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Interest Rate
        </label>
        <div className="relative rounded-lg shadow-sm">
          <input
            type="number"
            value={interestRate || ''}
            onChange={e => setInterestRate(Number(e.target.value))}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
            placeholder="Enter annual interest rate"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 font-medium">
            %
          </span>
        </div>
      </div>
    </div>

    {debtError && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-600 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {debtError}
        </p>
      </div>
    )}

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md hover:shadow-lg"
      disabled={debtLoading}
    >
      <RefreshCw
        className={`h-5 w-5 ${debtLoading ? "animate-spin" : ""}`}
      />
      <span>
        {debtLoading
          ? "Processing Simulation..."
          : "Calculate Payoff Timeline"}
      </span>
    </button>
  </form>

  {/* Simulation Result */}
  {simulationResult && (
    <div className="p-6 bg-blue-50/30 rounded-b-2xl border-t border-gray-200">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">Payoff Summary</h4>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Time to Pay Off</p>
          <p className="text-xl font-bold text-gray-800">{simulationResult.months} months</p>
          <p className="text-gray-500 text-sm mt-1">({(simulationResult.months / 12).toFixed(1)} years)</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Interest</p>
          <p className="text-xl font-bold text-blue-600">LKR {simulationResult.totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Monthly Payment</p>
          <p className="text-xl font-bold text-green-600">LKR {simulationResult.availablePayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>
    </div>
  )}
</div>
            {/* Recent Transactions */}
            <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-5 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-purple-600" /> Recent
                Transactions
              </h2>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full mr-3 ${
                          tx.amount.startsWith("+")
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{tx.name}</p>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>{tx.date}</span>
                          <span className="mx-1">•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-medium ${
                        tx.amount.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.amount}
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
