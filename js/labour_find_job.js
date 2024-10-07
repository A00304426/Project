function initFindingJob() {
    const locationSearchForm = document.getElementById('location-search-form');
    const searchResults = document.getElementById('search-results');
    const locationSelect = document.getElementById('location');

    // Move labour_id declaration here
    const labour_id = localStorage.getItem('labour_id') || 'default_labour_id'; // Fallback if not set

    // Function to fetch and populate cities in the select dropdown
    function populateCities() {
        fetch(`${apiUrl}/cities`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch cities: ${response.status}`);
                }
                return response.json();
            })
            .then(cities => {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.city_id; // Using city_id as the value
                    option.textContent = city.name;
                    locationSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching cities:', error);
                alert('Failed to load cities. Please try again later.');
            });
    }

    // Call the function to populate cities when the tab is initialized
    populateCities();

    // Handle form submission to search for jobs based on selected city
    locationSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCityId = locationSelect.value;

        if (!selectedCityId) {
            alert('Please select a location.');
            return;
        }

        // Clear previous results and show a loading message
        searchResults.innerHTML = '<p>Searching for jobs...</p>';

        // Remove labour_id declaration here
        // const labour_id = localStorage.getItem('labour_id') || 'default_labour_id'; // Fallback if not set

        console.log('labour_id:', labour_id);
        // API call to search for jobs by city_id and labour_id
        fetch(`${apiUrl}/get_labour_jobs/${selectedCityId}/${labour_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(jobs => {
                // Clear previous results
                searchResults.innerHTML = '';

                // Initialize arrays for the three categories
                const applyJobs = [];
                const appliedJobs = [];
                const selectedJobs = [];

                // Categorize the jobs
                jobs.forEach(job => {
                    if (job.status === 'Apply') {
                        applyJobs.push(job);
                    } else if (job.status === 'Applied') {
                        appliedJobs.push(job);
                    } else if (job.status === 'Selected') {
                        selectedJobs.push(job);
                    }
                });

                // Create the tables
                createTable(applyJobs, 'Available Jobs', false, true, true);
                createTable(appliedJobs, 'Applied Jobs', true, true, false);
                createTable(selectedJobs, 'Selected Jobs', true, false, false);
            })
            .catch(error => {
                console.error('Error searching jobs:', error);
                searchResults.innerHTML = '<p>Error searching for jobs. Please try again later.</p>';
            });
    });

    // Function to create a table
    function createTable(jobsArray, tableTitle, showRole, showAction, showNoJobsMessage) {
        if (jobsArray.length === 0 && !showNoJobsMessage) {
            // If no jobs and no message to show, return without creating the table
            return;
        }

        // Create title
        const title = document.createElement('h3');
        title.textContent = tableTitle;
        searchResults.appendChild(title);

        // Create the table
        const table = document.createElement('table');
        table.classList.add('job-table');

        // Create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = ['Company Name', 'Company Address', 'City', 'Date', 'Start Time', 'End Time', 'Salary'];
        if (showRole) {
            headers.push('Role');
        }
        if (showAction) {
            headers.push('Actions');
        }

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');

        if (jobsArray.length === 0 && showNoJobsMessage) {
            // If no jobs, display a row with "No Available Jobs"
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = 'No Available Jobs';
            cell.colSpan = headers.length;
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tbody.appendChild(row);
        } else {
            jobsArray.forEach(job => {
                const row = document.createElement('tr');

                // Company Name
                const companyNameCell = document.createElement('td');
                companyNameCell.textContent = job.company_name;
                row.appendChild(companyNameCell);

                // Company Address
                const companyAddressCell = document.createElement('td');
                companyAddressCell.textContent = job.company_address;
                row.appendChild(companyAddressCell);

                // City
                const cityCell = document.createElement('td');
                cityCell.textContent = job.city_name;
                row.appendChild(cityCell);

                // Date
                const dateCell = document.createElement('td');
                dateCell.textContent = job.date;
                row.appendChild(dateCell);

                // Start Time
                const startTimeCell = document.createElement('td');
                startTimeCell.textContent = job.start_time;
                row.appendChild(startTimeCell);

                // End Time
                const endTimeCell = document.createElement('td');
                endTimeCell.textContent = job.end_time;
                row.appendChild(endTimeCell);

                // Salary
                const salaryCell = document.createElement('td');
                salaryCell.textContent = `$${job.salary}`;
                row.appendChild(salaryCell);

                if (showRole) {
                    // Role
                    const roleCell = document.createElement('td');
                    roleCell.textContent = job.role;
                    row.appendChild(roleCell);
                }

                if (showAction) {
                    // Actions
                    const actionsCell = document.createElement('td');
                    const actionButton = document.createElement('button');

                    if (job.status === 'Apply') {
                        actionButton.textContent = 'Apply';
                        actionButton.classList.add('btn', 'btn-primary');
                        actionButton.addEventListener('click', () => {
                            // Handle apply action
                            applyForJob(job.company_requirement_id, labour_id);
                        });
                    } else if (job.status === 'Applied') {
                        actionButton.textContent = 'Cancel';
                        actionButton.classList.add('btn', 'btn-secondary');
                        // Check if the job can be cancelled (more than 6 hours before start_time)
                        const canCancel = canCancelJob(job.date, job.start_time);
                        if (canCancel) {
                            actionButton.addEventListener('click', () => {
                                // Handle cancel action
                                cancelJobApplication(job.company_requirement_id, labour_id);
                            });
                        } else {
                            actionButton.disabled = true;
                            actionButton.title = 'Cannot cancel less than 6 hours before job start time';
                        }
                    }

                    actionsCell.appendChild(actionButton);
                    row.appendChild(actionsCell);
                }

                tbody.appendChild(row);
            });
        }

        table.appendChild(tbody);
        searchResults.appendChild(table);
    }

    // Function to apply for a job
    function applyForJob(companyRequirementId, labourId) {
        fetch(`${apiUrl}/apply_job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                labour_id: labourId,
                company_requirement_id: companyRequirementId
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to apply for the job');
                }
                return response.json();
            })
            .then(data => {
                alert('Applied for the job successfully');
                // Refresh the job listings
                locationSearchForm.dispatchEvent(new Event('submit'));
            })
            .catch(error => {
                console.error('Error applying for job:', error);
                alert('Error applying for the job. Please try again later.');
            });
    }

    // Function to cancel a job application
    function cancelJobApplication(companyRequirementId, labourId) {
        fetch(`${apiUrl}/cancel_job_application`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                labour_id: labourId,
                company_requirement_id: companyRequirementId
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to cancel the job application');
                }
                return response.json();
            })
            .then(data => {
                alert('Cancelled the job application successfully');
                // Refresh the job listings
                locationSearchForm.dispatchEvent(new Event('submit'));
            })
            .catch(error => {
                console.error('Error cancelling job application:', error);
                alert('Error cancelling the job application. Please try again later.');
            });
    }

    // Function to check if the job can be cancelled (more than 6 hours before start_time)
    function canCancelJob(jobDate, jobStartTime) {
        const jobDateTime = new Date(`${jobDate}T${jobStartTime}`);
        const now = new Date();
        const diff = jobDateTime - now;
        const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
        return diff > sixHours;
    }
}
