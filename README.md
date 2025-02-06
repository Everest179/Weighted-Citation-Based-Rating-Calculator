# Person Rating Calculator

This is a web application for calculating and visualizing ratings based on multiple criteria. The application allows users to rate a subject on various criteria, adjust the weight of each criterion, and visualize the impact distribution and overall rating using charts.

## Features

- Add, remove, and rate criteria
- Adjust weights of each criterion
- Visualize impact distribution with a pie chart
- Visualize ratings with a radar chart
- Export rating data as a JSON file
- Toggle between light and dark modes
- Mobile-responsive design

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/person-rating-calculator.git
    cd person-rating-calculator
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required packages:
    ```sh
    pip install -r requirements.txt
    ```

4. Run the application:
    ```sh
    python app.py
    ```

5. Open your browser and navigate to `http://127.0.0.1:5000`.

## Usage

1. Enter the subject's name (optional).
2. Rate each criterion and adjust the weights as needed.
3. Click "Calculate Rating" to see the overall rating and visualizations.
4. Use the "Clear All" button to reset all ratings.
5. Use the "Auto-adjust Weights" button to evenly distribute weights.
6. Click "Export Rating Data" to download the rating data as a JSON file.
7. Toggle between light and dark modes using the button in the top-right corner.

## File Structure

```
person-rating-calculator/
│
├── static/
│   ├── styles.css
│   └── scripts.js
│
├── templates/
│   └── index.html
│
├── app.py
├── requirements.txt
└── README.md
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
