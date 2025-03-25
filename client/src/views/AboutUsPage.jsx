import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/AboutUsPage.css";

const AboutUsPage = () => {
    return (
        <div className="about-us-page-container">
        <Header />
        <NavBar />
        <div className="about-us-page-content">
            <h1>About Us Page</h1>
        </div>
        </div>
    );
}

export default AboutUsPage;