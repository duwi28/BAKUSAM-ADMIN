import mysql from 'mysql2/promise';

console.log('🔌 Testing Database Connection...\n');

async function testConnection() {
  try {
    // Test connection with your database credentials
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'bakusam_app',
      password: 'BakusamApp2024!',
      database: 'bakusam_express'
    });

    console.log('✅ Database connection successful!');

    // Test sample queries
    const [drivers] = await connection.execute('SELECT COUNT(*) as total FROM drivers');
    const [orders] = await connection.execute('SELECT COUNT(*) as total FROM orders');
    const [customers] = await connection.execute('SELECT COUNT(*) as total FROM customers');

    console.log(`📊 Data loaded successfully:`);
    console.log(`   👥 Drivers: ${drivers[0].total}`);
    console.log(`   📦 Orders: ${orders[0].total}`);
    console.log(`   👤 Customers: ${customers[0].total}`);

    await connection.end();
    console.log('\n🎯 Database is ready for your Bakusam Express application!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Please check:');
    console.log('   1. MySQL server is running');
    console.log('   2. Database credentials are correct');
    console.log('   3. Database "bakusam_express" exists');
    console.log('   4. User "bakusam_app" has proper permissions');
  }
}

testConnection();