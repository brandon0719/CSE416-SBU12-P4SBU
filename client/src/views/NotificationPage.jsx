import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/NotificationPage.css";

const NotifcationPage = () => {
    return (
        <div className="notif-page-container">
        <Header />
        <NavBar />
        <div className="notif-page-content">
            <h1>Notif Page</h1>
        </div>
        </div>
    );
}

export default NotifcationPage;