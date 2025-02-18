import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRouters from "./routes/user.router.js";
import roomRouters from "./routes/room.route.js";
import notificationRoutes from "./routes/notification.route.js";
import relationshipRoutes from "./routes/relationship.route.js";
import { server, app } from "./services/socket.service.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const PORT = process.env.PORT;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "1.0.0",
      description: "API documentation for Express.js",
    },
    servers: [{ url: "https://virgochat-be.onrender.com" }],
  },
  apis: ["src/routes/*.js", "src/controllers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ limit: "12mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRouters);
app.use("/api/rooms", roomRouters);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/relationships", relationshipRoutes);

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  connectDB();
});
