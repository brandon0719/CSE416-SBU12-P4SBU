import { createReservation, getUserReservations, getReservationsByUser, getLotReservations, getOverlappingReservations, getNumAvailableSpotsAtTime } from "../models/reservationModel.js";

// Reservation
export const reserve = async (req, res) => {
    const { userId, parkingLot, startTime, endTime, numSpots, explanation } = req.body;

    try {
        const newReservation = await createReservation(userId, parkingLot, startTime, endTime, numSpots, explanation);
        res.status(201).json({
            message: "Reservation created successfully",
            user: newReservation,
        });
    } catch (error) {
        if (error.message == "Not enough spaces in parking lot for reservation") {
            res.status(409).json({error: error.message})
        } else {
            res.status(500).json({ error: error.message });
        }

    }
};

// Reservation
export const getReservations = async (req, res) => {
    const { u } = req.query;

    try {
        const reservations = await getUserReservations(u);
        res.status(200).json({
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

export const getReservationsByLot = async (req, res) => {
    const { lot } = req.query;
    try {
        const reservations = await getLotReservations(lot);
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getReservationsByLotAndTime = async (req, res) => {
    const { parkingLot, startTime, endTime } = req.query;
    try {
        const reservations = await getOverlappingReservations(parkingLot, startTime, endTime);
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getNumAvailableAtTime = async (req, res) => {
    const { parkingLot, startTime, endTime } = req.query;
    try {
        const num = await getNumAvailableSpotsAtTime(parkingLot, startTime, endTime);
        res.status(200).json(num);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};