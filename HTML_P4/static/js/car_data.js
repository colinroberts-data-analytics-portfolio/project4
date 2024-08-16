const csvFiles = [
  "/resources/used_carswithindex.csv",
  "/resources/ratings_used_cars.csv"
];

let usedCars = []; // Global variable to store used cars data
let ratings = []; // Global variable to store ratings data

// Fetch and parse CSV files
async function fetchCSVs(files) {
  try {
    const promises = files.map(file => 
      fetch(file)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok for ${file}`);
          }
          return response.text();
        })
        .then(data => 
          new Promise((resolve, reject) => {
            Papa.parse(data, {
              header: true,
              skipEmptyLines: true, // Ignore empty lines
              complete: results => resolve({ file, data: results.data }),
              error: error => reject(error)
            });
          })
        )
    );

    // Wait for all CSV files to be processed
    const results = await Promise.all(promises);

    results.forEach(result => {
      console.log('File:', result.file);
      console.log('Data:', result.data); // Parsed CSV data

      // Store the data in global variables based on file names
      if (result.file.includes('used_cars')) {
        usedCars = result.data; // Store data for later use
      } else if (result.file.includes('ratings_used_cars')) {
        ratings = result.data; // Store data for later use
      }
    });

    // You can now use usedCars and ratings as needed
    console.log('Used Cars Data:', usedCars);
    console.log('Ratings Data:', ratings);

    // Call functions to populate dropdowns or handle data
    populateDropdowns();
  } catch (error) {
    console.error('Error fetching or parsing CSV files:', error);
  }
}

// Populate dropdown menus based on available data
function populateDropdowns() {
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

  usedCars.forEach(car => {
    // Ensure the fields exist and are not undefined or empty
    if (car.Make && car.Model) {
      makes.add(car.Make.trim());
      if (!modelsByMake[car.Make]) modelsByMake[car.Make] = new Set();
      modelsByMake[car.Make].add(car.Model.trim());
      years.add(parseInt(car.year_made, 10));
      fuelTypes.add(car.fuel_type ? car.fuel_type.trim() : 'Unknown');
      transmissions.add(car.transmission ? car.transmission.trim() : 'Unknown');
    } else {
      console.warn('Skipping car due to missing Make or Model:', car);
    }
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
}

// Populate a dropdown with values
function populateDropdown(id, values) {
  const select = document.getElementById(id);
  if (!select) {
    console.error(`Dropdown with id "${id}" not found.`);
    return;
  }
  select.innerHTML = '<option value="" disabled selected>Select</option>'; // Ensure there's always a default option
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

// Automatically fetch CSV data when the page loads
window.onload = function() {
  fetchCSVs(csvFiles);
};

///========================================================================================================================================

