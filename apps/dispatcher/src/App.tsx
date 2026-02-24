import { useState, useEffect } from "react";
import type { AuthUser, AuthResponse } from "shared";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("dispatcherAuthToken");
    const storedUser = localStorage.getItem("dispatcherUser");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("dispatcherAuthToken");
        localStorage.removeItem("dispatcherUser");
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (authData: AuthResponse) => {
    setUser(authData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("dispatcherAuthToken");
    localStorage.removeItem("dispatcherUser");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-purple-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
