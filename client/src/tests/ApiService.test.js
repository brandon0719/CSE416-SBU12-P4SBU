// Make sure to mock axios before importing ApiService!
jest.mock("axios", () => {
    const actualAxios = jest.requireActual("axios");
    return {
        ...actualAxios,
        create: jest.fn(() => actualAxios),
    };
});

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Cookies from "js-cookie";
import ApiService from "../services/ApiService";

describe("ApiService", () => {
    let mock;

    beforeEach(() => {
        // Clear cookies before each test
        Cookies.remove("user");
        Cookies.remove("token");
        // Create a new instance of axios-mock-adapter using the default axios instance
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        // Restore the original axios behavior after each test
        mock.restore();
    });

    test("handleLogin should throw error if response is invalid", async () => {
        const email = "test@example.com";
        const password = "password123";
        // Missing the required `user` and `token` properties in the response
        const invalidResponse = { invalid: "data" };

        mock.onPost("/auth/login", { email, password }).reply(
            200,
            invalidResponse
        );

        await expect(ApiService.handleLogin(email, password)).rejects.toThrow(
            "Invalid login response"
        );
    });

    test("registerUser should return response data on successful registration", async () => {
        const name = "New User";
        const email = "newuser@example.com";
        const password = "newpassword";
        const responsePayload = {
            message: "User registered successfully",
            user: {
                id: 2,
                name,
                email,
                is_admin: false,
            },
        };

        // Intercept the POST request for registration
        mock.onPost("/auth/register", { name, email, password }).reply(
            200,
            responsePayload
        );

        const result = await ApiService.registerUser(name, email, password);
        expect(result).toEqual(responsePayload);
    });

    test("registerUser should throw error on failed registration", async () => {
        const name = "New User";
        const email = "newuser@example.com";
        const password = "newpassword";
        const errorResponse = { message: "Registration failed" };

        // Simulate a 400 error with an error response
        mock.onPost("/auth/register", { name, email, password }).reply(
            400,
            errorResponse
        );

        await expect(
            ApiService.registerUser(name, email, password)
        ).rejects.toEqual(errorResponse);
    });
});
