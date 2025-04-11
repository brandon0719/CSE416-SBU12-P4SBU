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

    // Dummy values
    const distance = 150;
    const duration = 30;

    console.log("Origin:", originCoord);
    console.log("Destination:", destCoord);
    

    return {
        routes: [
            {
                geometry: {
                    type: "LineString",
                    coordinates,
                },
                distance,
                duration,
                legs: [
                    {
                        steps: [],
                    },
                ],
            },
        ],
        // Add proper waypoints
        waypoints: [
            {
                name: "Origin",
                location: originCoord,
            },
            {
                name: "Destination",
                location: destCoord,
            },
        ],
        code: "Ok",
    };
}


export { aStar, toOSRMResponse };
