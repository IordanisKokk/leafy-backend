import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import AppDataSource from "../data-source";
import { PlantSpecies } from "../entities/PlantSpecies";
import { z } from "zod";

/**
 * Zod schemas for the seed JSON.
 * Keep these aligned with src/types/species.ts
 */
const GrowthRateSchema = z.enum(["slow", "medium", "fast"]);

const SpeciesPropertiesSchema = z.object({
  growthRate: GrowthRateSchema,
  nativeRegion: z.string().min(1),
  isToxicToPets: z.boolean(),
  matureSizeCm: z.number().int().nonnegative(),
});

const CareInstructionsSchema = z.object({
  soil: z.string().min(1),
  light: z.string().min(1),
  humidity: z.string().min(1),
  temperatureC: z.string().min(1),
  fertilizer: z.string().min(1),

  // optional
  pruning: z.string().min(1).optional(),
  watering: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),

});

const PlantSpeciesSeedSchema = z.object({
  commonName: z.string().min(1),
  scientificName: z.string().min(1),
  description: z.string().optional(),
  defaultWateringIntervalDays: z.number().int().positive().optional(),
  imageUrl: z.string().min(1).optional(),
  properties: SpeciesPropertiesSchema,
  careInstructions: CareInstructionsSchema,
});

const PlantSpeciesSeedArraySchema = z.array(PlantSpeciesSeedSchema);

async function main() {
  await AppDataSource.initialize();

  try {
    const file = path.join(__dirname, "..", "data", "plant-species.json");
    const json = await fs.readFile(file, "utf-8");

    // 1) parse JSON (will throw if invalid JSON)
    const raw = JSON.parse(json);

    // 2) validate shape (will throw ZodError if wrong)
    const speciesArr = PlantSpeciesSeedArraySchema.parse(raw);

    // 3) normalize defaults so you don't rely on entity defaults implicitly
    const normalized = speciesArr.map((s) => ({
      ...s,
      defaultWateringIntervalDays: s.defaultWateringIntervalDays ?? 7,
    }));

    const repo = AppDataSource.getRepository(PlantSpecies);

    for (const data of normalized) {
      const exists = await repo.findOneBy({ commonName: data.commonName });
      if (exists) continue;

      await repo.save(repo.create(data));
    }

    console.log(`*** Species seeding complete (${normalized.length} entries checked) ***`);
  } catch (err) {

    if (err instanceof z.ZodError) {
      console.error("Seed data validation failed:");
      console.error(JSON.stringify(err.format(), null, 2));
      throw err;
    }

    console.error("Error seeding species:", err);
    throw err;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main().catch(() => process.exit(1));
