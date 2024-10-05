/**
 * Initializes the Home Tab Functionality
 */
function initHome() {
    console.log('Home tab initialized successfully!');
    
    // Add event listener to the "Add Requirements" button
    const addRequirementsBtn = document.getElementById('add-requirements-btn');
    if (addRequirementsBtn) {
        addRequirementsBtn.addEventListener('click', openModal);
    }
    
    // Initialize modal functionality
    initModal();

    // Populate time options in the select dropdowns
    populateTimeOptions();
    
    // Fetch and display existing company requirements
    fetchCompanyRequirements();
    
    // Add more interactive functionality as needed
}

/**
 * Initializes Modal Functionality
 */
function initModal() {
    // Get modal elements
    const modal = document.getElementById('addRequirementModal');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('add-requirement-form');

    // Close modal when 'x' is clicked
    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Opens the Add Requirement Modal
 */
function openModal() {
    const modal = document.getElementById('addRequirementModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Closes the Add Requirement Modal
 */
function closeModal() {
    const modal = document.getElementById('addRequirementModal');
    if (modal) {
        modal.style.display = 'none';
        // Optionally, reset the form after closing
        const form = document.getElementById('add-requirement-form');
        if (form) {
            form.reset();
            // Ensure the 'active' checkbox is selected by default
            const activeCheckbox = document.getElementById('active');
            if (activeCheckbox) {
                activeCheckbox.checked = true;
            }
            // Hide the time error message if visible
            const timeError = document.getElementById('time-error');
            if (timeError) {
                timeError.style.display = 'none';
            }
        }
    }
}

/**
 * Handles the Form Submission
 * @param {Event} event 
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const role = document.getElementById('role').value.trim();
    const no_of_vacancies = parseInt(document.getElementById('no_of_vacancies').value);
    const date = document.getElementById('date').value;
    const salary = parseInt(document.getElementById('salary').value);
    const start_time = document.getElementById('start_time').value;
    const end_time = document.getElementById('end_time').value;
    const active = document.getElementById('active').checked;

    // Validate time difference
    const isValidTime = validateTimeDifference(start_time, end_time);
    const timeError = document.getElementById('time-error');
    if (!isValidTime) {
        if (timeError) {
            timeError.style.display = 'block';
        }
        return; // Prevent form submission
    } else {
        if (timeError) {
            timeError.style.display = 'none';
        }
    }

    // Generate unique companyRequirementId (e.g., using current timestamp and a random number)
    const companyRequirementId = generateUniqueId();

    // Retrieve company_id from localStorage
    const company_id = localStorage.getItem('company_id') || 'default_company_id'; // Fallback if not set
    console.log('Company ID:', company_id);

    // Create the requirement object
    const requirement = {
        company_requirement_id: companyRequirementId,
        company_id: company_id,
        selected_employee: [], // Initially set to null
        no_of_vacancies: no_of_vacancies,
        date: date,
        start_time: start_time,
        end_time: end_time,
        role: role,
        salary: salary,
        active: active
    };

    // Log the requirement object
    console.log('New Company Requirement:', requirement);

    try {
        const response = await fetch('http://localhost:8000/add_company_requirements', { // Adjust the URL as needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requirement)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Requirement added successfully:', result);
            alert('Requirement added successfully!');
            closeModal();
            // Refresh the grid to include the new requirement
            fetchCompanyRequirements();
        } else {
            const error = await response.json();
            console.error('Error adding requirement:', error);
            alert('Failed to add requirement. Please try again.');
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('Network error. Please try again later.');
    }
}

/**
 * Fetches Company Requirements from the Backend and Populates the Grid
 */
async function fetchCompanyRequirements() {
    try {
        const response = await fetch(`${apiUrl}/company_requirements`); // Adjust the URL as needed
        if (response.ok) {
            const requirements = await response.json();
            populateRequirementsGrid(requirements);
        } else {
            console.error('Failed to fetch company requirements:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching company requirements:', error);
    }
}

/**
 * Populates the Requirements Grid with Data
 * @param {Array} requirements - Array of CompanyRequirements objects
 */
function populateRequirementsGrid(requirements) {
    const gridContainer = document.getElementById('requirements-grid');
    if (!gridContainer) return;

    // Clear existing grid items
    gridContainer.innerHTML = '';

    if (requirements.length === 0) {
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'No company requirements found.';
        noDataMessage.style.textAlign = 'center';
        noDataMessage.style.color = '#555555';
        gridContainer.appendChild(noDataMessage);
        return;
    }

    // Populate grid with requirement cards
    requirements.forEach(requirement => {
        const card = document.createElement('div');
        card.classList.add('requirement-card');

        // Role
        const roleItem = createRequirementItem('Role:', requirement.role);
        card.appendChild(roleItem);

        // Start Time
        const startTimeItem = createRequirementItem('Start Time:', formatTimeDisplay(requirement.start_time));
        card.appendChild(startTimeItem);

        // End Time
        const endTimeItem = createRequirementItem('End Time:', formatTimeDisplay(requirement.end_time));
        card.appendChild(endTimeItem);

        // Salary
        const salaryItem = createRequirementItem('Salary:', `$${requirement.salary.toLocaleString()}`);
        card.appendChild(salaryItem);

        // Date
        const dateItem = createRequirementItem('Date:', formatDateDisplay(requirement.date));
        card.appendChild(dateItem);

        // No. of Vacancies
        const vacanciesItem = createRequirementItem('No. of Vacancies:', requirement.no_of_vacancies);
        card.appendChild(vacanciesItem);

        // Active
        const activeItem = createRequirementItem('Active:', requirement.active ? 'Yes' : 'No');
        card.appendChild(activeItem);

        gridContainer.appendChild(card);

        const superCard = document.createElement('div');
        superCard.classList.add('requirement-card');

        gridContainer.appendChild(superCard).appendChild(document.createElement('div').appendChild(createRequirementItem('Selected Employee:', 'Select Employee'))); // Add a dummy element for better spacing
    });
    // gridContainer.appendChild(document.createElement('div').appendChild(createRequirementItem('ABC','XYZ'))); // Add a dummy element for better spacing

}

/**
 * Creates a Requirement Item Element
 * @param {string} label - The label text
 * @param {string} value - The value text
 * @returns {HTMLElement} - The requirement item element
 */
function createRequirementItem(label, value) {
    const item = document.createElement('div');
    item.classList.add('requirement-item');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('label');
    labelSpan.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.classList.add('value');
    valueSpan.textContent = value;

    item.appendChild(labelSpan);
    item.appendChild(valueSpan);

    return item;
}

/**
 * Formats time strings for display (e.g., "08:00" to "8:00 AM").
 * @param {string} time - Time string in "HH:MM" format.
 * @returns {string} Formatted time string.
 */
function formatTimeDisplay(time) {
    if (!time) return '';
    let [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Formats date strings for display (e.g., "2023-10-15" to "October 15, 2023").
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format.
 * @returns {string} Formatted date string.
 */
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString(undefined, options);
}

/**
 * Generates a Unique ID for Company Requirement
 * @returns {string} Unique ID
 */
function generateUniqueId() {
    // Simple unique ID generator using current timestamp and a random number
    const timestamp = Date.now(); // milliseconds since epoch
    const randomNum = Math.floor(Math.random() * 1000); // random number between 0-999
    return `CR-${timestamp}-${randomNum}`;
}

/**
 * Validates that end_time is at least 30 minutes after start_time
 * @param {string} startTime - Format "HH:MM"
 * @param {string} endTime - Format "HH:MM"
 * @returns {boolean} - True if valid, false otherwise
 */
function validateTimeDifference(startTime, endTime) {
    if (!startTime || !endTime) return false;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    return (endTotalMinutes - startTotalMinutes) >= 30;
}

/**
 * Populates the Start Time and End Time dropdowns with 30-minute intervals.
 */
function populateTimeOptions() {
    const startTimeSelect = document.getElementById('start_time');
    const endTimeSelect = document.getElementById('end_time');

    // Check if the elements are select elements
    if (startTimeSelect.tagName.toLowerCase() === 'select' && endTimeSelect.tagName.toLowerCase() === 'select') {
        const times = generate30MinuteIntervals();

        // Populate Start Time Select
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = formatTimeDisplay(time);
            startTimeSelect.appendChild(option.cloneNode(true));
        });

        // Populate End Time Select
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = formatTimeDisplay(time);
            endTimeSelect.appendChild(option.cloneNode(true));
        });
    }
}

/**
 * Generates an array of time strings in "HH:MM" format at 30-minute intervals.
 * @returns {string[]} Array of time strings.
 */
function generate30MinuteIntervals() {
    const times = [];
    for (let hour = 0; hour <= 24; hour++) {
        ['00', '30'].forEach(minute => {
            // Prevent "24:30" as it's not a valid time
            if (hour === 24 && minute !== '00') return;
            const formattedHour = hour.toString().padStart(2, '0');
            times.push(`${formattedHour}:${minute}`);
        });
    }
    return times;
}

// Export the initHome function to make it accessible globally
window.initHome = initHome;
