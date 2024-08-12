from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Define the path to the Resources folder
resources_folder = os.path.join(os.path.dirname(__file__), 'Resources')

# Load CSV data
used_cars_df = pd.read_csv(os.path.join(resources_folder, 'used_carswithindex.csv'))
ratings_df = pd.read_csv(os.path.join(resources_folder, 'ratings_used_cars.csv'))

# Extract unique options for dropdowns
makes = sorted(used_cars_df['Make'].unique())
models_by_make = used_cars_df.groupby('Make')['Model'].unique().apply(list).to_dict()
years = sorted(used_cars_df['year_made'].unique())
fuel_types = sorted(used_cars_df['fuel_type'].unique())
transmissions = sorted(used_cars_df['transmission'].unique())

@app.route('/')
def home():
    return render_template('index.html', makes=makes, years=years, fuel_types=fuel_types, transmissions=transmissions)

@app.route('/get_models', methods=['POST'])
def get_models():
    selected_make = request.form['make']
    models = models_by_make.get(selected_make, [])
    return jsonify(models)

@app.route('/estimate', methods=['POST'])
def estimate():
    # Capture form data
    make = request.form['make']
    model = request.form['model']
    year = int(request.form['year'])
    mileage_range = request.form['mileage']  # This is now a string like "20001-50000"
    fuel_type = request.form['fuel_type']
    transmission = request.form['transmission']
    
    # Extract min and max mileage from the range
    min_mileage, max_mileage = map(int, mileage_range.split('-'))
    
    # Basic processing: Filter data to match the user's car exactly
    matched_cars = used_cars_df[
        (used_cars_df['Make'] == make) &
        (used_cars_df['Model'] == model) &
        (used_cars_df['year_made'] == year) &
        (used_cars_df['mileage'].between(min_mileage, max_mileage)) &
        (used_cars_df['fuel_type'] == fuel_type) &
        (used_cars_df['transmission'] == transmission)
    ]
    
    if not matched_cars.empty:
        estimated_price = matched_cars['price'].mean()
    else:
        # If no exact match, try to find similar cars by relaxing the year and mileage criteria
        similar_cars = used_cars_df[
            (used_cars_df['Make'] == make) &
            (used_cars_df['Model'] == model) &
            (used_cars_df['mileage'].between(min_mileage, max_mileage)) &
            (used_cars_df['fuel_type'] == fuel_type) &
            (used_cars_df['transmission'] == transmission)
        ]

        if not similar_cars.empty:
            estimated_price = similar_cars['price'].mean()
        else:
            return "Sorry, we couldn't find a similar car in our database. Please try entering different details."
    
    car_rating = ratings_df[
        (ratings_df['Make'] == make) &
        (ratings_df['Model'] == model)
    ]['car_rating'].mean()

    # Render the estimate page with the results
    return render_template('estimate.html', estimated_price=f"${estimated_price:,.2f}", car_rating=f"{car_rating:.2f}")

if __name__ == '__main__':
    app.run(debug=True)
