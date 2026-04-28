const { Sequelize } = require('sequelize');

// Validate required environment variables at startup
if (!process.env.DB_NAME || !process.env.DB_USER) {
  console.error('❌ FATAL: DB_NAME and DB_USER environment variables are required');
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'health_guide',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected successfully.');

    // Sync all models (creates tables if they don't exist)
    // Use alter in development to auto-update schema, false in production
    const syncOptions = process.env.NODE_ENV === 'production' ? { alter: false } : { alter: true };
    await sequelize.sync(syncOptions);
    console.log('✅ Database tables synced.');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
