import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/ProfilePage.css";

const ProfilePage = () => {
    return (
        <div className="profile-page-container">
            <Header />
            <NavBar />
            <div className="profile-page-content">
                <h1>Profile Page</h1>
            </div>
        </div>
    );
};

export default ProfilePage;
