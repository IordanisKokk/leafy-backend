import "dotenv/config";
import bcrypt from "bcrypt";
import AppDataSource from "../data-source";
import { Plant } from "../entities/Plant";
import { PlantSpecies } from "../entities/PlantSpecies";
import { User } from "../entities/User";
import { WateringLog } from "../entities/WateringLog";

const TEST_USER_EMAIL = "test-user@plant.com";
const TEST_USER_PASSWORD = "plant";

type PlantSeed = {
  name: string;
  preferredSpecies: string[];
  room?: string;
  location?: string;
  notes?: string;
  wateringFrequencyDays: number;
  historyDaysAgo?: number[];
};

const startOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(9, 0, 0, 0);
  return next;
};

const daysAgo = (days: number): Date => {
  const next = startOfDay(new Date());
  next.setDate(next.getDate() - days);
  return next;
};

const seedPlants: PlantSeed[] = [
  {
    name: "Athena",
    preferredSpecies: ["Snake Plant", "ZZ Plant"],
    room: "Living Room",
    location: "TV stand",
    notes: "Clearly overdue for testing alerts.",
    wateringFrequencyDays: 14,
    historyDaysAgo: [45, 28, 18],
  },
  {
    name: "Nora",
    preferredSpecies: ["Monstera", "Philodendron"],
    room: "Living Room",
    location: "Window corner",
    notes: "Should show as due today.",
    wateringFrequencyDays: 7,
    historyDaysAgo: [21, 14, 7],
  },
  {
    name: "Ivy",
    preferredSpecies: ["Pothos", "Heartleaf Philodendron", "Philodendron"],
    room: "Kitchen",
    location: "Top shelf",
    wateringFrequencyDays: 5,
    historyDaysAgo: [14, 9, 4],
  },
  {
    name: "Luna",
    preferredSpecies: ["Peace Lily", "Calathea"],
    room: "Bedroom",
    location: "Nightstand",
    wateringFrequencyDays: 3,
    historyDaysAgo: [10, 6, 1],
  },
  {
    name: "Sunny",
    preferredSpecies: ["Aloe Vera", "Rubber Plant", "Fiddle Leaf Fig"],
    room: "Office",
    location: "Desk",
    wateringFrequencyDays: 10,
    historyDaysAgo: [25, 15, 5],
  },
  {
    name: "Milo",
    preferredSpecies: ["Spider Plant", "Parlor Palm"],
    room: "Bathroom",
    location: "Upper shelf",
    wateringFrequencyDays: 6,
    historyDaysAgo: [20, 12, 2],
  },
  {
    name: "Ghost",
    preferredSpecies: ["ZZ Plant", "Snake Plant"],
    room: "Hallway",
    location: "Entry console",
    notes: "Healthy plant that should not appear in this week's schedule.",
    wateringFrequencyDays: 14,
    historyDaysAgo: [30, 16, 2],
  },
  {
    name: "Setup Fern",
    preferredSpecies: ["Boston Fern", "Peace Lily", "Calathea"],
    room: "Guest Room",
    location: "Chair side table",
    notes: "Has a schedule but no last watered date yet.",
    wateringFrequencyDays: 4,
  },
];

async function main() {
  await AppDataSource.initialize();

  try {
    const speciesRepo = AppDataSource.getRepository(PlantSpecies);
    const userRepo = AppDataSource.getRepository(User);
    const plantRepo = AppDataSource.getRepository(Plant);
    const wateringLogRepo = AppDataSource.getRepository(WateringLog);

    const allSpecies = await speciesRepo.find({
      order: { commonName: "ASC" },
    });

    if (allSpecies.length === 0) {
      throw new Error(
        "No plant species found. Run the species seed first with `npm run build && npm run seed:species`.",
      );
    }

    let user = await userRepo.findOneBy({ email: TEST_USER_EMAIL });

    if (!user) {
      user = userRepo.create({
        email: TEST_USER_EMAIL,
        passwordHash: TEST_USER_PASSWORD,
      });
      await userRepo.save(user);
    } else {
      user.passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 12);
      await userRepo.save(user);
    }

    const existingPlants = await plantRepo.find({
      where: { owner: { id: user.id } },
    });

    if (existingPlants.length > 0) {
      await plantRepo.remove(existingPlants);
    }

    let fallbackSpeciesIndex = 0;

    for (const plantSeed of seedPlants) {
      const species =
        plantSeed.preferredSpecies
          .map((commonName) => allSpecies.find((entry) => entry.commonName === commonName))
          .find((entry): entry is PlantSpecies => Boolean(entry)) ??
        allSpecies[fallbackSpeciesIndex++ % allSpecies.length];

      const historyTimestamps = (plantSeed.historyDaysAgo ?? [])
        .map((days) => daysAgo(days))
        .sort((left, right) => left.getTime() - right.getTime());

      const lastWateredAt =
        historyTimestamps.length > 0
          ? historyTimestamps[historyTimestamps.length - 1]
          : null;

      const plant = await plantRepo.save(
        plantRepo.create({
          name: plantSeed.name,
          owner: user,
          species,
          wateringFrequencyDays: plantSeed.wateringFrequencyDays,
          lastWateredAt: lastWateredAt ?? undefined,
          room: plantSeed.room,
          location: plantSeed.location,
          notes: plantSeed.notes,
        }),
      );

      if (historyTimestamps.length > 0) {
        await wateringLogRepo.save(
          historyTimestamps.map((timestamp) =>
            wateringLogRepo.create({
              plant,
              timestamp,
            }),
          ),
        );
      }
    }

    console.log("Alpha test user seeded successfully.");
    console.log(`Email: ${TEST_USER_EMAIL}`);
    console.log(`Password: ${TEST_USER_PASSWORD}`);
    console.log(`Plants created: ${seedPlants.length}`);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main().catch((error) => {
  console.error("Failed to seed alpha user:", error);
  process.exit(1);
});
