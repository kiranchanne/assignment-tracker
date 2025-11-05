// ===== DOM Elements =====
const form = document.getElementById('assignmentForm');
const tableBody = document.getElementById('assignmentTableBody');
const courseInput = document.getElementById('courseInput');
const courseList = document.getElementById('courseList');
const semesterInput = document.getElementById('semesterInput');
const studentName = document.getElementById('studentName');
const newCourseInput = document.getElementById('newCourseInput');
const addCourseBtn = document.getElementById('addCourseBtn');
const courseListTop = document.getElementById('courseListTop');
const coursesSection = document.querySelector('.courses-section');
const completeAssignmentsBody = document.getElementById('completeAssignmentsBody');
const toggleCompletedBtn = document.getElementById('toggleCompleted');
const completedTable = document.getElementById('completeAssignments');

const courses = []; // master list of courses

// JavaScript
flatpickr("#dueDate", {
    dateFormat: "Y-m-d", // matches placeholder
    allowInput: true      // allows typing manually
});

// ===== Helper: Save all assignments to localStorage =====
function saveAssignments() {
    const rows = tableBody.querySelectorAll('tr');
    const completedRows = completeAssignmentsBody.querySelectorAll('tr');
    const assignmentsData = [];

    const processRow = row => {
        const cells = row.querySelectorAll('td');
        const statusSelect = row.querySelector('select');

        assignmentsData.push({
            title: cells[0].childNodes[0].textContent, // removes delete button text
            course: cells[1].textContent,
            dueDate: cells[2].textContent,
            weight: cells[3].textContent,
            status: statusSelect.value
        });
    };

    rows.forEach(processRow);
    completedRows.forEach(processRow);

    localStorage.setItem('assignments', JSON.stringify(assignmentsData));
}

// ===== Helper: Build a row (used for new or loaded assignments) =====
function buildRow(data) {
    const row = document.createElement('tr');

    const titleCell = document.createElement('td');
    titleCell.textContent = data.title;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    Object.assign(deleteBtn.style, {
        marginLeft: '10px',
        background: 'transparent',
        border: 'none',
        color: '#cfcfcf',
        cursor: 'pointer',
        fontWeight: 'bold'
    });
    deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        row.remove();
        saveAssignments();
    });
    titleCell.appendChild(deleteBtn);

    const courseCell = document.createElement('td');
    courseCell.textContent = data.course;
    const dueDateCell = document.createElement('td');
    dueDateCell.textContent = data.dueDate;
    const weightCell = document.createElement('td');
    weightCell.textContent = data.weight;

    const statusCell = document.createElement('td');
    const statusSelect = document.createElement('select');
    ["Not Started", "In Progress", "Completed"].forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (status === data.status) option.selected = true;
        statusSelect.appendChild(option);
    });
    statusSelect.classList.add(
        data.status === "Completed" ? 'select-completed' :
        data.status === "In Progress" ? 'select-in-progress' :
        'select-not-started'
    );

    statusSelect.addEventListener('change', function() {
        statusSelect.classList.remove('select-not-started', 'select-in-progress', 'select-completed');

        if (statusSelect.value === "Not Started") {
            statusSelect.classList.add('select-not-started');
            if (row.parentElement === completeAssignmentsBody) {
                row.remove();
                tableBody.appendChild(row);
            }
        } else if (statusSelect.value === "In Progress") {
            statusSelect.classList.add('select-in-progress');
            if (row.parentElement === completeAssignmentsBody) {
                row.remove();
                tableBody.appendChild(row);
            }
        } else if (statusSelect.value === "Completed") {
            statusSelect.classList.add('select-completed');
            if (row.parentElement !== completeAssignmentsBody) {
                row.remove();
                completeAssignmentsBody.appendChild(row);
            }
        }

        saveAssignments();
    });

    statusCell.appendChild(statusSelect);
    row.append(titleCell, courseCell, dueDateCell, weightCell, statusCell);

    // Append to correct table
    if (data.status === "Completed") {
        completeAssignmentsBody.appendChild(row);
    } else {
        tableBody.appendChild(row);
    }
}

// ===== Load assignments from localStorage on page load =====
window.addEventListener('DOMContentLoaded', () => {
    const stored = JSON.parse(localStorage.getItem('assignments')) || [];
    stored.forEach(buildRow);
});

// ===== Double click resize section =====
coursesSection.addEventListener('dblclick', (e) => {
    const rect = coursesSection.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX > rect.width - 25 && clickY > rect.height - 25) {
        coursesSection.style.height = "fit-content";
    }
});

// ===== Save semester on Enter =====
semesterInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        semesterInput.blur();
        alert('Semester set to: ' + semesterInput.value);
        studentName.focus();
    }
});

// ===== Save student name on Enter =====
studentName.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        studentName.blur();
        document.getElementById('title').focus();
    }
});

// ===== Add course function =====
function addCourse() {
    const courseName = newCourseInput.value.trim();
    if (!courseName || courses.includes(courseName)) return;

    courses.push(courseName);

    const li = document.createElement('li');
    li.textContent = courseName;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'X';
    delBtn.style.marginLeft = '5px';
    delBtn.addEventListener('click', () => {
        li.remove();
        const index = courses.indexOf(courseName);
        if (index > -1) courses.splice(index, 1);
        updateDatalist();
    });

    li.appendChild(delBtn);
    courseListTop.appendChild(li);
    updateDatalist();

    newCourseInput.value = "";
    newCourseInput.focus();
}

// ===== Update datalist =====
function updateDatalist() {
    // Clear all options except the first (placeholder)
    courseInput.innerHTML = '<option value="" disabled selected hidden>Choose a course</option>';

    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseInput.appendChild(option);
    });

    // Reset select to placeholder
    courseInput.value = "";
}

courseInput.addEventListener('keydown', function(e) {
    if (e.key === "Backspace") {
        e.preventDefault(); // prevent default deletion
        this.value = "";     // reset to placeholder
    }
});

// ===== Add course listeners =====
addCourseBtn.addEventListener('click', addCourse);
newCourseInput.addEventListener('keydown', function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addCourse();
    }
});

// ===== Handle form submission =====
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const course = courseInput.value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const weight = document.getElementById('weight').value.trim();

    if (!title || !course || !dueDate) {
        alert("Please fill in all required fields.");
        return;
    }

    // Build row using helper
    buildRow({
        title: title,
        course: course,
        dueDate: dueDate,
        weight: weight,
        status: "Not Started"
    });

    saveAssignments(); // save after adding

    form.reset();
});

// ===== Toggle Completed Section =====
toggleCompletedBtn.addEventListener('click', function() {
    if (completedTable.style.display === "none") {
        completedTable.style.display = "table";
        this.textContent = "−";
    } else {
        completedTable.style.display = "none";
        this.textContent = "+";
    }
});
