function initLabourRecord() {
    const apiUrl = 'http://127.0.0.1:8000'; // Update with your actual API URL
    const labour_id = localStorage.getItem('labour_id') || 'default_labour_id'; // Fallback if not set
    const recordTableBody = document.querySelector('#record-table tbody');

    // Function to fetch labour records
    function fetchLabourRecords() {
        fetch(`${apiUrl}/labour_records/${labour_id}`, {
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
                const noRecordsRow = document.createElement('tr');
                const noRecordsCell = document.createElement('td');
                noRecordsCell.colSpan = 6;
                noRecordsCell.classList.add('no-records');
                noRecordsCell.textContent = 'No records found.';
                noRecordsRow.appendChild(noRecordsCell);
                recordTableBody.appendChild(noRecordsRow);
                return;
            }

            // Populate the table with records
            records.forEach(record => {
                const tr = document.createElement('tr');

                // Company Name
                const tdCompanyName = document.createElement('td');
                tdCompanyName.textContent = record.company_name;
                tr.appendChild(tdCompanyName);

                // Address
                const tdAddress = document.createElement('td');
                tdAddress.textContent = record.address;
                tr.appendChild(tdAddress);

                // Role
                const tdRole = document.createElement('td');
                tdRole.textContent = record.role;
                tr.appendChild(tdRole);

                // Date
                const tdDate = document.createElement('td');
                tdDate.textContent = record.date;
                tr.appendChild(tdDate);

                // Comments
                const tdComments = document.createElement('td');
                tdComments.textContent = record.comments || '-';
                tr.appendChild(tdComments);

                // Rating
                const tdRating = document.createElement('td');
                tdRating.textContent = record.rating !== null ? record.rating : '-';
                tr.appendChild(tdRating);

                recordTableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching records:', error);
            recordTableBody.innerHTML = '<tr><td colspan="6">Error fetching records. Please try again later.</td></tr>';
        });
    }

    // Initial fetch of labour records
    fetchLabourRecords();
}

// Initialize the labour record screen
initLabourRecord();
