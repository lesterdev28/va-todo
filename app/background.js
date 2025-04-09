// Background service worker for VA To-Do Chrome extension

// Store active ports
const activePorts = new Map();

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details.reason);
  
  // Initialize the side panel
  if (chrome.sidePanel) {
    try {
      // Set the default options (enabled, but not opened automatically)
      chrome.sidePanel.setOptions({
        enabled: true,
        path: 'index.html'
      }).then(() => {
        console.log("Side panel options set successfully");
      }).catch(error => {
        console.error("Error setting side panel options:", error);
      });
    } catch (error) {
      console.error("Error setting side panel options:", error);
    }
  }
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked, toggling side panel for tab:", tab.id);
  
  // The sidePanel.open() method can only be called in response to a user gesture
  // This is a user gesture (clicking the extension icon), so it's allowed here
  if (chrome.sidePanel) {
    try {
      // Toggle the side panel for this tab
      chrome.sidePanel.open({tabId: tab.id}).then(() => {
        console.log("Side panel opened successfully");
      }).catch((error) => {
        console.error("Error opening side panel:", error);
      });
    } catch (error) {
      console.error("Error when trying to open side panel:", error);
    }
  } else {
    console.error("Chrome sidePanel API not available");
  }
});

// Track service worker state
let isServiceWorkerActive = true;

// Handle connections to prevent "message port closed" errors
chrome.runtime.onConnect.addListener((port) => {
  console.log("New connection established:", port.name);
  
  // Add to active ports with timestamp
  const portInfo = {
    port: port,
    timestamp: Date.now(),
    lastPing: Date.now()
  };
  activePorts.set(port.name, portInfo);
  
  // Setup disconnect listener
  port.onDisconnect.addListener(() => {
    console.log("Port disconnected:", port.name);
    activePorts.delete(port.name);
    
    // Check for runtime.lastError to prevent unchecked errors
    if (chrome.runtime.lastError) {
      console.log("Port closed with lastError:", chrome.runtime.lastError.message);
    }
  });
  
  // Setup message listener
  port.onMessage.addListener((message) => {
    // Update last ping timestamp
    const portInfo = activePorts.get(port.name);
    if (portInfo) {
      portInfo.lastPing = Date.now();
    }
    
    // Log important messages but not keepAlives to reduce noise
    if (message.type !== "keepAlive") {
      console.log("Received message from port:", message);
    } else {
      // Just acknowledge keepAlive messages
      try {
        port.postMessage({ type: "ack", timestamp: Date.now() });
      } catch (error) {
        console.error("Error responding to keepAlive:", error);
        // Remove the port from active ports if can't send message
        activePorts.delete(port.name);
      }
    }
  });
});

// Listen for runtime errors
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // Always send a response to prevent message port closed errors
  sendResponse({ status: "received" });
  return true; // Indicates async response
});

// Keep service worker alive and clean inactive ports
setInterval(() => {
  if (isServiceWorkerActive) {
    const now = Date.now();
    // Clean up stale ports (no activity for more than 60 seconds)
    for (const [name, portInfo] of activePorts.entries()) {
      if (now - portInfo.lastPing > 60000) {
        console.log(`Port ${name} inactive for over 60s, cleaning up`);
        try {
          // Try to close the port gracefully if possible
          portInfo.port.disconnect();
        } catch (error) {
          console.log(`Error disconnecting inactive port ${name}:`, error);
        }
        activePorts.delete(name);
      }
    }
    
    // Log active connection count (only if changed since last time)
    if (activePorts.size > 0) {
      console.log(`Service worker active with ${activePorts.size} connections`);
    }
  }
}, 30000);

// Handle shutdown to ensure all ports are closed properly
self.addEventListener('beforeunload', () => {
  isServiceWorkerActive = false;
  console.log("Service worker shutting down, closing all connections...");
  
  // Close all ports gracefully
  for (const [name, portInfo] of activePorts.entries()) {
    try {
      portInfo.port.disconnect();
    } catch (error) {
      console.log(`Error disconnecting port ${name} during shutdown:`, error);
    }
  }
  
  // Clear the map
  activePorts.clear();
});

console.log("Background service worker initialized"); 