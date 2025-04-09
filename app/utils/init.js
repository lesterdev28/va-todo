// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're running in a Chrome extension context
  window.isExtension = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) ? true : false;
  console.log("Running as extension:", window.isExtension);
  
  // Initialize the side panel if we're in an extension context
  if (window.isExtension) {
    try {
      // Global variables to track connection status
      let port = null;
      let reconnectAttempts = 0;
      let keepAliveInterval = null;
      let isConnected = false;
      
      // Function to establish connection
      function connectToBackgroundScript() {
        if (chrome.runtime && chrome.runtime.connect) {
          try {
            // Clear any existing interval to avoid duplicate timers
            if (keepAliveInterval) {
              clearInterval(keepAliveInterval);
              keepAliveInterval = null;
            }
            
            // Create a connection to the background page
            console.log("Attempting to connect to background script...");
            port = chrome.runtime.connect({name: `sidepanel-connection-${Date.now()}`});
            isConnected = true;
            reconnectAttempts = 0;
            console.log("Connection established to background script");
            
            // Handle messages from the background script
            port.onMessage.addListener(function(message) {
              console.log("Message from background script:", message);
            });
            
            // Handle disconnections
            port.onDisconnect.addListener(function() {
              isConnected = false;
              console.log("Disconnected from background script");
              
              // Check for last error
              if (chrome.runtime.lastError) {
                console.log("Connection closed with error:", chrome.runtime.lastError.message);
              }
              
              // Clear existing interval
              if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
              }
              
              // Try to reconnect with exponential backoff
              if (reconnectAttempts < 5) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                reconnectAttempts++;
                console.log(`Scheduling reconnection attempt ${reconnectAttempts} in ${delay}ms`);
                
                setTimeout(function() {
                  if (!isConnected) {
                    connectToBackgroundScript();
                  }
                }, delay);
              } else {
                console.log("Maximum reconnection attempts reached");
              }
            });
            
            // Start the keep-alive interval only when connection is successful
            keepAliveInterval = setInterval(function() {
              if (port && isConnected) {
                try {
                  port.postMessage({type: "keepAlive", timestamp: Date.now()});
                } catch (error) {
                  console.error("Error sending keepAlive message:", error);
                  
                  // Reset connection on error
                  isConnected = false;
                  clearInterval(keepAliveInterval);
                  keepAliveInterval = null;
                  
                  // Reconnect if still in page
                  if (document.visibilityState !== "hidden") {
                    setTimeout(connectToBackgroundScript, 1000);
                  }
                }
              }
            }, 15000); // Send a message every 15 seconds
          } catch (error) {
            console.error("Error establishing connection:", error);
          }
        }
      }
      
      // Initial connection
      connectToBackgroundScript();
      
      // Reconnect when the page becomes visible again
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === "visible" && !isConnected) {
          console.log("Page visible again, attempting to reconnect");
          connectToBackgroundScript();
        }
      });
      
      // Clean up on window unload
      window.addEventListener('beforeunload', function() {
        console.log("Page unloading, cleaning up connections");
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        
        if (port && isConnected) {
          try {
            port.disconnect();
          } catch (error) {
            console.log("Error during port disconnect:", error);
          }
        }
      });
      
      // Check if sidePanel API is available but don't call methods directly
      if (chrome.sidePanel) {
        console.log("Chrome sidePanel API is available");
      } else {
        console.log("Chrome sidePanel API is not available");
      }
    } catch (error) {
      console.error("Error initializing extension features:", error);
    }
  }
  
  // Setup error logging
  window.addEventListener('error', function(e) {
    console.log('Error occurred:', e.error);
    if (e.error && e.error.message) {
      console.error('Error message:', e.error.message);
    }
  });
}); 