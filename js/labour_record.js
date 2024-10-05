// labour_record.js

function initLabourRecord() {
    const recordTableBody = document.querySelector('#record-table tbody');

    // Example API call to fetch user records
    fetch(`${apiUrl}/labour_records`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(records => {
        // Clear existing records
        recordTableBody.innerHTML = '';

        if (records.length === 0) {
            recordTableBody.innerHTML = '<tr><td colspan="5">No records found.</td></tr>';
            return;
        }

        // Populate the table with records
        records.forEach(record => {
            const tr = document.createElement('tr');

            const tdId = document.createElement('td');
            tdId.textContent = record.id;
            tr.appendChild(tdId);

            const tdJobTitle = document.createElement('td');
            tdJobTitle.textContent = record.job_title;
            tr.appendChild(tdJobTitle);

            const tdEmployer = document.createElement('td');
            tdEmployer.textContent = record.employer;
            tr.appendChild(tdEmployer);

            const tdStatus = document.createElement('td');
            tdStatus.textContent = record.status;
            tr.appendChild(tdStatus);

            const tdActions = document.createElement('td');
            // Example action buttons
            const viewBtn = document.createElement('button');
            viewBtn.textContent = 'View';
            viewBtn.classList.add('btn', 'btn-secondary');
            // Add event listeners for actions as needed
            tdActions.appendChild(viewBtn);

            tr.appendChild(tdActions);

            recordTableBody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Error fetching records:', error);
        recordTableBody.innerHTML = '<tr><td colspan="5">Error fetching records. Please try again later.</td></tr>';
    });
}
