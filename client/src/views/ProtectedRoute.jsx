import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    // If there is no token, redirect user to login
    return token ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
// ProtectedRoute component that checks if the user is 
// authenticated by checking if a token is stored in the local storage. 
// If the token is present, it renders the children (protected content), 
// otherwise it redirects the user to the login page.