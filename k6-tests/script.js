import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {

    stages: [
        { duration: '1s', target: 547 }, 
        // { duration: '1m', target: 50 },   
        // { duration: '30s', target: 0 },   
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // Fail if >1% requests fail
        http_req_duration: ['p(95)<500'], // 95% of requests <500ms
    },
};

export default function () {
    const reservationPayload = JSON.stringify({
        userId: "aaa5f145-a4c0-4acc-bf54-348f5525b513",
        parkingLot: "Lot 13 Old H",
        startTime: "2025-04-24T00:00:00.000Z",
        endTime: "2025-04-25T00:00:00.000Z",
        numSpots: 1,
        explanation: null
    })

    const res = http.post('http://localhost:8000/api/reservation/create', reservationPayload, {headers: { 'Content-Type': 'application/json' }} );
    check(res, {
        'Reservation created successfully': (r) => r.status === 201,
    });
    sleep(1)
}