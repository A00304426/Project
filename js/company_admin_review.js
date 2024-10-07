function initReviewScreen() {
    const apiUrl = 'http://127.0.0.1:8000'; // Update with your actual API URL
    const company_id = localStorage.getItem('company_id') || 'company123'; // Fallback company_id
    const reviewContainer = document.getElementById('review-container'); // Ensure this div exists in your HTML

    // Function to fetch reviews
    function fetchReviews() {
        fetch(`${apiUrl}/reviews/${company_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch reviews: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayReviewTable(data);
            })
            .catch(error => {
                console.error('Error fetching reviews:', error);
                reviewContainer.innerHTML = '<p>Error fetching reviews. Please try again later.</p>';
            });
    }

    // Function to display the table
    function displayReviewTable(reviews) {
        // Clear previous content
        reviewContainer.innerHTML = '';
        console.log(reviews);

        // Create table
        const table = document.createElement('table');
        table.classList.add('review-table');

        // Create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = ['Name', 'Mobile Number', 'Rating', 'Comment', 'Actions'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');

        if (reviews.length === 0) {
            // No reviews to display
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = 'No records to display';
            cell.colSpan = headers.length;
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tbody.appendChild(row);
        } else {
            reviews.forEach(review => {
                console.log(review);
                const row = document.createElement('tr');

                // Name
                const nameCell = document.createElement('td');
                nameCell.textContent = review.name;
                row.appendChild(nameCell);

                // Mobile Number
                const mobileCell = document.createElement('td');
                mobileCell.textContent = review.mobile_number;
                row.appendChild(mobileCell);

                // Rating
                const ratingCell = document.createElement('td');
                ratingCell.textContent = review.rating != null ? review.rating : '-';
                row.appendChild(ratingCell);

                // Comment
                const commentCell = document.createElement('td');
                commentCell.textContent = review.comments !== null ? review.comments : '-';
                row.appendChild(commentCell);

                // Actions
                const actionsCell = document.createElement('td');
                const giveCommentButton = document.createElement('button');
                giveCommentButton.textContent = 'Give Comment';
                giveCommentButton.classList.add('btn', 'btn-primary');
                giveCommentButton.addEventListener('click', () => {
                    // Open the review form
                    openReviewForm(review);
                });
                actionsCell.appendChild(giveCommentButton);
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });
        }

        table.appendChild(tbody);
        reviewContainer.appendChild(table);
    }

    // Function to open the review form
    function openReviewForm(review) {
        // Remove existing modal if any
        const existingModal = document.getElementById('review-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'review-modal';
        modalOverlay.classList.add('modal-overlay');

        // Modal content container
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        // Close Button
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.classList.add('close-button');
        closeButton.onclick = function() {
            modalOverlay.remove();
        };
        modalContent.appendChild(closeButton);

        // Modal Title
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Update Review';
        modalContent.appendChild(modalTitle);

        // Labour Name
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Labour Name:';
        modalContent.appendChild(nameLabel);

        const nameValue = document.createElement('p');
        nameValue.textContent = review.name;
        modalContent.appendChild(nameValue);

        // Mobile Number
        const mobileLabel = document.createElement('label');
        mobileLabel.textContent = 'Mobile Number:';
        modalContent.appendChild(mobileLabel);

        const mobileValue = document.createElement('p');
        mobileValue.textContent = review.mobile_number;
        modalContent.appendChild(mobileValue);

        // Rating
        const ratingLabel = document.createElement('label');
        ratingLabel.textContent = 'Rating (out of 5):';
        modalContent.appendChild(ratingLabel);

        const ratingInput = document.createElement('input');
        ratingInput.type = 'number';
        ratingInput.min = 1;
        ratingInput.max = 5;
        ratingInput.value = review.rating !== null ? review.rating : '';
        modalContent.appendChild(ratingInput);

        // Comment
        const commentLabel = document.createElement('label');
        commentLabel.textContent = 'Comment:';
        modalContent.appendChild(commentLabel);

        const commentInput = document.createElement('textarea');
        commentInput.value = review.comments !== null ? review.comments : '';
        modalContent.appendChild(commentInput);

        // Button Container
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        // Update Review Button
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update Review';
        updateButton.classList.add('btn', 'btn-success');
        updateButton.addEventListener('click', () => {
            // Validate rating input
            const ratingValue = parseInt(ratingInput.value);
            if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                alert('Please enter a valid rating between 1 and 5.');
                return;
            }

            // Submit the review
            submitReview(review.company_requirement_id, review.labour_id, ratingValue, commentInput.value);
        });
        buttonContainer.appendChild(updateButton);

        // Cancel Button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('btn', 'btn-secondary');
        cancelButton.addEventListener('click', () => {
            // Close the modal
            modalOverlay.remove();
        });
        buttonContainer.appendChild(cancelButton);

        modalContent.appendChild(buttonContainer);

        modalOverlay.appendChild(modalContent);

        // Append modal to body
        document.body.appendChild(modalOverlay);
    }

    // Function to submit the review
    function submitReview(company_requirement_id, labour_id, rating, comments) {
        fetch(`${apiUrl}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company_requirement_id: company_requirement_id,
                labour_id: labour_id,
                rating: rating,
                comments: comments
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit review');
                }
                return response.json();
            })
            .then(data => {
                alert('Review submitted successfully');
                // Close the modal
                const modalOverlay = document.getElementById('review-modal');
                if (modalOverlay) {
                    modalOverlay.remove();
                }
                // Refresh the reviews
                fetchReviews();
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Error submitting the review. Please try again later.');
            });
    }

    // Initial fetch of reviews
    fetchReviews();
}

// Attach initReviewScreen to the window object to make it globally accessible
window.initReviewScreen = initReviewScreen;
