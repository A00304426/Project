/**
 * Initializes the Home Tab Functionality
 */
function initHome() {
    console.log('Home tab initialized successfully!');

    // Define the API URL (adjust if necessary)
    window.apiUrl = 'http://localhost:8000';

    // Add event listener to the "Add Requirements" button
    const addRequirementsBtn = document.getElementById('add-requirements-btn');
    if (addRequirementsBtn) {
        addRequirementsBtn.addEventListener('click', openModal);
    } else {
        console.error('Add Requirements button not found');
    }

    // Initialize modal functionality
    initModal();

    // Populate time options in the select dropdowns
    populateTimeOptions();

    // Fetch and display existing company requirements
    fetchCompanyRequirements();
}

/**
 * Initializes Modal Functionality
 */
function initModal() {
    // Get modal elements
    const modal = document.getElementById('addRequirementModal');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('add-requirement-form');

    if (!modal || !closeBtn || !form) {
        console.error('Modal elements not found');
        return;
    }

    // Close modal when 'x' is clicked
    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function (event) {
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
    const company_requirement_id = generateUniqueId();

    // Retrieve company_id from localStorage
    const company_id = localStorage.getItem('company_id') || 'default_company_id'; // Fallback if not set

    // Create the requirement object
    const requirement = {
        company_requirement_id: company_requirement_id,
        company_id: company_id,
        select_labour: [], // Initially empty
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
        const response = await fetch(`${apiUrl}/add_company_requirements`, {
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
    const company_id = localStorage.getItem('company_id') || 'default_company_id';
    try {
        console.log(apiUrl);
        const response = await fetch(`${apiUrl}/company_requirements/${company_id}`);
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

        // Add "Active" and "Delete" buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        // Check if vacancies are filled
        const selectedCount = requirement.select_labour.filter(a => a.selected).length;
        const vacanciesFilled = selectedCount >= requirement.no_of_vacancies;

        // Active Button
        if (!vacanciesFilled) {
            const activeButton = document.createElement('button');
            activeButton.textContent = requirement.active ? 'Deactivate' : 'Activate';
            activeButton.classList.add('btn', 'btn-secondary');
            activeButton.addEventListener('click', () => {
                updateActiveStatus(requirement.company_requirement_id, !requirement.active)
                    .then(() => {
                        // Refresh the grid
                        fetchCompanyRequirements();
                    })
                    .catch(error => {
                        console.error('Error updating active status:', error);
                    });
            });
            buttonContainer.appendChild(activeButton);
        }

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this requirement?')) {
                deleteCompanyRequirement(requirement.company_requirement_id)
                    .then(() => {
                        fetchCompanyRequirements();
                    })
                    .catch(error => {
                        console.error('Error deleting requirement:', error);
                    });
            }
        });
        buttonContainer.appendChild(deleteButton);

        card.appendChild(buttonContainer);

        // Append the requirement card to the grid
        gridContainer.appendChild(card);

        // Create a container for applicants
        const applicantsContainer = document.createElement('div');
        applicantsContainer.classList.add('applicants-container');

        // Fetch applicants for the requirement
        fetchApplicants(requirement.company_requirement_id)
            .then(applicants => {
                requirement.select_labour = applicants; // Update select_labour for vacancy calculation
                const selectedCount = applicants.filter(a => a.selected).length;
                const vacanciesFilled = selectedCount >= requirement.no_of_vacancies;

                // If vacancies are filled, set the requirement to inactive
                if (vacanciesFilled && requirement.active) {
                    updateActiveStatus(requirement.company_requirement_id, false)
                        .then(() => {
                            requirement.active = false;
                            activeItem.querySelector('.value').textContent = 'No';
                            // Remove the active button if present
                            if (buttonContainer.contains(activeButton)) {
                                buttonContainer.removeChild(activeButton);
                                buttonContainer.style = 'block';
                            }
                        })
                        .catch(error => {
                            console.error('Error updating active status:', error);
                        });
                }

                // Display applicants
                if (applicants.length > 0) {
                    const applicantsHeading = document.createElement('h4');
                    applicantsHeading.textContent = 'Applicants:';
                    applicantsContainer.appendChild(applicantsHeading);

                    // Create a table to display applicants
                    const table = document.createElement('table');
                    table.classList.add('applicants-table');

                    // Create table header
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    const headers = ['Name', 'Mobile Number', 'City', 'Status'];
                    headers.forEach(headerText => {
                        const th = document.createElement('th');
                        th.textContent = headerText;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);

                    // Create table body
                    const tbody = document.createElement('tbody');

                    applicants.forEach(applicant => {
                        // Hide unselected applicants if vacancies are filled
                        if (vacanciesFilled && !applicant.selected) return;

                        const row = document.createElement('tr');

                        // Name
                        const nameCell = document.createElement('td');
                        nameCell.textContent = applicant.name;
                        nameCell.setAttribute('data-label', 'Name');
                        row.appendChild(nameCell);

                        // Mobile Number
                        const mobileCell = document.createElement('td');
                        mobileCell.textContent = applicant.mobile_number;
                        mobileCell.setAttribute('data-label', 'Mobile Number');
                        row.appendChild(mobileCell);

                        // City
                        const cityCell = document.createElement('td');
                        cityCell.textContent = applicant.city;
                        cityCell.setAttribute('data-label', 'City');
                        row.appendChild(cityCell);

                        // Status (Select/Deselect button)
                        const statusCell = document.createElement('td');
                        statusCell.setAttribute('data-label', 'Status');

                        if (applicant.selected) {
                            // Show status as "Selected"
                            const statusText = document.createElement('span');
                            statusText.textContent = 'Selected';
                            statusCell.appendChild(statusText);
                        } else {
                            // Select Button
                            if (!vacanciesFilled) {
                                const selectButton = document.createElement('button');
                                selectButton.textContent = 'Select';
                                selectButton.classList.add('btn', 'btn-primary');
                                selectButton.addEventListener('click', () => {
                                    updateSelection(requirement.company_requirement_id, applicant.labour_id, true)
                                        .then(() => {
                                            fetchCompanyRequirements();
                                        })
                                        .catch(error => {
                                            console.error('Error updating selection:', error);
                                        });
                                });
                                statusCell.appendChild(selectButton);
                            }
                        }

                        row.appendChild(statusCell);

                        tbody.appendChild(row);
                    });

                    table.appendChild(tbody);
                    applicantsContainer.appendChild(table);
                } else {
                    const noApplicantsMessage = document.createElement('p');
                    noApplicantsMessage.textContent = 'No applicants yet.';
                    applicantsContainer.appendChild(noApplicantsMessage);
                }
            })
            .catch(error => {
                console.error('Error fetching applicants:', error);
            });

        // Append the applicants container to the grid
        gridContainer.appendChild(applicantsContainer);
    });
}

/**
 * Fetches Applicants for a Given Company Requirement
 * @param {string} company_requirement_id 
 * @returns {Promise<Array>}
 */
function fetchApplicants(company_requirement_id) {
    return fetch(`${apiUrl}/company_requirement/${company_requirement_id}/applicants`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch applicants');
            }
            return response.json();
        });
}

/**
 * Updates the Active Status of a Company Requirement
 * @param {string} company_requirement_id 
 * @param {boolean} activeStatus 
 * @returns {Promise}
 */
function updateActiveStatus(company_requirement_id, activeStatus) {
    return fetch(`${apiUrl}/company_requirement/${company_requirement_id}/update_active_status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: activeStatus })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update active status');
            }
            return response.json();
        });
}

/**
 * Deletes a Company Requirement
 * @param {string} company_requirement_id 
 * @returns {Promise}
 */
function deleteCompanyRequirement(company_requirement_id) {
    return fetch(`${apiUrl}/company_requirement/${company_requirement_id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete company requirement');
            }
            return response.json();
        });
}

/**
 * Updates the Selection Status of a Labour Applicant
 * @param {string} company_requirement_id 
 * @param {string} labour_id 
 * @param {boolean} selected 
 * @returns {Promise}
 */
function updateSelection(company_requirement_id, labour_id, selected) {
    return fetch(`${apiUrl}/company_requirement/${company_requirement_id}/select_labour`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            labour_id: labour_id,
            selected: selected
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update selection');
            }
            return response.json();
        });
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
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

    if (startTimeSelect && endTimeSelect) {
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
    } else {
        console.error('Start Time or End Time select elements not found');
    }
}

/**
 * Generates an array of time strings in "HH:MM" format at 30-minute intervals.
 * @returns {string[]} Array of time strings.
 */
function generate30MinuteIntervals() {
    const times = [];
    for (let hour = 0; hour <= 23; hour++) {
        ['00', '30'].forEach(minute => {
            const formattedHour = hour.toString().padStart(2, '0');
            times.push(`${formattedHour}:${minute}`);
        });
    }
    // Add 24:00 as the last option
    times.push('24:00');
    return times;
}

// Initialize the home functionality when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    initHome();
});
