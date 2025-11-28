const form = document.getElementById('dashboard-form');
const formMessage = document.getElementById('form-message');
const resultsCount = document.getElementById('results-count');
const resultsList = document.getElementById('results-list');

const renderPlaceholder = (text) => {
    resultsList.innerHTML = `
        <div class="results-placeholder">
            <p>${text}</p>
        </div>
    `;
};

const renderColleges = (colleges = []) => {
    if (!colleges.length) {
        resultsCount.textContent = 'No colleges found matching your criteria.';
        renderPlaceholder('Try adjusting your MCET rank, marks, or course to see more results.');
        return;
    }

    resultsCount.textContent = `Found ${colleges.length} matching college${colleges.length > 1 ? 's' : ''}.`;
    resultsList.innerHTML = colleges
        .map((college) => {
            return `
                <article class="result-card">
                    <div class="result-heading">
                        <h3>${college.name}</h3>
                        <span class="badge">${college.course}</span>
                    </div>
                    <div class="result-meta">
                        <span>📍 ${college.location || 'N/A'}</span>
                        <span>🏫 ${college.affiliation || 'Affiliation N/A'}</span>
                    </div>
                    <div class="result-details">
                        <div class="detail-item">
                            <p class="detail-label">MCET Cutoff</p>
                            <p class="detail-value">${college.mcet_rank_cutoff}</p>
                        </div>
                        <div class="detail-item">
                            <p class="detail-label">Intermediate Cutoff</p>
                            <p class="detail-value">${college.intermediate_marks_cutoff}%</p>
                        </div>
                    </div>
                </article>
            `;
        })
        .join('');
};

const submitHandler = async (event) => {
    event.preventDefault();

    if (!form) return;

    formMessage.textContent = '';
    formMessage.className = 'form-message';

    const rank = Number(document.getElementById('mcet-rank').value);
    const marks = Number(document.getElementById('intermediate-marks').value);
    const course = document.getElementById('desired-course').value;

    if (!rank || !marks || !course) {
        formMessage.textContent = 'All fields are required.';
        formMessage.classList.add('error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
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
                mcet_rank: rank,
                intermediate_marks: marks,
                desired_course: course,
                // include camelCase to stay backward-compatible
                mcetRank: rank,
                intermediateMarks: marks,
                desiredCourse: course
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unable to fetch recommendations');
        }

        renderColleges(data.colleges || []);
        formMessage.textContent = data.colleges?.length ? 'Recommendations updated!' : '';
        if (data.colleges?.length) {
            formMessage.classList.add('success');
        }
    } catch (error) {
        console.error('Recommendation fetch error:', error);
        formMessage.textContent = error.message || 'Something went wrong. Please try again.';
        formMessage.classList.add('error');
        renderPlaceholder('Unable to load recommendations at the moment.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
};

if (form) {
    form.addEventListener('submit', submitHandler);
}
const form = document.getElementById('dashboard-form');
const resultsSummary = document.getElementById('results-summary');
const resultsList = document.getElementById('results-list');
const formMessage = document.getElementById('form-message');

function setFormMessage(text, type = '') {
    formMessage.textContent = text;
    formMessage.className = `inline-message ${type}`;
}

function renderResults(colleges = []) {
    if (!colleges.length) {
        resultsList.innerHTML = `
            <div class="empty-state">
                No colleges found matching your criteria. Adjust your inputs and try again.
            </div>
        `;
        return;
    }

    resultsList.innerHTML = colleges.map((college, index) => `
        <article class="result-card">
            <h3>${index + 1}. ${college.name}</h3>
            <p class="result-meta">${college.location || 'Location unavailable'}</p>
            <div class="result-details">
                <span class="detail-pill">Course: ${college.course}</span>
                <span class="detail-pill">MCET Cutoff: ${college.mcet_rank_cutoff}</span>
                <span class="detail-pill">Intermediate Cutoff: ${college.intermediate_marks_cutoff}%</span>
            </div>
        </article>
    `).join('');
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFormMessage('');
    resultsSummary.textContent = 'Fetching the best matches for you...';

    const mcet_rank = Number(document.getElementById('dashboard-mcet-rank').value);
    const intermediate_marks = Number(document.getElementById('dashboard-inter-marks').value);
    const desired_course = document.getElementById('dashboard-course').value;

    if (!mcet_rank || !intermediate_marks || !desired_course) {
        setFormMessage('Please fill all the fields correctly.', 'error');
        resultsSummary.textContent = 'Enter your details to get personalized recommendations.';
        return;
    }

    try {
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mcet_rank, intermediate_marks, desired_course }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch recommendations');
        }

        resultsSummary.textContent = `Found ${data.count} matching college${data.count === 1 ? '' : 's'}.`;
        renderResults(data.colleges);
        setFormMessage('Recommendations updated!', 'success');
    } catch (error) {
        console.error('Recommendation error:', error);
        setFormMessage(error.message, 'error');
        resultsSummary.textContent = 'Something went wrong. Please try again.';
        renderResults([]);
    }
});

