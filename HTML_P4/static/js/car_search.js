document.addEventListener('DOMContentLoaded', () => {
    const usedCarsCsv = '/resources/used_carswithindex.csv';
    const ratingsCsv = '/resources/ratings_used_cars.csv';

    let usedCarsData = [];
    let ratingsData = [];

    // Function to parse CSV data into JSON
    const parseCSV = (csvText) => {
        const rows = csvText.trim().split('\n').map(row => row.split(','));
        const headers = rows[0];
        return rows.slice(1).map(row => {
            return headers.reduce((obj, header, index) => {
                obj[header] = row[index];
                return obj;
            }, {});
        });
    };

    // Load CSV data and initialize dropdowns
    const loadData = async () => {
        try {
            const [carsResponse, ratingsResponse] = await Promise.all([
                fetch(usedCarsCsv),
                fetch(ratingsCsv)
            ]);
            const carsText = await carsResponse.text();
            const ratingsText = await ratingsResponse.text();
            usedCarsData = parseCSV(carsText);
            ratingsData = parseCSV(ratingsText);
            populateDropdowns();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // Populate dropdown menus based on available data
    const populateDropdowns = () => {
        const makeSelect = document.getElementById('make');
        const modelSelect = document.getElementById('model');
        const yearSelect = document.getElementById('year');
        const fuelTypeSelect = document.getElementById('fuel_type');
        const transmissionSelect = document.getElementById('transmission');

        const makes = new Set();
        const modelsByMake = {};
        const years = new Set();
        const fuelTypes = new Set();
        const transmissions = new Set();

        usedCarsData.forEach(car => {
            makes.add(car.Make);
            if (!modelsByMake[car.Make]) modelsByMake[car.Make] = new Set();
            modelsByMake[car.Make].add(car.Model);
            years.add(parseInt(car.year_made, 10)); // Ensure year is an integer
            fuelTypes.add(car.fuel_type);
            transmissions.add(car.transmission);
        });

        // Log data to verify correct parsing and population
        console.log('Makes:', Array.from(makes));
        console.log('Models by Make:', modelsByMake);
        console.log('Years:', Array.from(years));
        console.log('Fuel Types:', Array.from(fuelTypes));
        console.log('Transmissions:', Array.from(transmissions));

        // Populate dropdowns
        populateDropdown('make', Array.from(makes));
        populateDropdown('year', Array.from(years).sort((a, b) => b - a)); // Sort years in descending order
        populateDropdown('fuel_type', Array.from(fuelTypes));
        populateDropdown('transmission', Array.from(transmissions));

        // Event listener for make dropdown
        makeSelect.addEventListener('change', () => {
            const selectedMake = makeSelect.value;
            console.log(`Selected Make: ${selectedMake}`); // Debugging line

            // Clear model dropdown when make changes
            populateDropdown('model', []);

            const models = modelsByMake[selectedMake] || [];
            console.log(`Available Models for Make ${selectedMake}:`, models); // Debugging line
            populateDropdown('model', Array.from(models));
        });
    };

    // Populate a dropdown with values
    const populateDropdown = (id, values) => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="" disabled selected>Select</option>'; // Ensure there's always a default option
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };

    // Handle form submission to estimate car price
    document.getElementById('estimate-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const { make, model, year, mileage, fuel_type, transmission } = data;
        
        // Handle mileage input
        const [minMileage, maxMileage] = mileage.split('-').map(val => val === '100001+' ? 100001 : Number(val));

        // Filter cars based on form data
        let filteredCars = usedCarsData.filter(car => {
            return (
                car.Make === make &&
                car.Model === model &&
                parseFloat(car.year_made) === year &&
                (mileage === '100001+' ? parseFloat(car.mileage) >= 100001 : (parseFloat(car.mileage) >= minMileage && parseFloat(car.mileage) <= maxMileage)) &&
                car.fuel_type === fuel_type &&
                car.transmission === transmission
            );
        });

        // Broaden search if no exact matches
        if (filteredCars.length === 0) {
            filteredCars = usedCarsData.filter(car => {
                return (
                    car.Make === make &&
                    car.Model === model &&
                    (mileage === '100001+' ? parseFloat(car.mileage) >= 100001 : (parseFloat(car.mileage) >= minMileage - 50000 && parseFloat(car.mileage) <= maxMileage + 50000)) &&
                    car.fuel_type === fuel_type &&
                    car.transmission === transmission
                );
            });
        }
        if (filteredCars.length === 0) {
            filteredCars = usedCarsData.filter(car => car.Make === make && car.Model === model);
        }
        if (filteredCars.length === 0) {
            filteredCars = usedCarsData.filter(car => car.Make === make);
        }
        if (filteredCars.length === 0) {
            filteredCars = usedCarsData;
        }

        // Calculate estimated price
        const estimatedPrice = filteredCars.length > 0
            ? filteredCars.reduce((sum, car) => sum + parseFloat(car.price), 0) / filteredCars.length
            : 0;

        // Calculate car rating
        const rating = ratingsData.filter(r => r.Make === make && r.Model === model);
        const carRating = rating.length > 0
            ? rating.reduce((sum, r) => sum + parseFloat(r.car_rating), 0) / rating.length
            : 0;

        // Display results
        document.getElementById('results').innerHTML = `
            <h2>Estimated Price: $${estimatedPrice.toFixed(2)}</h2>
            <h3>Car Rating: ${carRating.toFixed(2)}</h3>
        `;
    });

    loadData();
});
