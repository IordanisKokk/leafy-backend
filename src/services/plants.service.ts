import { Response } from "express";
import AppDataSource from "../data-source";
import { Plant } from "../entities/Plant";
import { WateringLog } from "../entities/WateringLog";
import { AuthedRequest } from "../middleware/auth";
import { PlantSpecies } from "../entities/PlantSpecies";
import { computeNextWatering } from "./schedule.service";
import { User } from "../entities/User";
import { DataSource } from "typeorm";

export class PlantService {
    constructor(private dataSource: DataSource) { }

    async create(
        name: string,
        speciesId: string,
        ownerId: string,
        wateringIntervalDays?: number,
        properties?: Record<string, any>,
        careInstructions?: Record<string, any>,
    ) {

        if (!name || !speciesId) {
            return { error: "bad_request" };
        }

        const speciesRepo = this.dataSource.getRepository(PlantSpecies);
        const species = await speciesRepo.findOneBy({ id: speciesId });
        if (!species) {
            return { error: "species_not_found" };
        }

        const userRepo = this.dataSource.getRepository(User);
        const owner = await userRepo.findOneBy({ id: ownerId });

        if (!owner) {
            return { error: "user not_found" };
        }

        const repo = this.dataSource.getRepository(Plant);
        const plant = repo.create({
            name,
            species,
            wateringIntervalDays:
                wateringIntervalDays ?? species.defaultWateringIntervalDays,
            properties,
            careInstructions,
            owner,
        });

        return await repo.save(plant);
    }

    async list(ownerId: string) {
        const plants = await this.dataSource.getRepository(Plant).find({
            where: { owner: { id: ownerId } },
        });
        return plants;
    }

    async getById(ownerId: string, plantId: string) {
        console.log("Fetching plant with ID:", plantId, "for owner ID:", ownerId);
        const plant = await this.dataSource.getRepository(Plant).findOne({
            where: { id: plantId, owner: { id: ownerId } },
        });

        if (!plant) {
            return { error: "not found" };
        }
        return plant;
    }

    async waterNow(ownerId: string, plantId: string) {
        const now = new Date();

        const result = await this.dataSource.getRepository(Plant).update(
            { id: plantId, owner: { id: ownerId } },
            { lastWateredAt: now }
        );
        if (result.affected === 0) {
            return { error: "not found" };
        }

        const waterRepo = this.dataSource.getRepository(WateringLog);
        await waterRepo.save(waterRepo.create({ plant: { id: plantId } }));
        return { wateredAt: now };
    }

    async scheduleNext(ownerId: string) {
        const plants = await this.dataSource.getRepository(Plant).find({
            where: { owner: { id: ownerId } },
        });
        return plants.map(p => computeNextWatering(p));
    }

    async scheduleNextById(ownerId: string, plantId: string) {
        const plant = await this.dataSource.getRepository(Plant).findOne({
            where: { id: plantId, owner: { id: ownerId } },
        });
        if (!plant) return { error: "not found" }; // or throw for 404 at controller
        return computeNextWatering(plant);
    }

    async getHistory(ownerId: string, plantId: string) {
        const plant = await this.dataSource.getRepository(Plant).findOne({
            where: { id: plantId, owner: { id: ownerId } }
        });
        if (!plant) return { error: "not found" };

        const logs = await this.dataSource.getRepository(WateringLog).find({
            where: { plant: { id: plant.id } },
            order: { timestamp: "DESC" }
        });

        return logs;
    }

    async scheduleOverdue(ownerId: string) {
        const plants = await this.dataSource.getRepository(Plant).find({
            where: { owner: { id: ownerId } },
        });

        if (plants.length === 0) {
            return { error: "no plants found" };
        }

        const overduePlants = plants.filter(plant => {
            if (!plant.lastWateredAt) {
                return true;
            }

            const dueDate = new Date(plant.lastWateredAt.getTime() +
                plant.wateringIntervalDays * 24 * 60 * 60 * 1000);

            return dueDate < new Date();
        });

        return overduePlants;
    }

    async delete(ownerId: string, plantId: string) {
        const result = await this.dataSource.getRepository(Plant).delete({
            id: plantId,
            owner: { id: ownerId }
        });
        if (result.affected === 0) {
            return { error: "not found" };
        }
        return { success: true };
    }

    async update(ownerId: string, plantId: string, updateData: Partial<Plant>) {
        const {
            name,
            wateringIntervalDays,
            properties,
            careInstructions,
        } = updateData;

        const repo = this.dataSource.getRepository(Plant);
        const plant = await repo.findOne({
            where: { id: plantId, owner: { id: ownerId } },
        });
        if (!plant) {
            return { error: "not found" };
        }

        if (name !== undefined) plant.name = name;
        if (wateringIntervalDays !== undefined) plant.wateringIntervalDays = wateringIntervalDays;
        if (properties !== undefined) plant.properties = properties;
        if (careInstructions !== undefined) plant.careInstructions = careInstructions;

        return { success: true, plant: await repo.save(plant) };
    }
}