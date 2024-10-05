// labour_profile.js

function initLabourProfile() {
    const profileForm = document.getElementById('profile-form');

    // Example API call to fetch user profile
    fetch(`${apiUrl}/labour_profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(profile => {
        // Populate the form with existing profile data
        document.getElementById('full-name').value = profile.full_name || '';
        document.getElementById('email').value = profile.email || '';
        document.getElementById('phone').value = profile.phone || '';
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        // Optionally, display an error message to the user
    });

    // Handle form submission to update profile
    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const updatedProfile = {
            full_name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        // Example API call to update profile
        fetch(`${apiUrl}/update_labour_profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfile)
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            alert('Profile updated successfully!');
            // Optionally, update the form with new data
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again later.');
        });
    });
}
