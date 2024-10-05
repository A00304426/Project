// labour_dashboard.js
const apiUrl = "http://127.0.0.1:8000"; // Update with your FastAPI server URL

document.addEventListener('DOMContentLoaded', function() {
    const tabs = {
        'finding-job-tab': 'labour_find_job.html',
        'record-tab': 'labour_record.html',
        'profile-tab': 'labour_profile.html'
    };

    const tabElements = {
        'finding-job-tab': document.getElementById('finding-job-tab'),
        'record-tab': document.getElementById('record-tab'),
        'profile-tab': document.getElementById('profile-tab')
    };

    const contentArea = document.getElementById('content-area');

    // Keep track of loaded scripts to prevent multiple loads
    const loadedScripts = {};

    // Function to load content
    function loadContent(tabId) {
        // Remove active class from all tabs
        for (let tab in tabElements) {
            tabElements[tab].classList.remove('active');
        }

        // Add active class to the clicked tab
        tabElements[tabId].classList.add('active');

        // Fetch the content from the corresponding HTML file
        fetch(tabs[tabId])
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                contentArea.innerHTML = data;

                // Determine which script to load based on the tab
                let scriptToLoad = '';
                let initFunction = '';

                if (tabId === 'profile-tab') {
                    scriptToLoad = 'js/labour_profile.js';
                    initFunction = 'initLabourProfile';
                } else if (tabId === 'finding-job-tab') {
                    scriptToLoad = 'js/labour_find_job.js';
                    initFunction = 'initFindingJob';
                } else if (tabId === 'record-tab') {
                    scriptToLoad = 'js/labour_record.js';
                    initFunction = 'initLabourRecord';
                }

                if (scriptToLoad && initFunction) {
                    // Load the script if not already loaded
                    if (!loadedScripts[scriptToLoad]) {
                        const script = document.createElement('script');
                        script.src = scriptToLoad;
                        script.onload = () => {
                            // Call the initialization function after the script loads
                            if (typeof window[initFunction] === 'function') {
                                window[initFunction]();
                            }
                        };
                        script.onerror = () => {
                            console.error(`Failed to load ${scriptToLoad}`);
                        };
                        document.body.appendChild(script);
                        loadedScripts[scriptToLoad] = true;
                    } else {
                        // If already loaded, just call the init function
                        if (typeof window[initFunction] === 'function') {
                            window[initFunction]();
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error loading content:', error);
                contentArea.innerHTML = '<p>Error loading content.</p>';
            });
    }

    // Set up event listeners for tab clicks
    for (let tabId in tabElements) {
        tabElements[tabId].addEventListener('click', function() {
            loadContent(tabId);
        });
    }

    // Load the default tab content
    loadContent('finding-job-tab');
});
