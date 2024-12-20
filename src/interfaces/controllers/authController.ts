// src/interfaces/controllers/authController.ts

import { Request, Response, NextFunction } from "express";
import { AuthUseCase } from "../../application/use-cases/auth/AuthUseCase";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { AuthenticationError } from "../../common/error/AuthenticationError";
import { z } from "zod";
import ms from "ms";

const userRepository = new UserRepository();
const authUseCase = new AuthUseCase(userRepository);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  namaDepan: z.string().min(1),
  namaBelakang: z.string().min(1),
  nomorHp: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(8),
});

const registerAdminSchema = z.object({
  namaDepan: z.string().min(1),
  namaBelakang: z.string().min(1),
  nomorHp: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(12), // Consider stronger password requirements for admins
});

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { accessToken, user } = await authUseCase.login(email, password);

    const accessTokenAge = process.env.ACCESS_TOKEN_AGE || "1d";
    const maxAge = ms(accessTokenAge);
    const isProduction = process.env.NODE_ENV === "production";

    // Set the access token in an HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: typeof maxAge === "number" ? maxAge : undefined,
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // Log untuk debugging
    console.log("Login attempt:", { email, success: true, cookieSet: true });

    // Send user information (including role) in the response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        namaDepan: user.namaDepan,
        namaBelakang: user.namaBelakang,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else if (error instanceof AuthenticationError) {
      res.status(401).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = registerSchema.parse(req.body);
    const newUser = await authUseCase.register(userData);
    res
      .status(201)
      .json({ message: "Registration successful", userId: newUser.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else if (error instanceof AuthenticationError) {
      res.status(409).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminData = registerAdminSchema.parse(req.body);
    const newAdmin = await authUseCase.registerAdmin(adminData);
    res.status(201).json({
      message: "Admin registration successful",
      userId: newAdmin.id,
      role: newAdmin.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else if (error instanceof AuthenticationError) {
      res.status(409).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authUseCase.logout();

    const isProduction = process.env.NODE_ENV === "production";
    // Get sameSite directly from environment variable
    const sameSite = process.env.COOKIE_SAME_SITE;

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSite as "strict" | "lax" | "none" | undefined,
    });

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await authUseCase.getCurrentUser(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
