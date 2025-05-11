import pool from "../config/db.js";

export const getAllLots = async () => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM lots"
        );
        return rows;
    } catch (error) {
        throw new Error("Error fetching parking lots: " + error.message);
    }
};

export const getLotDetails = async () => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                lotid,
                campus,
                name,
                total_spaces,
                faculty_staff_spots,
                commuter_premium_spots,
                metered_spots,
                commuter_spots,
                resident_spots,
                details,
                rate,
                ST_AsGeoJSON(geom)::json AS geom
             FROM lots`
        );
        return rows;
    } catch (error) {
        throw new Error("Error fetching parking lots: " + error.message);
    }
};

export const addLot = async (lotData) => {
    const {
        campus,
        name,
        total_spaces,
        faculty_staff_spots,
        commuter_premium_spots,
        metered_spots,
        commuter_spots,
        resident_spots,
        geom,
        details,
        rate,
    } = lotData;
    console.log(lotData, "lotData in model");
    try {
        const { rows } = await pool.query(
            "INSERT INTO lots (campus, name, total_spaces, faculty_staff_spots, commuter_premium_spots, metered_spots, commuter_spots, resident_spots, geom, details, rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromGeoJSON($9), $10, $11) RETURNING *",
            [campus, name, total_spaces, faculty_staff_spots, commuter_premium_spots, metered_spots, commuter_spots, resident_spots, geom, details, rate]
        );
        return rows[0];
    } catch (error) {
        throw new Error("Error adding parking lot: " + error.message);
    }
};

export const editLot = async (lotId, lotData) => {
    const {
        campus,
        name,
        total_spaces,
        faculty_staff_spots,
        commuter_premium_spots,
        metered_spots,
        commuter_spots,
        resident_spots,
        geom,
        details,
        rate,
    } = lotData;

    try {
        // Fetch the current geom value from the database
        const { rows: currentRows } = await pool.query(
            "SELECT encode(ST_AsBinary(geom), 'hex') AS geom FROM lots WHERE lotid = $1",
            [lotId]
        );

        if (currentRows.length === 0) {
            throw new Error("Parking lot not found");
        }

        const currentGeom = currentRows[0].geom;

        // Determine whether to update the geom field
        const geomQueryPart =
            geom && geom !== currentGeom
                ? "geom = ST_GeomFromWKB(decode($9, 'hex'))"
                : "geom = geom";

        // Build the query
        const query = `
            UPDATE lots 
            SET campus = $1, 
                name = $2, 
                total_spaces = $3, 
                faculty_staff_spots = $4, 
                commuter_premium_spots = $5, 
                metered_spots = $6, 
                commuter_spots = $7, 
                resident_spots = $8, 
                ${geomQueryPart}, 
                details = $10, 
                rate = $11 
            WHERE lotid = $12 
            RETURNING *`;

        // Prepare query parameters
        const queryParams = [
            campus,
            name,
            total_spaces,
            faculty_staff_spots,
            commuter_premium_spots,
            metered_spots,
            commuter_spots,
            resident_spots,
            geom && geom !== currentGeom ? geom : null, // Only pass geom if it's different
            details,
            rate,
            lotId,
        ];

        // Execute the query
        const { rows } = await pool.query(query, queryParams);
        return rows[0];
    } catch (error) {
        console.error("Error editing parking lot:", error.message);
        throw new Error("Error editing parking lot: " + error.message);
    }
};

export const removeLot = async (lotId) => {
    console.log(lotId, "lotId in model");
    try { 
        const { rows } = await pool.query(
            "DELETE FROM lots WHERE lotid = $1 RETURNING *",
            [lotId]
        );
        return rows[0];
    } catch (error) {
        throw new Error("Error removing parking lot: " + error.message);
    }
}