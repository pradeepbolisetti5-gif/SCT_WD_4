let tasks = JSON.parse(localStorage.getItem('tasks_final_version')) || [];
let currentFilter = 'all';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskFrequencySelect = document.getElementById('taskFrequencySelect');
const taskTypeSelect = document.getElementById('taskTypeSelect');
const taskDateTime = document.getElementById('taskDateTime');
const submitBtn = document.getElementById('submitBtn');
const editingTaskId = document.getElementById('editingTaskId');
const taskListContainer = document.getElementById('taskListContainer');

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    const frequency = taskFrequencySelect.value;
    const taskType = taskTypeSelect.value;
    const datetime = taskDateTime.value;
    const id = editingTaskId.value;

    if(!text) return;

    if (id) {
        tasks = tasks.map(task => task.id == id ? { ...task, text, frequency, taskType, datetime } : task);
        submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Task`;
        editingTaskId.value = '';
    } else {
        const newTask = {
            id: Date.now(),
            text,
            frequency,
            taskType,
            datetime,
            completed: false
        };
        tasks.push(newTask);
    }

    saveAndRender();
    taskForm.reset();
});

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function toggleComplete(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveAndRender();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    taskInput.value = task.text;
    taskFrequencySelect.value = task.frequency;
    taskTypeSelect.value = task.taskType;
    taskDateTime.value = task.datetime || '';
    editingTaskId.value = task.id;

    submitBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Update Task`;
    taskInput.focus();
}

function filterTasks(filterValue) {
    currentFilter = filterValue;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const text = btn.textContent.trim();
        btn.classList.toggle('active', 
            text.toLowerCase() === filterValue.toLowerCase() || 
            (filterValue === 'all' && text === 'All Tasks')
        );
    });
    renderTasks();
}

function saveAndRender() {
    localStorage.setItem('tasks_final_version', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskListContainer.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        return task.frequency.toLowerCase() === currentFilter.toLowerCase() || 
               task.taskType.toLowerCase() === currentFilter.toLowerCase();
    });

    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-shapes"></i>
                No active context parameters match this filter layer.
            </div>`;
        return;
    }

    filteredTasks.forEach(task => {
        const formattedDate = task.datetime ? new Date(task.datetime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';

        const freqIcon = task.frequency === 'Every Day' ? 'fa-solid fa-arrows-spin' : 
                         task.frequency === 'Weekly' ? 'fa-solid fa-calendar-week' :
                         task.frequency === 'Monthly' ? 'fa-solid fa-calendar-days' : 
                         'fa-regular fa-calendar-check';

        const typeIcon = task.taskType === 'Work' ? 'fa-solid fa-briefcase' : 
                         task.taskType === 'Shopping' ? 'fa-solid fa-cart-shopping' : 
                         'fa-solid fa-paperclip';

        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-left">
                <label class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${task.id})">
                    <span class="checkmark"></span>
                </label>
                <div class="task-details">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <div class="task-meta">
                        <span class="task-badge-tag tag-frequency">
                            <i class="${freqIcon}"></i> ${task.frequency}
                        </span>
                        <span class="task-badge-tag tag-type">
                            <i class="${typeIcon}"></i> ${task.taskType}
                        </span>
                        ${formattedDate ? `<span class="task-date"><i class="fa-regular fa-clock"></i> ${formattedDate}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit" onclick="editTask(${task.id})" title="Edit Task"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})" title="Delete Task"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        taskListContainer.appendChild(taskElement);
    });
}

renderTasks();
