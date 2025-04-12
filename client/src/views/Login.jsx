import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import "../stylesheets/Login.css"; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await ApiService.handleLogin(email, password);
            const user = ApiService.getSessionUser(); // Get the logged-in user from cookies
            if (user && user.is_admin) {
                navigate("/users"); // Redirect to /users if the user is an admin
            } else {
                navigate("/HomePage"); // Redirect to /HomePage for regular users
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className = "login-page-background">
            <div className="login-container">
                <h1>Welcome to <br></br><span className="red-text">P4SBU</span></h1>
                <form onSubmit={handleLogin}>
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
                    <button type="submit" className="red-button">Login</button>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </form>
                <div className="login-links">
                    <a href="/register" className="red-text">Create Account</a> | <a href="/forgot-password" className="red-text">Forgot Password</a>
                </div>
                <div className="contact-info">
                    <h2><span className="red-text">Contact us</span></h2>
                    <p>Stony Brook Union, 2nd Floor</p>
                    <p>631-632-MAPS (6277)</p>
                    <p>parking@stonybrook.edu</p>
                    <p>Hours of Operation: Monday-Friday 8:30am-4:00pm</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
