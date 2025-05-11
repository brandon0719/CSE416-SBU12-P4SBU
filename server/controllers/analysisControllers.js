import pool from  "../config/db.js";   

export const getCapacityAnalysis = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(commuter_spots + commuter_premium_spots) AS commuter_capacity,
                SUM(faculty_staff_spots) AS faculty_capacity,
                SUM(resident_spots) AS resident_capacity,
                SUM(metered_spots) AS visitor_capacity
            FROM lots;
        `);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCapacityUsage = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(CASE WHEN user_type = 'Commuter' THEN num_spots ELSE 0 END) +
                SUM(CASE WHEN user_type = 'Commuter Premium' THEN num_spots ELSE 0 END) AS commuter_used,
                SUM(CASE WHEN user_type = 'Faculty' THEN num_spots ELSE 0 END) AS faculty_used,
                SUM(CASE WHEN user_type = 'Resident' THEN num_spots ELSE 0 END) AS resident_used,
                SUM(CASE WHEN user_type = 'Visitor' THEN num_spots ELSE 0 END) AS visitor_used
            FROM reservations
            WHERE start_time <= NOW() AND end_time >= NOW(); -- Active reservations
        `);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRevenueAnalysis = async (req, res) => {
    try {
        // Update the user_type column in the reservations table
        await pool.query(`
            UPDATE reservations
            SET user_type = u.user_type
            FROM users u
            WHERE reservations.user_id = u.user_id
              AND (reservations.user_type IS NULL OR reservations.user_type != u.user_type);
        `);

        // Now perform the revenue analysis
        const result = await pool.query(`
            SELECT 
                u.user_type,
                COALESCE(SUM(r.num_spots * l.rate), 0)::NUMERIC(10, 2) AS reservation_revenue, 
                COALESCE(SUM(t.ticket_price), 0)::NUMERIC(10, 2) AS ticket_revenue 
            FROM users u
            LEFT JOIN reservations r ON u.user_id = r.user_id
            LEFT JOIN lots l ON r.lot_name = l.name
            LEFT JOIN tickets t ON u.user_id = t.user_id
            GROUP BY u.user_type
            ORDER BY u.user_type;
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTicketAnalysis = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_type,
                COUNT(DISTINCT t.ticket_id) AS total_tickets,
                COALESCE(SUM(t.ticket_price), 0)::NUMERIC(10, 2) AS ticket_revenue
            FROM users u
            LEFT JOIN tickets t ON u.user_id = t.user_id
            GROUP BY u.user_type
            ORDER BY u.user_type;
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getReservationAnalysis = async (req, res) => {
    try {
        // Update the user_type column in the reservations table
        await pool.query(`
            UPDATE reservations
            SET user_type = u.user_type
            FROM users u
            WHERE reservations.user_id = u.user_id
              AND (reservations.user_type IS NULL OR reservations.user_type != u.user_type);
        `);

        // Now perform the reservation analysis
        const result = await pool.query(`
            SELECT 
                u.user_type,
                COUNT(DISTINCT r.reservation_id) AS total_reservations,
                COALESCE(SUM(r.num_spots * l.rate), 0)::NUMERIC(10, 2) AS reservation_revenue
            FROM users u
            LEFT JOIN reservations r ON u.user_id = r.user_id
            LEFT JOIN lots l ON r.lot_name = l.name
            GROUP BY u.user_type
            ORDER BY u.user_type;
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};