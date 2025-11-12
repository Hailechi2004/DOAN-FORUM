const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const swaggerUi = require("swagger-ui-express");

// Use presentation layer routes (Clean Architecture)
const routes = require("./presentation/routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");
const SocketHandler = require("./socket/socketHandler");
const redisClient = require("./config/redis");
const swaggerSpec = require("./config/swagger");

class App {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);

    // Parse CORS_ORIGIN (có thể là string hoặc comma-separated list)
    const corsOrigin = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : "*";

    this.io = new Server(this.server, {
      cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );

    // Parse CORS_ORIGIN
    const corsOrigin = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : "*";

    // CORS
    this.app.use(
      cors({
        origin: corsOrigin,
        credentials: true,
      })
    );

    // Body parsers
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Rate limiting
    this.app.use(globalLimiter);

    // Static files with CORS headers for images
    this.app.use(
      "/uploads",
      cors({
        origin: corsOrigin,
        credentials: true,
        exposedHeaders: ["Content-Type", "Content-Length"],
      })
    );

    this.app.use(
      "/uploads",
      express.static("uploads", {
        maxAge: "1y",
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
          res.set("Cross-Origin-Resource-Policy", "cross-origin");
          if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
            res.set("Content-Type", "image/jpeg");
          } else if (path.endsWith(".png")) {
            res.set("Content-Type", "image/png");
          } else if (path.endsWith(".gif")) {
            res.set("Content-Type", "image/gif");
          }
        },
      })
    );
  }

  setupRoutes() {
    // API Documentation
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Company Forum API Docs",
      })
    );

    // API routes
    this.app.use("/api", routes);

    // Root
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Company Forum API",
        version: "1.0.0",
        endpoints: {
          api: "/api",
          health: "/api/health",
          docs: "/api-docs",
        },
      });
    });
  }

  async setupSocket() {
    // Redis adapter for Socket.io (for multi-server scaling)
    // TODO: Enable Redis adapter when Redis server is running
    // const pubClient = redisClient.duplicate();
    // const subClient = redisClient.duplicate();
    // this.io.adapter(createAdapter(pubClient, subClient));

    // Initialize socket handler
    this.socketHandler = new SocketHandler(this.io);
    this.socketHandler.initialize();

    console.log("✅ Socket.IO initialized (Memory adapter)");
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  getServer() {
    return this.server;
  }

  getSocketHandler() {
    return this.socketHandler;
  }
}

module.exports = App;
