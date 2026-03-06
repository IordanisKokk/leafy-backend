import { CareInstructions, SpeciesProperties } from "./species";

export type PlantSpeciesSeed = {
  commonName: string;
  scientificName: string;
  description?: string;
  defaultWateringFrequencyDays?: number;
  imageUrl?: string;
  properties: SpeciesProperties;
  careInstructions: CareInstructions;
};