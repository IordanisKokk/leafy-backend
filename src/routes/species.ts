import { Router } from "express";
import { AppDataSource } from "../data-source";
import { PlantSpecies } from "../entities/PlantSpecies";

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
speciesRouter.get("/", async (_req, res) => {
  const list = await AppDataSource.getRepository(PlantSpecies).find();
  res.json(list);
});

/* GET /api/v1/species/:id  → single species */
speciesRouter.get("/:id", async (req, res) => {
  const species = await AppDataSource
    .getRepository(PlantSpecies)
    .findOneBy({ id: req.params.id });

  if (!species) return res.status(404).json({ error: "not_found" });
  res.json(species);
});
