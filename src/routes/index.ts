import { Router } from "express";
import { authRouter } from "./auth";
import { speciesRouter } from "./species.router";
import { plantRouter } from "./plants.router";

export const apiRouter = Router();


apiRouter.use("/auth", authRouter);
apiRouter.use("/species", speciesRouter);
apiRouter.use("/plants", plantRouter);

export default apiRouter;