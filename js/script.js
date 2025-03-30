let apiKey = '';  // Initially empty API key
const trackedFoods = [];

// API key input section
document.getElementById('setApiKeyButton').addEventListener('click', function () {
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    if (!apiKeyInput) {
        alert('Please enter a valid API key.');
        return;
    }
    apiKey = apiKeyInput;
    alert('API Key set successfully!');
});

// Search button click handler
document.getElementById('searchButton').addEventListener('click', function (e) {
    e.preventDefault();
    const foodQuery = document.getElementById('foodInput').value.trim();

    if (!foodQuery) {
        alert('Please enter a food name');
        return;
    }

    if (!apiKey) {
        alert('Please set the API key before searching.');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('foodListContainer').style.display = 'none';
    document.getElementById('trackedFoodsList').innerHTML = '';
    document.getElementById('foodListContainer').innerHTML = '';

    fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodQuery}&api_key=${apiKey}`) // Using dynamic API key
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading').style.display = 'none';

            if (data.foods && data.foods.length > 0) {
                const foodListContainer = document.getElementById('foodListContainer');
                foodListContainer.style.display = 'grid';

                data.foods.forEach(food => {
                    const foodOption = document.createElement('button');
                    foodOption.classList.add('food-option');
                    foodOption.textContent = food.description;
                    foodOption.onclick = function () {
                        addFoodToTracker(food);  // Add food to tracker
                    };
                    foodListContainer.appendChild(foodOption);
                });
            } else {
                alert('No foods found.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('There was an error fetching data.');
        });
});

// Add food to the tracker list
function addFoodToTracker(foodItem) {
    trackedFoods.push(foodItem);
    updateTrackedFoods();
    updateGraph();  // Update the graph after adding a food
}

// Update the list of tracked foods
function updateTrackedFoods() {
    const trackedFoodsList = document.getElementById('trackedFoodsList');
    trackedFoodsList.innerHTML = '';

    trackedFoods.forEach((food, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = food.description;
        listItem.onclick = function () {
            removeFoodFromTracker(index);
        };
        trackedFoodsList.appendChild(listItem);
    });
}

// Remove food from the tracker list
function removeFoodFromTracker(index) {
    trackedFoods.splice(index, 1);
    updateTrackedFoods();
    updateGraph();  
}

// Clear the tracker list
document.getElementById('clearTracker').addEventListener('click', function () {
    trackedFoods.length = 0;
    updateTrackedFoods();
    updateGraph();  
    hideStatisticalBreakdown();
});

// Show or hide the statistical breakdown
document.getElementById('showBreakdown').addEventListener('click', function () {
    const breakdownSection = document.getElementById('statisticalBreakdown');
    if (breakdownSection.style.display === 'none') {
        breakdownSection.style.display = 'block';
        updateStatisticalBreakdown();
    } else {
        breakdownSection.style.display = 'none';
    }
});

// Update the nutrient graph and calories
function updateGraph() {
    if (window.myChart) {
        window.myChart.destroy();  // Destroy the previous chart
    }

    const labels = ['Protein (g)', 'Total Sugars (g)', 'Total Fat (g)', 'Carbohydrates (g)', 'Fiber (g)'];

    let protein = 0, totalSugars = 0, fat = 0, carbs = 0, fiber = 0, totalCalories = 0;

    trackedFoods.forEach(food => {
        protein += getNutrientValue(food, 'Protein');
        totalSugars += getNutrientValue(food, 'Total Sugars');
        fat += getNutrientValue(food, 'Total lipid (fat)');
        carbs += getNutrientValue(food, 'Carbohydrate, by difference');
        fiber += getNutrientValue(food, 'Fiber, total dietary');
        totalCalories += getNutrientValue(food, 'Energy');  // Calories
    });

    protein = roundToTwoDecimalPlaces(protein);
    totalSugars = roundToTwoDecimalPlaces(totalSugars);
    fat = roundToTwoDecimalPlaces(fat);
    carbs = roundToTwoDecimalPlaces(carbs);
    fiber = roundToTwoDecimalPlaces(fiber);
    totalCalories = roundToTwoDecimalPlaces(totalCalories);

    // Create chart data based on the updated nutrients
    const chartData = {
        labels: labels,
        datasets: [{
            data: [protein, totalSugars, fat, carbs, fiber],
            backgroundColor: ['#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F'],
            borderColor: ['#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F'],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.raw + 'g';
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('macronutrientChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

    updateStatisticalBreakdownFromGraph();
}

function updateStatisticalBreakdownFromGraph() {
    const chartData = window.myChart.data.datasets[0].data; 
    const [protein, totalSugars, fat, carbs, fiber] = chartData;

    document.getElementById('caloriesStat').textContent = `${roundToTwoDecimalPlaces(getTotalCalories())} kcal`;
    document.getElementById('fatStat').textContent = `${fat} g`;
    document.getElementById('proteinStat').textContent = `${protein} g`;
    document.getElementById('carbsStat').textContent = `${carbs} g`;
    document.getElementById('fiberStat').textContent = `${fiber} g`;
    document.getElementById('sugarsStat').textContent = `${totalSugars} g`;
}

function getTotalCalories() {
    let totalCalories = 0;
    trackedFoods.forEach(food => {
        totalCalories += getNutrientValue(food, 'Energy'); // Calories
    });
    return totalCalories;
}

function roundToTwoDecimalPlaces(value) {
    return parseFloat(value.toFixed(2));
}

function getNutrientValue(food, nutrientName) {
    const nutrient = food.foodNutrients ? food.foodNutrients.find(nutrient => nutrient.nutrientName === nutrientName) : null;
    return nutrient ? nutrient.value : 0;
}

function hideStatisticalBreakdown() {
    document.getElementById('statisticalBreakdown').style.display = 'none';
}
