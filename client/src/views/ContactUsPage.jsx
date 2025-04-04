import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/ContactUsPage.css";

const ContactUsPage = () => {
    return (
        <div className="contact-page-container">
        <Header />
        <NavBar />
        <div className="contact-page-content">
            <h1>Contact Page</h1>
        </div>
        </div>
    );
}

export default ContactUsPage;