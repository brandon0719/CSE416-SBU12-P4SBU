import axios from "axios";

const http = axios.create({
    baseURL: "http://localhost:8000/api", 
});

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

// Login User
const loginUser = async (email, password) => {
    try {
        const response = await http.post("/auth/login", { email, password });
        localStorage.setItem("token", response.data.token);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

// Logout User
const logoutUser = () => {
    localStorage.removeItem("token");
};

// Fetch Protected Data
const fetchProtectedData = async () => {
    try {
        const response = await http.get("/auth/protected");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unauthorized access" };
    }
};

const ApiService = {
    registerUser : registerUser,
    loginUser : loginUser,
    logoutUser : logoutUser,
    fetchProtectedData : fetchProtectedData,
}

export default ApiService;
