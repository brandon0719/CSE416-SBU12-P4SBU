import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "../stylesheets/HomePage.css";

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
    const [lots, setLots] = useState([]);
    const [sortBy, setSortBy] = useState("distance");
    const [userLocation, setUserLocation] = useState({ lng: -73.12246, lat: 40.91671 });
    const [searchTerm, setSearchTerm] = useState(""); // New state for search
    const [reservationStart, setReservationStart] = useState("");
    const [reservationEnd, setReservationEnd] = useState("");

    // Filter the lots based on the search term
    const filteredLots = lots.filter(lot =>
        lot.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchLots = async () => {
            try {
                const response = await fetch(
                    `/api/lots?sortBy=${sortBy}&userLng=${userLocation.lng}&userLat=${userLocation.lat}`
                );
                const data = await response.json();
                setLots(data);
            } catch (error) {
                console.error("Error fetching lots:", error);
            }
        };

        fetchLots();
    }, [sortBy, userLocation]);

    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

        // Set initial center and zoom level
        const initialCenter = [-73.12246, 40.91671];
        const initialZoom = 14;

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/light-v10",
            center: initialCenter,
            zoom: initialZoom,
        });

        map.on("load", async () => {
            // Set scroll zoom rate
            map.scrollZoom.setWheelZoomRate(100);

            // Add the Directions control first so it appears to the left
            const directions = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: "metric",
                profile: "mapbox/driving",
            });
            map.addControl(directions, "top-left");

            // Add the Geolocate control next so it appears to the right of directions
            const geolocateControl = new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
                showUserHeading: true,
            });
            map.addControl(geolocateControl, "top-left");

            geolocateControl.on("error", (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    map.removeControl(geolocateControl);
                }
            });

            geolocateControl.on("geolocate", (position) => {
                const userLng = position.coords.longitude;
                const userLat = position.coords.latitude;
                directions.setOrigin([userLng, userLat]);
            });

            try {
                const response = await fetch("/api/lots");
                const lotsData = await response.json();

                lotsData.forEach((lot) => {
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
                            "text-size": 10,
                            "text-offset": [0, 0],
                            "text-anchor": "center",
                        },
                        paint: {
                            "text-color": "#000",
                        },
                    });

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

        return () => map.remove();
    }, []);

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                <div className="left-panel">

                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search parking lots..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="time-selection">
                        <label htmlFor="start-date">Reservation start:</label>
                        <div id="start-date">
                            <DatePicker
                                placeholderText="Select date and time..."
                                selected={reservationStart}
                                onChange={(date) => setReservationStart(date)}
                                showTimeSelect
                                timeFormat="h:mm aa"
                                timeIntervals={30}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                minDate={new Date()}
                                className="date-picker"
                            />

                        </div>

                        <label htmlFor="end-date">Reservation end:</label>
                        <div id="end-date">
                            <DatePicker
                                placeholderText="Select date and time..."
                                selected={reservationEnd}
                                onChange={(date) => setReservationEnd(date)}
                                showTimeSelect
                                timeFormat="h:mm aa"
                                timeIntervals={30}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                minDate={new Date()}
                                className="date-picker" />
                        </div>

                    </div>


                    <div className="sorting-options">
                        <label htmlFor="sort-by">Starting:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="current_location">Current Location</option>
                            <option value="destination">Destination</option>
                        </select>

                        <label htmlFor="sort-by">Sort by:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="distance">Distance</option>
                            <option value="price">Price</option>
                        </select>
                    </div>



                    <div className="lots-list">
                        <h3>Parking Lots</h3>
                        {filteredLots.map((lot) => (
                            <div key={lot.name} className="lot-item">
                                <p><strong>{lot.name}</strong></p>
                                <p>{lot.details}</p>
                                <p>Price: ${lot.price}</p>
                                <button onClick={() => alert(`Reserving lot: ${lot.name}`)}>
                                    Reserve
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="right-panel">
                    <div id="map" className="map-container" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
