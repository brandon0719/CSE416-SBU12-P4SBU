import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/HomePage.css";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox GL CSS

const HomePage = () => {
    useEffect(() => {
        // For Vite, use import.meta.env instead of process.env
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

        const campusBounds = [
            [-73.147969, 40.891420], // SW corner
            [-73.109477, 40.927109], // NE corner
        ];

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/light-v10",
            maxBounds: campusBounds,
        });

        map.on("load", async () => {
            // Fit map to the campus bounds
            map.fitBounds(campusBounds, { padding: 0 });

            try {
                // Fetch the lots from your API endpoint
                const response = await fetch("/api/lots");
                const lots = await response.json(); // Array of lot objects

                // Loop through each lot and add it to the map
                lots.forEach((lot) => {
                    // Construct a unique source ID using the lot's name.
                    // Replace spaces with dashes to ensure a valid ID.
                    const sourceId = `lot-${lot.name.replace(/\s+/g, "-")}`;

                    // Add the GeoJSON source using the 'geom' field from the DB
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: lot.geom, // Use lot.geom since the column is named geom
                    });

                    // Add a fill layer with grey fill and black outline
                    map.addLayer({
                        id: `${sourceId}-fill`,
                        type: "fill",
                        source: sourceId,
                        paint: {
                            "fill-color": "#808080",        // Grey fill
                            "fill-opacity": 0.5,
                            "fill-outline-color": "#000",     // Black outline
                        },
                    });

                    // Add a label layer for the lot name
                    map.addLayer({
                        id: `${sourceId}-label`,
                        type: "symbol",
                        source: sourceId,
                        layout: {
                            "text-field": lot.name, // Use the lot's name as the label
                            "text-size": 14,
                            "text-offset": [0, 0],
                            "text-anchor": "center",
                        },
                        paint: {
                            "text-color": "#000",
                        },
                    });
                });
            } catch (error) {
                console.error("Error fetching lots data:", error);
            }
        });

        // Clean up the map instance on component unmount
        return () => map.remove();
    }, []);

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                <div className="left-panel">
                    <h2>Parking Details</h2>
                    {/* Add additional parking details here */}
                </div>
                <div className="right-panel">
                    <div
                        id="map"
                        style={{
                            width: "600px",
                            height: "800px",
                            border: "2px solid #ccc",
                            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
