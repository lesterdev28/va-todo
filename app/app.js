import TodoList from './components/TodoList.js';
import ThemeToggler from './components/ThemeToggler.js';
import ClientManager from './components/ClientManager.js';
import StorageService from './services/StorageService.js';

// Add script loading confirmation
console.log('App script loaded');

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  
  try {
    // Initialize client manager first
    const clientManager = new ClientManager();
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
    const themeToggler = new ThemeToggler();
    
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
    
    console.log('App initialization complete!');
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}); 