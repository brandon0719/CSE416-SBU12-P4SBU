import axios from "axios";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

const baseURL = process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:8000/api";      // for local‐dev 
const http = axios.create({
    baseURL
});

export const login = (user) => {
    const in1Hour = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour from now
    Cookies.set("token", user.token, { expires: in1Hour });
    Cookies.set("user", JSON.stringify(user), { expires: in1Hour });
    console.log("User cookie set:", JSON.stringify(user));
};

export const logout = () => {
    Cookies.remove("user");
    Cookies.remove("token");
    console.log("User cookie removed");
    window.location.reload(); // Reload the page to reflect the logout
};

export const getSessionUser = () => {
    try {
        const userCookie = Cookies.get("user");
        // console.log("Raw user cookie:", userCookie);

        if (!userCookie) {
            console.warn("No user cookie found.");
            return null;
        }

        const user = JSON.parse(userCookie);
        // console.log("Parsed session user:", user);
        return user;
    } catch (error) {
        console.error("Failed to parse session user:", error);
        Cookies.remove("user"); // Clear corrupted cookie
        return null;
    }
};

export const getMessages = async (userId) => {
    // console.log("Fetching messages for user ID:", userId);
    try {
        const response = await http.get(`/messages/${userId}`);
        // console.log("Messages fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};

export const sendMessage = async (senderId, recipientId, messageDetails) => {
    try {
        const response = await http.post("/messages/send", {
            senderId,
            recipientId,
            messageDetails,
        });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

//newly added function
const getNotifications = async () => {
    console.log("Fetching mock notifications...");
    const mockNotifications = [
        {
            message: "New announcement posted",
            link: "/announcements/123",
            time: new Date("2025-04-04T16:00:00"), // Example datetime
        },
        {
            message: "Your ticket has been updated",
            link: "/tickets/123",
            time: new Date("2025-04-04T13:00:00"),
        },
        {
            message: "System maintenance scheduled",
            link: "/announcements/456",
            time: new Date("2025-04-03T18:22:00"),
        },
        {
            message: "New parking spots added",
            link: "/homepage",
            time: new Date("2025-04-03T15:51:00"),
        },
        {
            message: "Group reservation was approved",
            link: "/homepage",
            time: new Date("2025-04-03T08:55:00"),
        },
        {
            message: "New commuter Lot added",
            link: "/homepage",
            time: new Date("2025-03-28T11:07:00"),
        },
        {
            message: "New message from admin",
            link: "/messages/advisor",
            time: new Date("2025-03-27T09:30:00"),
        },
    ];

    // Format the time for each notification
    const formattedNotifications = mockNotifications.map((notification) => {
        const now = new Date();
        const diffMs = now - notification.time; // Difference in milliseconds
        const diffMinutes = Math.ceil(diffMs / (1000 * 60)); // Difference in minutes
        const diffHours = Math.floor(diffMinutes / 60); // Difference in hours

        let formattedTime;
        if (diffMinutes < 60) {
            formattedTime = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""
                } ago`;
        } else if (diffHours < 24) {
            formattedTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else {
            const options = {
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            };
            formattedTime = notification.time.toLocaleString("en-US", options); // Example: "March 28 at 11:07 AM"
        }

        return {
            ...notification,
            time: formattedTime, // Replace the time with the formatted string
        };
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(formattedNotifications);
        }, 1000); // Simulate a 1-second delay
    });
};

export const handleLogin = async (email, password) => {
    try {
        const response = await http.post("/auth/login", { email, password });
        console.log("Login API response:", response); // Log the full response

        const { user, token } = response.data;

        if (!user || !token) throw new Error("Invalid login response");

        Cookies.set("user", JSON.stringify(user), { expires: 7 }); // Save user to cookie
        Cookies.set("token", token, { expires: 7 }); // Save token to cookie
        console.log("HANDLING User cookie set:", JSON.stringify(user));
    } catch (err) {
        console.error("Error during login:", err.response?.data || err.message);
        console.log(JSON.stringify(err.response?.data.error));
        throw err;
    }
};

// Register User
const registerUser = async (name, email, password) => {
    try {
        const response = await http.post("/auth/register", {
            name,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Registration failed" };
    }
};

// Fetch Protected Data
const fetchProtectedData = async () => {
    try {
        const response = await http.get("/auth/protected", {
            headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unauthorized access" };
    }
};

//create a reservation
const createReservation = async (userId, parkingLot, startTime, endTime, numSpots, explanation) => {
    try {
        const response = await http.post("/reservation/create", {
            userId,
            parkingLot,
            startTime,
            endTime,
            numSpots,
            explanation
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            switch (error.response.status) {
                case 409:
                    throw { message: 'Conflict: Not enough spaces in parking lot for reservation' };
                default:
                    throw error.response?.data || { message: "Reservation failed" };
            }
        }
    };
}

// ticket stuff
export const createTicket = async (
    userId,
    violationDate,
    ticketPrice,
    ticketDetails
) => {
    try {
        console.log("Creating ticket with:", {
            userId,
            violationDate,
            ticketPrice,
            ticketDetails,
        });
        const response = await http.post("/tickets/create", {
            userId,
            violationDate,
            ticketPrice,
            ticketDetails,
        });

        return response.data;
    } catch (error) {
        console.error("Failed to create ticket:", error);
        throw error.response?.data || { message: "Ticket creation failed" };
    }
};

export const getTickets = async (userId) => {
    try {
        const response = await http.get(`/tickets/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
        throw error.response?.data || { message: "Failed to fetch tickets" };
    }
};

export const getPaidTickets = async (UserId) => {
    try {
        const response = await http.get(`/tickets/user/${UserId}/paid`);
        return response.data;
    } catch {
        console.error("Failed to fetch paid tickets:", error);
        throw error.response?.data || { message: "Failed to fetch paid tickets" };
    }
}

export const payTickets = async (ticketIds) => {
    try {
        const response = await http.post("/tickets/pay", { ticketIds });
        return response.data;
    } catch (error) {
        console.error("Failed to pay tickets:", error);
        throw error.response?.data || { message: "Failed to pay tickets" };
    }
};


// user stuff
export const fetchAllUsers = async () => {
    try {
        const response = await http.get("/admin/users");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error.response?.data || { message: "Failed to fetch users" };
    }
};

export const findUserById = async (userId) => {
    console.log("Finding user by ID:", userId);
    try {
        const response = await http.get(`/admin/${userId}`);
        console.log("User found:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error.response?.data || { message: "Error fetching user by ID" };
    }
};


export const approveUser = async (userId) => {
    try {
        await http.post("/admin/approveUser", { userId });
    } catch (error) {
        console.error("Failed to approve user:", error);
        throw error.response?.data || { message: "Failed to approve user" };
    }
};

export const deleteUser = async (userId) => {
    try {
        await http.post("/admin/deleteUser", { userId });
    } catch (error) {
        console.error("Failed to delete user:", error);
        throw error.response?.data || { message: "Failed to delete user" };
    }
};

// Fetch all parking lots
export const fetchAllParkingLots = async () => {
    try {
        const response = await http.get("/lots/getlots");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch parking lots:", error);
        throw error.response?.data || { message: "Failed to fetch parking lots" };
    }
};

// Add a new parking lot
export const addParkingLot = async (data) => {
    try {
        const response = await http.post("/lots/add", data);
        return response.data;
    } catch (error) {
        console.error("Failed to add parking lot:", error);
        throw error.response?.data || { message: "Failed to add parking lot" };
    }
};


// Edit an existing parking lot
export const editParkingLot = async (id, data) => {
    try {
        const response = await http.put(`/lots/edit/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Failed to edit parking lot:", error);
        throw error.response?.data || { message: "Failed to edit parking lot" };
    }
};

// Delete a parking lot
export const deleteParkingLot = async (id) => {
    try {
        console.log("Deleting parking lot with ID:", id);
        const response = await http.delete(`/lots/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete parking lot:", error);
        throw error.response?.data || { message: "Failed to delete parking lot" };
    }
};

const updateProfile = async (profileData) => {
    console.log("Updating profile with data:", profileData);
    try {
        const response = await http.put("/user/profile", profileData);
        return response.data;
    } catch (error) {
        console.error("API updateProfile error:", error.response || error);
        throw error.response?.data || error;
    }
};

const getUserReservations = async (userId) => {
    try {
        const response = await http.get(`/reservation/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching reservations:", error.response || error);
        throw error.response?.data || error;
    }
};

const getNumAvailableSpotsAtTime = async (lot, reservationStart, reservationEnd) => {
    try {
        const response = await http.get('/reservation/lot/num', {
            params: {  
                parkingLot: lot,
                startTime: reservationStart.toISOString(),
                endTime: reservationEnd.toISOString()
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reservations:", error.response || error);
        throw error.response?.data || error;
    }
}

export const createFeedback = async (userId, topic, details) => {
    try {
        const response = await http.post("/feedback/create", {
            userId,
            topic,
            details,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating feedback:", error);
        throw error.response?.data || { message: "Error creating feedback" };
    }
};

export const fetchFeedback = async () => {
    try {
        const response = await http.get("/feedback/list");
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback:", error);
        throw error.response?.data || { message: "Error fetching feedback" };
    }
}

export const getFeedbackDetails = async (feedbackId) => {
    try {
        const response = await http.get(`/feedback/${feedbackId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback details:", error);
        throw error.response?.data || { message: "Error fetching feedback details" };
    }
};

export const resolveFeedback = async (feedbackId, messageDetails, senderId, recipientId) => {
    try {
        console.log("feedback info", feedbackId,'\n', messageDetails, '\n', senderId, '\n', recipientId);
        const response = await http.post("/feedback/resolve", {
            feedbackId,
            messageDetails,
            senderId,
            recipientId,
        });
        return response.data;
    } catch (error) {
        console.error("Error resolving feedback:", error);
        throw error.response?.data || { message: "Error resolving feedback" };
    }
};

export const getPopularHours = async (lot, day) => {
    try {
        const response = await http.get(`/reservation/lot/hourly?lot=${lot}&day=${day}`)
        return response.data;
    } catch (error) {
        console.error("Error fetching reservations:", error.response || error);
        throw error.response?.data || error;
    }
}


// Stripe
export const createPaymentIntent = async (amount) => {
    try {
        const { data } = await http.post("/payments/create-payment-intent", {
            amount,
        });
        return data.clientSecret;
    } catch (err) {
        console.error(
            "Error creating PaymentIntent:",
            err.response?.data || err.message
        );
        throw err;
    }
};

export const approveReservation = async (reservationId) => {
    try {
        const resp = await http.post("/admin/approveReservation", {
            reservationId,
        });
        return resp.data;
    } catch (err) {
        console.error(
            "Failed to approve reservation:",
            err.response?.data || err
        );
        throw err.response?.data || err;
    }
};

export const fetchPendingReservations = async () => {
    try {
        const response = await http.get("/reservation/pending");
        return response.data;
    } catch (error) {
        console.error("Error fetching pending reservations:", error);
        throw error.response?.data || { message: "Error fetching pending reservations" };
    }
}

export const fetchCompletedReservations = async () => {
    try {
        const response = await http.get("/reservation/approved");
        return response.data
    } catch (error) {
        console.error("Error fetching approved reservations:", error);
        throw error.response?.data || { message: "Error fetching approved reservations" };
    }
}

const getLotUsage = async () => {
    const response = await http.get("/reservation/usage");
    return response.data; // array of { lot_name, permit_type, spots_taken }
};

export const fetchCapacityAnalysis = async (lotName = "All") => {
    try {
        const response = await http.get(`/analysis/capacity`, {
            params: { lotName }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching capacity analysis:", error);
        throw error.response?.data || { message: "Error fetching capacity analysis" };
    }
}

export const fetchCapacityUsage = async (lotName= "All") => {
    try {
        console.log("Fetching capacity usage for lot:", lotName);
        const response = await http.get(`/analysis/capacity-usage`, {
            params: { lotName },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching capacity usage:", error);
        throw error.response?.data || { message: "Error fetching capacity usage" };
    }
}

export const fetchRevenueAnalysis = async (revenueType = "total", month = new Date().getMonth() + 1) => {
    try {
        // console.log("Fetching revenue analysis for month:", month, "and type:", revenueType);
        const response = await http.get("/analysis/revenue", {
            params: { revenueType, month },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching revenue analysis:", error);
        throw error;
    }
};

export const fetchDailyRevenueAnalysis = async (revenueType = "total", month = new Date().getMonth() + 1) => {
    try {
        // console.log("Fetching daily revenue analysis for month:", month, "and type:", revenueType);
        const response = await http.get(`/analysis/daily-revenue`, {
            params: { revenueType, month },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching daily revenue analysis:", error);
        throw error;
    }
};

export const fetchTicketAnalysis = async (month = new Date().getMonth() + 1) => {
    try {
        const response = await http.get("/analysis/tickets", {
            params: { month },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket analysis:", error);
        throw error.response?.data || { message: "Error fetching ticket analysis" };
    }
};

export const fetchDailyTicketAnalysis = async (month = new Date().getMonth() + 1) => {
    try {
        const response = await http.get(`/analysis/daily-tickets?month=${month}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching daily ticket analysis:", error);
        throw error;
    }
};

export const fetchReservationAnalysis = async (month = new Date().getMonth() + 1) => {
    try {
        const response = await http.get("/analysis/reservations", {
            params: { month },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reservation analysis:", error);
        throw error.response?.data || { message: "Error fetching reservation analysis" };
    }
};

export const fetchDailyReservationAnalysis = async (month = new Date().getMonth() + 1) => {
    try {
        const response = await http.get(`/analysis/daily-reservations?month=${month}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching daily reservation analysis:", error);
        throw error;
    }
};

export const fetchUserTypeCounts = async () => {
    try {
        const response = await http.get("/analysis/user-type-counts");
        return response.data;
    } catch (error) {
        console.error("Error fetching user type counts:", error);
        throw error;
    }
};

export const fetchDailyFeedbackCounts = async (month = new Date().getMonth() + 1) => {
    try {
        const response = await http.get(`/analysis/daily-feedback-counts?month=${month}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching daily feedback counts:", error);
        throw error;
    }
};

const ApiService = {
    registerUser: registerUser,
    handleLogin: handleLogin,
    login: login,
    fetchProtectedData: fetchProtectedData,
    logout: logout,
    getSessionUser: getSessionUser,
    getNotifications: getNotifications,
    getMessages: getMessages,
    sendMessage: sendMessage,
    createReservation: createReservation,
    getTickets: getTickets,
    getPaidTickets: getPaidTickets,
    getPopularHours: getPopularHours,
    createTicket: createTicket,
    fetchAllUsers: fetchAllUsers,
    findUserById: findUserById,
    payTickets: payTickets,
    approveUser: approveUser,
    deleteUser: deleteUser,
    fetchAllParkingLots: fetchAllParkingLots,
    addParkingLot: addParkingLot,
    editParkingLot: editParkingLot,
    deleteParkingLot: deleteParkingLot,
    updateProfile: updateProfile,
    getUserReservations: getUserReservations,
    createFeedback: createFeedback,
    fetchFeedback: fetchFeedback,
    getFeedbackDetails: getFeedbackDetails,
    resolveFeedback: resolveFeedback,
    getNumAvailableSpotsAtTime: getNumAvailableSpotsAtTime,
    createPaymentIntent: createPaymentIntent,
    approveReservation: approveReservation,
    fetchPendingReservations: fetchPendingReservations,
    fetchCompletedReservations: fetchCompletedReservations,
    getLotUsage: getLotUsage,
    fetchCapacityAnalysis: fetchCapacityAnalysis,
    fetchCapacityUsage: fetchCapacityUsage,
    fetchRevenueAnalysis: fetchRevenueAnalysis,
    fetchDailyRevenueAnalysis: fetchDailyRevenueAnalysis,
    fetchTicketAnalysis: fetchTicketAnalysis,
    fetchReservationAnalysis: fetchReservationAnalysis, 
    fetchDailyTicketAnalysis: fetchDailyTicketAnalysis,
    fetchDailyReservationAnalysis: fetchDailyReservationAnalysis,
    fetchUserTypeCounts: fetchUserTypeCounts,
    fetchDailyFeedbackCounts: fetchDailyFeedbackCounts,
};

export default ApiService;
