import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/MessagePage.css";

const MessagePage = () => {
    return (
        <div className="message-page-container">
        <Header />
        <NavBar />
        <div className="message-page-content">
            <h1>Message Page</h1>
        </div>
        </div>
    );
}

export default MessagePage;