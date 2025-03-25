import { useEffect, useState } from "react";
import ApiService from "../services/ApiService";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/HomePage.css";

const HomePage = () => {
    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="mapbox-container">
                <iframe
                    src="/map_test.html" // Path to map_test.html in the public folder
                    title="Map"
                    frameBorder="0"
                    style={{ width: "100%", height: "100%" }}
                ></iframe>
            </div>
        </div>
    );
};

export default HomePage;

