const mysql = require('mysql2/promise');

async function testRemote() {
  console.log('🔗 Testing connection to remote DB...');
  console.log('Host: 103.175.220.185');
  console.log('User: smkn1');
  console.log('DB: simrs');
  
  const connection = await mysql.createConnection({
    host: '103.175.220.185',
    user: 'smkn1',
    password: '5mkn1@2025',
    database: 'simrs',
    port: 3306,
    connectTimeout: 10000
  });

  try {
    // Test 1: Koneksi dasar
    const [result1] = await connection.query('SELECT 1 + 1 AS test');
    console.log('✅ Basic query test:', result1[0].test);

    // Test 2: Cek waktu server
    const [result2] = await connection.query('SELECT NOW() AS server_time, @@hostname AS hostname');
    console.log('✅ Server time:', result2[0].server_time);
    console.log('✅ Hostname:', result2[0].hostname);

    // Test 3: Cek tabel yang ada
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'simrs'
      LIMIT 10
    `);
    console.log('✅ Tables in simrs database:');
    console.table(tables);

    // Test 4: Cek tabel pasien (jika ada)
    const [pasienCheck] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'simrs' 
      AND TABLE_NAME = 'pasien'
    `);
    
    if (pasienCheck.length > 0) {
      console.log('✅ Table "pasien" exists with columns:');
      console.table(pasienCheck);
      
      // Ambil sample data
      const [sample] = await connection.query('SELECT * FROM pasien LIMIT 3');
      console.log('✅ Sample data from pasien:');
      console.table(sample);
    } else {
      console.log('⚠  Table "pasien" not found. Checking other tables...');
      const [allTables] = await connection.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'simrs'
        AND TABLE_NAME LIKE '%pasien%' OR TABLE_NAME LIKE '%patient%'
      `);
      console.log('Tables with "pasien" or "patient":', allTables);
    }

    await connection.end();
    console.log('🎉 Remote connection successful!');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Code:', error.code);
    console.error('Errno:', error.errno);
    
    // Troubleshooting tips
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Cek apakah IP 103.175.220.185 bisa diakses dari jaringan Anda');
    console.log('2. Cek firewall/port 3306 terbuka');
    console.log('3. Cek apakah user smkn1 punya akses remote');
    console.log('4. Coba ping: ping 103.175.220.185');
  }
}

testRemote();