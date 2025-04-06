// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're running in a Chrome extension context
  window.isExtension = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) ? true : false;
  console.log("Running as extension:", window.isExtension);
  
  // Setup error logging
  window.addEventListener('error', function(e) {
    console.log('Error occurred:', e.error);
    if (e.error && e.error.message) {
      console.error('Error message:', e.error.message);
    }
  });
}); 