import { Plant } from "../entities/Plant";
import { WateringLog } from "../entities/WateringLog";
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
        wateringFrequencyDays?: number,
        lastWateredAt?: Date,
        room?: string,
        location?: string,
        notes?: string,
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
            return { error: "user_not_found" };
        }

        console.log("[LOG] Creating plant with name:", name, "speciesId:", speciesId, "ownerId:", ownerId);
        console.log("[LOG] Additional details - WateringFrequencyDays:", wateringFrequencyDays, "room:", room, "location:", location, "notes:", notes);

        const repo = this.dataSource.getRepository(Plant);
        const plant = repo.create({
            name,
            species,
            wateringFrequencyDays:
                wateringFrequencyDays ?? species.defaultWateringFrequencyDays,
            lastWateredAt, 
            careInstructions,
            room,
            location,
            notes,
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
            return { error: "not_found" };
        }
        return plant;
    }

    async waterNow(ownerId: string, plantId: string, wateredAt: Date) {
        return this.dataSource.transaction(async (manager) => {
            const plantRepo = manager.getRepository(Plant);
            const waterRepo = manager.getRepository(WateringLog);

            const result = await plantRepo.update(
                { id: plantId, owner: { id: ownerId } },
                { lastWateredAt: wateredAt }
            );

            if (result.affected === 0) {
                return { error: "not_found" };
            }

            await waterRepo.save(
                waterRepo.create({
                    plant: { id: plantId },
                    timestamp: wateredAt,
                })
            );

            return { plantId, wateredAt };
        })
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
        if (!plant) return { error: "not_found" };
        return computeNextWatering(plant);
    }

    async getHistory(ownerId: string, plantId: string) {
        const plant = await this.dataSource.getRepository(Plant).findOne({
            where: { id: plantId, owner: { id: ownerId } }
        });
        if (!plant) return { error: "not_found" };

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

        const overduePlants = plants.filter(plant => {
            if (!plant.lastWateredAt) {
                return true;
            }

            const dueDate = new Date(plant.lastWateredAt.getTime() +
                plant.wateringFrequencyDays * 24 * 60 * 60 * 1000);

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
            return { error: "not_found" };
        }
        return { success: true };
    }

    async update(ownerId: string, plantId: string, updateData: Partial<Plant>) {
        const {
            name,
            wateringFrequencyDays,
            lastWateredAt,
            room,
            location,
            notes,
            careInstructions,
        } = updateData;

        const repo = this.dataSource.getRepository(Plant);
        const plant = await repo.findOne({
            where: { id: plantId, owner: { id: ownerId } },
        });
        if (!plant) {
            return { error: "not_found" };
        }

        if (name !== undefined) plant.name = name;
        if (wateringFrequencyDays !== undefined) plant.wateringFrequencyDays = wateringFrequencyDays;
        if (lastWateredAt !== undefined) plant.lastWateredAt = lastWateredAt;
        if (room !== undefined) plant.room = room;
        if (location !== undefined) plant.location = location;
        if (notes !== undefined) plant.notes = notes;
        if (careInstructions !== undefined) plant.careInstructions = careInstructions;
        console.log("Saving updated plant:", plant);
        return { success: true, plant: await repo.save(plant) };
    }
}
