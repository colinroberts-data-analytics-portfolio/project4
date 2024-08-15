const csvFiles = [
  "/resources/used_carswithindex.csv",
  "/resources/ratings_used_cars.csv"
];

let usedCars = []; // Global variable to store used cars data
let ratings = []; // Global variable to store ratings data

function fetchCSVs(files) {
  const promises = files.map(file => 
    fetch(file)
      .then(response => response.text())
      .then(data => {
        return new Promise((resolve, reject) => {
          Papa.parse(data, {
            header: true,
            complete: function(results) {
              resolve({ file, data: results.data });
            },
            error: function(error) {
              reject(error);
            }
          });
        });
      })
  );

  // Wait for all CSV files to be processed
  Promise.all(promises)
    .then(results => {
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
    })
    .catch(error => console.error('Error fetching or parsing CSV files:', error));
}

// Automatically fetch CSV data when the page loads
window.onload = function() {
  fetchCSVs(csvFiles);
};


///========================================================================================================================================

