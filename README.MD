# Visualization Tool for Edmonton Real-Estate Prices

A web application that allows a user to visualize a collection of geographic data (a geographic coordinate along with a numeric value attribute), stored in a CSV file, using an interactive, three-dimensional map. Each data point is represented as a vertical bar, with its length representing a market price.

![Preview](https://github.com/IgorMalis/gis-edm-realestate-prices/blob/master/screens/preview.png?raw=true)

- Uses [MapBox](https://www.mapbox.com/) and [Deck.gl](https://deck.gl/) to visualize the dataset
- The Deck.gl HexagonCellLayer class has been extended to allow a custom colour-coding scheme. A tooltip showing the price and location is shown when the cursor hovers over each bar
- Several configurable options are available: the radius of each bar, adjusting the lower and upper percentiles (showing a fraction of the data, arranged by price), a multiplication factor, and seeing the data in linear or log scale
- Material UI is used for the user interface styling (card, typography, and UI controls)
- The application is built using Node.js and JavaScript. Webpack is used to serve and package the JavaScript/HTML/CSS code. JavaSctipt ES2015+ code is supported using the buble loader for webpack
- The data is stored in a CSV file (`data.csv`), where the three columns represent the longitude, latitude, and market value, respectively
- Data obtained from Edmonton.ca's 2015-2016 [property assessment historical data](https://data.edmonton.ca/City-Administration/Property-Assessment-Data-Historical-/qi6a-xuwt/data)

## Instructions

Make sure you have Node.js v20 and npm installed. To run the code, first clone the repository, navigate into the repository's directory, and modify the `app.js` file by setting the `MAPBOX_TOKEN` variable to your MapBox API token.

Next, install the required Node.js packages and launch the application:

```bash
npm install
npm run start
```

The application will launch in your default web browser, where it will be available at address `http://localhost:8080/`

## How to

Use the mouse to pan the view. The scroll wheel can be used to zoom in & out, control/command + click while moving the mouse sideways can be used to modify the azimuth, and control/command + click while moving the mouse vertically can be used to modify the altitude of the camera. 

Hovering over a bar will highlight it and show a tooltip with the value associated with that data point:

![Tooltip](https://github.com/IgorMalis/gis-edm-realestate-prices/blob/master/screens/tooltip.png?raw=true)
