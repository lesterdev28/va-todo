import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set, get, remove, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://va-to-do-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const tasksRef = ref(database, "tasks");

document.addEventListener("DOMContentLoaded", function() {
    const inputBtn = document.getElementById("input-btn");
    const clearCompletedBtn = document.getElementById("clear-completed-btn");
    const checkbox = document.getElementById("checkbox");
    const inputEl = document.getElementById("input-el");
    const ulEl = document.getElementById("ul-el");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

    // Fetch tasks from Firebase
    get(tasksRef).then((snapshot) => {
        if (snapshot.exists()) {
            tasks = snapshot.val();
            for (let key in tasks) {
                addTaskToDOM(tasks[key].text, tasks[key].completed, key);
            }
            toggleClearCompletedBtn();
        }
    }).catch((error) => {
        console.error(error);
    });

    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
        checkbox.checked = true;
    }

    inputBtn.addEventListener("click", function() {
        if (inputEl.value.trim() !== "") {
            const task = {
                text: inputEl.value,
                completed: false
            };
            const newTaskRef = push(tasksRef);
            set(newTaskRef, task).then(() => {
                tasks[newTaskRef.key] = task;
                localStorage.setItem("tasks", JSON.stringify(tasks));
                addTaskToDOM(task.text, task.completed, newTaskRef.key);
                inputEl.value = "";
                toggleClearCompletedBtn();
            });
        }
    });

    clearCompletedBtn.addEventListener("click", function() {
        const completedTasks = document.querySelectorAll(".completed");
        completedTasks.forEach(task => {
            const checkbox = task.querySelector(".task-checkbox");
            checkbox.checked = false;
            task.classList.remove("completed");
            const taskText = task.querySelector("span").textContent;
            const taskKey = task.getAttribute("data-key");
            if (taskKey) {
                tasks[taskKey].completed = false;
                set(ref(database, `tasks/${taskKey}`), tasks[taskKey]);
                localStorage.setItem("tasks", JSON.stringify(tasks));
            }
        });
    });

    checkbox.addEventListener("change", function() {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });

    function addTaskToDOM(taskText, completed, key) {
        const li = document.createElement("li");
        li.setAttribute("data-key", key);

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
            tasks[key].completed = checkbox.checked;
            set(ref(database, `tasks/${key}`), tasks[key]);
            localStorage.setItem("tasks", JSON.stringify(tasks));
        });

        const taskTextEl = document.createElement("span");
        taskTextEl.textContent = taskText;

        const deleteBtn = document.createElement("img");
        deleteBtn.src = "images/delete.png";
        deleteBtn.alt = "delete button";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", function() {
            ulEl.removeChild(li);
            remove(ref(database, `tasks/${key}`));
            delete tasks[key];
            localStorage.setItem("tasks", JSON.stringify(tasks));
            toggleClearCompletedBtn();
        });

        li.appendChild(checkbox);
        li.appendChild(taskTextEl);
        li.appendChild(deleteBtn);
        ulEl.appendChild(li);
    }

    function toggleClearCompletedBtn() {
        if (Object.keys(tasks).length > 0) {
            clearCompletedBtn.style.display = "block";
        } else {
            clearCompletedBtn.style.display = "none";
        }
    }
});