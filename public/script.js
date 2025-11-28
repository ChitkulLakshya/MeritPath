// Global state
let currentUser = null;

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageDiv = document.getElementById('login-message');
        messageDiv.textContent = '';
        messageDiv.className = 'message';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                messageDiv.textContent = 'Login successful! Redirecting...';
                messageDiv.className = 'message success';
                
                // Show main content and hide auth wrapper
                setTimeout(() => {
                    document.querySelector('.auth-wrapper').style.display = 'none';
                    document.body.classList.remove('auth-page');
                    document.getElementById('main-content').classList.remove('hidden');
                    document.getElementById('user-greeting').style.display = 'flex';
                    document.getElementById('user-name-display').textContent = currentUser.username;
                }, 1000);
            } else {
                messageDiv.textContent = data.error || 'Login failed';
                messageDiv.className = 'message error';
            }
        } catch (error) {
            messageDiv.textContent = 'Network error. Please try again.';
            messageDiv.className = 'message error';
            console.error('Login error:', error);
        }
    });
}

// Logout function
function logout() {
    currentUser = null;
    document.body.classList.add('auth-page');
    const authWrapper = document.querySelector('.auth-wrapper');
    if (authWrapper) {
        authWrapper.style.display = 'flex';
    }
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('user-greeting').style.display = 'none';
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.reset();
    }
    const recommendationForm = document.getElementById('recommendation-form');
    if (recommendationForm) {
        recommendationForm.reset();
    }
    document.getElementById('results-container').classList.add('hidden');
    // Redirect to login page
    window.location.href = 'index.html';
}

// Recommendation form handler
document.getElementById('recommendation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const mcetRank = document.getElementById('mcet-rank').value;
    const intermediateMarks = document.getElementById('intermediate-marks').value;
    const desiredCourse = document.getElementById('desired-course').value;

    // Client-side validation
    if (!mcetRank || !intermediateMarks || !desiredCourse) {
        alert('Please fill in all fields');
        return;
    }

    const rank = Number(mcetRank);
    const marks = Number(intermediateMarks);

    if (isNaN(rank) || isNaN(marks) || rank < 1 || marks < 0 || marks > 100) {
        alert('Please enter valid numbers for MCET Rank and Intermediate Marks');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#recommendation-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Searching...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mcetRank: rank,
                intermediateMarks: marks,
                desiredCourse: desiredCourse
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayResults(data);
        } else {
            alert(data.error || 'Error fetching recommendations');
        }
    } catch (error) {
        alert('Network error. Please try again.');
        console.error('Recommendation error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Display recommendation results
function displayResults(data) {
    const resultsContainer = document.getElementById('results-container');
    const resultsCount = document.getElementById('results-count');
    const collegesList = document.getElementById('colleges-list');

    resultsContainer.classList.remove('hidden');

    // Update count
    if (data.count === 0) {
        resultsCount.textContent = '';
        collegesList.innerHTML = `
            <div class="no-results-placeholder">
                <p>No colleges found matching your criteria.</p>
            </div>
        `;
    } else {
        resultsCount.textContent = `Found ${data.count} matching college${data.count > 1 ? 's' : ''}`;

        // Render colleges
        collegesList.innerHTML = data.colleges.map((college, index) => {
            return `
                <div class="college-card">
                    <div class="college-header">
                        <h3>${index + 1}. ${college.name}</h3>
                        <span class="badge badge-${college.course.toLowerCase()}">${college.course}</span>
                    </div>
                    <div class="college-details">
                        <div class="detail-item">
                            <span class="detail-label">📍 Location:</span>
                            <span class="detail-value">${college.location || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🎓 Affiliation:</span>
                            <span class="detail-value">${college.affiliation || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📊 MCET Rank Cutoff:</span>
                            <span class="detail-value">${college.mcet_rank_cutoff}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📝 Intermediate Marks Cutoff:</span>
                            <span class="detail-value">${college.intermediate_marks_cutoff}%</span>
                        </div>
                        ${college.fees ? `
                        <div class="detail-item">
                            <span class="detail-label">💰 Fees:</span>
                            <span class="detail-value">₹${college.fees.toLocaleString()}/year</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
