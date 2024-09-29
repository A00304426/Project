/**
 * Initializes the Profile Tab Functionality
 */
function initProfile() {
    // Company Profile Elements
    const companyNameInput = document.getElementById('company-name');
    const companyAddressInput = document.getElementById('company-address');
    const companyCityInput = document.getElementById('company-city');
    const companyMobileInput = document.getElementById('company-mobile');

    // Get company_id from localStorage
    const companyId = localStorage.getItem('company_id');
    if (!companyId) {
        alert('Company ID not found in localStorage.');
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
        })
        .catch(error => {
            console.error('Error fetching company data:', error);
            alert('Failed to load company data.');
        });

    // Agent Profile Elements
    const agentForm = document.getElementById('agent-profile-form');
    const agentNameInput = document.getElementById('agent-name');
    const agentMobileInput = document.getElementById('agent-mobile');
    const agentAddressInput = document.getElementById('agent-address');
    const agentCityInput = document.getElementById('agent-city');
    const agentEmailInput = document.getElementById('agent-email');
    const agentPasswordInput = document.getElementById('agent-password');
    const agentSaveBtn = document.getElementById('agent-save-btn');

    // Get company_admin_id from localStorage
    const companyAdminId = localStorage.getItem('company_admin_id');
    if (!companyAdminId) {
        alert('Company Admin ID not found in localStorage.');
        return;
    }

    // Fetch agent profile data from the API
    fetch(`${apiUrl}/company_admin/${companyAdminId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(agentProfile => {
            // Populate agent form fields with data from the API
            agentNameInput.value = agentProfile.name || '';
            agentMobileInput.value = agentProfile.mobile_number || '';
            agentAddressInput.value = agentProfile.address || '';
            agentCityInput.value = agentProfile.city.name || '';
            agentEmailInput.value = agentProfile.email_id || '';
            agentPasswordInput.value = agentProfile.password || '';
        })
        .catch(error => {
            console.error('Error fetching agent profile data:', error);
            alert('Failed to load agent profile data.');
        });

    // Handle agent profile save button click
    agentSaveBtn.addEventListener('click', function() {
        // Create an updated agent profile object
        const updatedAgentProfile = {
            company_admin_id: companyAdminId, // Ensure the ID is included
            name: agentNameInput.value,
            mobile_number: agentMobileInput.value,
            address: agentAddressInput.value,
            city: agentCityInput.value,
            email: agentEmailInput.value,
            password: agentPasswordInput.value
        };

        // Send updated agent profile data to the API
        fetch(`${apiUrl}/company_admin/${companyAdminId}`, {
            method: 'PUT', // Use 'PUT' or 'POST' depending on your API design
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedAgentProfile)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert('Agent profile updated successfully!');
                // Optionally, update the form fields with any returned data
            })
            .catch(error => {
                console.error('Error updating agent profile data:', error);
                alert('Failed to update agent profile.');
            });
    });
}
