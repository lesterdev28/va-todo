// Todo.js - Individual todo item component

class Todo {
  constructor(taskText, completed = false) {
    console.log("Creating Todo instance:", taskText, completed);
    this.taskText = taskText;
    this.completed = completed;
    try {
      this.element = this.createTodoElement();
      this.isEditing = false;
      console.log("Todo element created successfully");
    } catch (error) {
      console.error("Error creating Todo element:", error);
      this.element = null;
    }
  }

  // Create the DOM element for this todo
  createTodoElement() {
    console.log("Creating todo element for:", this.taskText);
    const li = document.createElement("li");

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = this.completed;
    checkbox.setAttribute("aria-label", "Mark task as " + (this.completed ? "incomplete" : "complete"));

    if (this.completed) {
      li.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      console.log("Checkbox changed:", checkbox.checked);
      if (checkbox.checked) {
        li.classList.add("completed");
      } else {
        li.classList.remove("completed");
      }
      this.completed = checkbox.checked;
      // Custom event to notify state changes
      const event = new CustomEvent("todoStateChanged", { 
        detail: { 
          taskText: this.taskText, 
          completed: this.completed,
          type: "update"
        } 
      });
      console.log("Dispatching todoStateChanged event:", event.detail);
      document.dispatchEvent(event);
    });
    
    // Add keyboard support for accessibility
    checkbox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        
        // Trigger the change event
        const changeEvent = new Event("change");
        checkbox.dispatchEvent(changeEvent);
      }
    });

    // Create text span for task
    const taskTextEl = document.createElement("span");
    taskTextEl.textContent = this.taskText;
    taskTextEl.classList.add("task-text");

    // Create edit button with improved icon
    const editBtn = document.createElement("i");
    editBtn.className = "fas fa-edit edit-btn";
    editBtn.setAttribute("title", "Edit task");
    
    // Create delete button with improved icon
    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fas fa-trash-alt delete-btn";
    deleteBtn.setAttribute("title", "Delete task");
    
    // Action buttons wrapper for layout
    const actionBtns = document.createElement("div");
    actionBtns.className = "action-buttons";
    actionBtns.appendChild(editBtn);
    actionBtns.appendChild(deleteBtn);
    
    // Edit functionality
    editBtn.addEventListener("click", () => {
      if (this.completed) return; // Don't allow editing completed tasks
      
      if (!this.isEditing) {
        this.startEditing(li, taskTextEl);
      }
    });
    
    // Double-click on text to edit
    taskTextEl.addEventListener("dblclick", () => {
      if (this.completed) return; // Don't allow editing completed tasks
      
      if (!this.isEditing) {
        this.startEditing(li, taskTextEl);
      }
    });
    
    deleteBtn.addEventListener("click", () => {
      console.log('Delete button clicked for task:', this.taskText);
      li.remove();
      // Custom event to notify deletion
      const event = new CustomEvent("todoStateChanged", { 
        detail: { 
          taskText: this.taskText, 
          type: "delete"
        } 
      });
      document.dispatchEvent(event);
    });
    
    // Add animation to the task item
    setTimeout(() => {
      li.classList.add('fade-in');
    }, 10);

    li.appendChild(checkbox);
    li.appendChild(taskTextEl);
    li.appendChild(actionBtns);
    
    return li;
  }

  startEditing(li, taskTextEl) {
    this.isEditing = true;
    
    // Create input field
    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.value = this.taskText;
    inputEl.className = "edit-task-input";
    
    // Replace text with input
    taskTextEl.style.display = "none";
    li.insertBefore(inputEl, taskTextEl.nextSibling);
    
    // Focus input
    inputEl.focus();
    
    // Set cursor at end of text
    inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    
    // Handle input blur (finish editing)
    inputEl.addEventListener("blur", () => {
      this.finishEditing(li, taskTextEl, inputEl);
    });
    
    // Handle Enter key
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inputEl.blur();
      }
      
      if (e.key === "Escape") {
        e.preventDefault();
        inputEl.value = this.taskText; // Reset to original value
        inputEl.blur();
      }
    });
  }
  
  finishEditing(li, taskTextEl, inputEl) {
    if (!this.isEditing) return;
    
    const newValue = inputEl.value.trim();
    
    if (newValue && newValue !== this.taskText) {
      const oldText = this.taskText;
      this.taskText = newValue;
      taskTextEl.textContent = newValue;
      
      // Notify of the change
      const event = new CustomEvent("todoStateChanged", { 
        detail: { 
          oldText: oldText,
          taskText: newValue, 
          completed: this.completed,
          type: "edit"
        } 
      });
      document.dispatchEvent(event);
    }
    
    // Restore the display
    taskTextEl.style.display = "";
    li.removeChild(inputEl);
    this.isEditing = false;
  }

  getElement() {
    if (!this.element) {
      console.warn("Todo element is null, trying to recreate it");
      try {
        this.element = this.createTodoElement();
        if (!this.element) {
          console.error("Failed to recreate todo element");
        }
      } catch (error) {
        console.error("Error recreating todo element:", error);
      }
    }
    return this.element;
  }

  update(completed) {
    this.completed = completed;
    
    const checkbox = this.element.querySelector(".task-checkbox");
    checkbox.checked = completed;
    
    if (completed) {
      this.element.classList.add("completed");
    } else {
      this.element.classList.remove("completed");
    }
  }
} 