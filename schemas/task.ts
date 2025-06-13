import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.any().optional(),
});

export type TaskPayload = z.infer<typeof TaskSchema>;
