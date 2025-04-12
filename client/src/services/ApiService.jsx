import axios from "axios";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";


const http = axios.create({
    baseURL: "http://localhost:8000/api",
});

export const login = (user) => {
    Cookies.set("token", user.token, { expires: 7 }); // 30 min
    Cookies.set("user", JSON.stringify(user), { expires: 7 }); // 30 min
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
        console.log("Raw user cookie:", userCookie);

        if (!userCookie) {
            console.warn("No user cookie found.");
            return null;
        }

        const user = JSON.parse(userCookie);
        console.log("Parsed session user:", user);
        return user;
    } catch (error) {
        console.error("Failed to parse session user:", error);
        Cookies.remove("user"); // Clear corrupted cookie
        return null;
    }
};

const getMessages = async () => {
    console.log("Fetching mock messages...");
    const mockMessages = [
        {
            message: "You have a new message from Admin",
            link: "/messages/admin",
            time: new Date("2025-04-06T10:00:00"), // Example datetime
        },
        {
            message: "Your reservation has been approved",
            link: "/reservations/123",
            time: new Date("2025-04-05T15:30:00"),
        },
        {
            message: "Reminder: Meeting tomorrow at 10 AM",
            link: "/meetings/456",
            time: new Date("2025-04-05T08:00:00"),
        },
        {
            message: "Your ticket has been updated",
            link: "/tickets/789",
            time: new Date("2025-04-04T18:45:00"),
        },
        {
            message: "System maintenance scheduled for tonight",
            link: "/announcements/maintenance",
            time: new Date("2025-04-03T22:00:00"),
        },
    ];

    // Format the time for each message
    const formattedMessages = mockMessages.map((message) => {
        const now = new Date();
        const diffMs = now - message.time; // Difference in milliseconds
        const diffMinutes = Math.ceil(diffMs / (1000 * 60)); // Difference in minutes
        const diffHours = Math.floor(diffMinutes / 60); // Difference in hours

        let formattedTime;
        if (diffMinutes < 60) {
            formattedTime = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
        } else if (diffHours < 24) {
            formattedTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else {
            const options = { month: "long", day: "numeric", hour: "numeric", minute: "numeric", hour12: true };
            formattedTime = message.time.toLocaleString("en-US", options); // Example: "April 5 at 3:30 PM"
        }

        return {
            ...message,
            time: formattedTime, // Replace the time with the formatted string
        };
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(formattedMessages);
        }, 1000); // Simulate a 1-second delay
    });
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
            formattedTime = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
        } else if (diffHours < 24) {
            formattedTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else {
            const options = { month: "long", day: "numeric", hour: "numeric", minute: "numeric", hour12: true };
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
    console.log("handleLogin called with:", { email, password });

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
                Authorization: `Bearer ${Cookies.get('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unauthorized access" };
    }
};


// // mock create payment
// const createPaymentIntent = async (ticketIds) => {
//     console.log("Mocking payment intent creation for tickets:", ticketIds);
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve({ clientSecret: "mock_client_secret" });
//         }, 1000); // Simulate a delay
//     });
// };

//create a reservation
const createReservation = async (userId, parkingLot, startTime, endTime) => {
    try {
        const response = await http.post("/reservation/create", {
            userId,
            parkingLot,
            startTime,
            endTime
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Reservation failed" };
    }
};

export const createTicket = async (userId, violationDate, ticketPrice, ticketDetails) => {
    try {
        console.log("Creating ticket with:", { userId, violationDate, ticketPrice, ticketDetails });
        const response = await http.post("/tickets/create", {
            userId,
            violationDate,
            ticketPrice,
            ticketDetails
        });

        return response.data;
    } catch (error) {
        console.error("Failed to create ticket:", error);
        throw error.response?.data || { message: "Ticket creation failed" };
    }
}

export const getTickets = async (userId) => {
    try {
        console.log("Fetching tickets for user ID:", userId);
        const response = await http.get(`/tickets/user/${userId}`);
        console.log("Tickets fetched:", response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
        throw error.response?.data || { message: "Failed to fetch tickets" };
    }
};

export const payTickets = async (ticketIds) => {
    try {
        const response = await http.post("/tickets/pay", {ticketIds});
        return response.data;
    } catch(error) {
        console.error("Failed to pay tickets:", error);
        throw error.response?.data || { message: "Failed to pay tickets" };
    }
}

export const fetchAllUsers = async () => {
    try {
        const response = await http.get("/tickets/users");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error.response?.data || { message: "Failed to fetch users" };
    }
}



const ApiService = {
    registerUser: registerUser,
    handleLogin: handleLogin,
    login: login,
    fetchProtectedData: fetchProtectedData,
    logout: logout,
    getSessionUser: getSessionUser,
    getNotifications: getNotifications,
    getMessages: getMessages,
    createReservation: createReservation,
    getTickets: getTickets,
    createTicket: createTicket,
    fetchAllUsers: fetchAllUsers,
    payTickets: payTickets,
}

export default ApiService;
