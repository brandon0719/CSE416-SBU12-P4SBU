// server/lib/astar.js

class PriorityQueue {
    constructor() {
        this.elements = [];
    }
    isEmpty() {
        return this.elements.length === 0;
    }
    enqueue(item, priority) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.elements.shift().item;
    }
}

function aStar(graph, start, goal, options = {}) {
    const heuristic = options.heuristic || (() => 0);
    const openSet = new PriorityQueue();
    openSet.enqueue(start, 0);

    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    for (let node in graph) {
        gScore[node] = Infinity;
        fScore[node] = Infinity;
    }
    gScore[start] = 0;
    fScore[start] = heuristic(graph[start].coords, graph[goal].coords);

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        if (current === goal) {
            return reconstructPath(cameFrom, current);
        }
        for (const edge of graph[current].neighbors) {
            const neighbor = edge.node;
            const tentativeGScore = gScore[current] + edge.cost;
            if (tentativeGScore < gScore[neighbor]) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentativeGScore;
                fScore[neighbor] =
                    tentativeGScore + heuristic(graph[neighbor].coords, graph[goal].coords);
                if (!openSet.elements.some(e => e.item === neighbor)) {
                    openSet.enqueue(neighbor, fScore[neighbor]);
                }
            }
        }
    }
    return [];
}

function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (current in cameFrom) {
        current = cameFrom[current];
        totalPath.unshift(current);
    }
    return totalPath;
}

// server/lib/astar.js

/**
 * Computes haversine distance in meters between two [lng, lat] pairs.
 */
function haversineDistance([lng1, lat1], [lng2, lat2]) {
    const R = 6371000; // Earth radius in meters
    const toRad = (val) => (val * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in meters
}

/**
 * Summation of distances across the route's line
 */
function computeTotalDistance(coords) {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        total += haversineDistance(coords[i], coords[i + 1]);
    }
    return total; // meters
}

/**
 * Example:  If driving speed ~ 30 km/h => ~8.33 m/s
 *           so duration (sec) = distance (m) / speed (m/s)
 */
function computeDuration(distanceMeters) {
    const speedMetersPerSec = 8.33; // ~ 30 km/h
    return distanceMeters / speedMetersPerSec; // in seconds
}

/**
 * Creates minimal "step" instructions for the route.
 * We'll just create one step from start to end, to show how it can be done.
 */
function createSteps(coords) {
    if (coords.length < 2) return [];

    // The Directions control typically expects an array of steps.
    // We'll define a single step that goes from the first coordinate to the last.
    const distance = haversineDistance(coords[0], coords[coords.length - 1]);
    return [
        {
            distance,                  // in meters
            duration: computeDuration(distance), // in seconds
            geometry: {
                type: "LineString",
                coordinates: coords
            },
            name: "",                  // Usually the street name
            maneuver: {
                bearing_before: 0,
                bearing_after: 0,
                location: coords[0],    // Start location
                type: "depart",
                instruction: "Head to destination"
            }
        }
    ];
}

/**
 * Convert the node path into a full OSRM-v5-like JSON response.
 */
function toOSRMResponse(graph, pathNodes, originCoord, destCoord) {
    let coordinates;
    if (pathNodes.length < 2) {
        coordinates = [originCoord, destCoord];
    } else {
        coordinates = pathNodes.map((nodeId) => {
            const { x, y } = graph[nodeId].coords;
            return [x, y];
        });
    }

    // Compute total distance across our final coords
    const distanceMeters = computeTotalDistance(coordinates);
    const durationSeconds = computeDuration(distanceMeters);

    // Create a single leg with optional steps
    const steps = createSteps(coordinates);

    return {
        routes: [
            {
                geometry: {
                    type: "LineString",
                    coordinates
                },
                distance: distanceMeters,         // in meters
                duration: durationSeconds,        // in seconds
                legs: [
                    {
                        distance: distanceMeters,
                        duration: durationSeconds,
                        steps
                    }
                ]
            }
        ],
        waypoints: [
            {
                name: "Origin",
                location: originCoord
            },
            {
                name: "Destination",
                location: destCoord
            }
        ],
        code: "Ok"
    };
}

export { aStar, toOSRMResponse };
