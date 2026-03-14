require('dotenv').config();
const mongoose = require('mongoose');

async function fixGithubIdIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Drop the problematic index
        try {
            await usersCollection.dropIndex('githubId_1');
            console.log('✅ Dropped old githubId index');
        } catch (err) {
            console.log('ℹ️  Index might not exist:', err.message);
        }

        // Create a proper sparse unique index
        await usersCollection.createIndex(
            { githubId: 1 },
            { 
                unique: true, 
                sparse: true,
                name: 'githubId_1'
            }
        );
        console.log('✅ Created new sparse unique index on githubId');

        // List all indexes to verify
        const indexes = await usersCollection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
                       index.unique ? '(unique)' : '', 
                       index.sparse ? '(sparse)' : '');
        });

        console.log('\n✅ Index fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing index:', error);
        process.exit(1);
    }
}

fixGithubIdIndex();
