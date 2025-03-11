document.addEventListener("DOMContentLoaded", function() {
    const inputBtn = document.getElementById("input-btn");
    const inputEl = document.getElementById("input-el");
    const ulEl = document.getElementById("ul-el");

    // Load tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        addTaskToDOM(task.text, task.completed);
    });

    inputBtn.addEventListener("click", function() {
        if (inputEl.value.trim() !== "") {
            const task = {
                text: inputEl.value,
                completed: false
            };
            addTaskToDOM(task.text, task.completed);
            tasks.push(task);
            localStorage.setItem("tasks", JSON.stringify(tasks));
            inputEl.value = "";
        }
    });

    function addTaskToDOM(taskText, completed) {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("task-checkbox");
        checkbox.checked = completed;

        if (completed) {
            li.classList.add("completed");
        }

        checkbox.addEventListener("change", function() {
            if (checkbox.checked) {
                li.classList.add("completed");
            } else {
                li.classList.remove("completed");
            }
            const index = tasks.findIndex(task => task.text === taskText);
            if (index > -1) {
                tasks[index].completed = checkbox.checked;
                localStorage.setItem("tasks", JSON.stringify(tasks));
            }
        });

        const taskTextEl = document.createElement("span");
        taskTextEl.textContent = taskText;

        const deleteBtn = document.createElement("img");
        deleteBtn.src = "images/delete.png";
        deleteBtn.alt = "delete button";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", function() {
            ulEl.removeChild(li);
            const index = tasks.findIndex(task => task.text === taskText);
            if (index > -1) {
                tasks.splice(index, 1);
                localStorage.setItem("tasks", JSON.stringify(tasks));
            }
        });

        li.appendChild(checkbox);
        li.appendChild(taskTextEl);
        li.appendChild(deleteBtn);
        ulEl.appendChild(li);
    }
});