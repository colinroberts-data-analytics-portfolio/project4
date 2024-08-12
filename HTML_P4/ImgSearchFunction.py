import requests

def get_car_images_pexels(make, model, api_key, num_images=5):
    search_query = f"{make} {model} car"
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": api_key}
    params = {"query": search_query, "per_page": num_images}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    search_results = response.json()

    image_urls = []
    if search_results["photos"]:
        for photo in search_results["photos"]:
            image_urls.append(photo["src"]["original"])

    return image_urls

# Example usage
make = "Chevy"
model = "Silverado"
api_key = "lMS8h7arpMrRVWgniBbl464TISqNklDqsSAus0k5UyDJJFurxrhAEkLL"

image_urls = get_car_images_pexels(make, model, api_key, num_images=5)
print("Image URLs:")
for url in image_urls:
    print(url)
import requests
import matplotlib.pyplot as plt
from io import BytesIO
from PIL import Image

def fetch_and_print_image(url):
    response = requests.get(url)
    response.raise_for_status()

    img = Image.open(BytesIO(response.content))

    plt.imshow(img)
    plt.axis('off')
    plt.show()

for url in image_urls:
    fetch_and_print_image(url)