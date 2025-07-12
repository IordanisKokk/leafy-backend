import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { PlantSpecies } from './entities/PlantSpecies';
import { Plant } from './entities/Plant';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, PlantSpecies, Plant],
});
