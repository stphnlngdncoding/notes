import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  content: z.string().min(1, 'Content is required').trim(),
  tags: z.array(z.string().trim()).default([])
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().optional(),
  content: z.string().min(1, 'Content is required').trim().optional(),
  tags: z.array(z.string().trim()).optional()
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
