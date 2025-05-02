import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import DatePicker from "react-datepicker";
import ReservationModal from "../components/ReservationModal";
import "react-datepicker/dist/react-datepicker.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "../stylesheets/HomePage.css";
import ApiService from "../services/ApiService";
import CheckoutForm from "../components/CheckoutForm";

function computeCentroid(geom) {
    let coords = [];
    if (geom.type === "Polygon") {
        coords = geom.coordinates[0];
    } else if (geom.type === "MultiPolygon") {
        coords = geom.coordinates[0][0];
    } else {
        return [-73.12246, 40.91671];
    }
    let sumLng = 0,
        sumLat = 0;
    coords.forEach(([lng, lat]) => {
        sumLng += lng;
        sumLat += lat;
    });
    const count = coords.length || 1;
    return [sumLng / count, sumLat / count];
}

async function getWalkingDistance(origin, destination) {
    const token = import.meta.env.VITE_MAPBOX_KEY;
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${token}&overview=false`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.routes && json.routes.length > 0) {
            return json.routes[0].distance; // distance in meters
        }
        return Infinity;
    } catch (err) {
        console.error("Error fetching walking distance:", err);
        return Infinity;
    }
}

const HomePage = () => {
    // Existing states for parking lots and reservation details
    const [lots, setLots] = useState([]);
    const [sortBy, setSortBy] = useState("distance");
    const [userLocation, setUserLocation] = useState({
        lng: -73.12246,
        lat: 40.91671,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [reservationStart, setReservationStart] = useState("");
    const [reservationEnd, setReservationEnd] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New states for campus buildings & building selection/search
    const [buildings, setBuildings] = useState([]);
    const [buildingSearchTerm, setBuildingSearchTerm] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [selectedLot, setSelectedLot] = useState("");
    const [availableSpots, setAvailableSpots] = useState(null);
    const [permitType, setPermitType] = useState(null);

    // Ref to store the Mapbox Directions control
    const directionsRef = useRef(null);
    // Ref for the left panel container to reset its scroll position
    const leftPanelRef = useRef(null);

    const buildingListRef = useRef(null);
    const lotsScrollRef = useRef(null);

    const [sortCriteria, setSortCriteria] = useState("distance");

    // Stripe
    const [clientSecret, setClientSecret] = useState(null);
    const [pendingReservation, setPendingReservation] = useState(null);

    // Filter the parking lots based on the search term
    const filteredLots = lots.filter((lot) =>
        lot.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter the buildings based on the building search term
    const filteredBuildings = buildings.filter((building) =>
        building.name.toLowerCase().includes(buildingSearchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchAndSortLots = async () => {
            try {
                const response = await fetch("/api/lots/getlotdetails");
                const data = await response.json();

                if (
                    sortCriteria === "distance" ||
                    sortCriteria === "distance-non-metered"
                ) {
                    // Determine the origin: use selected building's location if available,
                    // otherwise fallback to user location.
                    const origin =
                        selectedBuilding &&
                            selectedBuilding.location &&
                            selectedBuilding.location.coordinates
                            ? selectedBuilding.location.coordinates
                            : [userLocation.lng, userLocation.lat];

                    // Compute walking distance for each parking lot; if the lot does not have
                    // a valid geometry, assign Infinity so it sorts last.
                    const lotsWithDistance = await Promise.all(
                        data.map(async (lot) => {
                            if (
                                lot.geom &&
                                lot.geom.coordinates &&
                                lot.geom.coordinates.length > 0
                            ) {
                                const centroid = computeCentroid(lot.geom);
                                const distance = await getWalkingDistance(
                                    origin,
                                    centroid
                                );
                                return { ...lot, walkingDistance: distance };
                            } else {
                                // If lot location is not set, assign a high distance value.
                                return { ...lot, walkingDistance: Infinity };
                            }
                        })
                    );

                    // Sort the lots so that those with a finite (computed) walking distance come first.
                    lotsWithDistance.sort(
                        (a, b) => a.walkingDistance - b.walkingDistance
                    );
                    setLots(lotsWithDistance);
                } else if (sortCriteria === "price") {
                    // Sorting by price – simply sort based on the rate field.
                    data.sort((a, b) => a.rate - b.rate);
                    setLots(data);
                } else {
                    // If no specific sorting criteria applied, set the fetched data as is.
                    setLots(data);
                }
            } catch (error) {
                console.error("Error fetching lots:", error);
            }
        };

        fetchAndSortLots();
    }, [sortCriteria, userLocation, selectedBuilding]);

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

    useEffect(() => {
        const user = ApiService.getSessionUser();
        setPermitType(user?.user_type || "visitor");
    }, []);

    // Initialize the Mapbox map, Directions control and parking lots display
    useEffect(() => {
        if (!permitType) return;

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

            // Fetch parking lot data and add them to the map
            try {
                const response = await fetch("/api/lots/getlotdetails");
                const lotsData = await response.json();

                lotsData
                    .filter((lot) => isLotVisibleForPermit(lot, permitType))
                    .forEach((lot) => {
                        const sourceId = `lot-${lot.name.replace(/\s+/g, "-")}`;
                        map.addSource(sourceId, {
                            type: "geojson",
                            data: lot.geom,
                        });

                        const fillColor =
                            lot.metered_spots > 0
                                ? "#002244" // metered
                                : "#6B000D"; // all other lots

                        map.addLayer({
                            id: `${sourceId}-fill`,
                            type: "fill",
                            source: sourceId,
                            paint: {
                                "fill-color": fillColor,
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
                                "text-size": 11,
                                "text-offset": [0, 0],
                                "text-anchor": "center",
                            },
                            paint: {
                                "text-color": "#000000",
                                "text-halo-color": "#ffffff",
                                "text-halo-width": 1,
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
                                    .setHTML(
                                        `
                  <div style="text-align: center;">
                    <h3>${lot.name}</h3>
                    <p>${lot.details || "No additional information available."
                                        }</p>
                  </div>
                `
                                    )
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
    }, [permitType]);

    useEffect(() => {
        if (!selectedBuilding && buildingListRef.current) {
            buildingListRef.current.scrollTop = 0;
        } else if (selectedBuilding && lotsScrollRef.current) {
            lotsScrollRef.current.scrollTop = 0;
        }
    }, [selectedBuilding, buildingSearchTerm, searchTerm]);

    useEffect(() => {
        if (!reservationStart || !reservationEnd || !selectedLot) return;
        ApiService.getNumAvailableSpotsAtTime(
            selectedLot,
            reservationStart,
            reservationEnd
        )
            .then((res) => {
                setAvailableSpots(res);
            })
            .catch((error) => {
                console.error(
                    `Failed to fetch spots for ${selectedLot}:`,
                    error
                );
                setAvailableSpots(null);
            });
    }, [reservationStart, reservationEnd, selectedLot]);

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
        if (lot.geom && selectedBuilding && directionsRef.current) {
            const centroid = computeCentroid(lot.geom);
            directionsRef.current.setOrigin(centroid);
            // Immediately set the destination back to the selected building's coordinates.
            const [lng, lat] = selectedBuilding.location.coordinates;
            directionsRef.current.setDestination([lng, lat]);
        }
    };

    const handleReserveClicked = (lotName) => {
        setSelectedLot(lotName);
        if (reservationEnd < reservationStart) {
            alert("Reservation end cannot be before start");
        } else if (!reservationStart || !reservationEnd) {
            alert("Please enter reservation time.");
        } else {
            setIsModalOpen(true);
        }
    };

    // 2) Helper to call your backend and get a Stripe PaymentIntent:
    const fetchPaymentIntent = async (amountCents) => {
        const clientSecret = await ApiService.createPaymentIntent(amountCents);
        setClientSecret(clientSecret);
    };

    const handleReservation = async (formData) => {
        // 1) find the lot object to get its price
        const lotObj = lots.find((lot) => lot.name === selectedLot);
        if (!lotObj) {
            return alert("Error: selected lot not found.");
        }
        // 2) compute cost in cents
        const amountCents = formData.numSpots * lotObj.rate * 100; 

        // 3) stash the form data for after payment succeeds
        setPendingReservation(formData);

        // 4) kick off Stripe
        await fetchPaymentIntent(amountCents);
        console.log(formData);
    };

    function isLotVisibleForPermit(lot, permit) {
        const {
            metered_spots,
            faculty_staff_spots,
            commuter_spots,
            commuter_premium_spots,
            resident_spots,
        } = lot;

        switch (permit) {
            case "Visitor":
                return metered_spots > 0;
            case "Faculty":
                return metered_spots > 0 || faculty_staff_spots > 0;
            case "Commuter":
                return (
                    metered_spots > 0 ||
                    commuter_spots > 0 ||
                    commuter_premium_spots > 0
                );
            case "Resident":
                return metered_spots > 0 || resident_spots > 0;
            default:
                return false;
        }
    }

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                <div className="left-panel" ref={leftPanelRef}>
                    {!selectedBuilding ? (
                        <>
                            <div className="buildings-header">
                                <h3>Select a Building</h3>
                                <input
                                    type="text"
                                    placeholder="Search Buildings..."
                                    value={buildingSearchTerm}
                                    onChange={(e) =>
                                        setBuildingSearchTerm(e.target.value)
                                    }
                                    className="building-search"
                                />
                            </div>
                            <div
                                className="buildings-list"
                                ref={buildingListRef}>
                                {filteredBuildings.map((building) => (
                                    <div
                                        key={building.id}
                                        className="building-item"
                                        onClick={() =>
                                            handleBuildingSelect(building)
                                        }>
                                        <p>{building.name}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="lot-header">
                                <div className="selected-building-row">
                                    <h3 className="selected-building-name">
                                        Selected Building:{" "}
                                        {selectedBuilding.name}
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setSelectedBuilding(null)
                                        }
                                        className="change-building-btn">
                                        Change Selection
                                    </button>
                                </div>

                                {/* Row 2: Reservation Start/End */}
                                <div className="reservation-row">
                                    <div className="reservation-field">
                                        <label htmlFor="start-date">
                                            Reservation start:
                                        </label>
                                        <DatePicker
                                            withPortal
                                            id="start-date"
                                            placeholderText="Select date and time..."
                                            selected={reservationStart}
                                            onChange={(date) =>
                                                setReservationStart(date)
                                            }
                                            showTimeSelect
                                            timeFormat="h:mm aa"
                                            timeIntervals={30}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            minDate={new Date()}
                                            className="date-picker"
                                        />
                                    </div>
                                    <div className="reservation-field">
                                        <label htmlFor="end-date">
                                            Reservation end:
                                        </label>
                                        <DatePicker
                                            withPortal
                                            id="end-date"
                                            placeholderText="Select date and time..."
                                            selected={reservationEnd}
                                            onChange={(date) =>
                                                setReservationEnd(date)
                                            }
                                            showTimeSelect
                                            timeFormat="h:mm aa"
                                            timeIntervals={30}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            minDate={new Date()}
                                            className="date-picker"
                                        />
                                    </div>
                                </div>
                                {/* Flex container for the lots header and sorting controls */}
                                <div className="lots-header-sort">
                                    <h3 className="lots-title">Parking Lots</h3>
                                    <div className="sorting-options">
                                        <label htmlFor="sort-criteria">
                                            Sort by:
                                        </label>
                                        <select
                                            id="sort-criteria"
                                            value={sortCriteria}
                                            onChange={(e) =>
                                                setSortCriteria(e.target.value)
                                            }>
                                            <option value="distance">
                                                Distance
                                            </option>
                                            <option value="price">Price</option>
                                            {permitType !== "visitor" && (
                                                <option value="distance-non-metered">
                                                    Distance – Non-metered
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="search-bar">
                                    <input
                                        type="text"
                                        placeholder="Search parking lots..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="lots-scroll" ref={lotsScrollRef}>
                                {filteredLots
                                    .filter((lot) =>
                                        isLotVisibleForPermit(lot, permitType)
                                    )
                                    // if “non-metered” chosen, exclude any lot with metered_spots > 0
                                    .filter((lot) =>
                                        sortCriteria === "distance-non-metered"
                                            ? lot.metered_spots === 0
                                            : true
                                    )
                                    .map((lot) => (
                                        <div
                                            key={lot.name}
                                            className="lot-item">
                                            <p>
                                                <strong>{lot.name}</strong>
                                            </p>
                                            <p>{lot.details}</p>
                                            <p>  Rate:{" "}
                                                {lot.rate != null
                                                    ? `$${parseFloat(lot.rate).toFixed(2)}/hr`
                                                    : "N/A"}</p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                }}>
                                                <button
                                                    onClick={() =>
                                                        handleReserveClicked(
                                                            lot.name
                                                        )
                                                    }>
                                                    Reserve
                                                </button>
                                                {lot.geom && (
                                                    <button
                                                        onClick={() =>
                                                            handleLotView(lot)
                                                        }>
                                                        View
                                                    </button>
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
            <ReservationModal
                reservationStart={reservationStart}
                reservationEnd={reservationEnd}
                lotName={selectedLot}
                price={lots.find((l) => l.name === selectedLot)?.price || 0} // ← here
                isOpen={isModalOpen}
                numAvailableSpots={availableSpots}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleReservation}
            />
            {clientSecret && pendingReservation && (
                <>
                    <div className="modal-overlay" />
                    <div className="checkout-container">
                        <h4>Complete Payment</h4>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            onSuccessfulPayment={async () => {
                                const d = pendingReservation;
                                await ApiService.createReservation(
                                    ApiService.getSessionUser().user_id,
                                    selectedLot,
                                    reservationStart,
                                    reservationEnd,
                                    d.numSpots,
                                    d.explanation
                                );
                                alert(
                                    "✅ Reservation confirmed and payment complete!"
                                );
                                setClientSecret(null);
                                setPendingReservation(null);
                                setIsModalOpen(false);
                                setAvailableSpots(availableSpots - d.numSpots);
                            }}
                            onCancel={() => {
                                setClientSecret(null);
                                setPendingReservation(null);
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;
