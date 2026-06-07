import { z } from "zod";

export const createLokumSchema = z.object({
  content: z.string().min(10, "Le contenu est trop court"),
  name: z.string().optional(),
  flavor: z.string().optional(),
});

export const updateLokumSchema = z.object({
  content: z.string().min(10, "Le contenu est trop court"),
  changelog: z.string().optional(),
  name: z.string().optional(),
  flavor: z.string().optional(),
});

export type CreateLokumInput = z.infer<typeof createLokumSchema>;
export type UpdateLokumInput = z.infer<typeof updateLokumSchema>;
