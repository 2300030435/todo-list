document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const inputBox = document.getElementById('input-box');
    const prioritySelect = document.getElementById('priority-select');
    const dueDateInput = document.getElementById('due-date-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('list-container');
    const taskCounter = document.getElementById('task-counter');
    const filters = document.querySelector('.filters');

    // --- Application State ---
    let tasks = []; // Master list of all tasks
    let currentFilter = 'all'; // Can be 'all', 'active', or 'completed'

    // --- Main Functions ---

    /**
     * Renders the tasks to the DOM based on the current filter.
     */
    function renderTasks() {
        listContainer.innerHTML = ''; // Clear the existing list

        // Filter tasks based on the current filter
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });

        if (filteredTasks.length === 0) {
            listContainer.innerHTML = '<p class="no-tasks">No tasks here. Add one above!</p>';
        } else {
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.dataset.id = task.id;
                if (task.completed) {
                    li.classList.add('checked');
                }

                // Check if task is overdue
                if (task.dueDate && !task.completed) {
                    const today = new Date().setHours(0, 0, 0, 0);
                    const dueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                    if (dueDate < today) {
                        li.classList.add('overdue');
                    }
                }
                
                // Set the inner HTML for the task
                li.innerHTML = `
                    <div class="task-text">${task.text}</div>
                    <div class="task-details">
                        <span class="priority ${task.priority}">${task.priority}</span>
                        ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ''}
                    </div>
                    <span class="delete-btn">×</span>
                `;
                listContainer.appendChild(li);
            });
        }
        
        updateTaskCount();
        saveData();
    }

    /**
     * Adds a new task to the 'tasks' array.
     */
    function addTask() {
        const taskText = inputBox.value.trim();
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value,
            completed: false,
        };

        tasks.push(newTask);

        // Reset input fields
        inputBox.value = '';
        dueDateInput.value = '';
        prioritySelect.value = 'low';

        renderTasks();
    }

    /**
     * Handles clicks on the list container for toggling completion or deleting tasks.
     */
    function handleListClick(e) {
        const target = e.target;
        const li = target.closest('li');
        if (!li) return;

        const taskId = Number(li.dataset.id);

        if (target.classList.contains('delete-btn')) {
            // Delete task
            tasks = tasks.filter(task => task.id !== taskId);
        } else {
            // Toggle completion status
            const task = tasks.find(task => task.id === taskId);
            if (task) {
                task.completed = !task.completed;
            }
        }
        renderTasks();
    }

    /**
     * Handles double-clicks on a task to enable editing.
     */
    function handleListDoubleClick(e) {
        const taskTextElement = e.target.closest('.task-text');
        if (!taskTextElement) return;

        const li = taskTextElement.closest('li');
        const taskId = Number(li.dataset.id);
        const currentText = tasks.find(task => task.id === taskId).text;

        // Replace text with an input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        
        taskTextElement.replaceWith(input);
        input.focus();

        // Save on blur (clicking away)
        input.addEventListener('blur', () => {
            updateTaskText(taskId, input.value);
        });

        // Save on Enter key
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                input.blur(); // Trigger the blur event to save
            }
        });
    }

    /**
     * Updates the text of a specific task.
     */
    function updateTaskText(id, newText) {
        const task = tasks.find(task => task.id === id);
        if (task && newText.trim() !== '') {
            task.text = newText.trim();
        }
        renderTasks(); // Re-render to show the change
    }

    /**
     * Updates the task counter display.
     */
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    }

    /**
     * Handles filter button clicks.
     */
    function handleFilterClick(e) {
        if (e.target.tagName === 'SPAN') {
            currentFilter = e.target.id.replace('filter-', '');
            document.querySelectorAll('.filters span').forEach(span => span.classList.remove('active'));
            e.target.classList.add('active');
            renderTasks();
        }
    }

    // --- Utility and Data Persistence ---

    /**
     * Formats date for display (e.g., 'Dec 25').
     */
    function formatDate(dateString) {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    }
    
    /**
     * Saves the tasks array to localStorage.
     */
    function saveData() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    /**
     * Loads tasks from localStorage on page load.
     */
    function loadData() {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        renderTasks();
    }

    // --- Event Listeners ---
    addBtn.addEventListener('click', addTask);
    inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });
    listContainer.addEventListener('click', handleListClick);
    listContainer.addEventListener('dblclick', handleListDoubleClick);
    filters.addEventListener('click', handleFilterClick);
    
    // --- Initial Load ---
    loadData();
});