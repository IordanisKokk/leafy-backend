import { Response } from "express";
import AppDataSource from "../data-source";
import { AuthedRequest } from "../middleware/auth";
import { PlantService } from "../services/plants.service"

const plantService = new PlantService(AppDataSource);

type ServiceError = { error: string };

function isServiceError(value: unknown): value is ServiceError {
    return typeof value === "object" && value !== null && "error" in value;
}

function sendServiceError(res: Response, error: ServiceError) {
    switch (error.error) {
        case "bad_request":
            return res.status(400).json(error);
        case "species_not_found":
        case "not_found":
            return res.status(404).json(error);
        case "user_not_found":
            return res.status(401).json({ error: "unauthorized" });
        default:
            return res.status(500).json({ error: "internal_server_error" });
    }
}

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
            if (isServiceError(data)) {
                return sendServiceError(res, data);
            }
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
            const plantId = req.params.id;
            const data = await plantService.getById(userId, plantId)
            if (isServiceError(data)) {
                return sendServiceError(res, data);
            }
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching plant:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async waterNow(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.params.id;
            if (!plantId) {
                return res.status(400).json({ error: "missing_plant_id" });
            }
            const wateredAt = req.body.wateredAt ? new Date(req.body.wateredAt) : new Date();
            if (isNaN(wateredAt.getTime())) {
                return res.status(400).json({ error: "invalid_watered_at" });
            }
            const data = await plantService.waterNow(userId, plantId, wateredAt)
            if (isServiceError(data)) {
                return sendServiceError(res, data);
            }
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
            const plantId = req.params.id;
            const data = await plantService.scheduleNextById(userId, plantId)
            if (isServiceError(data)) {
                return sendServiceError(res, data);
            }
            res.status(200).json(data);
        } catch (error) {
            console.error("Error scheduling next watering:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },

    async getHistory(req: AuthedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const plantId = req.params.id;
            const data = await plantService.getHistory(userId, plantId)
            if (isServiceError(data)) {
                return sendServiceError(res, data);
            }
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
            if (isServiceError(ok)) {
                return sendServiceError(res, ok);
            }
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
                careInstructions: req.body.careInstructions || undefined,
            };
            console.log("Update plant request received with data:", updatedPlantData);
            const data = await plantService.update(userId, plantId, updatedPlantData)
            if (isServiceError(data)) {
                return sendServiceError(res, data);
            }
            console.log("Updated plant data:", data);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error updating plant:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },
};
