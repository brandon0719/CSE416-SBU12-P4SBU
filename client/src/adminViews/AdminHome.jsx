import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import "../stylesheets/AdminHome.css";

const AdminHome = () => {
    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <h1>USERS PAGE</h1>
                <p>List of users</p>
                <p>option to approve users</p>
                <p>option to add/delete users</p>
                <p>option to look at user profiles and change them if needed</p>

            </div>
        </div>
    );
}

export default AdminHome;