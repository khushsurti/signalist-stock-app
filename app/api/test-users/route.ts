import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/database/mongoose';

export async function GET() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed' 
      });
    }
    
    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Try to get users from all possible collections
    const possibleCollections = ['user', 'users', 'User', 'Users'];
    const results: any = {};
    
    for (const collName of possibleCollections) {
      if (collectionNames.includes(collName)) {
        const collection = db.collection(collName);
        const count = await collection.countDocuments();
        const sample = await collection.find({}).limit(2).toArray();
        
        results[collName] = {
          exists: true,
          count,
          sample: sample.map(doc => ({
            id: doc._id?.toString(),
            name: doc.name || doc.fullName || 'No name',
            email: doc.email || 'No email'
          }))
        };
      } else {
        results[collName] = { exists: false };
      }
    }
    
    return NextResponse.json({
      success: true,
      collections: collectionNames,
      results
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}