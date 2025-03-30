# NutriTrack Web App

NutriTrack is a simple web app to track food items, view nutritional information, and visualize macronutrients via charts. It allows users to search for foods, add them to a tracker, and view a statistical breakdown of their nutritional values such as protein, fat, carbs, and more.

## Features

- **Food Search**: Search for foods using the USDA Food Data Central API.
- **Track Foods**: Add foods to a personal tracker to keep a list of selected items.
- **Macronutrient Breakdown**: View macronutrient information (protein, carbs, fat, etc.) of tracked foods.
- **Visual Graph**: A bar graph displays the breakdown of macronutrients in the tracked foods.
- **Statistical Overview**: Get a statistical breakdown of the tracked foods' nutrition, including calories, fat, protein, etc.
- **Custom API Key**: Users can input their own USDA API key for accessing the data.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/nutritrack.git
    cd nutritrack
    ```

2. **Install Dependencies (Optional, for local development with npm):**

   This project does not require a local server or specific build tools, as it’s a simple static web page. If you'd like to use Node.js, you can install any required dependencies by running:

    ```bash
    npm install
    ```

3. **Open the `index.html` file in your browser** to start using the app.

4. You can also deploy the app on GitHub Pages (as this project is already deployed there).

## Usage

1. **Search for Food**: Enter the name of a food item into the search bar.
2. **Track Food**: Click on a food from the search results to add it to your tracker.
3. **View Macronutrient Breakdown**: Click on the “Show Breakdown” button to see the nutritional breakdown for the tracked foods.
4. **Clear Tracker**: Use the “Clear Tracker” button to remove all foods from the tracker.

## API Key

For the app to work, you'll need an API key from the USDA Food Data Central API. Follow these steps:

1. Go to the USDA API website to request an API key.
2. Input the API key into the text box provided in the app for fetching food data.

### Security Note:
API keys are sensitive information and should not be exposed in production environments. This app allows users to input their API key directly, but for deployment purposes, it’s essential to handle API keys securely.

## Technologies Used

- **HTML5**: Structure and layout of the web page.
- **CSS3**: Styling of the page for a dark mode theme.
- **JavaScript (Vanilla)**: Handles food search, tracking, statistical breakdown, and API calls.
- **Chart.js**: Used for visualizing macronutrient data in a bar chart.
- **USDA Food Data Central API**: Provides detailed nutritional information for foods.

## License

This project is open-source and available under the [MIT License](LICENSE).
