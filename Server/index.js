const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

// Debug: Log some key environment variables
console.log('Environment check:', {
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
});

const config = require("./config");
const logger = require("./utils/logger");
const {
  globalErrorHandler,
  handleNotFound,
} = require("./middleware/errorHandler");
const { sequelize } = require("./models");

// Add pg for database existence check
const { Client } = require("pg");

// Import routes - enabling all routes for production
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const organizationRoutes = require("./routes/organization");
const processRoutes = require("./routes/processes");
const timesheetRoutes = require("./routes/timesheets");
const customerRoutes = require("./routes/customers");
const projectRoutes = require("./routes/projects");
const dailyLoginRoutes = require("./routes/dailyLogin");
const externalClientsRoutes = require("./routes/externalClients");
const syncRoutes = require("./routes/sync");

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration with debugging
console.log('CORS Configuration:', {
  environment: config.server.env,
  frontendUrl: config.server.frontendUrl
});

// CORS configuration for development - Very permissive for debugging
console.log('Setting up CORS for development...');
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Cache-Control",
    "Pragma"
  ],
  exposedHeaders: ["Content-Length", "Set-Cookie"],
  optionsSuccessStatus: 200,
  preflightContinue: false
};
console.log('CORS options created - allowing all origins for development');

// Original CORS configuration (use this after debugging)
/*
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Origin Check:', { origin, environment: config.server.env });

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // In development, allow localhost and auth.localhost
    if (config.server.env === 'development') {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://auth.localhost',
        'https://auth.localhost',
        config.server.frontendUrl
      ].filter(Boolean); // Remove any undefined values

      console.log('CORS: Development allowed origins:', allowedOrigins);

      if (allowedOrigins.includes(origin)) {
        console.log('CORS: Origin allowed:', origin);
        return callback(null, true);
      }

      console.log('CORS: Origin not in allowed list:', origin);
    } else {
      // In production, only allow the configured frontend URL
      if (origin === config.server.frontendUrl) {
        console.log('CORS: Production origin allowed:', origin);
        return callback(null, true);
      }
      console.log('CORS: Production origin not allowed:', origin);
    }

    console.log('CORS: Rejecting origin:', origin);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
};
*/

console.log('Applying CORS middleware...');
app.use(cors(corsOptions));
console.log('CORS middleware applied successfully');

// Additional CORS headers and debugging middleware
console.log('Setting up additional CORS headers and request logging...');
app.use((req, res, next) => {
  const origin = req.get('Origin');
  console.log(`${req.method} ${req.path} - Origin: ${origin || 'none'}`);

  // Set additional CORS headers manually
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length,Set-Cookie');

  next();
});
console.log('Additional CORS headers and request logging set up');

// Handle preflight requests explicitly using middleware instead of route
console.log('Setting up OPTIONS handler...');
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.get('Origin');
    console.log('OPTIONS preflight request for:', req.path, 'from origin:', origin);

    // Set CORS headers for preflight
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    console.log('OPTIONS response headers set for origin:', origin);
    return res.status(200).end();
  }
  next();
});
console.log('OPTIONS handler set up');

// Body parsing middleware
console.log('Setting up body parsing middleware...');
app.use(express.json({ limit: "10mb" }));
console.log('JSON middleware set up');
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
console.log('URL encoded middleware set up');
app.use(cookieParser());
console.log('Cookie parser set up');
app.use(compression());
console.log('Compression middleware set up');

// Logging middleware
if (config.server.env !== "test") {
  app.use(morgan("combined", { stream: logger.stream }));
}

// Health check endpoints
console.log('Setting up health check endpoints...');
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Time Tracker API is running",
    timestamp: new Date().toISOString(),
    environment: config.server.env,
  });
});

// Also add /api/health for frontend compatibility
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Time Tracker API is running",
    timestamp: new Date().toISOString(),
    environment: config.server.env,
  });
});
console.log('Health check endpoints set up');

// API routes - enabling all routes for production
console.log('Registering all API routes...');
try {
  app.use("/api/auth", authRoutes);
  console.log('Auth routes registered successfully');

  app.use("/api/users", userRoutes);
  console.log('User routes registered successfully');

  app.use("/api/admin", adminRoutes);
  console.log('Admin routes registered successfully');

  app.use("/api/organizations", organizationRoutes);
  console.log('Organization routes registered successfully');

  app.use("/api/processes", processRoutes);
  console.log('Process routes registered successfully');

  app.use("/api/timesheets", timesheetRoutes);
  console.log('Timesheet routes registered successfully');

  app.use("/api/customers", customerRoutes);
  console.log('Customer routes registered successfully');

  app.use("/api/projects", projectRoutes);
  console.log('Project routes registered successfully');

  app.use("/api/daily-login", dailyLoginRoutes);
  console.log('Daily login routes registered successfully');

  app.use("/api/external-clients", externalClientsRoutes);
  console.log('External clients routes registered successfully');

  app.use("/api/sync", syncRoutes);
  console.log('Sync routes registered successfully');

} catch (error) {
  console.error('Error registering routes:', error);
}

// 404 handler
console.log('Setting up 404 handler...');
app.use(handleNotFound);
console.log('404 handler set up');

// Global error handler
console.log('Setting up global error handler...');
app.use(globalErrorHandler);
console.log('Global error handler set up');

// Database connection and server startup
const PORT = config.server.port;

// Helper to ensure DB exists before Sequelize connects
async function ensureDatabaseExists() {
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres", // connect to default db
  };
  const targetDb = process.env.DB_NAME;
  const client = new Client(dbConfig);
  await client.connect();
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${targetDb}'`);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${targetDb}"`);
    console.log(`Database "${targetDb}" created`);
  }
  await client.end();
}

async function startServer() {
  try {
    // Ensure DB exists before Sequelize connects
    await ensureDatabaseExists();
    logger.info("Database existence verified");

    // Test database connection with retry
    let dbRetries = 5;
    while (dbRetries > 0) {
      try {
        await sequelize.authenticate();
        logger.info("Database connection established successfully");
        break;
      } catch (error) {
        dbRetries--;
        logger.warn(`Database authentication failed. Retries left: ${dbRetries}`, error.message);
        if (dbRetries === 0) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Sync database models (always sync in Docker)
    await sequelize.sync({ alter: true });
    logger.info("Database models synchronized");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(
        `Server running on port ${PORT} in ${config.server.env} mode`
      );
      logger.info(`Frontend URL: ${config.server.frontendUrl}`);
    });
  } catch (error) {
    logger.error("Unable to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;
