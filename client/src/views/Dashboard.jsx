import { useEffect, useState } from "react";
import ApiService from "../services/ApiService";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getProtectedData = async () => {
            try {
                const data = await ApiService.fetchProtectedData();
                setMessage(data.message);
            } catch (error) {
                console.error("Unauthorized", error);
                navigate("/login");
            }
        };
        getProtectedData();
    }, [navigate]);

    const handleLogout = () => {
        ApiService.logoutUser();
        navigate("/login");
    };

    return (
        <div>
            <h1>{message}</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
