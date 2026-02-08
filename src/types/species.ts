export type GrowthRate = "slow" | "medium" | "fast";

export type SpeciesProperties = {
    growthRate: GrowthRate;
    nativeRegion: string;
    isToxicToPets: boolean;
    matureSizeCm: number;
};

export type CareInstructions = {
    soil: string;
    light: string;
    pruning: string;
    humidity: string;
    temperatureC: string;
    fertilizer?: string;
    watering?: string;
    notes?: string;
};
