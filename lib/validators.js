import { z } from "zod";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z
    .string()
    .min(8, "Parola trebuie să aibă minim 8 caractere.")
    .max(72, "Parola este prea lungă.")
    .regex(
      PASSWORD_PATTERN,
      "Parola trebuie să conțină literă mică, literă mare și cel puțin o cifră."
    )
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(1).max(72)
});
