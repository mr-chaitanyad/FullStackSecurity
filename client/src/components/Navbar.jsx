import React from 'react';
import { CloudSun, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
          <CloudSun className="w-9 h-9" />
          WeatherApp
        </div>

        {/* Links */}
        <div className="hidden md:flex space-x-6 text-gray-600 font-medium">
          <Link to="/weatherDashboard" className="hover:text-indigo-600 transition">Home</Link>
          {localStorage.getItem("role")=="admin"?<Link to="/adminDashboard" className="hover:text-indigo-600 transition">Dashboard</Link>:<Link/>}
          {localStorage.getItem("token")?<button
            onClick={handleLogout}
            className="hover:text-indigo-600 transition"
          >
            Logout
          </button>:<Link/>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
