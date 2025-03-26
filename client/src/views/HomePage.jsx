import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js';
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/HomePage.css";
import "mapbox-gl/dist/mapbox-gl.css";
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

const HomePage = () => {
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

        // Set the initial center coordinates (roughly between your previous bounds)
        const initialCenter = [-73.12246,40.91671];
        const initialZoom = 15;

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/light-v10",
            center: initialCenter,
            zoom: initialZoom,
        });

        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/driving',
        });

        // Add the Directions control to the map
        map.addControl(directions, 'top-left');

        map.on("load", async () => {
            map.scrollZoom.setWheelZoomRate(100);

            try {
                const response = await fetch("/api/lots");
                const lots = await response.json(); // Array of lot objects

                lots.forEach((lot) => {
                    const sourceId = `lot-${lot.name.replace(/\s+/g, "-")}`;

                    map.addSource(sourceId, {
                        type: "geojson",
                        data: lot.geom,
                    });

                    map.addLayer({
                        id: `${sourceId}-fill`,
                        type: "fill",
                        source: sourceId,
                        paint: {
                            "fill-color": "#808080",
                            "fill-opacity": 0.5,
                            "fill-outline-color": "#000",
                        },
                    });

                    map.addLayer({
                        id: `${sourceId}-label`,
                        type: "symbol",
                        source: sourceId,
                        layout: {
                            "text-field": lot.name,
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

        return () => map.remove();
    }, []);

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                <div className="left-panel">
                    <h2>Parking Details</h2>
                    {/* Add additional parking details or components here */}
                </div>
                <div className="right-panel">
                    <div id="map" className="map-container" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
