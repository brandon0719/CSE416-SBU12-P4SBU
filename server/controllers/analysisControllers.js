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
              AND (reservations.user_type IS NULL);
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
        // console.log("Filtered Result:", filteredResult);
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
    

export const getDailyRevenueAnalysis = async (req, res) => {
    const { month, revenueType } = req.query;
    // console.log("Month:", month);
    // console.log("Revenue Type:", revenueType);

    try {
        // Default to the current month if no month is provided (months as numbers, e.g., 5 for May)
        const selectedMonth = month || new Date().getMonth() + 1;

        // This query splits reservations and tickets into two parts, then unions them.
        // Each subquery filters rows by the selected month and outputs: user_type, day, reservation_revenue, ticket_revenue.
        // Finally, we group by user_type and day in the outer query.
        let queryStr = `
            SELECT 
                user_type, 
                day, 
                SUM(reservation_revenue) AS reservation_revenue, 
                SUM(ticket_revenue) AS ticket_revenue
            FROM (
                SELECT 
                    u.user_type,
                    DATE(r.start_time) AS day,
                    r.num_spots * l.rate AS reservation_revenue,
                    0 AS ticket_revenue
                FROM users u
                LEFT JOIN reservations r ON u.user_id = r.user_id
                LEFT JOIN lots l ON r.lot_name = l.name
                WHERE u.user_type IS NOT NULL
                  AND r.start_time IS NOT NULL
                  AND EXTRACT(MONTH FROM r.start_time) = $1
                
                UNION ALL
                
                SELECT 
                    u.user_type,
                    DATE(t.creation_date) AS day,
                    0 AS reservation_revenue,
                    t.ticket_price AS ticket_revenue
                FROM users u
                LEFT JOIN tickets t ON u.user_id = t.user_id
                WHERE u.user_type IS NOT NULL
                  AND t.creation_date IS NOT NULL
                  AND EXTRACT(MONTH FROM t.creation_date) = $1
            ) sub
            GROUP BY user_type, day
            ORDER BY day;
        `;

        // console.log("Executing query...");
        const result = await pool.query(queryStr, [selectedMonth]);
        // console.log("Rows from DB:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error executing query:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getTicketAnalysis = async (req, res) => {
    const { month } = req.query;

    try {
        const result = await pool.query(`
            WITH user_types AS (
                SELECT UNNEST(ARRAY['Commuter', 'Faculty', 'Resident', 'Visitor']) AS user_type
            )
            SELECT 
                ut.user_type,
                COALESCE(COUNT(DISTINCT t.ticket_id), 0) AS total_tickets
            FROM user_types ut
            LEFT JOIN users u ON ut.user_type = u.user_type
            LEFT JOIN tickets t ON u.user_id = t.user_id
                AND EXTRACT(MONTH FROM t.creation_date) = $1
            GROUP BY ut.user_type
            ORDER BY ut.user_type;
        `, [month]);

        // console.log("Ticket Analysis Result:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getDailyTicketAnalysis = async (req, res) => {
    const { month } = req.query;

    try {
        const result = await pool.query(`
            WITH user_types AS (
                SELECT UNNEST(ARRAY['Commuter', 'Faculty', 'Resident', 'Visitor']) AS user_type
            )
            SELECT 
                ut.user_type,
                DATE(t.creation_date) AS day,
                COUNT(DISTINCT t.ticket_id) AS total_tickets
            FROM user_types ut
            LEFT JOIN users u ON ut.user_type = u.user_type
            LEFT JOIN tickets t ON u.user_id = t.user_id
                AND EXTRACT(MONTH FROM t.creation_date) = $1
            GROUP BY ut.user_type, DATE(t.creation_date)
            ORDER BY DATE(t.creation_date), ut.user_type;
        `, [month]);

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getReservationAnalysis = async (req, res) => {
    const { month } = req.query;

    try {
        const result = await pool.query(`
            WITH user_types AS (
                SELECT UNNEST(ARRAY['Commuter', 'Faculty', 'Resident', 'Visitor']) AS user_type
            )
            SELECT 
                ut.user_type,
                COALESCE(COUNT(DISTINCT r.reservation_id), 0) AS total_reservations
            FROM user_types ut
            LEFT JOIN users u ON ut.user_type = u.user_type
            LEFT JOIN reservations r ON u.user_id = r.user_id
                AND EXTRACT(MONTH FROM r.start_time) = $1
            GROUP BY ut.user_type
            ORDER BY ut.user_type;
        `, [month]);

        // console.log("Reservation Analysis Result:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDailyReservationAnalysis = async (req, res) => {
    const { month } = req.query;

    try {
        const result = await pool.query(`
            WITH user_types AS (
                SELECT UNNEST(ARRAY['Commuter', 'Faculty', 'Resident', 'Visitor']) AS user_type
            )
            SELECT 
                ut.user_type,
                DATE(r.start_time) AS day,
                COUNT(DISTINCT r.reservation_id) AS total_reservations
            FROM user_types ut
            LEFT JOIN users u ON ut.user_type = u.user_type
            LEFT JOIN reservations r ON u.user_id = r.user_id
                AND EXTRACT(MONTH FROM r.start_time) = $1
            GROUP BY ut.user_type, DATE(r.start_time)
            ORDER BY DATE(r.start_time), ut.user_type;
        `, [month]);

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserTypeCounts = async (req, res) => {
    try {
        const result = await pool.query(`
            WITH user_types AS (
                SELECT UNNEST(ARRAY['Commuter', 'Faculty', 'Resident', 'Visitor']) AS user_type
            )
            SELECT 
                ut.user_type,
                COALESCE(COUNT(u.user_id), 0) AS total_users
            FROM user_types ut
            LEFT JOIN users u ON ut.user_type = u.user_type
            GROUP BY ut.user_type
            ORDER BY ut.user_type;
        `);

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDailyFeedbackCounts = async (req, res) => {
    const { month } = req.query;

    try {
        const result = await pool.query(`
            SELECT 
                DATE(f.creation_date) AS day,
                COUNT(f.feedback_id) AS total_feedbacks
            FROM feedback f
            WHERE EXTRACT(MONTH FROM f.creation_date) = $1
            GROUP BY DATE(f.creation_date)
            ORDER BY DATE(f.creation_date);
        `, [month]);

        console.log("Daily Feedback Counts Result:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};