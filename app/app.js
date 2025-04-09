// Main application script for VA To-Do extension

console.log("VA To-Do initializing...");

// Wrap in a self-executing function to avoid global scope pollution
(function() {
  let todoList = null;

  // Initialize components directly and ensure DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing app");
    
    try {
      // Initialize components
      const clientManager = new ClientManager();
      clientManager.initialize();
      console.log('Client manager initialized successfully');
      
      // Initialize theme toggle
      const themeToggle = new ThemeToggle();
      
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
        
        // Try to add listeners again after a delay
        setTimeout(() => {
          setupEventListeners(clientManager);
        }, 500);
        
        return;
      }
      
      setupEventListeners(clientManager);
      
      console.log('App initialization complete!');
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  });
  
  function setupEventListeners(clientManager) {
    // DOM elements
    const inputEl = document.getElementById('input-el');
    const addBtn = document.getElementById('add-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    console.log('Setting up event listeners with DOM elements:', {
      inputEl: !!inputEl,
      addBtn: !!addBtn,
      clearCompletedBtn: !!clearCompletedBtn
    });
    
    if (!inputEl || !addBtn || !clearCompletedBtn) {
      console.error('Required DOM elements still not found in setupEventListeners!');
      return;
    }
    
    // Initialize todo list with the client manager
    console.log('Creating TodoList instance with clientManager:', !!clientManager);
    todoList = new TodoList(clientManager);
    console.log('TodoList instance created:', !!todoList);
    
    // Verify todoList methods
    console.log('TodoList methods available:', {
      addTask: typeof todoList.addTask === 'function',
      removeTask: typeof todoList.removeTask === 'function',
      renderTasks: typeof todoList.renderTasks === 'function'
    });

    // Add direct event listeners
    if (addBtn) {
      // Add task event - add button click
      addBtn.addEventListener('click', function() {
        console.log('Add button clicked, input value:', inputEl.value, 'trimmed:', inputEl.value.trim());
        if (inputEl.value.trim()) {
          try {
            console.log('Calling todoList.addTask with:', inputEl.value);
            todoList.addTask(inputEl.value);
            console.log('Task added successfully');
            inputEl.value = '';
            inputEl.focus();
          } catch (error) {
            console.error('Error adding task:', error);
          }
        } else {
          console.log('Empty input, not adding task');
        }
      });
    }
    
    if (inputEl) {
      // Allow pressing Enter to add task
      inputEl.addEventListener('keypress', function(e) {
        console.log('Key pressed:', e.key);
        if (e.key === 'Enter' && inputEl.value.trim()) {
          console.log('Enter key pressed with value:', inputEl.value);
          try {
            todoList.addTask(inputEl.value);
            inputEl.value = '';
          } catch (error) {
            console.error('Error adding task via Enter key:', error);
          }
        }
      });
    }
    
    if (clearCompletedBtn) {
      // Clear completed tasks
      clearCompletedBtn.addEventListener('click', function() {
        console.log('Clear completed button clicked');
        todoList.clearCompletedTasks();
      });
    }
    
    // Listen for client removed events
    document.addEventListener('clientRemoved', function(event) {
      const { clientId } = event.detail;
      console.log('Client removed event received for client:', clientId);
      
      // Remove the client's tasks from storage
      StorageService.removeClientTasks(clientId);
    });
  }
})(); 