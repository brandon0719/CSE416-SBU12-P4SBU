import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "../stylesheets/HomePage.css";
import ApiService from "../services/ApiService";

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
    // Existing states for parking lots and reservation details
    const [lots, setLots] = useState([]);
    const [sortBy, setSortBy] = useState("distance");
    const [userLocation, setUserLocation] = useState({ lng: -73.12246, lat: 40.91671 });
    const [searchTerm, setSearchTerm] = useState("");
    const [reservationStart, setReservationStart] = useState("");
    const [reservationEnd, setReservationEnd] = useState("");

    // New states for campus buildings & building selection/search
    const [buildings, setBuildings] = useState([]);
    const [buildingSearchTerm, setBuildingSearchTerm] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    // Ref to store the Mapbox Directions control
    const directionsRef = useRef(null);
    // Ref for the left panel container to reset its scroll position
    const leftPanelRef = useRef(null);

    // Filter the parking lots based on the search term
    const filteredLots = lots.filter((lot) =>
        lot.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter the buildings based on the building search term
    const filteredBuildings = buildings.filter((building) =>
        building.name.toLowerCase().includes(buildingSearchTerm.toLowerCase())
    );

    // Effect to reset the left-panel scroll position when switching views
    useEffect(() => {
        if (leftPanelRef.current) {
            leftPanelRef.current.scrollTop = 0;
        }
    }, [selectedBuilding, buildingSearchTerm]);

    // Fetch parking lots when sortBy or userLocation changes
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

    // Fetch campus buildings for initial building selection
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const response = await fetch("/api/buildings");
                const data = await response.json();
                setBuildings(data);
            } catch (error) {
                console.error("Error fetching buildings:", error);
            }
        };
        fetchBuildings();
    }, []);

    // Initialize the Mapbox map, Directions control and parking lots display
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
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

            // Initialize the Directions control (walking only)
            const directions = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: "metric",
                profile: "mapbox/walking",
                controls: { profileSwitcher: false },
            });
            directionsRef.current = directions;
            map.addControl(directions, "top-left");

            // Add Geolocate control
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

            // Fetch parking lot data and add them to the map
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

                    // Add interactivity for each lot (popups on hover)
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

    // Handler when a building is selected
    const handleBuildingSelect = (building) => {
        setSelectedBuilding(building);
        // building.location is a GeoJSON Point: { type: "Point", coordinates: [lng, lat] }
        const [lng, lat] = building.location.coordinates;
        setUserLocation({ lng, lat });
        if (directionsRef.current) {
            directionsRef.current.setDestination([lng, lat]);
        }
    };

    // Handler for the "View" button on a parking lot
    const handleLotView = (lot) => {
        if (lot.geom) {
            const centroid = computeCentroid(lot.geom);
            if (directionsRef.current) {
                directionsRef.current.setOrigin(centroid);
            }
        }
    };

    const handleReservation = (lotName) => {
        if (!reservationStart || !reservationEnd) {
            alert("Please enter reservation time.");
        } else {
            ApiService.createReservation(ApiService.getSessionUser().user_id, lotName, reservationStart, reservationEnd);
            alert("Reservation created.");
        }
        
    }

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                {/* Attach ref to left-panel */}
                <div className="left-panel" ref={leftPanelRef}>
                    {!selectedBuilding ? (
                        <div className="buildings-list">
                            <h3>Select a Building</h3>
                            <input
                                type="text"
                                placeholder="Search Buildings..."
                                value={buildingSearchTerm}
                                onChange={(e) => setBuildingSearchTerm(e.target.value)}
                                style={{
                                    backgroundColor: "white",
                                    width: "100%",
                                    padding: "8px",
                                    marginBottom: "12px",
                                }}
                            />
                            {filteredBuildings.map((building) => (
                                <div
                                    key={building.id}
                                    className="building-item"
                                    onClick={() => handleBuildingSelect(building)}
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid #ccc",
                                        padding: "8px 0",
                                    }}
                                >
                                    <p>{building.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="selected-building-info">
                                <h3>Selected Building: {selectedBuilding.name}</h3>
                                <button onClick={() => setSelectedBuilding(null)}>
                                    Change Selection
                                </button>
                            </div>
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search parking lots..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="time-selection">
                                <div className="start-time">
                                    <label htmlFor="start-date" id="timepick-label">Reservation Start:</label>
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
                                </div>
                                <div className="end-time">
                                    <label htmlFor="end-date" id="timepick-label">Reservation End:</label>
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
                                            className="date-picker"
                                        />
                                    </div>
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
                                        <p>
                                            <strong>{lot.name}</strong>
                                        </p>
                                        <p>{lot.details}</p>
                                        <p>Price: ${lot.price}</p>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button onClick={() => handleReservation(lot.name)}>
                                                Reserve
                                            </button>
                                            {lot.geom && (
                                                <button onClick={() => handleLotView(lot)}>View</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="right-panel">
                    <div id="map" className="map-container" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
