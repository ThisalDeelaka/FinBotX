// src/components/DynamicIsland.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMicrophone,
  FaChartLine,
  FaBell,
} from "react-icons/fa";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

const DynamicIsland = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [notification, setNotification] = useState(null);
  const [accessMode, setAccessMode] = useState("default"); // "default" | "high-contrast" | "monochrome" | "protanopia" | "deuteranopia" | "tritanopia"
  const { transcript, isListening, startListening } = useVoiceRecognition();

  // apply the appropriate class to <html> whenever accessMode changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      "high-contrast",
      "monochrome",
      "protanopia",
      "deuteranopia",
      "tritanopia"
    );
    if (accessMode !== "default") {
      root.classList.add(accessMode);
    }
  }, [accessMode]);

  // random notification after 10s
  useEffect(() => {
    const notifications = [
      { type: "finance", title: "AAPL ↗ 3.2%", duration: 5000 },
      { type: "alert",   title: "New message",   duration: 4000 },
    ];
    const timer = setTimeout(() => {
      setNotification(
        notifications[Math.floor(Math.random() * notifications.length)]
      );
    }, 10000);
    return () => clearTimeout(timer);
  }, [notification]);

  // voice commands → navigation
  useEffect(() => {
    if (!transcript) return;
    const cmd = transcript.toLowerCase();
    if (cmd.includes("go to expenses"))        navigate("/expenses");
    if (cmd.includes("go to income"))          navigate("/income");
    if (cmd.includes("go to finance ai"))      navigate("/financial-insights");
  }, [transcript, navigate]);

  return (
    <>
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded((v) => !v)}
        className={`relative flex items-center justify-center bg-black/90 backdrop-blur-sm
          rounded-full shadow-xl transition-all duration-500 ease-in-out cursor-pointer
          overflow-visible ${
            expanded
              ? "w-96 h-10"
              : notification
              ? "w-36 h-8"
              : "w-28 h-8"
          } ${notification && !expanded ? "animate-pulse" : ""}`}
        style={{ margin: "3px 0", borderRadius: "28px" }}
      >
        {expanded ? (
          <div className="flex items-center justify-between w-full px-4">
            {/* Left controls */}
            <div className="flex items-center space-x-3">
              {/* Voice */}
              <div className="relative">
                <button
                  className={`p-2 transition-all duration-200 ${
                    isListening
                      ? "text-blue-400 scale-125 animate-pulse"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    startListening();
                  }}
                >
                  <FaMicrophone size={16} />
                </button>
                {transcript && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                      bg-white text-black px-3 py-2 rounded-lg text-sm max-w-xs shadow-lg
                      animate-fade-in z-50"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">🎙</span>
                      <span
                        className="animate-typing overflow-hidden whitespace-nowrap
                          border-r-2 border-r-black pr-1"
                      >
                        {transcript}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Finance */}
              <button
                className="text-gray-300 hover:text-white transition-colors p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/finance");
                }}
              >
                <FaChartLine size={16} />
              </button>

              {/* Alerts */}
              <button
                className="text-gray-300 hover:text-white transition-colors p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <FaBell size={16} />
              </button>
            </div>

            {/* Right: Accessibility buttons */}
            {/* Right: Accessibility buttons */}
<div className="flex items-center space-x-2">
  <button
    className={`px-2 py-1 text-xs rounded text-white ${
      accessMode === "default" ? "bg-white/20" : "hover:bg-white/10"
    }`}
    onClick={() => setAccessMode("default")}
    title="Normal"
  >
    N
  </button>
  <button
    className={`px-2 py-1 text-xs rounded text-white ${
      accessMode === "high-contrast" ? "bg-white/20" : "hover:bg-white/10"
    }`}
    onClick={() => setAccessMode("high-contrast")}
    title="High‑Contrast"
  >
    HC
  </button>
  <button
    className={`px-2 py-1 text-xs rounded text-white ${
      accessMode === "monochrome" ? "bg-white/20" : "hover:bg-white/10"
    }`}
    onClick={() => setAccessMode("monochrome")}
    title="Monochrome"
  >
    Mono
  </button>
  <button
    className={`px-2 py-1 text-xs rounded text-white ${
      accessMode === "protanopia" ? "bg-white/20" : "hover:bg-white/10"
    }`}
    onClick={() => setAccessMode("protanopia")}
    title="Protanopia"
  >
    P
  </button>
  <button
    className={`px-2 py-1 text-xs rounded text-white ${
      accessMode === "deuteranopia" ? "bg-white/20" : "hover:bg-white/10"
    }`}
    onClick={() => setAccessMode("deuteranopia")}
    title="Deuteranopia"
  >
    D
  </button>
  <button
    className={`px-2 py-1 text-xs rounded text-white ${
      accessMode === "tritanopia" ? "bg-white/20" : "hover:bg-white/10"
    }`}
    onClick={() => setAccessMode("tritanopia")}
    title="Tritanopia"
  >
    T
  </button>
</div>

          </div>
        ) : notification ? (
          // Collapsed with notification
          <div className="flex items-center justify-between w-full px-3 animate-fade-in">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                notification.type === "finance"
                  ? "bg-green-400"
                  : "bg-blue-400"
              }`}
            >
              {notification.type === "finance" ? (
                <FaChartLine size={10} className="text-white" />
              ) : (
                <FaBell size={10} className="text-white" />
              )}
            </div>
            <span className="text-xs text-white font-medium ml-2 truncate">
              {notification.title}
            </span>
          </div>
        ) : (
          // Collapsed loading dots
          <div className="flex items-center justify-center space-x-2 animate-fade-in">
            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce delay-100" />
          </div>
        )}
      </div>

      {/* Inline CSS for all modes */}
      <style>{`
        html.high-contrast {
          filter: contrast(2) brightness(1.2);
          background-color: #000 !important;
          color: #fff !important;
        }
        html.high-contrast img,
        html.high-contrast svg {
          filter: contrast(2) brightness(1.2);
        }
        html.monochrome { filter: grayscale(100%); }
        html.protanopia { filter: url(#protanopia); }
        html.deuteranopia { filter: url(#deuteranopia); }
        html.tritanopia { filter: url(#tritanopia); }
      `}</style>

      {/* SVG filters for color‑blind modes */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values=".567 .433 0 0 0
                    .558 .442 0 0 0
                    0    .242 .758 0 0
                    0    0    0    1 0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values=".625 .375 0 0 0
                    .7   .3   0 0 0
                    0    .3   .7 0 0
                    0    0    0  1 0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values=".95  .05  0    0 0
                    0    .433 .567 0 0
                    0    .475 .525 0 0
                    0    0    0    1 0"
          />
        </filter>
      </svg>
    </>
  );
};

export default DynamicIsland;
