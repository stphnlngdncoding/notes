import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { createNoteSchema, updateNoteSchema } from './types.js';
import controller from './controller.js';
import { NotFoundError } from './errors.js';

const router = Router();

router.get('/notes', (req: Request, res: Response) => {
  try {
    const searchText = req.query.search as string | undefined;
    const tag = req.query.tag as string | undefined;

    const notes = controller.getNotes(searchText, tag);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/notes', (req: Request, res: Response) => {
  try {
    const validated = createNoteSchema.parse(req.body);
    const note = controller.createNote(validated);
    res.status(201).json(note);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/notes/:id', (req: Request, res: Response) => {
  try {
    const validated = updateNoteSchema.parse(req.body);
    const note = controller.updateNote(req.params.id, validated);
    res.json(note);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/notes/:id', (req: Request, res: Response) => {
  try {
    controller.deleteNote(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/tags', (req: Request, res: Response) => {
  try {
    const tags = controller.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
