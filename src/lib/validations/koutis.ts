import { z } from "zod";

export const createKoutiSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  skillIds: z.array(z.string()).default([]),
});

export const updateKoutiSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
  skillIds: z.array(z.string()).optional(),
});

export type CreateKoutiInput = z.infer<typeof createKoutiSchema>;
export type UpdateKoutiInput = z.infer<typeof updateKoutiSchema>;
