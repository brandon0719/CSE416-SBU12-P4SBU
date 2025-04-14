import request from 'supertest';
import app from "../app";
import pool from "./db"

import { closePool } from './db';

test('Create a reservation', async () => {
    const res = await request(app)
        .post('/api/reservation/create')
        .send({
            userId: "aaa5f145-a4c0-4acc-bf54-348f5525b513", 
            parkingLot: 'Lot 1 Admin Overflow', 
            startTime: '2025-01-01 08:00:00', 
            endTime: '2025-01-01 17:00:00'
        })

    expect(res.body).toMatchObject({
        message: "Reservation created successfully"
    });
});

test('View user reservations', async () => {
    const res = await request(app)
    .get('/api/reservation/fetch?u=aaa5f145-a4c0-4acc-bf54-348f5525b513')
    .expect(200)

    expect(res.body.reservations).toEqual(
            expect.objectContaining({
                lot_name: "Lot 1 Admin Overflow",
                user_id: "aaa5f145-a4c0-4acc-bf54-348f5525b513"
            })
    );  
})

afterAll(async () => {
    await pool.query('DELETE FROM reservations WHERE user_id = $1', ['aaa5f145-a4c0-4acc-bf54-348f5525b513']);
    await closePool; 
  });