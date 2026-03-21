'use client';

import { useState, useEffect } from 'react';

export default function DirectTestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test-users')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setData({ error: String(err) });
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      
      {data.error ? (
        <div className="bg-red-100 p-4 rounded text-red-700">
          Error: {data.error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Collections in Database:</h2>
            <p className="font-mono">{data.collections?.join(', ') || 'None'}</p>
          </div>

          {data.results && Object.entries(data.results).map(([name, info]: [string, any]) => (
            <div key={name} className="border rounded p-4">
              <h2 className="font-semibold text-lg mb-2">Collection: {name}</h2>
              {info.exists ? (
                <>
                  <p>✅ Exists - Count: {info.count}</p>
                  {info.sample && info.sample.length > 0 ? (
                    <div className="mt-2">
                      <p className="font-medium">Sample Users:</p>
                      {info.sample.map((user: any, i: number) => (
                        <div key={i} className="bg-gray-50 p-2 mt-2 rounded">
                          <p><strong>Name:</strong> {user.name}</p>
                          <p><strong>Email:</strong> {user.email}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-yellow-600 mt-2">No users in this collection</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">❌ Collection does not exist</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}