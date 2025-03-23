import axios from "axios";
import Cookies from "js-cookie";


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

        //I don't think we need the below two lines?

        //ApiService.setAuthToken(token); // Attach token to Axios
        //setUserset(user); // Update user state
    } catch (err) {
        console.error("Error during login:", err.message);
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

const ApiService = {
    registerUser : registerUser,
    handleLogin : handleLogin,
    login : login,
    logoutUser : logoutUser,
    fetchProtectedData : fetchProtectedData,
}

export default ApiService;
