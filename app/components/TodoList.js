// TodoList.js - Responsible for managing todo items

class TodoList {
  constructor(clientManager) {
    console.log('TodoList constructor called with clientManager:', !!clientManager);
    
    this.tasks = [];
    this.ulElement = document.getElementById('ul-el');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    console.log('DOM elements in constructor:', {
      ulElement: !!this.ulElement,
      clearCompletedBtn: !!this.clearCompletedBtn
    });
    
    if (!this.ulElement || !this.clearCompletedBtn) {
      console.error('Required DOM elements for TodoList not found!', {
        ulElement: this.ulElement,
        clearCompletedBtn: this.clearCompletedBtn
      });
      
      // Try to find elements again after a short delay (DOM might still be loading)
      setTimeout(() => {
        this.ulElement = document.getElementById('ul-el');
        this.clearCompletedBtn = document.getElementById('clear-completed-btn');
        console.log('Retried finding DOM elements:', {
          ulElement: !!this.ulElement,
          clearCompletedBtn: !!this.clearCompletedBtn
        });
        
        if (this.ulElement && this.clearCompletedBtn) {
          this.initialize(clientManager);
        }
      }, 100);
      
      return;
    }
    
    this.initialize(clientManager);
  }
  
  initialize(clientManager) {
    if (!clientManager) {
      console.error('ClientManager is required for TodoList to function!');
      return;
    }
    
    this.clientManager = clientManager;
    this.activeClientId = this.clientManager.getActiveClientId();
    
    console.log('TodoList initialized with client ID:', this.activeClientId);
    
    // Cleanup any leftover sections from previous instances
    this.cleanup();
    
    // Initialize from storage
    this.loadFromStorage();
    
    // Add event listener for the clear completed button
    this.clearCompletedBtn.addEventListener('click', () => {
      this.clearCompletedTasks();
    });
    
    // Render tasks initially
    console.log('About to render tasks for the first time');
    this.renderTasks();
    console.log('Initial rendering complete');
    
    // Listen for state changes from Todo components
    document.addEventListener('todoStateChanged', (event) => {
      console.log('todoStateChanged event received:', event.detail);
      const { taskText, oldText, completed, type } = event.detail;
      
      if (type === 'delete') {
        this.removeTask(taskText);
      } else if (type === 'update') {
        this.updateTask(taskText, completed);
      } else if (type === 'edit') {
        this.editTask(oldText, taskText);
      }
      
      this.saveToStorage();
      this.toggleClearCompletedBtn();
    });
    
    // Listen for client changes
    document.addEventListener('clientChanged', (event) => {
      console.log('clientChanged event received:', event.detail);
      const { clientId } = event.detail;
      this.activeClientId = clientId;
      
      // First, clean up any existing tasks display
      this.cleanup();
      
      // Then load tasks for the new client
      this.loadFromStorage();
      
      // Finally render the tasks for the new client
      console.log(`Rendering tasks for client ${clientId} after client change`);
      this.renderTasks();
    });
  }
  
  loadFromStorage() {
    try {
      this.tasks = StorageService.getClientTasks(this.activeClientId);
      console.log(`Loading tasks for client ${this.activeClientId}:`, this.tasks);
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      this.tasks = [];
    }
  }
  
  saveToStorage() {
    try {
      StorageService.saveClientTasks(this.activeClientId, this.tasks);
      console.log(`Tasks saved for client ${this.activeClientId}:`, this.tasks);
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }
  
  addTask(taskText) {
    console.log('addTask called with text:', taskText);
    
    // Ensure tasks array exists
    if (!this.tasks) {
      console.error('Tasks array is undefined, initializing empty array');
      this.tasks = [];
    }
    
    console.log('Current tasks array:', this.tasks);
    
    if (!taskText || taskText.trim() === '') {
      console.log('Task text is empty, not adding');
      return;
    }
    
    // Check if task already exists
    if (this.tasks.some(task => task.text === taskText)) {
      console.log('Task already exists, not adding');
      return;
    }
    
    const task = {
      text: taskText,
      completed: false
    };
    
    console.log('Adding new task:', task);
    
    // Ensure we're pushing to a valid array
    try {
      this.tasks.push(task);
      console.log('Tasks array after push:', this.tasks.length, 'tasks');
    } catch (error) {
      console.error('Error pushing task to tasks array:', error);
      this.tasks = [task]; // Reset tasks array with just this task
      console.log('Reset tasks array with new task');
    }
    
    // Remove empty state if present
    this.removeEmptyState();
    
    // Create and add the task to DOM
    console.log('Calling renderTasks after adding new task');
    this.renderTasks();
    
    console.log('Saving to storage');
    this.saveToStorage();
    console.log('Toggling clear completed button');
    this.toggleClearCompletedBtn();
    console.log('Task add operation complete');
  }
  
  removeTask(taskText) {
    const index = this.tasks.findIndex(task => task.text === taskText);
    if (index > -1) {
      console.log('Removing task:', this.tasks[index]);
      this.tasks.splice(index, 1);
      this.saveToStorage();
      
      // Re-render to properly show/hide sections
      this.renderTasks();
      
      // If no tasks left, show empty state
      if (this.tasks.length === 0) {
        this.showEmptyState();
      }
    }
  }
  
  updateTask(taskText, completed) {
    const index = this.tasks.findIndex(task => task.text === taskText);
    if (index > -1) {
      console.log('Updating task completion:', taskText, completed);
      this.tasks[index].completed = completed;
      this.saveToStorage();
      
      // Re-render to move task to the appropriate section
      this.renderTasks();
      
      // Make sure to update the clear completed button visibility
      this.toggleClearCompletedBtn();
    }
  }
  
  renderTasks() {
    console.log('renderTasks called. Tasks:', this.tasks);
    console.log('ulElement exists:', !!this.ulElement);
    console.log('Active client ID:', this.activeClientId);
    
    // Make sure the ulElement still exists
    this.ulElement = document.getElementById('ul-el');
    if (!this.ulElement) {
      console.error('ul-el not found during renderTasks');
      return;
    }
    
    // Clear current list
    this.ulElement.innerHTML = '';
    
    // Remove any existing empty state and completed section
    this.removeEmptyState();
    this.removeCompletedSection();

    // Check if there are tasks to render
    if (!this.tasks || this.tasks.length === 0) {
      console.log('No tasks to render, showing empty state');
      this.showEmptyState();
      this.toggleClearCompletedBtn();
      return;
    }

    // Separate active and completed tasks for the current client only
    const activeTasks = this.tasks.filter(task => !task.completed);
    const completedTasks = this.tasks.filter(task => task.completed);

    // Render active tasks - recently reactivated tasks will appear at the top
    console.log('Rendering active tasks for client', this.activeClientId, ':', activeTasks);
    
    // Check if there are any active tasks
    if (activeTasks.length > 0) {
      // Create active tasks header
      const activeHeader = document.createElement('h2');
      activeHeader.className = 'active-header';
      activeHeader.innerHTML = '<i class="fas fa-tasks"></i> Active Tasks';
      this.ulElement.parentNode.insertBefore(activeHeader, this.ulElement);
      
      // Render active tasks in reverse order (newest first)
      [...activeTasks].reverse().forEach(task => {
        try {
          const todo = new Todo(task.text, task.completed);
          const element = todo.getElement();
          if (element) {
            this.ulElement.appendChild(element);
          } else {
            console.error('Todo element is null for task:', task);
          }
        } catch (error) {
          console.error('Error creating Todo for task:', task, error);
        }
      });
    }

    // Render completed tasks in a separate section if any exist for the current client
    if (completedTasks.length > 0) {
      this.createCompletedSection(completedTasks);
    }
    
    this.toggleClearCompletedBtn();
  }
  
  createCompletedSection(completedTasks) {
    // Create completed tasks section
    const completedSection = document.createElement('div');
    completedSection.className = 'completed-section';
    completedSection.id = 'completed-section';
    completedSection.setAttribute('data-client-id', this.activeClientId);
    
    // Add a header for the section
    const completedHeader = document.createElement('h2');
    completedHeader.className = 'completed-header';
    completedHeader.innerHTML = `<i class="fas fa-check-circle"></i> Completed Tasks`;
    
    completedSection.appendChild(completedHeader);
    
    // Create a separate list for completed tasks
    const completedList = document.createElement('ul');
    completedList.className = 'completed-list';
    
    // Add completed tasks to this separate list
    console.log('Rendering completed tasks for client', this.activeClientId, ':', completedTasks);
    completedTasks.forEach(task => {
      const todo = new Todo(task.text, task.completed, task.timestamp);
      completedList.appendChild(todo.getElement());
    });
    
    completedSection.appendChild(completedList);
    
    // Add completed section after the main task list
    this.ulElement.parentNode.appendChild(completedSection);
  }
  
  getClientName() {
    // If clientManager exists, get the client name for the active client
    if (this.clientManager) {
      const clients = StorageService.getClients();
      const activeClient = clients.find(client => client.id === this.activeClientId);
      return activeClient ? activeClient.name : 'Current Client';
    }
    return 'Current Client';
  }
  
  removeCompletedSection() {
    const completedSection = document.getElementById('completed-section');
    if (completedSection) {
      completedSection.remove();
    }
  }
  
  clearCompletedTasks() {
    console.log('Clearing completed tasks...');
    
    // Find all tasks that are marked as completed
    const hasCompletedTasks = this.tasks.some(task => task.completed);
    
    if (hasCompletedTasks) {
      // Mark completed tasks as active again (deselect)
      this.tasks.forEach(task => {
        if (task.completed) {
          task.completed = false;
          console.log('Task marked as active:', task.text);
        }
      });
      
      console.log('After clearing, all tasks marked as active:', this.tasks);
      
      // Re-render all tasks with updated completion status
      this.renderTasks();
      
      // Hide the clear completed button since no tasks are completed now
      this.toggleClearCompletedBtn();
      
      // Save to storage
      this.saveToStorage();
      
      console.log('Completed tasks have been deselected and moved to active');
    } else {
      console.log('No completed tasks found to clear');
    }
  }
  
  toggleClearCompletedBtn() {
    // Check if there are any tasks that are completed
    const hasCompletedTasks = this.tasks.some(task => task.completed);
    
    console.log('Toggling clear completed button, hasCompletedTasks:', hasCompletedTasks);
    
    if (hasCompletedTasks) {
      // Only show the button when there are completed tasks
      this.clearCompletedBtn.style.display = 'block';
      this.clearCompletedBtn.innerHTML = '<i class="fas fa-check-circle"></i> Clear Completed Tasks';
    } else {
      // Hide the button when no tasks are completed
      this.clearCompletedBtn.style.display = 'none';
    }
  }
  
  cleanup() {
    // Remove any existing completed sections or empty states
    this.removeCompletedSection();
    this.removeEmptyState(); // This also removes active-header
    
    // Clear the task list
    if (this.ulElement) {
      this.ulElement.innerHTML = '';
    }
    
    // Hide the clear completed button by default
    if (this.clearCompletedBtn) {
      this.clearCompletedBtn.style.display = 'none';
    }
  }
  
  removeEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    
    // Also remove the active header if present
    const activeHeader = document.querySelector('.active-header');
    if (activeHeader) {
      activeHeader.remove();
    }
  }
  
  showEmptyState() {
    // Check if empty state already exists
    if (document.querySelector('.empty-state')) return;
    
    // Make sure the list container exists
    const listContainer = document.querySelector('.list');
    if (!listContainer) {
      console.error('List container not found for empty state');
      return;
    }
    
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    
    emptyDiv.innerHTML = `
      <div class="empty-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <p>Your task list is empty. Add a task to get started!</p>
    `;
    
    // Add to list container
    listContainer.appendChild(emptyDiv);
  }
  
  editTask(oldText, newText) {
    console.log('Editing task from:', oldText, 'to:', newText);
    
    const index = this.tasks.findIndex(task => task.text === oldText);
    if (index > -1) {
      // Keep the current completion status
      const currentCompleted = this.tasks[index].completed;
      
      // Update the task text
      this.tasks[index].text = newText;
      
      // Ensure completion status is preserved
      this.tasks[index].completed = currentCompleted;
      
      // Save to storage
      this.saveToStorage();
      console.log('Task updated in storage');
      
      // If it's a completed task, re-render to update the completed section
      if (currentCompleted) {
        this.renderTasks();
      }
    } else {
      console.error('Could not find task to edit:', oldText);
    }
  }
} 