// types/express/index.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // or `number` or `Types.ObjectId` depending on your DB
    }
  }
}
