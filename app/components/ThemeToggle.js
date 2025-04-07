import StorageService from '../services/StorageService.js';

class ThemeToggle {
  constructor() {
    console.log('Initializing ThemeToggle');
    this.checkbox = document.getElementById('checkbox');
    
    if (!this.checkbox) {
      console.error('Theme toggle checkbox not found!');
      return;
    }
    
    this.initializeTheme();
    this.setupEventListeners();
    console.log('ThemeToggle initialized successfully');
  }

  initializeTheme() {
    try {
      // Get the theme preference from storage
      const darkMode = StorageService.getThemePreference();
      console.log('Current theme preference:', darkMode);
      
      // If darkMode is 'enabled', we want to apply the dark mode class
      if (darkMode === 'enabled') {
        console.log('Enabling dark mode');
        document.body.classList.add('dark-mode');
        this.checkbox.checked = true;
      } else {
        console.log('Enabling light mode');
        // Ensure body does not have dark-mode class
        document.body.classList.remove('dark-mode');
        this.checkbox.checked = false;
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }

  setupEventListeners() {
    this.checkbox.addEventListener('change', () => {
      console.log('Theme toggle clicked, new state:', this.checkbox.checked);
      this.toggleTheme();
    });
  }

  toggleTheme() {
    try {
      if (this.checkbox.checked) {
        console.log('Switching to dark mode');
        document.body.classList.add('dark-mode');
        StorageService.saveThemePreference('enabled');
      } else {
        console.log('Switching to light mode');
        document.body.classList.remove('dark-mode');
        StorageService.saveThemePreference('disabled');
      }
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  }
}

export default ThemeToggle; 