const app = require('./app');
const env = require('./config/env.config');
const connectDB = require('./config/db.config');
const seedAdminUser = require('./seeders/admin.seeder');
const seedMarketplaceCatalog = require('./seeders/product.seeder');

const startServer = async () => {
  const server = app.listen(env.PORT, () => {
    console.log(`=================================================`);
    console.log(`Dehydrated Fruit Marketplace Backend Server`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Listening on: http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`=================================================`);
  });

  // Connect to MongoDB asynchronously & seed system data
  connectDB()
    .then(async (conn) => {
      if (conn) {
        await seedAdminUser();
        await seedMarketplaceCatalog();
      }
    })
    .catch((err) => {
      console.error(`[MongoDB] Initial connection error:`, err.message);
    });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection! Shutting down gracefully...', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception! Shutting down...', err);
    process.exit(1);
  });
};

startServer();

