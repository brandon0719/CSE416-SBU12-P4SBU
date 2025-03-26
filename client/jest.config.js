export default {
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",
    },
    globals: {
        "babel-jest": {
            useESM: true,
        },
    },
};
