import pool from  "../config/db.js";   

export const getCapacityAnalysis = async (req, res) => {
    const { lotName } = req.query; // read query parameter
    try {
        let queryStr, params;
        if (!lotName || lotName.toLowerCase() === "all") {
            // Aggregate over all lots if not provided or 'all'
            queryStr = `
                SELECT 
                    SUM(commuter_spots + commuter_premium_spots) AS commuter_capacity,
                    SUM(faculty_staff_spots) AS faculty_capacity,
                    SUM(resident_spots) AS resident_capacity,   
                    SUM(metered_spots) AS visitor_capacity
                FROM lots;
            `;
            params = [];
        } else {
            // Get capacity for the selected lot
            queryStr = `
                SELECT 
                    (commuter_spots + commuter_premium_spots) AS commuter_capacity,
                    faculty_staff_spots AS faculty_capacity,
                    resident_spots AS resident_capacity,
                    metered_spots AS visitor_capacity
                FROM lots
                WHERE name = $1;
            `;
            params = [lotName];
        }
        const result = await pool.query(queryStr, params);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCapacityUsage = async (req, res) => {
    const { lotName } = req.query; // Read the parking lot name from query parameters
    try {
        let queryStr, params;

        if (!lotName || lotName.toLowerCase() === "all") {
            // Aggregate over all lots if no specific lot is selected
            queryStr = `
                SELECT 
                    SUM(CASE WHEN user_type = 'Commuter' THEN num_spots ELSE 0 END) +
                    SUM(CASE WHEN user_type = 'Commuter Premium' THEN num_spots ELSE 0 END) AS commuter_used,
                    SUM(CASE WHEN user_type = 'Faculty' THEN num_spots ELSE 0 END) AS faculty_used,
                    SUM(CASE WHEN user_type = 'Resident' THEN num_spots ELSE 0 END) AS resident_used,
                    SUM(CASE WHEN user_type = 'Visitor' THEN num_spots ELSE 0 END) AS visitor_used
                FROM reservations
                WHERE start_time <= NOW() AND end_time >= NOW(); -- Active reservations
            `;
            params = [];
        } else {
            // Filter by the specific parking lot
            queryStr = `
                SELECT 
                    SUM(CASE WHEN user_type = 'Commuter' THEN num_spots ELSE 0 END) +
                    SUM(CASE WHEN user_type = 'Commuter Premium' THEN num_spots ELSE 0 END) AS commuter_used,
                    SUM(CASE WHEN user_type = 'Faculty' THEN num_spots ELSE 0 END) AS faculty_used,
                    SUM(CASE WHEN user_type = 'Resident' THEN num_spots ELSE 0 END) AS resident_used,
                    SUM(CASE WHEN user_type = 'Visitor' THEN num_spots ELSE 0 END) AS visitor_used
                FROM reservations
                WHERE lot_name = $1 AND start_time <= NOW() AND end_time >= NOW(); -- Active reservations
            `;
            params = [lotName];
        }

        const result = await pool.query(queryStr, params);

        // Replace null values with 0
        const data = result.rows[0];
        const response = {
            commuter_used: data.commuter_used || 0,
            faculty_used: data.faculty_used || 0,
            resident_used: data.resident_used || 0,
            visitor_used: data.visitor_used || 0,
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRevenueAnalysis = async (req, res) => {
    const { month, revenueType } = req.query;

    try {
        await pool.query(`
            UPDATE reservations
            SET user_type = u.user_type
            FROM users u
            WHERE reservations.user_id = u.user_id
              AND (reservations.user_type IS NULL OR reservations.user_type != u.user_type);
        `);
        // Default to the current month if no month is provided
        const selectedMonth = month || new Date().getMonth() + 1; // Months are 1-based (1 = January)

        // Base query
        let queryStr = `
            SELECT 
                u.user_type,
                COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM r.start_time) = $1 THEN r.num_spots * l.rate ELSE 0 END), 0)::NUMERIC(10, 2) AS reservation_revenue, 
                COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM t.creation_date) = $1 THEN t.ticket_price ELSE 0 END), 0)::NUMERIC(10, 2) AS ticket_revenue
            FROM users u
            LEFT JOIN reservations r ON u.user_id = r.user_id
            LEFT JOIN lots l ON r.lot_name = l.name
            LEFT JOIN tickets t ON u.user_id = t.user_id
            WHERE u.user_type IS NOT NULL -- Exclude rows with null user_type
            GROUP BY u.user_type
            ORDER BY u.user_type;
        `;

        const result = await pool.query(queryStr, [selectedMonth]);

        // Filter the result based on the revenue type
        let filteredResult = result.rows;
        console.log("Filtered Result:", filteredResult);
        if (revenueType === "ticket") {
            filteredResult = filteredResult.map((row) => ({
                user_type: row.user_type,
                revenue: parseFloat(row.ticket_revenue),
            }));
        } else if (revenueType === "reservation") {
            filteredResult = filteredResult.map((row) => ({
                user_type: row.user_type,
                revenue: parseFloat(row.reservation_revenue),
            }));
        } else if (revenueType === "total") {
            filteredResult = filteredResult.map((row) => ({
                user_type: row.user_type,
                revenue:
                    parseFloat(row.reservation_revenue) +
                    parseFloat(row.ticket_revenue),
            }));
        }
        // console.log("Filtered Result after mapping:", filteredResult);
        res.json(filteredResult);
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