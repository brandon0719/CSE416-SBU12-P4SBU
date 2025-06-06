import {
    createReservation,
    getUserReservations,
    getReservationsByUser,
    getLotReservations,
    getOverlappingReservations,
    getNumAvailableSpotsAtTime,
    getPendingReservations,
    approveResmodel,
    getApprovedReservations,
    getCurrentLotUsage,
} from "../models/reservationModel.js";

// Reservation
export const reserve = async (req, res) => {
    const { userId, parkingLot, startTime, endTime, numSpots, explanation } =
        req.body;

    try {
        const newReservation = await createReservation(
            userId,
            parkingLot,
            startTime,
            endTime,
            numSpots,
            explanation
        );
        res.status(201).json({
            message: "Reservation created successfully",
            user: newReservation,
        });
    } catch (error) {
        if (
            error.message == "Not enough spaces in parking lot for reservation"
        ) {
            res.status(409).json({ error: error.message });
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
        const reservations = await getOverlappingReservations(
            parkingLot,
            startTime,
            endTime
        );
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getNumAvailableAtTime = async (req, res) => {
    const { parkingLot, startTime, endTime } = req.query;
    try {
        const num = await getNumAvailableSpotsAtTime(
            parkingLot,
            startTime,
            endTime
        );
        res.status(200).json(num);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPopularHours = async (req, res) => {
    try {
        const { lot, day } = req.query;
        const reservations = await getLotReservations(lot);

        const hourlyCounts = Array(24).fill(0);

        reservations.forEach((reservation) => {
            const start = new Date(reservation.start_time);
            const end = new Date(reservation.end_time);

            if (
                start.getDay() == day ||
                end.getDay() == day ||
                (day > start.getDay() && day < end.getDay())
            ) {
                const startHour = start.getHours();
                const endHour = end.getHours();

                for (let hour = startHour; hour <= endHour; hour++) {
                    if (hour >= 0 && hour < 24) {
                        hourlyCounts[hour] += reservation.num_spots;
                    }
                }
            }
        });
        res.status(200).json(hourlyCounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listPendingReservations = async (req, res) => {
    try {
        const pending = await getPendingReservations();
        res.status(200).json({
            message: "Fetched pending reservations",
            reservations: pending,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listApprovedReservations = async (req, res) => {
    try {
        const approved = await getApprovedReservations();
        res.status(200).json({
            message: "Fetched approved reservations",
            reservations: approved,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const approveReservation = async (req, res) => {
    const { reservationId } = req.body;
    if (!reservationId) {
        return res.status(400).json({ error: "Missing reservationId." });
    }

    try {
        const updated = await approveResmodel(reservationId);
        res.status(200).json({
            message: "Reservation approved",
            reservation: updated,
        });
    } catch (error) {
        if (error.message === "Reservation not found") {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getCurrentUsage = async (req, res) => {
    try {
        const usage = await getCurrentLotUsage();
        res.status(200).json(usage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};