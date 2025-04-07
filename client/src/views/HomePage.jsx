import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js';
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/HomePage.css";
import "mapbox-gl/dist/mapbox-gl.css";
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

// Computes the average (mean) of coordinates in the outer ring of the geometry
function computeCentroid(geom) {
    let coords = [];
    if (geom.type === "Polygon") {
        coords = geom.coordinates[0];
    } else if (geom.type === "MultiPolygon") {
        coords = geom.coordinates[0][0];
    } else {
        return [-73.12246, 40.91671];
    }

    let sumLng = 0, sumLat = 0;
    coords.forEach(([lng, lat]) => {
        sumLng += lng;
        sumLat += lat;
    });
    const count = coords.length || 1;
    return [sumLng / count, sumLat / count];
}

const HomePage = () => {
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

        // Set initial center and zoom level
        const initialCenter = [-73.12246, 40.91671];
        const initialZoom = 15;

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/light-v10",
            center: initialCenter,
            zoom: initialZoom,
        });

        // Set up the GeolocateControl
        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
        });
        map.addControl(geolocateControl, 'top-right');

        // If user denies geolocation, remove the control so no dot is shown
        geolocateControl.on('error', (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                map.removeControl(geolocateControl);
            }
        });

        // Optional: automatically ask for location on load
        geolocateControl.on('render', () => {
            geolocateControl.trigger();
        });

        // Create Directions control
        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/driving',
        });
        map.addControl(directions, 'top-left');

        // *** When user grants location, set their location as the route origin ***
        geolocateControl.on("geolocate", (position) => {
            const userLng = position.coords.longitude;
            const userLat = position.coords.latitude;
            directions.setOrigin({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [userLng, userLat],
                },
                properties: {},
                place_name: "Your location",
            });
        });

        map.on("load", async () => {
            map.scrollZoom.setWheelZoomRate(100);

            try {
                const response = await fetch("/api/lots");
                const lots = await response.json(); // Array of lot objects

                lots.forEach((lot) => {
                    const sourceId = `lot-${lot.name.replace(/\s+/g, "-")}`;

                    // Add the GeoJSON source for this lot
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: lot.geom,
                    });

                    // Add a fill layer for the lot area
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

                    // Add a label layer for the lot name
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

                    // Show a popup on hover
                    (() => {
                        let lotPopup;
                        map.on("mouseenter", `${sourceId}-fill`, () => {
                            const center = computeCentroid(lot.geom);
                            lotPopup = new mapboxgl.Popup({
                                closeButton: false,
                                offset: 25,
                            })
                                .setLngLat(center)
                                .setHTML(`
                                    <div style="text-align: center;">
                                        <h3>${lot.name}</h3>
                                        <p>${lot.details || "No additional information available."}</p>
                                    </div>
                                `)
                                .addTo(map);
                            map.getCanvas().style.cursor = "pointer";
                        });
                        map.on("mouseleave", `${sourceId}-fill`, () => {
                            if (lotPopup) {
                                lotPopup.remove();
                                lotPopup = null;
                            }
                            map.getCanvas().style.cursor = "";
                        });
                    })();
                });
            } catch (error) {
                console.error("Error fetching lots data:", error);
            }
        });

        // Cleanup on unmount
        return () => map.remove();
    }, []);

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                <div className="left-panel">
                    <h2>Parking Details</h2>
                    {/* Additional parking details or interactive elements can be added here */}
                </div>
                <div className="right-panel">
                    <div id="map" className="map-container" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
