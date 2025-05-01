import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/AboutUsPage.css";
import malikPic from "../images/malikPic.png";
import weirdUnderline from "../images/Line4.svg";

const AboutUsPage = () => {
    return (
        <div className="about-us-page-container">
            <Header />
            <NavBar />

            <div className="about-us-page-content">
                <div className="who-header">
                    <h2>Who Is Smart Parking Management System 4 SBU</h2>
                </div>
                <div className="who-content">
                    <div className="who-left">
                        <section>
                        <img src={malikPic} alt="Picture of Malik" className = "malik"/>
                        </section>
                        <section>
                            <h3>Mission</h3>
                            <h2>What we strive to achieve</h2>
                            <img src={weirdUnderline} alt="underline" className="underline" />
                            <p>Our mission is to revolutionize the parking experience at Stony Brook University by providing a smarter, faster, and more reliable solution for managing campus parking. We are committed to reducing the time and stress involved in finding a parking spot, promoting sustainable parking practices that lower congestion and carbon emissions, and enhancing the overall user experience through an intuitive and adaptive platform. By continuously innovating and incorporating feedback from the campus community, we aim to create a system where parking becomes a seamless part of everyday life at SBU.
                            </p>
                        </section>
                    </div>
                    <div className="who-right">
                        <section>
                            <h2>Who are we?</h2>
                            <img src={weirdUnderline} alt="underline" className="underline" />
                            <p>We are a team of passionate developers, designers, and engineers dedicated to enhancing the parking experience at Stony Brook University. Our goal is to create an efficient, user-friendly, and smart parking system that simplifies the way students, faculty, and visitors find and reserve parking on campus.
                            </p>

                            <p>
                                By integrating real-time data, intelligent wayfinding algorithms, and a seamless reservation system, we aim to reduce congestion, minimize frustration, and make parking more accessible for everyone at SBU. Whether you're a daily commuter, a faculty member, or a visitor, P4SBU ensures that finding a parking spot is effortless and stress-free.
                            </p>
                        </section>
                        <section>
                            <h3>Vision</h3>
                            <h2>How we see our Future</h2>
                            <img src={weirdUnderline} alt="underline" className="underline" />
                            <p>We envision a future where parking at Stony Brook University is fully optimized, intelligent, and eco-friendly. Our goal is to leverage advanced technologies such as AI and predictive analytics to anticipate parking availability and guide users effortlessly to open spots. We also aspire to expand our system beyond SBU, offering scalable solutions that benefit other universities and institutions. By fostering a more sustainable campus environment and reducing traffic congestion, we aim to set a new standard for campus mobility, ensuring that parking is no longer a challenge but a streamlined and efficient process.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUsPage;