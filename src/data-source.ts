import "dotenv/config"; 
import 'reflect-metadata';
import { DataSource } from 'typeorm';
// import { User } from './entities/User';
// import { PlantSpecies } from './entities/PlantSpecies';
// import { Plant } from './entities/Plant';
// import { WateringLog } from './entities/WateringLog';

const isProd = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false} : false,
  synchronize: false,
  logging: false,
  entities: [isProd? "dist/entities/*.js" : "src/entities/*.ts"],
  migrations: [isProd? "dist/migrations/*.js" : "src/migrations/*.ts"],
});

export default AppDataSource;