import { Link, useLocation } from "react-router-dom";
import { FaMoneyBillWave, FaWallet, FaChartPie, FaUsers } from "react-icons/fa";
import { useState, useEffect } from "react";

const Sidebar = ({ isSidebarOpen }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`fixed top-16 left-0 z-40 min-h-[calc(100vh-4rem)] overflow-y-auto
        backdrop-blur-xl bg-white/70 text-gray-800 border-r border-white/60 shadow-lg transition-all duration-300 overflow-hidden
        ${isSidebarOpen ? 'w-64' : 'w-0'} 
        md:w-16 md:hover:w-56 lg:w-56`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 z-0"></div>

      {/* Animated orb */}
      <div 
        className={`absolute bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-teal-100/30 to-transparent backdrop-blur-lg z-0 transition-all duration-3000 ease-in-out ${
          animationPhase % 2 === 1 ? 'scale-100 opacity-30' : 'scale-105 opacity-15'
        }`}
      ></div>

      {/* Decorative lines */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((y, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#0e7490"
                strokeWidth="0.1"
                strokeDasharray="1,2"
                strokeOpacity={animationPhase === i % 4 ? "0.3" : "0.1"}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative mt-6 flex flex-col space-y-1 px-2 z-10">
        {[
          { to: "/dashboard", icon: <FaChartPie />, label: "Dashbord" },
          { to: "/financial-insights", icon: <FaChartPie />, label: "Finance AI" },
          { to: "/expenses", icon: <FaMoneyBillWave />, label: "Expenses" },
          { to: "/income", icon: <FaWallet />, label: "Income" },
          { to: "/shared-finance", icon: <FaUsers />, label: "Shared Finance" },
        ].map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
              isActive(to)
                ? "bg-white/80 border border-cyan-200 shadow-sm"
                : "text-gray-700 hover:bg-white/50 hover:border hover:border-cyan-200/30"
            }`}
            onMouseEnter={() => setHoveredItem(to)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span className={`${isActive(to) ? "text-cyan-500" : "text-gray-600"}`}>
              {icon}
            </span>
            <span className="md:opacity-0 md:group-hover:opacity-100 lg:opacity-100 transition-opacity duration-300">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Bottom progress bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
        <div className="w-24 h-1 rounded-full overflow-hidden bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-1000 ease-in-out"
            style={{ width: `${25 + animationPhase * 25}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
