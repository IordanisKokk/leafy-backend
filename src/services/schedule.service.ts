// src/services/schedule.service.ts
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface NextWateringResult {
  plantId: string;
  nextWatering: Date;
  daysRemaining: number;
}

export interface HasWateringFields {
  id: string;
  lastWateredAt?: Date | null;
  wateringIntervalDays: number;
}

export function computeNextWatering(plant: HasWateringFields): NextWateringResult {
  if (!plant.lastWateredAt) {
    return { plantId: plant.id, nextWatering: new Date(Date.now()), daysRemaining: 0 };
  }

  const dueDate = new Date(plant.lastWateredAt.getTime() + plant.wateringIntervalDays * MS_PER_DAY);
  const daysRemaining = Math.ceil((dueDate.getTime() - Date.now()) / MS_PER_DAY);

  return { plantId: plant.id, nextWatering: dueDate, daysRemaining };
}
