// labour_profile.js

async function initLabourProfile() {
    const profileForm = document.getElementById('profile-form');
    const editButton = document.getElementById('edit-button');
    const updateButton = document.getElementById('update-button');
    const citySelect = document.getElementById('city');
    const labourId = localStorage.getItem('labour_id');
    const collegeEntriesContainer = document.getElementById('college-entries');
    const addCollegeButton = document.getElementById('add-college-button');

    // Fetch the list of cities and populate the city select box
    await fetch(`${apiUrl}/cities`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(cities => {
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.city_id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching cities:', error);
            alert('Failed to load cities. Please try again later.');
        });

    // Fetch user profile
    fetch(`${apiUrl}/labour/${labourId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(profile => {
            // Populate the form with existing profile data
            document.getElementById('name').value = profile.name || '';
            document.getElementById('mobile-number').value = profile.mobile_number || '';
            document.getElementById('email-id').value = profile.email_id || '';
            document.getElementById('password').value = profile.password || '';
            document.getElementById('address').value = profile.address || '';
            citySelect.value = profile.city.city_id || '';
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            alert('Failed to load profile. Please try again later.');
        });

    // Handle Edit button click
    editButton.addEventListener('click', function () {
        makeFormEditable(true);
        editButton.style.display = 'none';
        updateButton.style.display = 'inline-block';
    });

    // Handle form submission to update profile
    profileForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const updatedProfile = {
            labour_id: labourId,
            name: document.getElementById('name').value,
            mobile_number: document.getElementById('mobile-number').value,
            email_id: document.getElementById('email-id').value,
            password: document.getElementById('password').value,
            address: document.getElementById('address').value,
            city_id: parseInt(citySelect.value)
        };

        // API call to update profile
        fetch(`${apiUrl}/labour/${labourId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfile)
        })
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(data => {
                alert('Profile updated successfully!');
                makeFormEditable(false);
                editButton.style.display = 'inline-block';
                updateButton.style.display = 'none';
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again later.');
            });
    });

    function makeFormEditable(editable) {
        const formElements = profileForm.elements;
        for (let i = 0; i < formElements.length; i++) {
            if (formElements[i].tagName !== 'BUTTON') {
                formElements[i].readOnly = !editable;
                formElements[i].disabled = !editable;
            }
        }
    }

    // Fetch college information
    fetch(`${apiUrl}/labour/${labourId}/colleges`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(colleges => {
            displayCollegeEntries(colleges);
        })
        .catch(error => {
            console.error('Error fetching college information:', error);
            alert('Failed to load college information. Please try again later.');
        });

    // Handle Add College Button
    addCollegeButton.addEventListener('click', function () {
        if (document.querySelectorAll('.college-entry').length < 2) {
            openCollegeForm();
        } else {
            alert('You can add a maximum of two college entries.');
        }
    });

    function displayCollegeEntries(colleges) {
        collegeEntriesContainer.innerHTML = '';
        colleges.forEach((college, index) => {
            const collegeDiv = document.createElement('div');
            collegeDiv.classList.add('college-entry');
            collegeDiv.innerHTML = `
                <p><strong>Name:</strong> ${college.name}</p>
                <p><strong>Course:</strong> ${college.course}</p>
                <p><strong>Intake:</strong> ${college.intake.join(', ')}</p>
                <p><strong>Year:</strong> ${college.year}</p>
                <p><strong>City:</strong> ${college.city.name}</p>
                <button type="button" class="btn btn-secondary edit-college-button" data-id="${college.college_id}">Edit</button>
            `;
            collegeEntriesContainer.appendChild(collegeDiv);
        });

        // Hide Add College Button if two entries exist
        if (colleges.length >= 2) {
            addCollegeButton.style.display = 'none';
        } else {
            addCollegeButton.style.display = 'block';
        }

        // Attach event listeners to edit buttons
        document.querySelectorAll('.edit-college-button').forEach(button => {
            button.addEventListener('click', function () {
                const collegeId = this.getAttribute('data-id');
                openCollegeForm(collegeId);
            });
        });
    }

    function openCollegeForm(collegeId = null) {
        // Create a form for adding/editing college information
        const form = document.createElement('form');
        form.id = 'college-form';
        form.innerHTML = `
            <label for="college-name">College Name:</label>
            <input type="text" id="college-name" name="name" required>

            <label for="course">Course:</label>
            <input type="text" id="course" name="course" required>

            <label for="intake">Intake:</label>
            <select id="intake" name="intake" multiple required>
                <option value="January">January</option>
                <option value="May">May</option>
                <option value="September">September</option>
            </select>

            <label for="year">Year:</label>
            <input type="number" id="year" name="year" required>

            <label for="college-city">City:</label>
            <select id="college-city" name="city" required>
                <!-- Options will be populated dynamically -->
            </select>

            <div class="button-group">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" id="cancel-college-button" class="btn btn-danger">Cancel</button>
            </div>
        `;

        // Populate city options
        const collegeCitySelect = form.querySelector('#college-city');
        citySelect.querySelectorAll('option').forEach(option => {
            collegeCitySelect.appendChild(option.cloneNode(true));
        });

        // If editing, populate form with existing data
        if (collegeId) {
            fetch(`${apiUrl}/labour/${labourId}/colleges/${collegeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.ok ? response.json() : Promise.reject(response))
                .then(college => {
                    form.querySelector('#college-name').value = college.name;
                    form.querySelector('#course').value = college.course;
                    form.querySelector('#year').value = college.year;
                    form.querySelector('#college-city').value = college.city.city_id;
                    const intakeSelect = form.querySelector('#intake');
                    college.intake.forEach(intake => {
                        const option = intakeSelect.querySelector(`option[value="${intake}"]`);
                        if (option) option.selected = true;
                    });
                })
                .catch(error => {
                    console.error('Error fetching college data:', error);
                    alert('Failed to load college data. Please try again later.');
                });
        }

        // Handle form submission
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const collegeData = {
                name: form.querySelector('#college-name').value,
                course: form.querySelector('#course').value,
                intake: Array.from(form.querySelector('#intake').selectedOptions).map(option => option.value),
                year: parseInt(form.querySelector('#year').value),
                city_id: parseInt(form.querySelector('#college-city').value)
            };

            let method = 'POST';
            let url = `${apiUrl}/labour/${labourId}/colleges`;
            if (collegeId) {
                method = 'PUT';
                url += `/${collegeId}`;
            }

            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collegeData)
            })
                .then(response => response.ok ? response.json() : Promise.reject(response))
                .then(data => {
                    alert('College information saved successfully!');
                    // Refresh college entries
                    fetch(`${apiUrl}/labour/${labourId}/colleges`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(response => response.ok ? response.json() : Promise.reject(response))
                        .then(colleges => {
                            displayCollegeEntries(colleges);
                        });
                    // Remove form
                    form.remove();
                })
                .catch(error => {
                    console.error('Error saving college information:', error);
                    alert('Failed to save college information. Please try again later.');
                });
        });

        // Handle cancel button
        form.querySelector('#cancel-college-button').addEventListener('click', function () {
            form.remove();
        });

        // Append form to college section
        collegeEntriesContainer.appendChild(form);
    }

    // Initial function to make profile form read-only
    makeFormEditable(false);
}

document.addEventListener('DOMContentLoaded', initLabourProfile);
