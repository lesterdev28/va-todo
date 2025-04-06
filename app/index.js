import TodoList from './components/TodoList.js';
import ClientManager from './components/ClientManager.js';
import ThemeToggler from './components/ThemeToggler.js';
import './utils/logger.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('DOM loaded, initializing app...');
    
    // Initialize components
    const clientManager = new ClientManager();
    clientManager.initialize();
    console.log('Client Manager initialized');
    
    const todoList = new TodoList(clientManager);
    console.log('TodoList initialized');
    
    const themeToggler = new ThemeToggler();
    console.log('Theme Toggler initialized');
    
    const inputEl = document.getElementById('input-el');
    const addBtn = document.getElementById('add-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    console.log('DOM elements found:', {
      inputEl: !!inputEl,
      addBtn: !!addBtn,
      clearCompletedBtn: !!clearCompletedBtn
    });
    
    if (!inputEl || !addBtn || !clearCompletedBtn) {
      console.error('Required DOM elements not found!');
      return;
    }
    
    // Add task event listener
    addBtn.addEventListener('click', () => {
      const taskText = inputEl.value.trim();
      if (taskText) {
        todoList.addTask(taskText);
        inputEl.value = '';
        inputEl.focus();
      }
    });
    
    // Enter key to add task
    inputEl.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        const taskText = inputEl.value.trim();
        if (taskText) {
          todoList.addTask(taskText);
          inputEl.value = '';
        }
      }
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', () => {
      todoList.clearCompletedTasks();
    });
    
    console.log('✅ VA To-Do app initialized');
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}); 