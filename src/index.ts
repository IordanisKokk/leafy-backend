import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from "./data-source";
import apiRouter from "./routes";
import { setupSwagger } from "./config/swagger";

(async () => {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const app = express();
    const PORT = process.env.PORT;
    setupSwagger(app);
    app.get('/healthz', (req, res) => {
        res.status(200).json({ status: 'ok' });
    })

    app.use(express.json());

    app.use("/api/v1", apiRouter);

    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
        console.error(err);
        res.status(500).json({ "error": "internal_server_error" });
    }
    );

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

})();

