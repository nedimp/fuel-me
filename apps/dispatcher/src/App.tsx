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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <div className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ADMIN DASHBOARD
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Dispatcher
            </h1>
            <p className="text-xl text-gray-600">
              Internal Operations Dashboard
            </p>
          </header>

          {loading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                    <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="ml-3 text-2xl font-bold text-gray-900">
                    System Status
                  </h2>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Backend API:</h3>
                    <p className="text-gray-700">{helloData.message}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Application:</span>
                        <span className="ml-2 font-medium text-gray-900">{helloData.app}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Version:</span>
                        <span className="ml-2 font-medium text-gray-900">{helloData.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Infrastructure:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">API Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          healthData.status === 'healthy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {healthData.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Database</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          healthData.database === 'connected' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {healthData.database}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-start">
                  <svg className="h-6 w-6 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="font-semibold text-lg mb-2">
                      Type-Safe Architecture
                    </h3>
                    <p className="text-purple-100">
                      This admin dashboard uses shared TypeScript types from the <code className="bg-purple-700 px-2 py-1 rounded">shared</code> package,
                      ensuring type safety across the entire stack.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
