import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Metrics
const regDuration = new Trend('registration_duration');
const regSuccess = new Rate('registration_success');
const loginDuration = new Trend('login_duration');
const loginSuccess = new Rate('login_success');
const authFailures = new Counter('auth_failures');

// Test config
const USER_POOL_SIZE = 1000; // Virtual users

export const options = {
        
    stages: [
    // Gradual warm-up (1-2 minutes)
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    // Sustained load (3-5 minutes)
    { duration: '2m', target: 200 },   
    // Stress testing (optional)
    { duration: '1m', target: 400 },  
    // Ramp-down
    { duration: '30s', target: 0 }
    ],
    thresholds: {
        registration_success: ['rate>0.95'],
        login_success: ['rate>0.98'],
        'http_req_duration{type:registration}': ['p(95)<500'],
        'http_req_duration{type:login}': ['p(95)<300']
    }
};

const testUsers = Array(USER_POOL_SIZE).fill().map((_, i) => ({
    email: `loadtest_user_${i}@stonybrook.edu`,
    password: `securep@$$w0rD90O0O`
}));

export default function () {
    const user = testUsers[__VU]; // unique user per each VU

  // ----------- Registration -----------------
    const registerRes = http.post(
            `http://localhost:8000/api/auth/register`,
            JSON.stringify({
            email: user.email,
            password: user.password,
            name: `Load Test ${__VU}`,
        }),
        { 
            headers: { 'Content-Type': 'application/json' },
            tags: { type: 'registration' }
        }
    );
    var regOK;
    
    if (registerRes.status !== 409) { //don't check if register success if there's a conflict
        regOK = check(registerRes, {
            'Registration succeeded': (r) => r.status === 201,
        });
    }
  sleep(2);

  regDuration.add(registerRes.timings.duration);
  if (regOK) {
    regSuccess.add(regOK);
  }
  
  if (!regOK) authFailures.add(1);
  // ----------- Login -----------
  const loginRes = http.post(
    `http://localhost:8000/api/auth/login`,
    JSON.stringify({
      email: user.email,
      password: user.password
    }),
    { 
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'login' }
    }
  );

  const loginOK = check(loginRes, {
    'Login success': (r) => r.status === 200,
    'Received token': (r) => r.json('token') !== undefined
  });

  loginDuration.add(loginRes.timings.duration);
  loginSuccess.add(loginOK);
  if (!loginOK) authFailures.add(1);

  // Verify token works
  if (loginOK) {
    const profileRes = http.get(
      `http://localhost:8000/api/auth/protected`,
      { headers: { Authorization: `Bearer ${loginRes.json('token')}` }}
    );
    check(profileRes, {
      'Profile access OK': (r) => r.status === 200
    });
  }

  sleep(3);
}

  // Short delay between registration and login

  