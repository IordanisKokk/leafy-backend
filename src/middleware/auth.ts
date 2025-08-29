import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extend Express’ Request so downstream handlers can access req.userId
 */
export interface AuthedRequest extends Request {
  userId?: string;
}

/**
 * auth_middleware
 * ----------------
 * Verifies a Bearer token, stores the user id on req, or responds 401/403.
 *
 * Usage:
 *   router.use(auth_middleware);
 */
export function auth_middleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const raw = req.headers.authorization?.split(" ")[1];
  if (!raw) {
    return res.status(401).json({ error: "missing_token" });
  }

  try {
    const payload = jwt.verify(
      raw,
      process.env.JWT_SECRET as string
    ) as { sub: string };

    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}