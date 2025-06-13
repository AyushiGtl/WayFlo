const isProd = process.env.NODE_ENV === 'production';

// Get the server IP from environment variable or use the local network IP
const getServerUrl = () => {
    if (isProd) {
        return process.env.REACT_APP_SERVER_URL || 'https://jovial-madeleine-8f088f.netlify.app';
    }
    
    // For local development
    return `http://${window.location.hostname}:8000`;
};

const getWebSocketUrl = () => {
    if (isProd) {
        return process.env.REACT_APP_WS_URL || 'wss://jovial-madeleine-8f088f.netlify.app';
    }
    
    // For local development
    return `ws://${window.location.hostname}:8000`;
};

const getFrontendUrl = () => {
    if (isProd) {
        return process.env.REACT_APP_FRONTEND_URL || 'https://jovial-madeleine-8f088f.netlify.app';
    }
    
    // For local development
    return `http://${window.location.hostname}:3000`;
};

export const config = {
    serverUrl: getServerUrl(),
    wsUrl: getWebSocketUrl(),
    frontendUrl: getFrontendUrl(),
    isProd,
}; 