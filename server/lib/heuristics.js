// server/lib/heuristics.js
function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export { manhattan };
