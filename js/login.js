const apiUrl = "http://127.0.0.1:8000"; // Update with your FastAPI server URL

document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        email_id: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
    };

    if (!formData.email_id || !formData.password) {
        alert('Please enter both email and password.');
        return;
    }

    // Attempt Labour Login First
    fetch(`${apiUrl}/labour_login/${formData.email_id}/${formData.password}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            alert('Labour Login Successful!');
            console.log('Logged in user:', data);
            // Redirect to dashboard or another page
            // window.location.href = '/dashboard.html';
        })
        .catch(labourError => {
            console.error('Labour Login Error:', labourError);

            // If labour login fails, attempt Company Admin login
            fetch(`${apiUrl}/company_admin_login/${formData.email_id}/${formData.password}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => response.ok ? response.json() : Promise.reject(response))
                .then(data => {
                    alert('Company Admin Login Successful!');
                    console.log('Logged in user:', data);

                    // Store company admin id in localStorage or pass it via URL to dashboard
                    localStorage.setItem('company_admin_id', data.company_admin_id); // Store in localStorage
                    localStorage.setItem('company_id', data.company_id); // Store in localStorage

                    // Redirect to dashboard or another page
                    if (data.company_id === "undefined") {
                        window.location.href = 'company_register.html';
                    } else {
                        window.location.href = 'company_admin.html';
                    }
                })
                .catch(adminError => {
                    console.error('Company Admin Login Error:', adminError);
                    alert('Login failed. Please check your credentials.');
                });
        });
});
