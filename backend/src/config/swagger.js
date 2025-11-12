const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Company Forum API",
      version: "1.0.0",
      description:
        "API Documentation for Company Forum System with Real-time Features",
      contact: {
        name: "API Support",
        email: "support@company.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.company-forum.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user@company.com" },
            username: { type: "string", example: "john.doe" },
            full_name: { type: "string", example: "John Doe" },
            avatar_url: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
            is_online: { type: "boolean", example: true },
            last_seen: { type: "string", format: "date-time" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Welcome to Company Forum" },
            content: { type: "string", example: "This is the post content..." },
            author_id: { type: "integer", example: 1 },
            author_name: { type: "string", example: "John Doe" },
            visibility: {
              type: "string",
              enum: ["company", "department", "team", "private"],
              example: "company",
            },
            total_reactions: { type: "integer", example: 10 },
            total_comments: { type: "integer", example: 5 },
            total_shares: { type: "integer", example: 2 },
            is_pinned: { type: "boolean", example: false },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            post_id: { type: "integer", example: 1 },
            author_id: { type: "integer", example: 1 },
            author_name: { type: "string", example: "John Doe" },
            content: { type: "string", example: "Great post!" },
            parent_id: { type: "integer", nullable: true, example: null },
            total_reactions: { type: "integer", example: 3 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            conversation_id: { type: "integer", example: 1 },
            sender_id: { type: "integer", example: 1 },
            sender_name: { type: "string", example: "John Doe" },
            content: { type: "string", example: "Hello!" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            type: { type: "string", example: "post_reaction" },
            content: { type: "string", example: "John reacted to your post" },
            is_read: { type: "boolean", example: false },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object" },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User authentication endpoints" },
      { name: "Posts", description: "Post management endpoints" },
      { name: "Comments", description: "Comment management endpoints" },
      { name: "Messages", description: "Messaging system endpoints" },
      { name: "Notifications", description: "Notification endpoints" },
      { name: "Departments", description: "Department management endpoints" },
      { name: "Teams", description: "Team management endpoints" },
      { name: "Categories", description: "Post category management" },
      { name: "Files", description: "File upload and management" },
      { name: "Users", description: "User management (admin)" },
      { name: "Projects", description: "Project management endpoints" },
      { name: "Tasks", description: "Task management endpoints" },
      { name: "Events", description: "Event and calendar management" },
      { name: "Polls", description: "Poll and survey management" },
      { name: "Bookmarks", description: "Bookmark management" },
      { name: "Meetings", description: "Meeting scheduling and management" },
      { name: "Search", description: "Global search functionality" },
      { name: "Analytics", description: "Analytics and statistics" },
    ],
  },
  apis: [
    "./src/presentation/routes/*.js",
    "./src/presentation/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
