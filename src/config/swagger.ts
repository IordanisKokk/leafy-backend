import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

/* ── 1. Basic API metadata ─────────────────────────────── */
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "House-plant API",
    version: "1.0.0",
    description: "CRUD plants, species catalogue, auth, watering logs",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

/* ── 2. Options tell swagger-jsdoc where to look for @swagger comments — you can add them later ── */
const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/**/*.ts"], // JSDoc blocks live next to routes
    // apis: ["src/routes/plants.ts", "src/routes/species.ts"]
};

const swaggerSpec = swaggerJSDoc(options);

/* ── 3. Convenience function to mount UI ───────────────── */
export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI available at /docs");
}
