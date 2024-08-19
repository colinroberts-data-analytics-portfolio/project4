document.addEventListener('DOMContentLoaded', () => {
    const usedCarsCsv = '/resources/used_carswithindex.csv';
    const ratingsCsv = '/resources/ratings_used_cars.csv';

    let usedCarsData = [];
    let ratingsData = [];

    // Function to parse CSV data into JSON using PapaParse
    const parseCSV = (csvText) => {
        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        console.log('CSV Headers:', results.meta.fields);
        return results.data;
    };

    // Function to convert a two-digit year to a four-digit year
    const convertToFourDigitYear = (year) => {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        const yearInt = parseInt(year, 10);
        
        if (isNaN(yearInt)) {
            console.warn(`Year is not a number: "${year}"`);
            return NaN;
        }
        
        if (yearInt < 100) {
            return (yearInt < 50) ? (century + yearInt) : (century - 100 + yearInt);
        }
        return yearInt; // Return as is if already four-digit
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
        
        if (!usedCarsData || usedCarsData.length === 0) {
            console.warn('No data available to populate dropdowns.');
            return;
        }
        
        const makes = new Set();
        const modelsByMake = {};
        const years = new Set();
        const fuelTypes = new Set();
        const transmissions = new Set();
        
        usedCarsData.forEach(car => {
            console.log(`Raw Year Data: ${car['year_made']}`); // Log raw year data

            if (car['Make']) makes.add(car['Make']);
            if (car['Make'] && car['Model']) {
                if (!modelsByMake[car['Make']]) modelsByMake[car['Make']] = new Set();
                modelsByMake[car['Make']].add(car['Model']);
            }
            if (car['year_made']) {
                const trimmedYear = car['year_made'].trim();
                console.log(`Trimmed Year: "${trimmedYear}"`); // Log trimmed year
                const year = convertToFourDigitYear(trimmedYear);
                console.log(`Converted Year: ${year}`); // Log converted year
                if (!isNaN(year)) {
                    years.add(year);
                } else {
                    console.warn(`Invalid year value: "${car['year_made']}"`);
                }
            }
            if (car['fuel_type']) fuelTypes.add(car['fuel_type']);
            if (car['transmission']) transmissions.add(car['transmission']);
        });
        
        const sortedYears = Array.from(years).sort((a, b) => b - a); // Sort years in descending order
        console.log('Sorted Years:', sortedYears);
        
        populateDropdown('make', Array.from(makes));
        populateDropdown('year', Array.from(sortedYears));
        populateDropdown('fuel_type', Array.from(fuelTypes));
        populateDropdown('transmission', Array.from(transmissions));
        
        makeSelect.addEventListener('change', () => {
            const selectedMake = makeSelect.value;
            populateDropdown('model', []);
            const models = modelsByMake[selectedMake] || [];
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