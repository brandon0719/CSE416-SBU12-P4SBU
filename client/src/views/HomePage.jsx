import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/HomePage.css";
import "mapbox-gl/dist/mapbox-gl.css"; 


const HomePage = () => {
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

        const campusBounds = [
            [-73.147969, 40.891420], // SW corner
            [-73.109477, 40.927109]  // NE corner
        ];

        const map = new mapboxgl.Map({
            container: 'map', // Matches the id of our map div below
            style: 'mapbox://styles/mapbox/light-v10',
            maxBounds: campusBounds
        });

        // Function to add a GeoJSON layer to the map
        function addGeoJSONLayer(url, layerId, fillColor) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    data.features.forEach(feature => {
                        if (!feature.properties.label) {
                            feature.properties.label = layerId;
                        }
                    });
                    map.addSource(layerId, {
                        type: 'geojson',
                        data: data
                    });
                    map.addLayer({
                        id: `${layerId}-layer`,
                        type: 'fill',
                        source: layerId,
                        paint: {
                            'fill-color': fillColor,
                            'fill-opacity': 0.5,
                            'fill-outline-color': '#000'
                        }
                    });
                    map.addLayer({
                        id: `${layerId}-labels`,
                        type: 'symbol',
                        source: layerId,
                        layout: {
                            'text-field': ['get', 'label'],
                            'text-size': 14,
                            'text-offset': [0, 0],
                            'text-anchor': 'center'
                        },
                        paint: {
                            'text-color': '#000'
                        }
                    });
                })
                .catch(error => console.error('Error loading GeoJSON from ' + url, error));
        }

        const geojsonFiles = [
            { url: 'geojson/Lot 40.geojson', id: 'Lot 40', fillColor: '#088' },
            { url: 'geojson/Lot 53.geojson', id: 'Lot 53', fillColor: '#800' },
            { url: 'geojson/Lot 54.geojson', id: 'Lot 54', fillColor: '#800' }
        ];

        map.on('load', () => {
            map.fitBounds(campusBounds, { padding: 0 });
            geojsonFiles.forEach(file => {
                addGeoJSONLayer(file.url, file.id, file.fillColor);
            });
        });

        // Clean up map instance on unmount
        return () => map.remove();
    }, []);

    return (
        <div className="homepage-container">
            <Header />
            <NavBar />
            <div className="map-content-container">
                <div className="left-panel">
                    <h2>Parking Details</h2>
                    {/* Future parking details content goes here */}
                </div>
                <div className="right-panel">
                    <div
                        id="map"
                        style={{
                            width: "600px",
                            height: "800px",
                            border: "2px solid #ccc",
                            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
