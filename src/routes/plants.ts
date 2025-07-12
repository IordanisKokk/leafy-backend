import { Router, Response } from "express";
import { AppDataSource } from "../data-source";
import { Plant } from "../entities/Plant";
import { PlantSpecies } from "../entities/PlantSpecies";
import { User } from "../entities/User";
import { auth_middleware, AuthedRequest } from "../middleware/auth";

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
plantRouter.post("/", async (req: AuthedRequest, res: Response) => {
  const {
    name,
    speciesId,
    wateringIntervalDays,
    properties,
    careInstructions,
  } = req.body as {
    name?: string;
    speciesId?: string;
    wateringIntervalDays?: number;
    properties?: Record<string, any>;
    careInstructions?: Record<string, any>;
  };

  if (!name || !speciesId) {
    return res.status(400).json({ error: "name and speciesId required" });
  }

  const speciesRepo = AppDataSource.getRepository(PlantSpecies);
  const species = await speciesRepo.findOneBy({ id: speciesId });
  if (!species) {
    return res.status(404).json({ error: "species_not_found" });
  }

  const userRepo = AppDataSource.getRepository(User);
  const owner = await userRepo.findOneBy({ id: req.userId });

  if (!owner) {
    return res.status(404).json({ error: "owner_not_found" });
  }

  const repo = AppDataSource.getRepository(Plant);
  const plant = repo.create({
    name,
    species,
    wateringIntervalDays:
      wateringIntervalDays ?? species.defaultWateringIntervalDays,
    properties,
    careInstructions,
    owner,
  });

  res.status(201).json(await repo.save(plant));
});

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
plantRouter.get("/", async (req: AuthedRequest, res: Response) => {
  const plants = await AppDataSource.getRepository(Plant).find({
    where: { owner: { id: req.userId } },
  });
  res.json(plants);
});

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
plantRouter.post("/:id/water", async (req: AuthedRequest, res) => {
  const now = new Date();
  const result = await AppDataSource.getRepository(Plant).update(
    { id: req.params.id, owner: { id: req.userId } },
    { lastWateredAt: now }
  );

  if (result.affected === 0) {
    return res.status(404).json({ error: "not_found" });
  }
  res.json({ wateredAt: now });
});