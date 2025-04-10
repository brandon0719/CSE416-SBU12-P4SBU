import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import "../stylesheets/AdminHome.css";

// I will play around with just 1 style sheet for all the admin views

const AdminParking = () => {
    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <h1>PARKING-LOT PAGE</h1>
                <p>This is where admins can approve of group reservations</p>
                <p>option to add parking lots</p>
                <p>option to remove parking lots</p>
            </div>
        </div>
    );
}

export default AdminParking;