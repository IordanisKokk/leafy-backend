import { Request, Response } from "express";
import { DataSource } from "typeorm";
import { PlantSpecies } from "../entities/PlantSpecies";

export class SpeciesService {
    constructor(private dataSource: DataSource) {}

    async getAll() {
        const species = await this.dataSource.getRepository(PlantSpecies).find();
        return species;
    }

    async getById(speciesId: string){
        const species = await this.dataSource
            .getRepository(PlantSpecies)
            .findOneBy({ id: speciesId});

          if (!species) return { error: "not_found" };
          return species;
    }
}