import { z } from "zod";

const BET_MIN = 10;
const BET_MAX = 100_000;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required").max(100),
});

export const depositSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Amount must be a whole number")
    .min(1, "Minimum deposit is 1")
    .max(100_000, "Maximum deposit is 100,000"),
});

export const slotSpinSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Bet must be a whole number")
    .min(BET_MIN, `Minimum bet is ${BET_MIN}`)
    .max(BET_MAX, `Maximum bet is ${BET_MAX}`),
});

const namedBetType = z.enum([
  "red",
  "black",
  "green",
  "even",
  "odd",
  "low",
  "high",
  "dozen1",
  "dozen2",
  "dozen3",
  "col1",
  "col2",
  "col3",
]);

const rouletteBetSchema = z.object({
  type: z.union([namedBetType, z.number().int().min(0).max(36)]),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Bet must be a whole number")
    .min(BET_MIN, `Minimum bet is ${BET_MIN}`)
    .max(BET_MAX, `Maximum bet is ${BET_MAX}`),
});

export const rouletteSpinSchema = z.object({
  bets: z
    .array(rouletteBetSchema)
    .min(1, "At least one bet is required")
    .max(20, "Maximum 20 bets per spin"),
});

export const blackjackStartSchema = z.object({
  bet: z
    .number({ invalid_type_error: "Bet must be a number" })
    .int("Bet must be a whole number")
    .min(BET_MIN, `Minimum bet is ${BET_MIN}`)
    .max(BET_MAX, `Maximum bet is ${BET_MAX}`),
});

export function validate(schema, body, res) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    res.status(400).json({ error: first.message });
    return null;
  }
  return result.data;
}
