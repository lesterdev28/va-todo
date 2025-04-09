// Global error handler to catch and log errors before other scripts load
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error ? event.error.message : event.message);
    return false; // Let other error handlers run
});

// Handle uncaught promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    return false; // Let other error handlers run
}); 