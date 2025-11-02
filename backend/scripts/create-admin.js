const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const email = 'admin@printing.com';
    const password = 'admin123';
    
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await query(
      `INSERT INTO users (name, email, password, phone, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      ['Admin User', email, hashedPassword, '1234567890', 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@printing.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

