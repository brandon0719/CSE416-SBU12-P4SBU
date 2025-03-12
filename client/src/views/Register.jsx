import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import "../stylesheets/Register.css"; // Import the CSS file

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await ApiService.registerUser(name, email, password);
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="register-container">
            <h1>Register for <br></br><span className="red-text">P4SBU</span></h1>
            <form onSubmit={handleRegister}>
                <label className="form-label">
                    Name:
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label className="form-label">
                    Email:
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label className="form-label">
                    Password:
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" className="red-button">Register</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}
