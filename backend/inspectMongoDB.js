const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import all models
const User = require('./models/User');
const Marketplace = require('./models/Marketplace');
const PitchDeck = require('./models/PitchDeck');
const Resource = require('./models/Resource');
const Portfolio = require('./models/Portfolio');
const ProofOfWork = require('./models/ProofOfWork');
const Admin = require('./models/Admin');
const AdminLog = require('./models/AdminLog');
const Analysis = require('./models/Analysis');
const Deal = require('./models/Deal');
const Document = require('./models/Document');
const EligibilityProfile = require('./models/EligibilityProfile');
const Startup = require('./models/Startup');

const inspectDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fondorax', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Define collections
    const collections = [
      { name: 'Users', model: User },
      { name: 'Marketplace Listings', model: Marketplace },
      { name: 'Pitch Decks', model: PitchDeck },
      { name: 'Resources', model: Resource },
      { name: 'Portfolios', model: Portfolio },
      { name: 'Proof of Work', model: ProofOfWork },
      { name: 'Admins', model: Admin },
      { name: 'Admin Logs', model: AdminLog },
      { name: 'Analyses', model: Analysis },
      { name: 'Deals', model: Deal },
      { name: 'Documents', model: Document },
      { name: 'Eligibility Profiles', model: EligibilityProfile },
      { name: 'Startups', model: Startup },
    ];

    console.log('📊 DATABASE INSPECTION REPORT\n');
    console.log('═'.repeat(60));

    let totalDocuments = 0;

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        totalDocuments += count;
        
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`${status} ${collection.name.padEnd(30)} | Count: ${count}`);

        // Show sample data if collection has documents
        if (count > 0 && count <= 5) {
          const samples = await collection.model.find().limit(3);
          samples.forEach((doc, idx) => {
            console.log(`   └─ Sample ${idx + 1}: ${JSON.stringify(doc, null, 2).substring(0, 80)}...`);
          });
        } else if (count > 5) {
          const sample = await collection.model.findOne();
          if (sample) {
            console.log(`   └─ Sample: ${JSON.stringify(sample.toObject(), null, 2).substring(0, 100)}...`);
          }
        }
      } catch (err) {
        console.log(`❌ ${collection.name.padEnd(30)} | Error: ${err.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`\n📈 TOTAL DOCUMENTS ACROSS ALL COLLECTIONS: ${totalDocuments}\n`);

    // Show some useful stats
    console.log('📌 NEXT STEPS:');
    console.log('1. If data is missing, check if users/listings were created');
    console.log('2. Verify MongoDB connection string in .env file');
    console.log('3. Check if the database name is correct (should be "fondorax")');
    console.log('4. Use MongoDB Atlas or MongoDB Compass to view data directly');

    await mongoose.connection.close();
    console.log('\n✅ Inspection complete. Connection closed.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

inspectDatabase();
