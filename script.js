// Initial student list (default if nothing in localStorage)
const defaultStudents = [
    "陳小明", "林美玲", "張大為", "李佳穎", "王志強", 
    "吳淑惠", "劉育廷", "蔡雅雯", "楊家豪", "黃詩涵",
    "趙子龍", "孫悟空", "周杰倫", "蔡依林", "林俊傑"
];

// Data Structure: allClasses = { "班級一": [...], "班級二": [...] }
let allClasses = JSON.parse(localStorage.getItem('allClassLists')) || { "預設班級": [...defaultStudents] };
let currentClassName = localStorage.getItem('lastActiveClassName') || Object.keys(allClasses)[0];

let initialStudents = [...allClasses[currentClassName]];
let availableStudents = [...initialStudents];
let pickedStudents = [];
let timer = null;
let currentStudent = "";

// DOM Elements
const nameDisplay = document.getElementById('name-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const editListBtn = document.getElementById('edit-list-btn');
const pickedList = document.getElementById('picked-list');
const pickedCount = document.getElementById('picked-count');
const currentClassBadge = document.getElementById('current-class-badge');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const classNameInput = document.getElementById('class-name-input');
const editTextarea = document.getElementById('edit-textarea');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveEditBtn = document.getElementById('save-edit');
const deleteClassBtn = document.getElementById('delete-class-btn');
const savedClassesList = document.getElementById('saved-classes-list');

/**
 * Initialize UI
 */
function init() {
    updateBadge();
    renderSavedClasses();
}

function updateBadge() {
    currentClassBadge.textContent = currentClassName;
}

/**
 * Start the randomization process
 */
function startPicking() {
    if (availableStudents.length === 0) {
        alert("名單已空！請重置名單。");
        return;
    }

    startBtn.disabled = true;
    stopBtn.disabled = false;
    nameDisplay.classList.add('spinning');

    const firstIndex = Math.floor(Math.random() * availableStudents.length);
    currentStudent = availableStudents[firstIndex];
    displayName(currentStudent);

    timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        currentStudent = availableStudents[randomIndex];
        displayName(currentStudent);
    }, 50);
}

/**
 * Update display and adjust font size
 */
function displayName(name) {
    nameDisplay.textContent = name;
    
    // Dynamically adjust font size for long names
    if (name.length > 5) {
        nameDisplay.style.fontSize = "clamp(1.5rem, 7vw, 2.5rem)";
    } else if (name.length >= 3) {
        nameDisplay.style.fontSize = "clamp(2rem, 10vw, 4rem)";
    } else {
        nameDisplay.style.fontSize = ""; // Reset to CSS default
    }
}

/**
 * Stop the randomization and pick a winner
 */
function stopPicking() {
    clearInterval(timer);
    timer = null;

    startBtn.disabled = false;
    stopBtn.disabled = true;
    nameDisplay.classList.remove('spinning');

    const index = availableStudents.indexOf(currentStudent);
    if (index > -1) {
        availableStudents.splice(index, 1);
        pickedStudents.push(currentStudent);
        updatePickedUI(currentStudent);
    }

    triggerSuccessEffect();
}

function updatePickedUI(name) {
    const li = document.createElement('li');
    li.textContent = name;
    pickedList.prepend(li);
    pickedCount.textContent = pickedStudents.length;
}

function resetList() {
    if (confirm(`確定要重置 [${currentClassName}] 的名單嗎？所有抽過的紀錄將會清除。`)) {
        availableStudents = [...initialStudents];
        pickedStudents = [];
        pickedList.innerHTML = "";
        pickedCount.textContent = "0";
        nameDisplay.textContent = "點擊開始";
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

/**
 * Class Management Modal Logic
 */
function openEditModal() {
    classNameInput.value = currentClassName;
    editTextarea.value = initialStudents.join('\n');
    renderSavedClasses();
    modalOverlay.classList.add('active');
}

function closeEditModal() {
    modalOverlay.classList.remove('active');
}

function renderSavedClasses() {
    savedClassesList.innerHTML = "";
    Object.keys(allClasses).forEach(name => {
        const div = document.createElement('div');
        div.className = `class-item ${name === currentClassName ? 'active' : ''}`;
        div.textContent = name;
        div.addEventListener('click', () => loadClass(name));
        savedClassesList.appendChild(div);
    });
}

function loadClass(name) {
    currentClassName = name;
    initialStudents = [...allClasses[name]];
    
    // Save state
    localStorage.setItem('lastActiveClassName', currentClassName);
    
    // Reset picker state
    availableStudents = [...initialStudents];
    pickedStudents = [];
    pickedList.innerHTML = "";
    pickedCount.textContent = "0";
    displayName("已載入 " + name);
    
    updateBadge();
    
    // Update modal inputs
    classNameInput.value = name;
    editTextarea.value = initialStudents.join('\n');
    renderSavedClasses();
}

function saveCurrentClass() {
    const name = classNameInput.value.trim();
    const content = editTextarea.value.trim();

    if (!name || !content) {
        alert("請填寫班級名稱與名單。");
        return;
    }

    const newNames = content.split('\n').map(n => n.trim()).filter(n => n !== "");
    if (newNames.length === 0) {
        alert("請輸入有效的名單。");
        return;
    }

    // Update data
    allClasses[name] = newNames;
    currentClassName = name;
    initialStudents = [...newNames];
    
    // Persist
    localStorage.setItem('allClassLists', JSON.stringify(allClasses));
    localStorage.setItem('lastActiveClassName', currentClassName);
    
    // Reset UI
    loadClass(name);
    closeEditModal();
}

function deleteCurrentClass() {
    const name = classNameInput.value.trim();
    if (Object.keys(allClasses).length <= 1) {
        alert("至少需要保留一個班級。");
        return;
    }

    if (confirm(`確定要刪除 [${name}] 嗎？此操作無法復原。`)) {
        delete allClasses[name];
        localStorage.setItem('allClassLists', JSON.stringify(allClasses));
        
        // Load the first available class
        loadClass(Object.keys(allClasses)[0]);
    }
}

function triggerSuccessEffect() {
    nameDisplay.style.transform = "scale(1.2)";
    setTimeout(() => {
        nameDisplay.style.transform = "scale(1)";
    }, 200);
}

// Event Listeners
startBtn.addEventListener('click', startPicking);
stopBtn.addEventListener('click', stopPicking);
resetBtn.addEventListener('click', resetList);

editListBtn.addEventListener('click', openEditModal);
closeModalBtn.addEventListener('click', closeEditModal);
saveEditBtn.addEventListener('click', saveCurrentClass);
deleteClassBtn.addEventListener('click', deleteCurrentClass);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (!startBtn.disabled) {
            startPicking();
        } else if (!stopBtn.disabled) {
            stopPicking();
        }
    }
});

// Initialize
init();
