import { Router } from "express";
import { authRouter } from "./auth";
import { speciesRouter } from "./species";
import { plantRouter } from "./plants";

export const apiRouter = Router();


apiRouter.use("/auth", authRouter);
apiRouter.use("/species", speciesRouter);
apiRouter.use("/plants", plantRouter);

export default apiRouter;