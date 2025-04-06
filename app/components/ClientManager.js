import StorageService from '../services/StorageService.js';

class ClientManager {
  constructor() {
    this.clients = [];
    this.activeClientId = null;
    this.clientSelector = document.getElementById('client-selector');
    this.addClientBtn = document.getElementById('add-client-btn');
    this.removeClientBtn = document.getElementById('remove-client-btn');
    this.modal = document.getElementById('add-client-modal');
    this.closeModalBtn = document.querySelector('.close-modal');
    this.addClientForm = document.getElementById('add-client-form');
    this.cancelClientBtn = document.getElementById('cancel-client-btn');
    
    // Check if required DOM elements are present
    if (!this.clientSelector || !this.addClientBtn || !this.removeClientBtn || !this.modal || !this.closeModalBtn || !this.addClientForm || !this.cancelClientBtn) {
      console.error('Required DOM elements for ClientManager not found!');
      return;
    }
  }
  
  initialize() {
    console.log('Initializing ClientManager...');
    try {
      console.log('Client selector found:', !!this.clientSelector);
      console.log('Add client button found:', !!this.addClientBtn);
      console.log('Remove client button found:', !!this.removeClientBtn);
      console.log('Modal dialog found:', !!this.modal);
      
      if (!this.clientSelector || !this.addClientBtn || !this.removeClientBtn || !this.modal) {
        console.error('Missing required DOM elements for ClientManager');
        return;
      }
      
      this.loadClients();
      this.renderClientSelector();
      this.setupEventListeners();
      
      // Ensure Personal client is selected initially if available
      if (this.clients.length > 0) {
        const personalClient = this.clients.find(client => client.name === 'Personal' || client.isDefault);
        if (personalClient && this.activeClientId !== personalClient.id) {
          this.activeClientId = personalClient.id;
          this.saveClients();
          this.renderClientSelector();
        }
      }
      
      console.log('ClientManager initialized with clients:', this.clients);
      console.log('Active client ID:', this.activeClientId);
    } catch (error) {
      console.error('Error initializing ClientManager:', error);
    }
  }
  
  loadClients() {
    this.clients = StorageService.getClients();
    this.activeClientId = StorageService.getActiveClient();
    
    console.log('Loading clients:', this.clients);
    console.log('Active client ID:', this.activeClientId);
    
    // Create a default client if there are none
    let hasDefaultClient = this.clients.some(client => client.name === 'Personal');
    
    if (!hasDefaultClient) {
      const defaultClient = {
        id: 'client_personal_default',
        name: 'Personal',
        isDefault: true
      };
      console.log('Creating default Personal client:', defaultClient);
      this.clients.push(defaultClient);
      
      if (!this.activeClientId) {
        this.activeClientId = defaultClient.id;
      }
      
      this.saveClients();
    }
    
    // If active client is not set or not found in clients list, set to Personal or first client
    if (!this.activeClientId || !this.clients.find(client => client.id === this.activeClientId)) {
      // Try to find Personal client first
      const personalClient = this.clients.find(client => client.name === 'Personal' || client.isDefault);
      if (personalClient) {
        this.activeClientId = personalClient.id;
      } else {
        this.activeClientId = this.clients[0].id;
      }
      
      console.log('Setting active client to:', this.activeClientId);
      StorageService.setActiveClient(this.activeClientId);
    }
  }
  
  renderClientSelector() {
    // Clear existing options
    this.clientSelector.innerHTML = '';
    
    // Add clients to selector
    this.clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      
      // Add indicator for default client
      if (client.name === 'Personal' || client.isDefault) {
        option.textContent = `${client.name} (Default)`;
      } else {
        option.textContent = client.name;
      }
      
      option.selected = client.id === this.activeClientId;
      this.clientSelector.appendChild(option);
    });
    
    // Update remove button state
    this.updateRemoveButtonState();
  }
  
  setupEventListeners() {
    // Handle client selection change
    this.clientSelector.addEventListener('change', (e) => {
      const clientId = e.target.value;
      this.activeClientId = clientId;
      StorageService.setActiveClient(clientId);
      
      // Update remove button state
      this.updateRemoveButtonState();
      
      // Dispatch event for other components to react
      const event = new CustomEvent('clientChanged', {
        detail: { clientId }
      });
      document.dispatchEvent(event);
      
      console.log(`Active client changed to ${clientId}`);
    });
    
    // Handle add client button
    this.addClientBtn.addEventListener('click', () => {
      this.showAddClientDialog();
    });
    
    // Handle remove client button
    this.removeClientBtn.addEventListener('click', () => {
      this.removeClient();
    });
    
    // Handle modal close button
    this.closeModalBtn.addEventListener('click', () => {
      this.closeModal();
    });
    
    // Handle cancel button
    this.cancelClientBtn.addEventListener('click', () => {
      this.closeModal();
    });
    
    // Handle click outside modal
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
    
    // Handle add client form submission
    this.addClientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const clientName = document.getElementById('client-name').value.trim();
      if (clientName) {
        this.addClient(clientName);
        this.closeModal();
      }
    });
    
    // Initial remove button state
    this.updateRemoveButtonState();
  }
  
  showAddClientDialog() {
    // Reset the form
    this.addClientForm.reset();
    
    // Show the modal
    this.modal.classList.add('show');
    
    // Focus on the name input
    document.getElementById('client-name').focus();
  }
  
  closeModal() {
    this.modal.classList.remove('show');
  }
  
  addClient(clientName) {
    // Check if client name is "Personal" (case insensitive)
    if (clientName.toLowerCase() === 'personal') {
      alert('Cannot create another client named "Personal" as it is reserved for the default client.');
      return;
    }
    
    // Check if client name already exists
    if (this.clients.some(client => client.name.toLowerCase() === clientName.toLowerCase())) {
      alert('A client with this name already exists.');
      return;
    }
    
    const newClient = {
      id: this.generateId(),
      name: clientName,
      isDefault: false
    };
    
    this.clients.push(newClient);
    this.activeClientId = newClient.id;
    this.saveClients();
    this.renderClientSelector();
    
    // Dispatch event for other components to react
    const event = new CustomEvent('clientChanged', {
      detail: { clientId: newClient.id }
    });
    document.dispatchEvent(event);
    
    console.log(`Added new client: ${clientName} with ID: ${newClient.id}`);
  }
  
  saveClients() {
    StorageService.saveClients(this.clients);
    StorageService.setActiveClient(this.activeClientId);
  }
  
  generateId() {
    return 'client_' + Date.now() + Math.random().toString(36).substring(2, 9);
  }
  
  getActiveClientId() {
    return this.activeClientId;
  }
  
  removeClient() {
    // Get the active client
    const activeClient = this.clients.find(client => client.id === this.activeClientId);
    
    // Don't allow removing the last client or the Personal client
    if (this.clients.length <= 1) {
      alert('Cannot remove the last client. At least one client must exist.');
      return;
    }
    
    if (activeClient && (activeClient.name === 'Personal' || activeClient.isDefault)) {
      alert('The Personal client cannot be removed.');
      return;
    }
    
    if (!activeClient) {
      console.error('Active client not found:', this.activeClientId);
      return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to remove the client "${activeClient.name}"? This will delete all tasks associated with this client.`)) {
      return;
    }
    
    // Find the index of the client to remove
    const clientIndex = this.clients.findIndex(client => client.id === this.activeClientId);
    if (clientIndex === -1) {
      console.error('Client not found for removal:', this.activeClientId);
      return;
    }
    
    // Store the ID to be removed
    const clientIdToRemove = this.activeClientId;
    
    // Find the Personal client to set as the new active
    const personalClient = this.clients.find(client => client.name === 'Personal' || client.isDefault);
    if (personalClient) {
      this.activeClientId = personalClient.id;
    } else {
      // Fallback to a different client if Personal doesn't exist
      let newActiveIndex = clientIndex > 0 ? clientIndex - 1 : 1;
      if (newActiveIndex >= this.clients.length) {
        newActiveIndex = 0;
      }
      this.activeClientId = this.clients[newActiveIndex].id;
    }
    
    // Remove the client from the array
    this.clients.splice(clientIndex, 1);
    
    // Save changes
    this.saveClients();
    
    // Update UI
    this.renderClientSelector();
    this.updateRemoveButtonState();
    
    // Dispatch event for other components to react
    const event = new CustomEvent('clientChanged', {
      detail: { clientId: this.activeClientId }
    });
    document.dispatchEvent(event);
    
    // Notify of client removal for cleanup
    const removalEvent = new CustomEvent('clientRemoved', {
      detail: { clientId: clientIdToRemove }
    });
    document.dispatchEvent(removalEvent);
    
    console.log(`Removed client ID: ${clientIdToRemove}, new active client: ${this.activeClientId}`);
  }
  
  updateRemoveButtonState() {
    // Get the active client
    const activeClient = this.clients.find(client => client.id === this.activeClientId);
    
    // Disable the remove button if there's only one client or if the active client is the default Personal
    if (this.clients.length <= 1 || 
        (activeClient && (activeClient.name === 'Personal' || activeClient.isDefault))) {
      this.removeClientBtn.classList.add('disabled');
      this.removeClientBtn.disabled = true;
      this.removeClientBtn.style.display = 'none';
    } else {
      this.removeClientBtn.classList.remove('disabled');
      this.removeClientBtn.disabled = false;
      this.removeClientBtn.style.display = 'flex';
    }
  }
}

export default ClientManager; 