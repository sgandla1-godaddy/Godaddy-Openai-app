import React, { useState, useEffect } from 'react';
import './App.css';

interface ServerResponse {
  status?: string;
  message?: string;
  timestamp?: string;
  data?: {
    server: string;
    version: string;
    environment: string;
  };
}

function App() {
  const [serverData, setServerData] = useState<ServerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hello');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 GoDaddy React Node.js Server</h1>
        <p>Welcome to your React + Node.js application!</p>

        <div className="button-group">
          <button
            onClick={fetchServerData}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'Get Server Data'}
          </button>

          <button
            onClick={checkHealth}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Checking...' : 'Check Health'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <h3>❌ Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {serverData && (
          <div className="server-response">
            <h3>✅ Server Response:</h3>
            <pre>{JSON.stringify(serverData, null, 2)}</pre>
          </div>
        )}

        <div className="info-section">
          <h3>📋 Available Endpoints:</h3>
          <ul>
            <li><code>GET /api/health</code> - Server health check</li>
            <li><code>GET /api/hello</code> - Server information</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
