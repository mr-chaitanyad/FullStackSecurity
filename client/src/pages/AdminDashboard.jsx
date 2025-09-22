import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()
  const [isAdmin, setAdmin] = useState(false);
  
  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await axios.get("http://localhost:5000/adminDashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);

      if (res.data.admin.role !== "admin") {
        navigate("/weatherDashboard");
      }
      navigate("/adminDashboard")
    } catch (err) {
      console.log("Access denied", err);
      navigate("/weatherDashboard"); // optional: redirect if not admin
    }
  };
  
  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of logged-in users</p>
        </div>

        {/* Stats Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-2xl p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">Total Logged-in Users</h2>
            <p className="text-4xl text-indigo-600 mt-2">{users.length}</p>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white shadow-md rounded-2xl overflow-x-auto">
          <table className="min-w-full table-auto text-sm text-gray-700">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">#</th>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Login Time</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{idx + 1}</td>
                  <td className="px-6 py-3">{user.name}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{user.role}</td>
                  <td className="px-6 py-3">{user.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
