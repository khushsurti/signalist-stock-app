'use client';

import { useState, useEffect } from 'react';
import { connectToDatabase } from '@/database/mongoose';

export default function TestUsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        
        // ✅ Check if db exists
        if (!db) {
          throw new Error('Database connection not available');
        }
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        
        // Try to get users from 'user' collection
        const userCollection = db.collection('user');
        const users = await userCollection.find({}).toArray();
        
        setData({
          collections: collections.map(c => c.name),
          userCount: users.length,
          users: users.map((u: any) => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email
          }))
        });
      } catch (error) {
        console.error('Error:', error);
        setData({ error: String(error) });
      } finally {
        setLoading(false);
      }
    };
    testConnection();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      
      {data?.error ? (
        <div className="bg-red-100 p-4 rounded text-red-700">
          Error: {data.error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Collections in Database:</h2>
            <p>{data?.collections?.join(', ') || 'No collections'}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Users in 'user' collection:</h2>
            <p>Count: {data?.userCount || 0}</p>
          </div>
          
          {data?.users && data.users.length > 0 ? (
            <div className="bg-white border rounded p-4">
              <h2 className="font-semibold mb-2">User List:</h2>
              {data.users.map((user: any) => (
                <div key={user.id} className="border-b last:border-0 py-2">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-yellow-700">No users found in 'user' collection</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}