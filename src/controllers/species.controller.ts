import { Request, Response } from "express";
import { SpeciesService } from "../services/species.service";
import AppDataSource from "../data-source";

const speciesService = new SpeciesService(AppDataSource);

export const SpeciesController = {
    async getAll(req: Request, res: Response) {
        try {
            const data = await speciesService.getAll()
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching species:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    },
    async getById(req: Request, res: Response) {
        try {
            const speciesId = req.params.id;
            if (!speciesId) {
                return res.status(400).json({ error: "speciesId required" });
            }
            const data = await speciesService.getById(speciesId)
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching species:", error);
            res.status(500).json({ error: "internal_server_error" });
        }
    }
}