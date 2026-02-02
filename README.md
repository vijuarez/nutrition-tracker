# 🍏 Nibbly Nutrition Tracker

Nibbly Nutrition Tracker is a self-hosted service that helps users easily **track their nutrition** by weighing and logging food. Simply weigh your food, input it into the app, and instantly receive detailed nutrition data such as calories, macros and fiber.

<img src="https://github.com/imivi/nutrition-tracker/blob/main/docs/video.gif" alt="Video">

<img src="https://github.com/imivi/nutrition-tracker/blob/main/docs/screenshot1.jpg" alt="Screenshot">

<img src="https://github.com/imivi/nutrition-tracker/blob/main/docs/screenshot2.jpg" alt="Screenshot">

❗**Note** Nibbly Nutrition Tracker is in active development, and at this time users are required to enter their own foods before using the service.

## Features

* Add and customize your own foods
* Super fast data input with fuzzy text matching
* Single user authentication
* Workout calorie tracking

## How to use

Enter the weighed foods in this format: `<weight in grams> <food name>`, for example:

```txt
50 bread
65 potato
50 cauliflower
12 dark chocolate
```

You can also add calories explicitly. For example, `100c cupcake` will add 100 Calories even if no food named "cupcake" is found.

The application will perform **fuzzy text analysis** to find the best matching foods.

✅ No need to manually enter each food via a separate menu!

## How to install

Requirements: Docker, a publicly available server, and a domain with SSL (HTTPS) setup.

1. Clone the repository: `git clone https://github.com/imivi/nutrition-tracker`
1. Rename .env.example to .env and adjust ports if needed
1. Run using Docker compose: `docker compose up`. By default the API runs on port 4000 and the frontend on port 3000. The SQLite database will be located inside `api/database`.
1. Configure a reverse proxy (Nginx, Apache) to proxy requests from your domain to the API and frontend. These may be different domains, as the API configures CORS appropriately.
1. On first launch, you will be prompted to create a new account.