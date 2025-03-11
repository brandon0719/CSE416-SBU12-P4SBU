import { Routes, Route } from "react-router-dom";
import Login from "./views/Login";
// import Dashboard from "./views/Dashboard";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );
}

export default App;
