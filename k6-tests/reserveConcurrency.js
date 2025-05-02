import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 50,
    duration: '10s'
};

export default function () {
    const reservationPayload = JSON.stringify({
        userId: "aaa5f145-a4c0-4acc-bf54-348f5525b513",
        parkingLot: "concurrencytest",
        startTime: "2025-04-24T00:00:00.000Z",
        endTime: "2025-04-25T00:00:00.000Z",
        numSpots: 1,
        explanation: null
    })

    const res = http.post('http://localhost:8000/api/reservation/create', reservationPayload, {headers: { 'Content-Type': 'application/json' }} );
    check(res, {
        'Valid status': (r) => r.status === 201 || r.status === 409,
    });

    sleep(1)
}