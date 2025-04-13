import { createReservation, getUserReservations, getReservationsByUser } from "../models/reservationModel.js";

// Reservation
export const reserve = async (req, res) => {
    const { userId, parkingLot, startTime, endTime } = req.body;

    try {
        const newReservation = await createReservation(userId, parkingLot, startTime, endTime);
        res.status(201).json({
            message: "Reservation created successfully",
            user: newReservation,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reservation
export const getReservations = async (req, res) => {
    const { u } = req.query;

    try {
        const reservations = await getUserReservations(u);
        res.status(201).json({
            message: "Fetched user reservations",
            reservations: reservations,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ^ Different from getReservations because separates past and current reservations
export const getSortedReservations = async (req, res) => {
    const { userId } = req.params;
    try {
        const reservations = await getReservationsByUser(userId);
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};