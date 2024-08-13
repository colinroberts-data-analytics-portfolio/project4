from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Create path to the Resources folder
resources_folder = os.path.join(os.path.dirname(__file__), 'Resources')

# Load CSV data
used_cars_df = pd.read_csv(os.path.join(resources_folder, 'used_carswithindex.csv'))
ratings_df = pd.read_csv(os.path.join(resources_folder, 'ratings_used_cars.csv'))

# Extract unique options for dropdowns selected
makes = sorted(used_cars_df['Make'].unique())
models_by_make = used_cars_df.groupby('Make')['Model'].unique().apply(list).to_dict()
years = sorted(used_cars_df['year_made'].unique())
transmissions = sorted(used_cars_df['transmission'].unique())

@app.route('/')
def home():
    return render_template('index.html', makes=makes, years=years, transmissions=transmissions)

@app.route('/get_models', methods=['POST'])
def get_models():
    selected_make = request.form['make']
    models = models_by_make.get(selected_make, [])
    return jsonify(models)

@app.route('/estimate', methods=['POST'])
def estimate():
    try:
        # Capture form data
        make = request.form['make']
        model = request.form['model']
        year = int(request.form['year'])
        mileage_range = request.form['mileage']
        transmission = request.form['transmission']

        # Debugging if none found
        print(f"Received data - Make: {make}, Model: {model}, Year: {year}, Mileage Range: {mileage_range}, Transmission: {transmission}")

        # Extract min and max mileage from the range
        min_mileage, max_mileage = map(int, mileage_range.split('-'))
        print(f"Parsed mileage range - Min: {min_mileage}, Max: {max_mileage}")

        # Find an exact match of selection
        matched_cars = used_cars_df[
            (used_cars_df['Make'] == make) &
            (used_cars_df['Model'] == model) &
            (used_cars_df['year_made'] == year) &
            (used_cars_df['mileage'].between(min_mileage, max_mileage)) &
            (used_cars_df['transmission'] == transmission)
        ]

        if not matched_cars.empty:
            estimated_price = matched_cars['price'].mean()
        else:
            # If no exact match, find the closest match based on Make and Model
            matched_cars = used_cars_df[
                (used_cars_df['Make'] == make) &
                (used_cars_df['Model'] == model)
            ]

            if not matched_cars.empty:
                estimated_price = matched_cars['price'].mean()
            else:
                # If no match found, use the global average price as a last resort
                estimated_price = used_cars_df['price'].mean()

        car_rating = ratings_df[
            (ratings_df['Make'] == make) &
            (ratings_df['Model'] == model)
        ]['car_rating'].mean()

        return render_template('estimate.html', estimated_price=f"${estimated_price:,.2f}", car_rating=f"{car_rating:.2f}")
    except Exception as e:
        print(f"Error occurred: {e}")
        return "An error occurred while processing your request."


if __name__ == '__main__':
    app.run(debug=True)
