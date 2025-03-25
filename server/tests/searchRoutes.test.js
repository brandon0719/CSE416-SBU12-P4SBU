import request from 'supertest';
import app from "../app";
import { closePool } from './db';

test('Search buildings by querying a part of its name', async () => {
    const res = await request(app)
        .get('/api/search/buildings?q=wang')
        .expect(200)

    expect(res.body.searchResults).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                name: "Charles B. Wang Center",
                campus: "SBU WEST"
            })
        ])
    );    
});

afterAll(async () => {
  await closePool(); // Cleanup
});