import pool from  "../config/db.js";   

export const getCapacityAnalysis = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(faculty_staff_spots) AS faculty_capacity,
                SUM(commuter_spots) AS commuter_capacity,
                SUM(resident_spots) AS resident_capacity,
                SUM(metered_spots) AS visitor_capacity
            FROM lots;
        `);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRevenueAnalysis = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_type,
                COALESCE(SUM(r.num_spots * l.rate), 0) AS reservation_revenue,
                COALESCE(SUM(t.ticket_price), 0) AS ticket_revenue
            FROM users u
            LEFT JOIN reservations r ON u.user_id = r.user_id
            LEFT JOIN lots l ON r.lot_name = l.name
            LEFT JOIN tickets t ON u.user_id = t.user_id
            GROUP BY u.user_type;
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserAnalysis = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_type,
                COUNT(DISTINCT r.reservation_id) AS total_reservations,
                COUNT(DISTINCT t.ticket_id) AS total_tickets,
                COALESCE(SUM(r.num_spots * l.rate), 0) AS reservation_revenue,
                COALESCE(SUM(t.ticket_price), 0) AS ticket_revenue
            FROM users u
            LEFT JOIN reservations r ON u.user_id = r.user_id
            LEFT JOIN lots l ON r.lot_name = l.name
            LEFT JOIN tickets t ON u.user_id = t.user_id
            GROUP BY u.user_type;
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};