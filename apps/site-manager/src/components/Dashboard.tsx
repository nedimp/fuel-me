import { useEffect, useState } from "react";
import type { AuthUser } from "shared";
import { OrderForm } from "./OrderForm";

const API_URL = "http://localhost:4000";

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [healthStatus, setHealthStatus] = useState<string>("");
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch(() => setHealthStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Site Manager</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Form - Full width on left */}
          <div className="md:col-span-1">
            <OrderForm token={token} />
          </div>

          {/* User Info Cards - Stacked on right */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                User Info
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>{" "}
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="text-gray-900">{user.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>{" "}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                System Health
              </h2>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    healthStatus === "healthy" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-700">
                  {healthStatus === "healthy"
                    ? "All systems operational"
                    : "System error"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
