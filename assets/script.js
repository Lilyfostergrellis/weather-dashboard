$(document).ready(function () {
    // We want to limit the number of cities in search history to 9
    const HISTORY_LIMIT = 9;
    // Populate search history when the page loads first time(or when it is refreshed)
    populateSearchHistory()

    //Saving the user's input into a variable and call the function that displays the weather info
    $('#search-button').click(function (event) {
        event.preventDefault();
        var cityName = $('#search-input').val().trim()
        if (cityName !== "") { //checks if the user input is not empty
            displayCityWeather(cityName);
            if (!isCityInHistory(cityName)){
                storeCityToLocalStorage(cityName);
                populateSearchHistory();
            }   
        }
    })
    //hecking to see if the city is in the local Storage 
    function isCityInHistory(cityName) {
        cities = getCitiesArrayFromLocalStorage()

        for (let i = 0; i < HISTORY_LIMIT; i++) {
            if (cities[i] === cityName) {
                return true
            }
        }
        return false
    }



    function getCitiesArrayFromLocalStorage() {
        var cities = localStorage.getItem("cities")
        if (cities === null) {
            localStorage.setItem("cities", JSON.stringify([]))
        }
        return JSON.parse(localStorage.getItem("cities"))
    }
    //Stores the city names in the local storage
    function storeCityToLocalStorage(cityName) {
        var cities = getCitiesArrayFromLocalStorage()
        cities.unshift(cityName)
        localStorage.setItem("cities", JSON.stringify(cities));
    }
    //Renders the history buttons
    function populateSearchHistory() {
        $('#history').empty()
        var citiesSearchHistory = getCitiesArrayFromLocalStorage()
        for (let i = 0; i < citiesSearchHistory.length; i++) {
            if (i + 1 <= 9) {
                var button = createSearchHistoryBtn(citiesSearchHistory[i])
                $('#history').append(button)
            }

        };
    }
    //Creates the city history buttons
    function createSearchHistoryBtn(city) {
        var buttonEl = $('<button>').addClass('btn btn-secondary search-button btn-block text-capitalize').text(city).css({'color': 'black'});
        buttonEl.click(function (event) {
            displayCityWeather(city);
        });
        return buttonEl
    }

    //Displays both the current weather and 5 day weather forecast
    function displayCityWeather(cityName) {
        var APIkey = '52d558d3ab565a0485f70b38fab6c332'
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIkey;


        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            displayCityCurrentWeather(cityName, response);
            return { lon: response.coord.lon, lat: response.coord.lat }

        }).then(function ({ lon, lat }) {
            var queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}`;

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                displayFiveDayForecast(response);
            });
        });
    }

    //Displays the current weather conditions
    function displayCityCurrentWeather(cityName, data) {
        $('#today').empty();
        $('#today').append(createCurrentWeatherCard(cityName, data));
    }
    //Displays the weather forecast for 5 days
    function displayFiveDayForecast(data) {
        $('#forecast').empty();
        $('#forecast-title').removeClass('invisible')

        //Appends the different days weather by looping through the time stamps
        //With the 3-hour step APIdata a day has 8 time stamps,
        //We iterate at the 8th time stamp through the 40 timestamps count
        for (var i = 7; i < data.cnt; i += 8) {
            $('#forecast').append(createForecastCard(data.list[i]));
        }
    }
    //This creates the current weather card
    function createCurrentWeatherCard(cityName, weatherData) {

        function createTitleElement(cityName, weatherData) {
            var date = formatDate(weatherData.dt);
            var iconURL = getWeatherIconURL(weatherData.weather[0].icon);

            var iconEl = $('<img>').attr('src', iconURL)
            var titleEl = $('<h4>').addClass('card-title text-capitalize')
            var imageSpanEl = $('<span>').html(iconEl)

            return titleEl.text(cityName + ' ' + '(' + date +')').append(imageSpanEl)
        }

        var cardEl = $('<div>').addClass('card mr-2').css({ 'width': '62rem' })
        var cardBody = $('<div>').addClass('card-body')

        var titleEl = createTitleElement(cityName, weatherData)
        const { tempEl, windEl, humidityEl } = createWeatherStatsElements(weatherData)

        cardBody.append(titleEl, tempEl, windEl, humidityEl);
        cardEl.append(cardBody);

        return cardEl;
    }
    //builds up the forecast card used by the 5 days forecast
    function createForecastCard(weatherData) {
        var date = formatDate(weatherData.dt);
        var iconURL = getWeatherIconURL(weatherData.weather[0].icon)

        var cardEl = $('<div>').addClass('card mr-2').css({ 'width': '12rem' })
        var cardBody = $('<div>').addClass('card-body').css({ 'color': 'white', 'background-color': '#001A53' })
        var dateEl = $('<h5>').addClass('card-title').text(date)
        var iconEl = $('<img>').attr('src', iconURL)
        const { tempEl, windEl, humidityEl } = createWeatherStatsElements(weatherData)

        cardBody.append(dateEl, iconEl, tempEl, windEl, humidityEl);
        cardEl.append(cardBody);

        return cardEl;
    }
    //Creates element that hold the weather statistics
    function createWeatherStatsElements(weatherData) {
        var tempCelsius = convertTempToCelsius(weatherData.main.temp)
        var humidity = weatherData.main.humidity
        var windSpeedKPH = convertWindSpeedToKPH(weatherData.wind.speed)

        var tempEl = $('<p>').addClass('card-text').text('Temp: ' + tempCelsius + ' °C')
        var windEl = $('<p>').addClass('card-text').text('Wind: ' + windSpeedKPH + ' KPH')
        var humidityEl = $('<p>').addClass('card-text').text('Humidity: ' + humidity + '%')

        return {
            tempEl: tempEl,
            windEl: windEl,
            humidityEl: humidityEl
        }
    }
    //Changing time from unix format to date month and year
    function formatDate(unixTime) {
        return moment.unix(unixTime).format("DD/M/YYYY");
    }
    // Returns the URL for weather icon
    function getWeatherIconURL(iconText) {
        return 'https://openweathermap.org/img/w/' + iconText + '.png';
    }
    //Converts wind speed from MPH to KPH
    function convertWindSpeedToKPH(speed) {
        return Number(speed * 3.6).toFixed(2)
    }
    //Converts temperature from Kelvin to Celsius
    function convertTempToCelsius(tempKelvin) {
        return Number(tempKelvin - 273.15).toFixed(2);
    }
})