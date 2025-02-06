let criteria = {};

// Calculate rating locally
function calculateRating() {
    const ratingInputs = document.querySelectorAll('.rating-input');
    const weightInputs = document.querySelectorAll('.weight-input');
    let total = 0;
    let totalWeight = 0;

    weightInputs.forEach(input => {
        totalWeight += parseInt(input.value) || 0;
    });

    if (totalWeight !== 100) {
        throw new Error(`Total weight must be 100%, current total is ${totalWeight}%`);
    }

    ratingInputs.forEach(input => {
        const criterion = input.dataset.criterion;
        const rating = parseFloat(input.value) || 0;
        const weight = parseInt(document.querySelector(`.weight-input[data-criterion="${criterion}"]`).value) || 0;
        
        if (rating < 0 || rating > 10) {
            throw new Error("Ratings must be between 0 and 10");
        }
        
        total += (rating * weight) / 100;
    });

    return total.toFixed(1);
}

// Live total weight update
function updateTotalWeight() {
    const weightInputs = document.querySelectorAll('.weight-input');
    const total = Array.from(weightInputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
    const totalWeightElement = document.getElementById('totalWeight');
    totalWeightElement.textContent = `Total Weight: ${total}%`;
    totalWeightElement.style.color = total === 100 ? '#28a745' : '#dc3545';
}

// Auto-adjust weights
function autoAdjustWeights() {
    const weightInputs = document.querySelectorAll('.weight-input');
    const count = weightInputs.length;
    const equalWeight = Math.floor(100 / count);
    const remainder = 100 - (equalWeight * count);
    
    weightInputs.forEach((input, index) => {
        // Add remainder to last input to ensure total is exactly 100
        input.value = index === count - 1 ? equalWeight + remainder : equalWeight;
    });
    
    updateTotalWeight();
}

document.getElementById('autoWeight').addEventListener('click', autoAdjustWeights);

// Handle weight input changes
document.addEventListener('input', e => {
    if (e.target.classList.contains('weight-input')) {
        updateTotalWeight();
    }
});

// Remove criterion handler
document.addEventListener('click', e => {
    if (e.target.classList.contains('remove-criterion')) {
        const criterion = e.target.dataset.criterion;
        e.target.closest('.form-group').remove();
        updateTotalWeight();
    }
});

// Rating calculation
document.getElementById('ratingForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    form.classList.add('loading');
    
    try {
        const rating = calculateRating();
        const result = document.getElementById('result');
        result.textContent = `Overall Rating: ${rating}/10`;
        result.style.display = 'block';
        
        // Fix export button visibility and style
        const exportBtn = document.getElementById('exportRating');
        exportBtn.style.display = 'block';
        exportBtn.className = 'btn btn-secondary mt-3 d-block mx-auto';
        
        updateCharts();
    } catch (err) {
        showError(err.message);
    } finally {
        form.classList.remove('loading');
    }
};

// Add new criterion (fixed version)
document.getElementById('criterionForm').onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name').replace(/\s+/g, '_').toLowerCase();
    const weight = parseInt(formData.get('weight')) || 0;

    if (weight < 0 || weight > 100) {
        alert('Weight must be between 0 and 100');
        return;
    }

    // Check for duplicate criterion names
    if (document.querySelector(`[data-criterion="${name}"]`)) {
        alert('A criterion with this name already exists');
        return;
    }

    const criterionHtml = `
        <div class="form-group">
            <div class="row">
                <div class="col-md-7">
                    <label>
                        ${formData.get('name')}
                        <input type="number" class="form-control rating-input" 
                               data-criterion="${name}"
                               min="0" max="10" step="0.1" 
                               placeholder="Rate 0-10"
                               required>
                    </label>
                </div>
                <div class="col-md-4">
                    <label>
                        Weight %
                        <input type="number" 
                               class="form-control weight-input" 
                               data-criterion="${name}"
                               value="${weight}" 
                               min="0" max="100" 
                               step="1">
                    </label>
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger remove-criterion" 
                            data-criterion="${name}">×</button>
                </div>
            </div>
        </div>
    `;
    
    const template = document.createElement('template');
    template.innerHTML = criterionHtml.trim();
    const newCriterion = template.content.firstChild;
    
    document.getElementById('criteriaList').insertBefore(
        newCriterion,
        document.getElementById('criteriaList').lastElementChild
    );
    
    updateTotalWeight();
    e.target.reset();
};

// Initialize dark mode from localStorage
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

document.getElementById('toggleDarkMode').onclick = () => {
    const isDarkMode = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateChartsTheme(isDarkMode);
};

// Initialize total weight display
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    initializeCharts();
    updateChartsTheme(isDarkMode);
    updateTotalWeight();
});

// Chart initialization
let weightChart = null;
let ratingChart = null;

function initializeCharts() {
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    const ratingCtx = document.getElementById('ratingChart').getContext('2d');
    
    // Get initial criteria count for empty charts
    const criteriaCount = document.querySelectorAll('.rating-input').length;
    const emptyLabels = Array.from(document.querySelectorAll('.rating-input')).map(input => 
        input.dataset.criterion.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    );
    const emptyData = new Array(criteriaCount).fill(0);
    
    weightChart = new Chart(weightCtx, {
        type: 'pie',
        data: {
            labels: emptyLabels,
            datasets: [{
                data: emptyData,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#4BC0C0', '#7BC8A4'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Impact Distribution',
                    color: document.body.classList.contains('dark-mode') ? '#fff' : '#666'
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#fff' : '#666'
                    }
                }
            }
        }
    });

    ratingChart = new Chart(ratingCtx, {
        type: 'radar',
        data: {
            labels: emptyLabels,
            datasets: [{
                label: 'Ratings',
                data: emptyData,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                borderColor: '#36A2EB',
                borderWidth: 2,
                pointBackgroundColor: '#36A2EB',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#36A2EB',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 2,
                        color: document.body.classList.contains('dark-mode') ? '#fff' : '#666'
                    },
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    angleLines: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        color: document.body.classList.contains('dark-mode') ? '#fff' : '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Rating Distribution',
                    color: document.body.classList.contains('dark-mode') ? '#fff' : '#666',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });

    // Apply current theme to charts
    updateChartsTheme(document.body.classList.contains('dark-mode'));
}

// Add new function to update chart themes
function updateChartsTheme(isDarkMode) {
    const textColor = isDarkMode ? '#fff' : '#666';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    
    // Add theme-transition class to body
    document.body.classList.add('theme-transition');
    
    if (ratingChart) {
        ratingChart.options.scales.r.pointLabels.color = textColor;
        ratingChart.options.scales.r.ticks.color = textColor;
        ratingChart.options.scales.r.grid.color = gridColor;
        ratingChart.options.scales.r.angleLines.color = gridColor;
        ratingChart.options.plugins.title.color = textColor;
        
        // Mobile-specific adjustments
        if (window.innerWidth < 768) {
            ratingChart.options.scales.r.ticks.display = false;
            ratingChart.options.scales.r.pointLabels.font.size = 10;
        }
        
        ratingChart.update();
    }

    if (weightChart) {
        weightChart.options.plugins.title.color = textColor;
        weightChart.options.plugins.legend.labels.color = textColor;
        
        // Mobile-specific adjustments
        if (window.innerWidth < 768) {
            weightChart.options.plugins.legend.position = 'bottom';
            weightChart.options.plugins.legend.labels.font.size = 10;
        }
        
        weightChart.update();
    }
    
    // Update chart containers background
    document.querySelectorAll('.chart-container').forEach(container => {
        container.style.background = isDarkMode ? 'var(--chart-bg-dark)' : 'var(--chart-bg-light)';
    });
    
    // Remove transition class after animation
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 300);
}

// Update theme toggle handler
document.getElementById('toggleDarkMode').onclick = () => {
    const isDarkMode = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateChartsTheme(isDarkMode);
};

// Add window resize handler for responsive charts
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateChartsTheme(document.body.classList.contains('dark-mode'));
    }, 250);
});

function updateCharts() {
    const labels = [];
    const weights = [];
    const ratings = [];
    const impacts = [];
    let totalImpact = 0;
    
    document.querySelectorAll('.form-group').forEach(group => {
        const criterionElement = group.querySelector('.rating-input');
        if (criterionElement) {
            const criterion = criterionElement.dataset.criterion;
            const weight = parseInt(group.querySelector('.weight-input').value) || 0;
            const rating = parseFloat(criterionElement.value) || 0;
            const impact = (rating * weight) / 100;
            
            const labelText = criterion.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            labels.push(labelText);
            weights.push(weight);
            ratings.push(rating);
            impacts.push(impact);
            totalImpact += impact;
        }
    });

    // Convert impacts to percentages
    const impactPercentages = impacts.map(impact => 
        totalImpact > 0 ? (impact / totalImpact) * 100 : 0
    );

    weightChart.data.labels = labels;
    weightChart.data.datasets[0].data = impactPercentages;
    weightChart.update();

    ratingChart.data.labels = labels;
    ratingChart.data.datasets[0].data = ratings;
    ratingChart.update();
}

// Export functionality
function exportRating() {
    try {
        const subjectName = document.getElementById('subjectName').value.trim();
        const totalRating = document.getElementById('result').textContent.split(': ')[1];
        
        const exportData = {
            subject: subjectName || 'Anonymous',
            date: new Date().toISOString(),
            criteria: {},
            totalRating: totalRating
        };

        // Collect all criteria data
        document.querySelectorAll('.form-group').forEach(group => {
            const ratingInput = group.querySelector('.rating-input');
            const weightInput = group.querySelector('.weight-input');
            
            if (ratingInput && weightInput) {
                const criterion = ratingInput.dataset.criterion;
                if (criterion) {  // Only process valid criteria
                    exportData.criteria[criterion] = {
                        name: criterion.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' '),
                        rating: parseFloat(ratingInput.value) || 0,
                        weight: parseInt(weightInput.value) || 0
                    };
                }
            }
        });

        // Create and trigger download
        const fileName = `rating_${subjectName || 'anonymous'}_${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        showError('Error exporting data: ' + err.message);
    }
}

document.getElementById('exportRating').addEventListener('click', exportRating);

// Add new clear all function
document.getElementById('clearAll').addEventListener('click', () => {
    document.querySelectorAll('.rating-input').forEach(input => {
        input.value = '';
    });
    document.getElementById('result').style.display = 'none';
    document.getElementById('exportRating').style.display = 'none';
    updateCharts();
});

// Update charts when criteria are modified
document.addEventListener('input', e => {
    if (e.target.classList.contains('weight-input') || e.target.classList.contains('rating-input')) {
        debouncedUpdateCharts();
    }
});

// Add error handling function
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.style.opacity = '0';
    
    document.getElementById('result').insertAdjacentElement('afterend', errorDiv);
    
    // Trigger animation
    requestAnimationFrame(() => {
        errorDiv.style.opacity = '1';
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    });
}

// Debounce chart updates
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedUpdateCharts = debounce(updateCharts, 100);
