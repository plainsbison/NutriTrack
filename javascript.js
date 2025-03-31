let apiKey = '';  // Initially empty API key
const trackedFoods = [];

// DOM Elements
const elements = {
    apiKeyInput: document.getElementById('apiKeyInput'),
    setApiKeyButton: document.getElementById('setApiKeyButton'),
    foodInput: document.getElementById('foodInput'),
    searchButton: document.getElementById('searchButton'),
    loading: document.getElementById('loading'),
    foodListContainer: document.getElementById('foodListContainer'),
    trackedFoodsList: document.getElementById('trackedFoodsList'),
    clearTracker: document.getElementById('clearTracker'),
    showBreakdown: document.getElementById('showBreakdown'),
    statisticalBreakdown: document.getElementById('statisticalBreakdown'),
    caloriesStat: document.getElementById('caloriesStat'),
    fatStat: document.getElementById('fatStat'),
    proteinStat: document.getElementById('proteinStat'),
    carbsStat: document.getElementById('carbsStat'),
    fiberStat: document.getElementById('fiberStat'),
    sugarsStat: document.getElementById('sugarsStat')
};

// API key input section, receive API key from USDA database
elements.setApiKeyButton.addEventListener('click', function () {
    const apiKeyInput = elements.apiKeyInput.value.trim();
    if (!apiKeyInput) {
        showNotification('Please enter a valid API key', 'error');
        return;
    }
    
    apiKey = apiKeyInput;
    showNotification('API Key set successfully!', 'success');
    elements.apiKeyInput.value = ''; 
});

// Search button click handler
elements.searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    const foodQuery = elements.foodInput.value.trim();

    if (!foodQuery) {
        showNotification('Please enter a food name', 'error');
        return;
    }

    if (!apiKey) {
        showNotification('Please set the API key before searching', 'error');
        return;
    }

    elements.loading.style.display = 'block';
    elements.foodListContainer.style.display = 'none';
    elements.foodListContainer.innerHTML = '';

    fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodQuery}&api_key=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('API request failed');
            }
            return response.json();
        })
        .then(data => {
            elements.loading.style.display = 'none';

            if (data.foods && data.foods.length > 0) {
                elements.foodListContainer.style.display = 'grid';

                data.foods.forEach(food => {
                    const foodOption = document.createElement('button');
                    foodOption.classList.add('food-option');
                    foodOption.textContent = food.description;
                    foodOption.onclick = function () {
                        addFoodToTracker(food);
                        showNotification(`Added ${food.description}`, 'success');
                    };
                    elements.foodListContainer.appendChild(foodOption);
                });
            } else {
                showNotification('No foods found', 'error');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            elements.loading.style.display = 'none';
            showNotification('Error fetching data. Please check your API key.', 'error');
        });
});

// Add food to the tracker list
function addFoodToTracker(foodItem) {
    trackedFoods.push(foodItem);
    updateTrackedFoods();
    updateGraph();
}

// Update the list of tracked foods
function updateTrackedFoods() {
    elements.trackedFoodsList.innerHTML = '';

    if (trackedFoods.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No foods tracked yet';
        emptyMessage.style.cursor = 'default';
        emptyMessage.style.opacity = '0.6';
        elements.trackedFoodsList.appendChild(emptyMessage);
        resetStatValues(); 
        return;
    }

    trackedFoods.forEach((food, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = food.description;
        listItem.title = "Click to remove";
        listItem.onclick = function () {
            removeFoodFromTracker(index);
            showNotification(`Removed ${food.description}`, 'info');
        };
        elements.trackedFoodsList.appendChild(listItem);
    });
}

// Remove food from the tracker list
function removeFoodFromTracker(index) {
    trackedFoods.splice(index, 1);
    updateTrackedFoods();
    updateGraph();
    
    // If no more foods, reset values
    if (trackedFoods.length === 0) {
        resetStatValues();
    }
}

// clears values 
function resetStatValues() {
    elements.caloriesStat.textContent = "0 kcal";
    elements.fatStat.textContent = "0g";
    elements.proteinStat.textContent = "0g";
    elements.carbsStat.textContent = "0g";
    elements.fiberStat.textContent = "0g";
    elements.sugarsStat.textContent = "0g";
}

// clears tracker
elements.clearTracker.addEventListener('click', function () {
    if (trackedFoods.length === 0) return;

    trackedFoods.length = 0;
    updateTrackedFoods();
    updateGraph();
    hideStatisticalBreakdown();
    resetStatValues(); // resets when cleared
    showNotification('Tracker cleared', 'info');
});

// hides statisticalbreakdown
function hideStatisticalBreakdown() {
    elements.statisticalBreakdown.style.display = 'none';
    elements.showBreakdown.textContent = 'Breakdown';
}

// Show or hide the statistical breakdown
elements.showBreakdown.addEventListener('click', function () {
    const breakdownSection = elements.statisticalBreakdown;
    if (trackedFoods.length === 0) {
        showNotification('Add foods to view breakdown', 'info');
        return;
    }

    if (breakdownSection.style.display === 'none') {
        breakdownSection.style.display = 'block';
        elements.showBreakdown.textContent = 'Hide Breakdown';
        updateStatisticalBreakdown();
    } else {
        breakdownSection.style.display = 'none';
        elements.showBreakdown.textContent = 'Breakdown';
    }
});

// Update the nutrient graph
function updateGraph() {
    if (window.myChart) {
        window.myChart.destroy();
    }

    if (trackedFoods.length === 0) {
        createEmptyChart();
        return;
    }

    const labels = ['Protein', 'Sugars', 'Fat', 'Carbs', 'Fiber'];
    let protein = 0, totalSugars = 0, fat = 0, carbs = 0, fiber = 0;

    trackedFoods.forEach(food => {
        protein += getNutrientValue(food, 'Protein');
        totalSugars += getNutrientValue(food, 'Total Sugars');
        fat += getNutrientValue(food, 'Total lipid (fat)');
        carbs += getNutrientValue(food, 'Carbohydrate, by difference');
        fiber += getNutrientValue(food, 'Fiber, total dietary');
    });

    protein = roundToTwoDecimalPlaces(protein);
    totalSugars = roundToTwoDecimalPlaces(totalSugars);
    fat = roundToTwoDecimalPlaces(fat);
    carbs = roundToTwoDecimalPlaces(carbs);
    fiber = roundToTwoDecimalPlaces(fiber);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Amount (g)',
            data: [protein, totalSugars, fat, carbs, fiber],
            backgroundColor: [
                'rgba(108, 92, 231, 0.7)',
                'rgba(0, 206, 201, 0.7)',
                'rgba(253, 121, 168, 0.7)',
                'rgba(253, 203, 110, 0.7)',
                'rgba(0, 184, 148, 0.7)'
            ],
            borderColor: [
                'rgb(108, 92, 231)',
                'rgb(0, 206, 201)',
                'rgb(253, 121, 168)',
                'rgb(253, 203, 110)',
                'rgb(0, 184, 148)'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff',
                    font: {
                        family: "'Poppins', sans-serif",
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}g`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#b0b3b8',
                    font: {
                        family: "'Poppins', sans-serif",
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#b0b3b8',
                    font: {
                        family: "'Poppins', sans-serif",
                    }
                }
            }
        }
    };

    // chart stuff

    const ctx = document.getElementById('macronutrientChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

    updateStatisticalBreakdown();
}

// Create empty chart with placeholder
function createEmptyChart() {
    const ctx = document.getElementById('macronutrientChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Add foods to see nutrition data'],
            datasets: [{
                label: 'No data available',
                data: [0],
                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                borderColor: 'rgba(200, 200, 200, 0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Get nutrient value from food object
function getNutrientValue(food, nutrientName) {
    const nutrient = food.foodNutrients.find(n => n.nutrientName === nutrientName);
    return nutrient ? nutrient.value : 0;
}

// Round a number to two decimal places
function roundToTwoDecimalPlaces(value) {
    return Math.round(value * 100) / 100;
}

// Update the statistical breakdown of the tracked foods
function updateStatisticalBreakdown() {
    if (trackedFoods.length === 0) {
        resetStatValues();
        return;
    }
    
    // Calculate nutrients
    const totalProtein = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Protein'), 0);
    const totalSugars = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Total Sugars'), 0);
    const totalFat = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Total lipid (fat)'), 0);
    const totalCarbs = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Carbohydrate, by difference'), 0);
    const totalFiber = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Fiber, total dietary'), 0);
    
    // Calculate total calories - try both common nutrient names for energy
    let totalCalories = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Energy'), 0);
    if (totalCalories === 0) {
        // If "Energy" doesn't work, try "Calories" as an alternative
        totalCalories = trackedFoods.reduce((sum, food) => sum + getNutrientValue(food, 'Calories'), 0);
    }

    // Update UI elements
    elements.proteinStat.textContent = `${roundToTwoDecimalPlaces(totalProtein)}g`;
    elements.sugarsStat.textContent = `${roundToTwoDecimalPlaces(totalSugars)}g`;
    elements.fatStat.textContent = `${roundToTwoDecimalPlaces(totalFat)}g`;
    elements.carbsStat.textContent = `${roundToTwoDecimalPlaces(totalCarbs)}g`;
    elements.fiberStat.textContent = `${roundToTwoDecimalPlaces(totalFiber)}g`;
    elements.caloriesStat.textContent = `${roundToTwoDecimalPlaces(totalCalories)} kcal`;
}

// Show notification box
function showNotification(message, type) {
    const notificationBox = document.createElement('div');
    notificationBox.classList.add('notification-box', type);
    notificationBox.textContent = message;

    // Append to body and remove after 3 seconds
    document.body.appendChild(notificationBox);
    setTimeout(() => {
        notificationBox.remove();
    }, 3000);
}
