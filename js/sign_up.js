document.addEventListener('DOMContentLoaded', function() {
    fetchCities();
    setupUserTypeListener();
});

const apiUrl = "http://127.0.0.1:8000"; // Update with your FastAPI server URL

function fetchCities() {
    fetch(`${apiUrl}/cities`)
        .then(response => response.json())
        .then(data => {
            const citySelect = document.getElementById('city');
            data.forEach(city => {
                const option = document.createElement('option');
                option.value = JSON.stringify(city);
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching cities:', error);
        });
}

function setupUserTypeListener() {
    const laborRadio = document.getElementById('labor');
    const adminRadio = document.getElementById('admin');

    laborRadio.addEventListener('change', function() {
        // Additional logic if needed for labor
    });

    adminRadio.addEventListener('change', function() {
        // Additional logic if needed for admin
    });
}

document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const userType = document.querySelector('input[name="user_type"]:checked').value;
    const citySelect = document.getElementById('city');
    const selectedCityIndex = citySelect.selectedIndex;
    const selectedCityOption = citySelect.options[selectedCityIndex];
    const city = JSON.parse(selectedCityOption.value);

    let formData = {
        name: document.getElementById('name').value.trim(),
        mobile_number: document.getElementById('mobile').value.trim(),
        email_id: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        address: document.getElementById('address').value.trim(),
        city: city
    };

    if (userType === 'admin') {
        formData.company_admin_id = crypto.randomUUID();
        formData.company_id = "undefined";
    } else {
        formData.labour_id = crypto.randomUUID();
    }

    for (let key in formData) {
        if (!formData[key]) {
            alert('Please fill in all fields.');
            return;
        }
    }
    console.log(formData)

    let endpoint = userType === 'labor' ? '/add_labour' : '/add_company_admin';

    fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(data => {alert('Sign Up Successful!');
        if(data.company_id == "undefined"){
            window.location.href = 'company_register.html';
        } 
        console.log(data)})
    .catch(error => alert('Error during sign up. Please try again.'));
});
