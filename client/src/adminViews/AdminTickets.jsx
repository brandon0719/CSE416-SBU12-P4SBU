import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import "../stylesheets/AdminHome.css";

// I will play around with just 1 style sheet for all the admin views

const AdminTickets= () => {
    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <h1>TICKETS PAGE</h1>
                <p>Option to search users by name or license plate</p>
                <p>Option to add and remove tickets from users</p>
                <p>List of unpaid tickets</p>
                <p>List of paid tickets</p>
            </div>
        </div>
    );
}

export default AdminTickets;