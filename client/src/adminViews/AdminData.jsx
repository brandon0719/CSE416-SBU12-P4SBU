import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import "../stylesheets/AdminHome.css";

// I will play around with just 1 style sheet for all the admin views

const AdminData = () => {
    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <h1>DATA-ANALYSIS PAGE</h1>
                <p>this will probably be the very last thing we implement
                </p>
                <p>admins will be able to read user comments and feedback and respond to them</p>
                <p>.  Capacity analysis for each user category
                </p>
                <p>
                    Revenue analysis for each category for various plots
                </p>
                <p>User analysis for each category includes occupancy and revenue, fine payment, tickets, 
                etc.</p>
            </div>
        </div>
    );
}

export default AdminData;