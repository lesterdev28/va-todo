import Todo from './Todo.js';
import StorageService from '../services/StorageService.js';

class TodoList {
  constructor(clientManager) {
    this.tasks = [];
    this.ulElement = document.getElementById('ul-el');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    if (!this.ulElement || !this.clearCompletedBtn) {
      console.error('Required DOM elements for TodoList not found!');
      return;
    }
    
    if (!clientManager) {
      console.error('ClientManager is required for TodoList to function!');
      return;
    }
    
    this.clientManager = clientManager;
    this.activeClientId = this.clientManager.getActiveClientId();
    
    console.log('TodoList initialized with client ID:', this.activeClientId);
    
    // Initialize from storage
    this.loadFromStorage();
    this.renderTasks();
    
    // Listen for state changes from Todo components
    document.addEventListener('todoStateChanged', (event) => {
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
      const { clientId } = event.detail;
      this.activeClientId = clientId;
      this.loadFromStorage();
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
    this.tasks.push(task);
    
    // Remove empty state if present
    this.removeEmptyState();
    
    // Create and add the task to DOM
    const todo = new Todo(task.text, task.completed);
    this.ulElement.appendChild(todo.getElement());
    
    this.saveToStorage();
    this.toggleClearCompletedBtn();
  }
  
  removeTask(taskText) {
    const index = this.tasks.findIndex(task => task.text === taskText);
    if (index > -1) {
      console.log('Removing task:', this.tasks[index]);
      this.tasks.splice(index, 1);
      this.saveToStorage();
      
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
      
      // Make sure to update the clear completed button visibility
      this.toggleClearCompletedBtn();
    }
  }
  
  renderTasks() {
    // Clear current list
    this.ulElement.innerHTML = '';
    
    // Remove any existing empty state
    this.removeEmptyState();
    
    // Check if there are tasks to render
    if (this.tasks.length === 0) {
      this.showEmptyState();
      this.toggleClearCompletedBtn();
      return;
    }
    
    // Sort tasks with completed at the bottom
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
    
    // Render each task
    console.log('Rendering tasks:', sortedTasks);
    sortedTasks.forEach(task => {
      const todo = new Todo(task.text, task.completed);
      this.ulElement.appendChild(todo.getElement());
    });
    
    this.toggleClearCompletedBtn();
  }
  
  clearCompletedTasks() {
    console.log('Clearing completed tasks...');
    
    // Find all tasks that are marked as completed
    const hasCompletedTasks = this.tasks.some(task => task.completed);
    
    if (hasCompletedTasks) {
      // Update task completion status in our array
      this.tasks.forEach(task => {
        if (task.completed) {
          task.completed = false;
        }
      });
      
      // Re-render all tasks with updated completion status
      this.renderTasks();
      
      // Hide the clear completed button since no tasks are completed now
      this.toggleClearCompletedBtn();
      
      console.log('Completed tasks have been reset');
    } else {
      console.log('No completed tasks found to clear');
    }
    
    this.saveToStorage();
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
  
  showEmptyState() {
    // Check if empty state already exists
    if (document.querySelector('.empty-list')) return;
    
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-list';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-clipboard-list';
    
    const message = document.createElement('p');
    message.textContent = 'Your task list is empty. Add a task to get started!';
    
    emptyDiv.appendChild(icon);
    emptyDiv.appendChild(message);
    
    // Add to list container
    this.ulElement.parentNode.appendChild(emptyDiv);
  }
  
  removeEmptyState() {
    const emptyState = document.querySelector('.empty-list');
    if (emptyState) {
      emptyState.remove();
    }
  }
  
  editTask(oldText, newText) {
    console.log('Editing task from:', oldText, 'to:', newText);
    
    const index = this.tasks.findIndex(task => task.text === oldText);
    if (index > -1) {
      // Update the task text
      this.tasks[index].text = newText;
      
      // Save to storage
      this.saveToStorage();
      console.log('Task updated in storage');
    } else {
      console.error('Could not find task to edit:', oldText);
    }
  }
}

export default TodoList; 