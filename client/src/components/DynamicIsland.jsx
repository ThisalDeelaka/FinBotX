// src/components/DynamicIsland.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaChartLine, FaBell } from "react-icons/fa";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

const DynamicIsland = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [notification, setNotification] = useState(null);
  const { transcript, isListening, startListening } = useVoiceRecognition();

  useEffect(() => {
    const notifications = [
      { type: "finance", title: "AAPL ↗ 3.2%", duration: 5000 },
      { type: "alert", title: "New message", duration: 4000 }
    ];
    
    const timer = setTimeout(() => {
      setNotification(notifications[Math.floor(Math.random() * 2)]);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (transcript) {
      const command = transcript.toLowerCase();
      if (command.includes("go to expenses")) navigate("/expenses");
      if (command.includes("go to income")) navigate("/income");
      if (command.includes("go to finance ai")) navigate("/financial-insights");
    }
  }, [transcript, navigate]);

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded(!expanded)}
      className={`relative flex items-center justify-center bg-black/90 backdrop-blur-sm
        rounded-full shadow-xl transition-all duration-500 ease-in-out cursor-pointer
        overflow-visible ${expanded ? "w-72 h-10" : notification ? "w-36 h-8" : "w-28 h-8"}
        ${notification && !expanded ? "animate-pulse" : ""}`}
      style={{
        margin: "3px 0",
        borderRadius: "28px",
      }}
    >
      {expanded ? (
        <div className="flex items-center justify-between w-full px-5 py-1">
          {/* Voice Control Section */}
          <div className="relative">
            <button
              className={`p-2 transition-all duration-200 ${
                isListening 
                  ? "text-blue-400 scale-125 animate-pulse" 
                  : "text-gray-300 hover:text-white scale-100"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                startListening();
              }}
            >
              <div className="flex flex-col items-center">
                <FaMicrophone size={16} />
                <span className="text-xs mt-0.5">Voice</span>
              </div>
            </button>

            {/* Speech Bubble */}
            {transcript && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                bg-white text-black px-3 py-2 rounded-lg text-sm max-w-xs shadow-lg
                animate-fade-in z-50">
                <div className="flex items-center">
                  <span className="mr-2">🎙</span>
                  <span className="animate-typing overflow-hidden whitespace-nowrap
                    border-r-2 border-r-black pr-1">
                    {transcript}
                  </span>
                </div>
                <div className="absolute left-1/2 -bottom-2 w-0 h-0 
                  border-l-8 border-r-8 border-t-8 border-transparent 
                  border-t-white -translate-x-1/2"></div>
              </div>
            )}
          </div>

          {/* Finance Button */}
          <button
            className="text-gray-300 hover:text-white transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/finance");
            }}
          >
            <div className="flex flex-col items-center">
              <FaChartLine size={16} />
              <span className="text-xs mt-0.5">Finance</span>
            </div>
          </button>

          {/* Alerts Button */}
          <button
            className="text-gray-300 hover:text-white transition-colors p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <FaBell size={16} />
              <span className="text-xs mt-0.5">Alerts</span>
            </div>
          </button>
        </div>
      ) : notification ? (
        <div className="flex items-center justify-between w-full px-3 animate-fade-in">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            notification.type === "finance" ? "bg-green-400" : "bg-blue-400"
          }`}>
            {notification.type === "finance" ? 
              <FaChartLine size={10} className="text-white" /> : 
              <FaBell size={10} className="text-white" />
            }
          </div>
          <span className="text-xs text-white font-medium ml-2 truncate">
            {notification.title}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2 animate-fade-in">
          <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
        </div>
      )}
    </div>
  );
};

export default DynamicIsland;