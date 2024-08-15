async function searchImages() {
    const make = document.getElementById('search-make').value;
    const model = document.getElementById('search-model').value;
    const apiKey = "lMS8h7arpMrRVWgniBbl464TISqNklDqsSAus0k5UyDJJFurxrhAEkLL"; 
    const numImages = 1;

    if (!make || !model) {
        alert('Please enter both make and model.');
        return;
    }

    const searchQuery = `${make} ${model} car`;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${numImages}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = '';

        if (data.photos.length === 0) {
            imageContainer.innerHTML = 'No images found.';
        } else {
            data.photos.forEach(photo => {
                const img = document.createElement('img');
                img.src = photo.src.original;
                img.alt = 'Car image';
                imageContainer.appendChild(img);
            });
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        alert('Error fetching images. Please try again.');
    }
}
