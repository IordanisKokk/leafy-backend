import { Router } from "express";
import { SpeciesController } from "../controllers/species.controller";

export const speciesRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Species
 *   description: Plant species management
 * 

 * @swagger
 * /species:
 *   get:
 *     summary: Get all plant species
 *     tags: [Species]
 *     responses:
 *       '200':
 *         description: A list of plant species
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlantSpecies'
 */
speciesRouter.get("/", SpeciesController.getAll);

/**
 * @swagger
 * /species/{id}:
 *   get:
 *     summary: Get a plant species by ID
 *     tags: [Species]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The plant species ID
 *     responses:
 *       '200':
 *         description: A single plant species
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlantSpecies'
 *       '404':
 *         description: Species not found
 */
speciesRouter.get("/:id", SpeciesController.getById);
