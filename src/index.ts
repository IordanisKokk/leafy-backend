import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import AppDataSource from "./data-source";
import apiRouter from "./routes";
import { setupSwagger } from "./config/swagger";
import cors from 'cors';

(async () => {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const app = express();
    const PORT = Number(process.env.PORT) || 3000;

    const origins = process.env.CORS_ORIGIN?.split(',') ?? [];

    app.use(
        cors({
            origin: origins.length ? origins : true,
            credentials: true,       // if you need cookies / auth headers
        }),
    );
    app.use(express.json());
    setupSwagger(app);
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use("/api/v1", apiRouter);

    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
        console.error(err);
        res.status(500).json({ "error": "internal_server_error" });
    }
    );

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

})();

