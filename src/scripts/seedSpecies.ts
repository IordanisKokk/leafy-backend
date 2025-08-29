import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import AppDataSource from "../data-source";
import { PlantSpecies } from "../entities/PlantSpecies";

(async () => {
  await AppDataSource.initialize();

  /* -------- read & parse JSON file -------- */
  const file = path.join(__dirname, "..", "data", "plant-species.json");
  const json = await fs.readFile(file, "utf-8");
  const speciesArr = JSON.parse(json) as Partial<PlantSpecies>[];

  const repo = AppDataSource.getRepository(PlantSpecies);

  /* -------- avoid dupes on re-run -------- */
  for (const data of speciesArr) {
    const exists = await repo.findOneBy({ commonName: data.commonName });
    if (exists) continue; // already seeded

    await repo.save(repo.create(data));
  }

  console.log("✅ Species seeding complete");
  process.exit(0);
})();
