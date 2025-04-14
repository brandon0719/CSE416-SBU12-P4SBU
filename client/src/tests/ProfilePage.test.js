// tests/profileApiService.test.js

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

describe("ApiService - Profile and Reservations", () => {
    let mock;

    beforeEach(() => {
        // Clear cookies before each test
        Cookies.remove("user");
        Cookies.remove("token");
        // Create a new instance of axios-mock-adapter using axios
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        // Restore the original axios behavior after each test
        mock.restore();
    });

    test("updateProfile returns updated user data on success", async () => {
        const profilePayload = {
            userId: "dummy-id",
            name: "Updated Name",
            sbuId: "123456789",
            address: "123 Updated Ave",
            userType: "Resident",
            permitNumber: "UPD123",
            carModel: "Toyota",
            licensePlate: "ABC123",
            isProfileComplete: true,
        };

        const responsePayload = {
            message: "Profile updated successfully",
            user: {
                user_id: "dummy-id",
                name: "Updated Name",
                sbu_id: "123456789",
                address: "123 Updated Ave",
                user_type: "Resident",
                permit_number: "UPD123",
                car_model: "Toyota",
                license_plate: "ABC123",
                is_profile_complete: true,
            },
        };

        // The update endpoint is "/user/profile"
        mock.onPut("/user/profile", profilePayload).reply(200, responsePayload);

        const result = await ApiService.updateProfile(profilePayload);
        expect(result).toEqual(responsePayload);
    });

    test("updateProfile throws error on failure", async () => {
        const profilePayload = {
            userId: "dummy-id",
            name: "", // Missing required name
            sbuId: "123456789",
            address: "123 Updated Ave",
            userType: "Resident",
            permitNumber: "UPD123",
            carModel: "Toyota",
            licensePlate: "ABC123",
            isProfileComplete: true,
        };

        const errorResponse = { error: "Name is required." };

        mock.onPut("/user/profile", profilePayload).reply(400, errorResponse);

        await expect(ApiService.updateProfile(profilePayload)).rejects.toEqual(
            errorResponse
        );
    });

    test("getUserReservations returns reservations data on success", async () => {
        const userId = "dummy-id";
        const reservationsResponse = {
            currentReservations: [
                {
                    reservation_id: "res1",
                    lot_name: "Lot A",
                    start_time: "2025-04-15T08:00:00Z",
                    end_time: "2025-04-15T17:00:00Z",
                },
            ],
            pastReservations: [
                {
                    reservation_id: "res2",
                    lot_name: "Lot B",
                    start_time: "2025-01-01T08:00:00Z",
                    end_time: "2025-01-01T17:00:00Z",
                },
            ],
        };

        // The get reservations endpoint is "/reservation/user/:userId"
        mock.onGet(`/reservation/user/${userId}`).reply(
            200,
            reservationsResponse
        );

        const result = await ApiService.getUserReservations(userId);
        expect(result).toEqual(reservationsResponse);
    });

    test("getUserReservations throws error on failure", async () => {
        const userId = "dummy-id";
        const errorResponse = { error: "Not Found" };

        mock.onGet(`/reservation/user/${userId}`).reply(404, errorResponse);

        await expect(ApiService.getUserReservations(userId)).rejects.toEqual(
            errorResponse
        );
    });
});
