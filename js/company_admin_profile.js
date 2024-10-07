/**
 * Initializes the Profile Tab Functionality
 */
function initProfile() {
    // Company Profile Elements
    const companyNameInput = document.getElementById('company-name');
    const companyAddressInput = document.getElementById('company-address');
    const companyCityInput = document.getElementById('company-city');
    const companyMobileInput = document.getElementById('company-mobile');

    // Admin Profile Elements
    const adminForm = document.getElementById('admin-profile-form');
    const adminNameInput = document.getElementById('admin-name');
    const adminMobileInput = document.getElementById('admin-mobile');
    const adminAddressInput = document.getElementById('admin-address');
    let adminCityInput = document.getElementById('admin-city'); // Changed to 'let' to allow reassignment
    const adminEmailInput = document.getElementById('admin-email');
    const adminPasswordInput = document.getElementById('admin-password');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let isEditing = false; // Flag to track if editing is in progress
    let cities = []; // Array to store cities

    // Get company_id from localStorage
    const companyId = localStorage.getItem('company_id');
    if (!companyId) {
        alert('Company ID not found in localStorage.');
        return;
    }

    // Get company_admin_id from localStorage
    const companyAdminId = localStorage.getItem('company_admin_id');
    if (!companyAdminId) {
        alert('Company Admin ID not found in localStorage.');
        return;
    }

    // Fetch company data from the API
    fetch(`${apiUrl}/company/${companyId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(companyData => {
            // Populate company form fields with data from the API
            companyNameInput.value = companyData.name;
            companyAddressInput.value = companyData.address;
            companyCityInput.value = companyData.city.name;
            companyMobileInput.value = companyData.mobile_number;

            // Check if the current admin is the main admin
            if (companyData.company_main_admin_id === companyAdminId) {
                // Fetch and display other admins
                fetchCompanyAdmins(companyId, companyAdminId);
            }
        })
        .catch(error => {
            console.error('Error fetching company data:', error);
            alert('Failed to load company data.');
        });

    // Fetch admin profile data from the API
    fetch(`${apiUrl}/company_admin/${companyAdminId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(adminProfile => {
            // Populate admin form fields with data from the API
            adminNameInput.value = adminProfile.name || '';
            adminMobileInput.value = adminProfile.mobile_number || '';
            adminAddressInput.value = adminProfile.address || '';
            adminCityInput.value = adminProfile.city.name || '';
            adminCityInput.setAttribute('data-city-id', adminProfile.city.city_id);
            adminEmailInput.value = adminProfile.email_id || '';
            adminPasswordInput.value = adminProfile.password || '';

            // Disable input fields initially
            setAdminFormEditable(false);
        })
        .catch(error => {
            console.error('Error fetching admin profile data:', error);
            alert('Failed to load admin profile data.');
        });

    // Handle Edit Profile button click
    editProfileBtn.addEventListener('click', function() {
        if (!isEditing) {
            // Start editing
            isEditing = true;
            setAdminFormEditable(true);
            editProfileBtn.textContent = 'Update Profile';
        } else {
            // Update profile
            const updatedAdminProfile = {
                company_admin_id: companyAdminId,
                name: adminNameInput.value,
                mobile_number: adminMobileInput.value,
                address: adminAddressInput.value,
                city_id: adminCityInput.value,
                email_id: adminEmailInput.value,
                password: adminPasswordInput.value,
                company_id: companyId
            };

            // Send updated admin profile data to the API
            fetch(`${apiUrl}/company_admin/${companyAdminId}`, {
                method: 'PUT', // Use 'PUT' or 'POST' depending on your API design
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedAdminProfile)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Admin profile updated successfully!');
                    // Optionally, update the form fields with any returned data
                    isEditing = false;
                    setAdminFormEditable(false);
                    editProfileBtn.textContent = 'Edit Profile';
                    // Update city name display
                    const selectedCity = cities.find(city => city.city_id == adminCityInput.value);
                    if (selectedCity) {
                        adminCityInput.setAttribute('data-city-id', selectedCity.city_id);
                        adminCityInput.value = selectedCity.name;
                    }
                })
                .catch(error => {
                    console.error('Error updating admin profile data:', error);
                    alert('Failed to update admin profile.');
                });
        }
    });

    // Handle Log Out button click
    logoutBtn.addEventListener('click', function() {
        // Clear localStorage and redirect to login page
        localStorage.clear();
        window.location.href = 'index.html'; // Adjust the path to your login page
    });

    /**
     * Sets the admin form fields to be editable or read-only
     * @param {boolean} editable 
     */
    function setAdminFormEditable(editable) {
        adminNameInput.readOnly = !editable;
        adminMobileInput.readOnly = !editable;
        adminAddressInput.readOnly = !editable;
        adminEmailInput.readOnly = !editable;
        adminPasswordInput.readOnly = !editable;

        if (editable) {
            // Replace city input with select box
            const citySelect = document.createElement('select');
            citySelect.id = 'admin-city';
            citySelect.className = adminCityInput.className; // Copy class names
            adminCityInput.parentNode.replaceChild(citySelect, adminCityInput);
            adminCityInput = citySelect;

            // Fetch cities and populate the city select box
            fetch(`${apiUrl}/cities`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch cities');
                    }
                    return response.json();
                })
                .then(data => {
                    cities = data;
                    populateCitySelect(adminCityInput, cities);
                    // Set the selected city
                    const currentCityId = adminCityInput.getAttribute('data-city-id');
                    if (currentCityId) {
                        adminCityInput.value = currentCityId;
                    }
                })
                .catch(error => {
                    console.error('Error fetching cities:', error);
                    alert('Failed to load cities.');
                });
        } else {
            // Replace city select with input
            const cityInput = document.createElement('input');
            cityInput.type = 'text';
            cityInput.id = 'admin-city';
            cityInput.readOnly = true;
            cityInput.className = adminCityInput.className; // Copy class names
            const selectedCity = cities.find(city => city.city_id == adminCityInput.value);
            if (selectedCity) {
                cityInput.value = selectedCity.name;
                cityInput.setAttribute('data-city-id', selectedCity.city_id);
            } else {
                cityInput.value = '';
                cityInput.setAttribute('data-city-id', '');
            }
            adminCityInput.parentNode.replaceChild(cityInput, adminCityInput);
            adminCityInput = cityInput;
        }
    }

    /**
     * Populates a select element with city options
     * @param {HTMLElement} selectElement 
     * @param {Array} cities 
     */
    function populateCitySelect(selectElement, cities) {
        selectElement.innerHTML = '';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.city_id;
            option.textContent = city.name;
            selectElement.appendChild(option);
        });
    }

    /**
     * Fetches and displays other company admins
     * @param {string} companyId 
     * @param {string} currentAdminId 
     */
    function fetchCompanyAdmins(companyId, currentAdminId) {
        fetch(`${apiUrl}/company_admins/${companyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch company admins');
                }
                return response.json();
            })
            .then(admins => {
                // Filter out the current admin
                const otherAdmins = admins.filter(admin => admin.company_admin_id !== currentAdminId);
                displayOtherAdmins(otherAdmins);
            })
            .catch(error => {
                console.error('Error fetching company admins:', error);
            });
    }

    /**
     * Displays other admins in a table
     * @param {Array} admins 
     */
    function displayOtherAdmins(admins) {
        const container = document.getElementById('other-admins-container');
        if (!container) return;

        if (admins.length === 0) {
            container.innerHTML = '<p>No other admins found.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('admin-table');

        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Name', 'Mobile Number', 'City', 'Action'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        admins.forEach(admin => {
            const row = document.createElement('tr');

            // Name
            const nameCell = document.createElement('td');
            nameCell.textContent = admin.name;
            row.appendChild(nameCell);

            // Mobile Number
            const mobileCell = document.createElement('td');
            mobileCell.textContent = admin.mobile_number;
            row.appendChild(mobileCell);

            // City
            const cityCell = document.createElement('td');
            cityCell.textContent = admin.city.name;
            row.appendChild(cityCell);

            // Action (Delete button)
            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-danger');
            deleteButton.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete admin ${admin.name}?`)) {
                    deleteCompanyAdmin(admin.company_admin_id)
                        .then(() => {
                            // Refresh the admin list
                            fetchCompanyAdmins(companyId, companyAdminId);
                        })
                        .catch(error => {
                            console.error('Error deleting admin:', error);
                            alert('Failed to delete admin.');
                        });
                }
            });
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.innerHTML = ''; // Clear previous content
        container.appendChild(table);
    }

    /**
     * Deletes a company admin
     * @param {string} adminId 
     * @returns {Promise}
     */
    function deleteCompanyAdmin(adminId) {
        return fetch(`${apiUrl}/company_admin/${adminId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete admin');
                }
                return response.json();
            });
    }
}
