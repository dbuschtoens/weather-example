# Typescript Weather App Example
The Typescript Weather App example showcases Tabris.js applications written in Typescript.
The App downloads weather data of the specified city from [OpenWeatherMap.org](http://openweathermap.org/) and displays current conditions 
as well 5 days forecast.

## Install instructions
To install the Typescript compiler from [npm](https://www.npmjs.org/), the Node.js package manager, 
excecute `npm install -g typescript` in the examples root directory.
The example requires some additional type definition files. To acquire those, install the Typings type definition manager with
`npm install -g typings`, then let Typings install the dependencies listed in the typings.json file with `typings install`.
Finally, write `tsc` to run the Typescript compiler that will generate the JavaScript files in `/bin/`. 