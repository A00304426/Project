const apiUrl = "http://127.0.0.1:8000"; // Update with your FastAPI server URL

document.addEventListener('DOMContentLoaded', function () {
    // Fetch cities from the API and populate the city select box
    fetch(`${apiUrl}/cities`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(cities => {
        const citySelect = document.getElementById('city');
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = JSON.stringify(city);
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching cities:', error);
        alert('Failed to load cities. Please try again later.');
    });

    const createCompanyBtn = document.getElementById('create-company-btn');
    const popup = document.getElementById('company-form-popup');
    const closePopup = document.getElementById('close-popup');
    const form = document.getElementById('company-form');

    // Show the popup when the "Create New Company" button is clicked
    createCompanyBtn.addEventListener('click', function () {
        popup.classList.remove('hidden');
    });

    // Close the popup when the close icon is clicked
    closePopup.addEventListener('click', function () {
        popup.classList.add('hidden');
    });

    // Handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the company admin ID from localStorage
        const companyAdminId = localStorage.getItem('company_admin_id');

        if (!companyAdminId) {
            alert('Error: Company Admin ID not found.');
            return;
        }

        const citySelect = document.getElementById('city');
        const selectedCityIndex = citySelect.selectedIndex;
        const selectedCityOption = citySelect.options[selectedCityIndex];
        const city = JSON.parse(selectedCityOption.value);

        const companyData = {
            company_id: Math.random().toString(36).substr(2, 9),  // Generate a random company ID
            name: document.getElementById('company_name').value,
            address: document.getElementById('company_address').value,
            mobile_number: document.getElementById('company_mobile_number').value,
            city: city,
            company_main_admin_id: companyAdminId
        };

        // Send the form data to the backend API
        fetch(`${apiUrl}/add_company`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(companyData)
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            alert('Company created successfully!');
            localStorage.setItem('company_id', data.company_id);

            // Now modify the company admin with the new company_id
            return fetch(`${apiUrl}/modify_company_admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // The company object returned from the add_company API
            });
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(modifiedAdminData => {
            console.log('Company Admin modified successfully:', modifiedAdminData);
            alert('Company Admin updated with the new company ID!');
            popup.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error updating Company Admin:', error);
            alert('Failed to update company admin. Please try again later.');
        });
    });
});
