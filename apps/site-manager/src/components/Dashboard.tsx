import { useEffect, useState } from 'react';
import type { AuthUser } from 'shared';

const API_URL = 'http://localhost:4000';

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [healthStatus, setHealthStatus] = useState<string>('');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch(() => setHealthStatus('error'));
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              User Info
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>{' '}
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span>{' '}
                <span className="text-gray-900">{user.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>{' '}
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
                  healthStatus === 'healthy'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm text-gray-700">
                {healthStatus === 'healthy' ? 'All systems operational' : 'System error'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                View Orders
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                Manage Profile
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Welcome to Site Manager
          </h2>
          <p className="text-gray-600">
            You've successfully authenticated! This is a demo dashboard showing
            the login/register functionality for the Fuel.me technical interview.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>JWT-based authentication</li>
              <li>Bcrypt password hashing</li>
              <li>Type-safe API with shared types</li>
              <li>Prisma ORM with PostgreSQL</li>
              <li>React + TypeScript + TailwindCSS</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
