# TaipeiParkingLot
AngularJS web app to list/speak out Taipei parking lot information

# Before running this project #

You need to provide your google map API key in the file named **googleApiKey.js** under root folder. The content of this file would look like

		module.exports = {
    		dev:"YOUR_GOOGLE_MAP_API_KEY_FOR_DEVELOPMENT_USE",
    		prod:"YOUR_GOOGLE_MAP_API_KEY_FOR_PRODUCTION_USE"
		}

Run the following command to install required npm modules

		npm install

## To Build the angular client app ##

Run this command to build client app

		npm run build

## Develop application with hot-swapping feature ##

		npm run dev


