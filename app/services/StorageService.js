// StorageService.js - Handles local storage operations

class StorageService {
  static getTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log('Retrieved tasks:', tasks);
    return tasks;
  }

  static saveTasks(tasks) {
    console.log('Saving tasks:', tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  static getThemePreference() {
    const preference = localStorage.getItem('darkMode') || 'disabled';
    console.log('Retrieved theme preference:', preference);
    return preference;
  }

  static saveThemePreference(preference) {
    console.log('Saving theme preference:', preference);
    localStorage.setItem('darkMode', preference);
  }
  
  static getClients() {
    try {
      const clientsString = localStorage.getItem('clients');
      if (!clientsString) {
        // Return default client if none found
        const defaultClient = { id: 'client_personal_default', name: 'Personal', isDefault: true };
        return [defaultClient];
      }
      
      return JSON.parse(clientsString);
    } catch (e) {
      console.error('Error parsing clients from storage:', e);
      const defaultClient = { id: 'client_personal_default', name: 'Personal', isDefault: true };
      return [defaultClient];
    }
  }
  
  static saveClients(clients) {
    try {
      console.log('Saving clients:', clients);
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  }
  
  static getActiveClient() {
    const activeClient = localStorage.getItem('activeClient') || null;
    console.log('Retrieved active client:', activeClient);
    return activeClient;
  }
  
  static setActiveClient(clientId) {
    console.log('Setting active client:', clientId);
    localStorage.setItem('activeClient', clientId);
  }
  
  static getClientTasks(clientId) {
    try {
      if (!clientId) {
        console.error('getClientTasks: clientId is null or undefined');
        return [];
      }
      const allTasks = JSON.parse(localStorage.getItem('clientTasks')) || {};
      const tasks = allTasks[clientId] || [];
      console.log(`Retrieved tasks for client ${clientId}:`, tasks);
      return tasks;
    } catch (error) {
      console.error('Error retrieving client tasks:', error);
      return [];
    }
  }
  
  static saveClientTasks(clientId, tasks) {
    try {
      if (!clientId) {
        console.error('saveClientTasks: clientId is null or undefined');
        return;
      }
      const allTasks = JSON.parse(localStorage.getItem('clientTasks')) || {};
      allTasks[clientId] = tasks;
      console.log(`Saving tasks for client ${clientId}:`, tasks);
      localStorage.setItem('clientTasks', JSON.stringify(allTasks));
    } catch (error) {
      console.error('Error saving client tasks:', error);
    }
  }

  static removeClientTasks(clientId) {
    try {
      if (!clientId) {
        console.error('removeClientTasks: clientId is null or undefined');
        return;
      }
      
      // Get all tasks
      const allTasks = JSON.parse(localStorage.getItem('clientTasks')) || {};
      
      // Remove tasks for the specified client
      delete allTasks[clientId];
      
      // Save updated tasks
      localStorage.setItem('clientTasks', JSON.stringify(allTasks));
      console.log(`Removed tasks for client ${clientId}`);
    } catch (error) {
      console.error('Error removing client tasks:', error);
    }
  }
} 