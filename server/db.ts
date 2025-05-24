import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Fallback to original Neon setup if MySQL not available
const sql = neon(process.env.DATABASE_URL || "");
export const db = drizzle(sql, { schema });