// tests/jwt.test.js
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware"; // adjust the path as needed

// Ensure that the secret used to sign tokens is available (fallback for tests)
const secret = process.env.JWT_SECRET || "testsecret";

describe("JWT Authorization Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn(() => res), // so that chaining res.status(...).json(...) works
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test("should return 401 if no token is provided", () => {
        authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
        expect(next).not.toHaveBeenCalled();
    });

    test("should call next and attach user if token is valid", () => {
        // Create a token with a sample payload
        const payload = { id: 1, username: "testuser" };
        const token = jwt.sign(payload, secret);
        req.headers.authorization = `Bearer ${token}`;

        authMiddleware(req, res, next);

        // Check that the payload is attached to req.user
        expect(req.user).toMatchObject(payload);
        expect(next).toHaveBeenCalled();
        // Ensure that res.status and res.json were not called
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
