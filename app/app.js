import TodoList from './components/TodoList.js';
import ClientManager from './components/ClientManager.js';
import StorageService from './services/StorageService.js';
import YuukiAssistant from './components/AIAssistant.js';
import ThemeToggle from './components/ThemeToggle.js';

// Add script loading confirmation
console.log('App script loaded');

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  
  try {
    // Initialize client manager first
    const clientManager = new ClientManager();
    const themeToggle = new ThemeToggle();
    clientManager.initialize();
    console.log('Client manager initialized successfully');
    
    // DOM elements
    const inputEl = document.getElementById('input-el');
    const addBtn = document.getElementById('add-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    // Log DOM elements to verify they are found
    console.log('DOM Elements found:', {
      inputEl: !!inputEl,
      addBtn: !!addBtn,
      clearCompletedBtn: !!clearCompletedBtn
    });
    
    if (!inputEl || !addBtn || !clearCompletedBtn) {
      console.error('Required DOM elements not found!');
      return;
    }
    
    // Initialize components
    const todoList = new TodoList(clientManager);
    const yuukiAssistant = new YuukiAssistant();
    
    // Add task event
    addBtn.addEventListener('click', function() {
      console.log('Add button clicked with value:', inputEl.value);
      todoList.addTask(inputEl.value);
      inputEl.value = '';
      inputEl.focus();
    });
    
    // Allow pressing Enter to add task
    inputEl.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        console.log('Enter key pressed with value:', inputEl.value);
        todoList.addTask(inputEl.value);
        inputEl.value = '';
      }
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', function() {
      console.log('Clear completed button clicked');
      todoList.clearCompletedTasks();
    });
    
    // Listen for client removed events
    document.addEventListener('clientRemoved', function(event) {
      const { clientId } = event.detail;
      console.log('Client removed event received for client:', clientId);
      
      // Remove the client's tasks from storage
      StorageService.removeClientTasks(clientId);
    });
    
    // Set up the upgrade to premium button
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        showPremiumUpgradeModal();
      });
    }
    
    console.log('App initialization complete!');
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
});

// Function to show the premium upgrade modal
function showPremiumUpgradeModal() {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.classList.add('modal-overlay');
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('premium-modal');
  
  // Add modal content
  modalContainer.innerHTML = `
    <div class="premium-modal-header">
      <h2><i class="fas fa-crown"></i> Upgrade to Premium</h2>
      <button class="close-modal-btn"><i class="fas fa-times"></i></button>
    </div>
    <div class="premium-modal-content">
      <div class="premium-features">
        <h3>Premium Features</h3>
        <ul>
          <li><i class="fas fa-check"></i> Unlimited clients</li>
          <li><i class="fas fa-check"></i> Advanced task categorization</li>
          <li><i class="fas fa-check"></i> Priority management</li>
          <li><i class="fas fa-check"></i> Enhanced analytics</li>
          <li><i class="fas fa-check"></i> Cloud backup</li>
        </ul>
      </div>
      <div class="pricing-options">
        <div class="pricing-card">
          <h4>Monthly</h4>
          <div class="price">$9.99<span>/month</span></div>
          <button class="premium-purchase-btn">Get Started</button>
        </div>
        <div class="pricing-card recommended">
          <div class="recommended-badge">Best Value</div>
          <h4>Annual</h4>
          <div class="price">$99.99<span>/year</span></div>
          <div class="savings">Save 17%</div>
          <button class="premium-purchase-btn">Get Started</button>
        </div>
      </div>
    </div>
  `;
  
  // Append modal to the DOM
  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);
  
  // Add event listener to close button
  const closeBtn = modalContainer.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  // Add event listener to close modal when clicking outside
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
  
  // Add event listeners to purchase buttons
  const purchaseBtns = modalContainer.querySelectorAll('.premium-purchase-btn');
  purchaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      alert('This is a demo. In a real application, this would redirect to a payment processor.');
      document.body.removeChild(modalOverlay);
    });
  });
} 