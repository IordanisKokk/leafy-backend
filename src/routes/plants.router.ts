import { Router } from "express";
import { auth_middleware } from "../middleware/auth";
import {PlantsController} from "../controllers/plants.controller";

export const plantRouter = Router();

plantRouter.use(auth_middleware);

/**
 * @swagger
 * /plants:
 *   post:
 *     summary: Create a new plant
 *     tags: [Plants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               speciesId:
 *                 type: string
 *               wateringIntervalDays:
 *                 type: integer
 *               properties:
 *                 type: object
 *                 additionalProperties: true
 *               careInstructions:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       '201':
 *         description: Plant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plant'
 *       '400':
 *         description: Bad request, missing required fields
 *       '404':
 *         description: Plant species not found
 *       '500':
 *         description: Internal server error
 */
plantRouter.post("/", PlantsController.create);

/**
 * @swagger
 * /plants:
 *   get:
 *     summary: Get all plants for the authenticated user
 *     tags: [Plants]
 *     responses:
 *       '200':
 *         description: List of plants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plant'
 */
plantRouter.get("/", PlantsController.list);

/**
 * @swagger
 * /plants/{id}:
 *   get:
 *     summary: Get a specific plant by ID
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Plant found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plant'
 *       '404':
 *         description: Plant not found
 */
plantRouter.get("/:id", PlantsController.getById);

/**
 * @swagger
 * /plants/water/{id}:
 *   post:
 *     summary: Mark a plant as just watered
 *     tags: [Plants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Watering timestamp updated
 *       404:
 *         description: Plant not found
 */
plantRouter.post("/water/:id", PlantsController.waterNow);

/**
 * @swagger
 * /plants/{id}:
 *   delete:
 *     summary: Delete a specific plant by ID
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Plant deleted successfully
 *       '404':
 *         description: Plant not found
 */
plantRouter.delete("/:id", PlantsController.delete);

/**
 * @swagger
 * /plants/schedule/next/{id}:
 *   get:
 *     summary: Get the next watering date for a plant
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Next watering date and days remaining
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plantId:
 *                   type: string
 *                 nextWatering:
 *                   type: string
 *                   format: date-time
 *                 daysRemaining:
 *                   type: integer
 *       '404':
 *         description: Plant not found
 *       '500':
 *         description: Internal server error
 */
plantRouter.get("/schedule/next/:id", PlantsController.scheduleNextById);

/**
 * @swagger
 * /plants/schedule/next:
 *   get:
 *     summary: Get next watering dates for all plants
 *     tags: [Plants]
 *     responses:
 *       '200':
 *         description: List of plants with next watering dates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   plantId:
 *                     type: string
 *                   nextWatering:
 *                     type: string
 *                     format: date-time
 *                   daysRemaining:
 *                     type: integer
 *       '500':
 *         description: Internal server error
 */
plantRouter.get("/schedule/next", PlantsController.scheduleNext);

/**
 * @swagger
 * /plants/schedule/overdue:
 *   get:
 *     summary: Get all overdue plants
 *     tags: [Plants]
 *     responses:
 *       '200':
 *         description: List of overdue plants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plant'
 *       '500':
 *         description: Internal server error
 */
plantRouter.get("/schedule/overdue", PlantsController.scheduleOverdue);

/**
 * @swagger
 * /plants/history/{id}:
 *   get:
 *     summary: Get watering history for a specific plant
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: List of watering logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WateringLog'
 *       '404':
 *         description: Plant not found
 *       '500':
 *         description: Internal server error
 */
plantRouter.get("/history/:id", PlantsController.getHistory);
