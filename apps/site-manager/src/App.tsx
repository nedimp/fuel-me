import { useState, useEffect } from 'react';
import type { HelloResponse, HealthResponse } from 'shared';

const API_URL = 'http://localhost:4000';

function App() {
  const [helloData, setHelloData] = useState<HelloResponse | null>(null);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [helloRes, healthRes] = await Promise.all([
          fetch(`${API_URL}/hello`),
          fetch(`${API_URL}/health`),
        ]);

        if (!helloRes.ok || !healthRes.ok) {
          throw new Error('Failed to fetch data from API');
        }

        const hello: HelloResponse = await helloRes.json();
        const health: HealthResponse = await healthRes.json();

        setHelloData(hello);
        setHealthData(health);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Site Manager
            </h1>
            <p className="text-xl text-gray-600">
              Public-Facing Application
            </p>
          </header>

          {loading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && helloData && healthData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="ml-3 text-2xl font-bold text-gray-900">
                    Backend Connected
                  </h2>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold text-gray-900 mb-2">API Response:</h3>
                    <p className="text-gray-700">{helloData.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      App: {helloData.app} | Version: {helloData.version}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold text-gray-900 mb-2">Health Status:</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        healthData.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-gray-700 capitalize">{healthData.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Database: {healthData.database}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="font-semibold text-indigo-900 mb-2">
                  ✅ TypeScript Types Shared
                </h3>
                <p className="text-indigo-700">
                  This app uses the <code className="bg-indigo-100 px-2 py-1 rounded">shared</code> package
                  for type-safe communication with the backend.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
