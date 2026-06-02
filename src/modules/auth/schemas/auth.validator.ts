import z from "zod/v3";

export const signupSchema = z
  .object({
    lastName: z
      .string()
      .min(3)
      .max(25)
      .regex(/^[\p{L}\s]+$/u, "Last name can only contain letters and spaces"),
    firstName: z
      .string()
      .min(3)
      .max(25)
      .regex(/^[\p{L}\s]+$/u, "First name can only contain letters and spaces"),
    email: z.string().email(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(25, "Password must be at most 25 characters")
      .regex(/^(?=.*[A-Z])(?=.*@)(?=.*[0-9]).+$/, "Password invalid"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password invalid")
    .max(25, "Password invalid")
    .regex(/^(?=.*[A-Z])(?=.*@)(?=.*[0-9]).+$/, "Password invalid"),
});

// Inferred TypeScript types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
