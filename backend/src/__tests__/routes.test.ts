import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import routes from '../routes.js';
import repository from '../repository.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('API Routes', () => {
  beforeEach(() => {
    // Reset repository before each test
    (repository as any).notes = [];
  });

  describe('POST /api/notes', () => {
    it('should create a note and return 201', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: 'Test', content: 'Content', tags: ['work'] });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test');
      expect(response.body.content).toBe('Content');
      expect(response.body.tags).toEqual(['work']);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '', content: 'Content' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should trim whitespace', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '  Test  ', content: '  Content  ', tags: [] });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test');
      expect(response.body.content).toBe('Content');
    });
  });

  describe('GET /api/notes', () => {
    it('should return all notes', async () => {
      await request(app).post('/api/notes').send({ title: 'Note 1', content: 'Content 1', tags: [] });

      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Note 1');
    });

    it('should filter by search text', async () => {
      await request(app).post('/api/notes').send({ title: 'Work Note', content: 'Content', tags: [] });
      await request(app).post('/api/notes').send({ title: 'Personal', content: 'Content', tags: [] });

      const response = await request(app).get('/api/notes?search=Work');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Work Note');
    });

    it('should filter by tag', async () => {
      await request(app).post('/api/notes').send({ title: 'Note 1', content: 'Content', tags: ['work'] });
      await request(app).post('/api/notes').send({ title: 'Note 2', content: 'Content', tags: ['personal'] });

      const response = await request(app).get('/api/notes?tag=work');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Note 1');
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .send({ title: 'Original', content: 'Content', tags: [] });

      const response = await request(app)
        .put(`/api/notes/${createRes.body.id}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
      expect(response.body.content).toBe('Content');
    });

    it('should return 404 when note not found', async () => {
      const response = await request(app)
        .put('/api/notes/non-existent')
        .send({ title: 'Test' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid input', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .send({ title: 'Test', content: 'Content', tags: [] });

      const response = await request(app)
        .put(`/api/notes/${createRes.body.id}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .send({ title: 'Test', content: 'Content', tags: [] });

      const response = await request(app).delete(`/api/notes/${createRes.body.id}`);

      expect(response.status).toBe(204);

      const getRes = await request(app).get('/api/notes');
      expect(getRes.body).toHaveLength(0);
    });

    it('should return 404 when note not found', async () => {
      const response = await request(app).delete('/api/notes/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/tags', () => {
    it('should return empty array when no notes', async () => {
      const response = await request(app).get('/api/tags');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all unique tags', async () => {
      await request(app).post('/api/notes').send({ title: 'Note 1', content: 'Content', tags: ['work', 'urgent'] });
      await request(app).post('/api/notes').send({ title: 'Note 2', content: 'Content', tags: ['personal'] });

      const response = await request(app).get('/api/tags');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(['personal', 'urgent', 'work']);
    });
  });
});
