import React, { useState, useEffect } from "react";
import { api, getAuthHeaders } from "../../utils/api";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import toast from "react-hot-toast";
import {
  TrendingUpIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  CreditCardIcon,
  PaperAirplaneIcon,
  CogIcon,
  UserCircleIcon,
  RefreshIcon,
  ChartBarIcon,
  LightBulbIcon,
  CalendarIcon
} from "@heroicons/react/outline";

const FinancialInsights = () => {
  // State for AI Insights section
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for Financial Advisory Chat
  const [generalQuery, setGeneralQuery] = useState("");
  const [generalChatHistory, setGeneralChatHistory] = useState([]);
  const [generalQueryLoading, setGeneralQueryLoading] = useState(false);

  // Fetch financial insights on component mount
  useEffect(() => {
    fetchFinancialInsights();
  }, []);

  // Fetch Financial Insights
  const fetchFinancialInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/ai/insights", getAuthHeaders());
      setInsights(response.data);
    } catch (err) {
      setError("Unable to retrieve financial insights at the moment.");
      toast.error("Error fetching insights");
      console.error("Insights fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle General Query Submission
  const handleGeneralQuerySubmit = async (e) => {
    e.preventDefault();
    if (!generalQuery.trim()) return;

    const newUserMessage = { 
      type: "user", 
      message: generalQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setGeneralQueryLoading(true);
    setError("");
    try {
      const response = await api.post(
        "/ai/general",
        { query: generalQuery },
        getAuthHeaders()
      );

      const botResponse = {
        type: "bot",
        message: response.data.message || 'No detailed response available.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setGeneralChatHistory((prevHistory) => [
        ...prevHistory,
        newUserMessage,
        botResponse
      ]);

      setGeneralQuery("");
    } catch (err) {
      setError("Failed to process your financial question.");
      toast.error("Query processing error");
      console.error("General query error:", err);

      // Add error message to chat history
      setGeneralChatHistory((prevHistory) => [
        ...prevHistory,
        newUserMessage,
        { 
          type: "system", 
          message: "Oops! I couldn't process your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setGeneralQueryLoading(false);
    }
  };

  // Reset Chat History
  const handleResetChat = () => {
    setGeneralChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <Navbar />
      
      <div className="ml-64 min-h-screen">
        
        
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <header className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Financial Insights
              </h1>
              <p className="text-slate-600 mt-3 text-xl font-medium">
                Your intelligent financial companion
              </p>
            </div>
            <div className="flex space-x-4">
              <TrendingUpIcon className="w-16 h-16 text-emerald-500 opacity-30" />
              <CreditCardIcon className="w-16 h-16 text-teal-500 opacity-30" />
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Insights Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <SparklesIcon className="w-10 h-10 text-emerald-500 mr-4" />
                <h2 className="text-2xl font-bold text-slate-800">
                  AI Financial Insights
                </h2>
              </div>

              {loading ? (
                <div className="text-center text-slate-500 animate-pulse">
                  Generating intelligent insights...
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : insights ? (
                <div className="space-y-6">
                  {[
                    {
                      title: "Smart Saving Strategies",
                      content: insights.smartSavingTips,
                      icon: <CreditCardIcon className="w-8 h-8 text-emerald-500" />,
                      gradient: "from-emerald-500 to-green-400"
                    },
                    {
                      title: "Expense Optimization",
                      content: insights.alternativeExpenses,
                      icon: <ChartBarIcon className="w-8 h-8 text-teal-500" />,
                      gradient: "from-teal-500 to-blue-400"
                    },
                    {
                      title: "Investment Guidance",
                      content: insights.investmentRecommendations,
                      icon: <LightBulbIcon className="w-8 h-8 text-blue-500" />,
                      gradient: "from-blue-500 to-indigo-400"
                    },
                  ].map((insight, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-4 bg-slate-50 p-4 rounded-xl hover:scale-[1.02] transition-transform"
                    >
                      <div className="bg-white/20 p-2 rounded-lg">
                        {insight.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2">{insight.title}</h3>
                        <p className="text-sm text-slate-600">
                          {insight.content || "Comprehensive analysis pending."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  No insights currently available
                </div>
              )}
            </div>

            {/* Financial Advisory Chat Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6 relative">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <QuestionMarkCircleIcon className="w-10 h-10 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Financial Advisory
                    </h2>
                    <p className="text-sm text-slate-500">
                      Your intelligent financial companion
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleResetChat}
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                  title="Clear Conversation"
                >
                  <RefreshIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages Container */}
              <div className="h-[400px] overflow-y-auto bg-slate-50 rounded-xl p-4 space-y-4">
                {generalChatHistory.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <CalendarIcon className="mx-auto w-16 h-16 text-blue-300 opacity-50 mb-4" />
                    <p>Start a conversation about your financial questions</p>
                    <p className="text-sm mt-2">Ask anything about budgeting, investments, or financial planning</p>
                  </div>
                ) : (
                  generalChatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start space-x-3 ${
                        msg.type === 'user' 
                          ? 'flex-row-reverse space-x-reverse' 
                          : 'flex-row'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {msg.type === 'user' ? (
                          <UserCircleIcon className="w-8 h-8 text-blue-500" />
                        ) : msg.type === 'bot' ? (
                          <CogIcon className="w-8 h-8 text-teal-500" />
                        ) : (
                          <SparklesIcon className="w-8 h-8 text-red-500" />
                        )}
                      </div>
                      <div 
                        className={`p-3 rounded-xl max-w-[70%] ${
                          msg.type === 'user' 
                            ? 'bg-blue-100 text-slate-800' 
                            : msg.type === 'bot'
                            ? 'bg-teal-50 text-slate-800'
                            : 'bg-red-50 text-slate-800'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs text-slate-500 mt-1 text-right">
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Query Input */}
              <form onSubmit={handleGeneralQuerySubmit} className="relative">
                <input
                  type="text"
                  value={generalQuery}
                  onChange={(e) => setGeneralQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors placeholder-slate-400"
                  placeholder="Ask your financial question..."
                />
                <button 
                  type="submit" 
                  disabled={generalQueryLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 
                  text-blue-500 hover:text-blue-600 
                  disabled:text-slate-400 transition-colors"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </form>

              {/* Error Handling */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;