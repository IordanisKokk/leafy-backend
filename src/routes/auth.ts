import { Router, Request, Response, NextFunction } from "express";
import AppDataSource from "../data-source";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

export const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request, invalid input
 *       '500':
 *         description: Internal server error
 */

authRouter.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOneBy({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const user = userRepository.create({ email, passwordHash: password });
        user.email = email;
        user.passwordHash = password;

        await userRepository.save(user);

        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *       '400':
 *         description: Bad request, invalid input
 */
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Login request received");
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOneBy({ email });
        console.debug("User found:", user);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        console.debug("Checking password for user:", user.email);
        if (!await user.matches(password)) {
            return res.status(400).json({ error: "Invalid password" });
        }
        console.debug("Password matches for user:", user.email);
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: "1h"
        });
        console.debug("Token generated for user:", user.email);
        return res.status(200).json({
            message: "User logged in successfully",
            token: token
        })
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});