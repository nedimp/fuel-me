import { useState, useEffect } from "react";
import type { AuthUser, AuthResponse } from "shared";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (authData: AuthResponse) => {
    setUser(authData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
