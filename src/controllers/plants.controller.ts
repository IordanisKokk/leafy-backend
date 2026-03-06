import { Response } from "express";
import AppDataSource from "../data-source";
import { AuthedRequest } from "../middleware/auth";
import { PlantService } from "../services/plants.service"

const plantService = new PlantService(AppDataSource);
export const PlantsController = {
    async create(req: AuthedRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: "unauthorized" });
            }

            const { name, speciesId, WateringFrequencyDays, lastWateredAt, room, location, notes, careInstructions } = req.body ?? {};
            if (!name || !speciesId) {
                return res.status(422).json({ error: "validation_error", fields: ["name", "speciesId"] });
            }

            const data = await plantService.create(
                name,
                speciesId,
                req.userId,               // now safely a string
                WateringFrequencyDays,
                lastWateredAt,
                room,
                location,
                notes,
                careInstructions
            );
            return res.status(201).json(data);
        } catch (error) {
            console.error("Error creating plant:", error);
            return res.status(500).json({ error: "internal_server_error" });
        }
    },

    async list(req: AuthedRequest, res: Response) {
        try {
            const data = await plantService.list(req.userId!)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching plants:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async getById(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.body.plantId;
            const data = await plantService.getById(userId, plantId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching plant:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async waterNow(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.body.plantId;
            const data = await plantService.waterNow(userId, plantId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error watering plant:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async scheduleNext(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const data = await plantService.scheduleNext(userId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error scheduling next watering:", error);
            res.status(500).json({ error: "internal_server_error" });
        }

    },

    async scheduleNextById(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.body.plantId;
            const data = await plantService.scheduleNextById(userId, plantId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error scheduling next watering:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async getHistory(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.body.plantId;
            const data = await plantService.getHistory(userId, plantId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching watering history:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async scheduleOverdue(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const data = await plantService.scheduleOverdue(userId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching overdue plants:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async delete(req: AuthedRequest, res: Response) {
        console.log("Delete plant request received with plantId:", req.params.id);
        try {
            const userId = req.userId!;
            const plantId = req.params.id;
            const ok = await plantService.delete(userId, plantId)
            if (!ok) return res.status(404).json({ error: "not_found" });
            res.status(204).send()
        } catch (error) {
            console.error("Error deleting plant:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async update(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.params.id;
            const updatedPlantData = {
                name: req.body.name || undefined,
                room: req.body.room || undefined,
                location: req.body.location || undefined,
                wateringFrequencyDays: req.body.wateringFrequencyDays || undefined,
                lastWateredAt: req.body.lastWateredAt || undefined,
                notes: req.body.notes || undefined,
            };
            console.log("Update plant request received with data:", updatedPlantData);
            const data = await plantService.update(userId, plantId, updatedPlantData)
            console.log("Updated plant data:", data);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error updating plant:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },
};