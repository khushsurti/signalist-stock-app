// Run with: npx tsx scripts/generate-sample-verifications.ts
import { connectToDatabase } from '../database/mongoose';
import Verification from '../database/models/verification.model';

async function generateSampleVerifications() {
  try {
    await connectToDatabase();
    
    const sampleVerifications = [
      {
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        panNumber: 'ABCDE1234F',
        panVerified: false,
        aadharNumber: '123456789012',
        aadharVerified: false,
        bankName: 'State Bank of India',
        accountNumber: '12345678901',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
        bankVerified: false,
        verificationStatus: 'pending',
      },
      {
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        panNumber: 'XYZAB5678G',
        panVerified: true,
        aadharNumber: '987654321098',
        aadharVerified: true,
        bankName: 'HDFC Bank',
        accountNumber: '98765432109',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Jane Smith',
        bankVerified: true,
        verificationStatus: 'verified',
        verifiedBy: 'admin1',
        verifiedAt: new Date('2024-02-28'),
      },
      {
        userId: 'user3',
        userName: 'Bob Johnson',
        userEmail: 'bob@example.com',
        panNumber: 'PQRST9012H',
        panVerified: false,
        aadharNumber: '543216789012',
        aadharVerified: false,
        bankName: 'ICICI Bank',
        accountNumber: '54321678901',
        ifscCode: 'ICIC0001234',
        accountHolderName: 'Bob Johnson',
        bankVerified: false,
        verificationStatus: 'rejected',
        rejectionReason: 'Document unclear',
      },
    ];
    
    await Verification.insertMany(sampleVerifications);
    console.log('✅ Sample verifications created');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

generateSampleVerifications();