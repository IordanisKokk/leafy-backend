import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import AppDataSource from "../data-source";
import { PlantSpecies } from "../entities/PlantSpecies";

async function main() {
  await AppDataSource.initialize();

  const file = path.join(__dirname, "..", "data", "plant-species.json");
  const json = await fs.readFile(file, "utf-8");
  const speciesArr = JSON.parse(json) as Partial<PlantSpecies>[];

  const repo = AppDataSource.getRepository(PlantSpecies);

  for (const data of speciesArr) {
    const exists = await repo.findOneBy({ commonName: data.commonName });
    if (exists) continue;

    await repo.save(repo.create(data));
  }

  console.log("✅ Species seeding complete");
  process.exit(0);
};


main()
  .then(() => AppDataSource.destroy())
  .catch(async (err) => { console.error("Error seeding species:", err);
    try { if (AppDataSource.isInitialized) await AppDataSource.destroy(); } catch { };
    process.exit(1); });