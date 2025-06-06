import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    console.log(req.headers);
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ message: "Access denied" });
    }

    try {
        const verified = jwt.verify(token, secret);
        console.log("Token verified:", verified);
        req.user = verified;
        next(); // pass the request to the next middleware
    } catch (err) {
        console.error("Token verification error:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(400).json({ message: "Invalid token" });
    }
}

export default authMiddleware;
