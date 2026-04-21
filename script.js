const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-button');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryText = document.querySelector('.country-text');
const tempText = document.querySelector('.temp-text');
const conditionText = document.querySelector('.condition-text');
const humidityValueText = document.querySelector('.humidity-value-text');
const windValueText = document.querySelector('.wind-value-text');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateText = document.querySelector('.current-date-text');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '9af0e9ce23bc11ea6ee44b568ecc6fa9';


/* ================= SEARCH BUTTON ================= */

searchButton.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});


/* ================= AUTO DETECT LOCATION ================= */

window.addEventListener("load", () => {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(position => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            updateWeatherByCoords(lat, lon);

        });

    }

});


/* ================= FETCH DATA ================= */

async function getFetchData(endPoint, query) {

    const apiURL = `https://api.openweathermap.org/data/2.5/${endPoint}?${query}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiURL);

    return response.json();

}


/* ================= WEATHER ICON ================= */

function getWeatherIcon(id) {

    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';

    return 'clouds.svg';

}


/* ================= DATE FORMAT ================= */

function getCurrentDate() {

    const currentDate = new Date();

    const options = {

        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',

    };

    return currentDate.toLocaleDateString('en-GB', options);

}


/* ================= WEATHER BY CITY ================= */

async function updateWeatherInfo(city) {

    const weatherData = await getFetchData('weather', `q=${city}`);

    if (weatherData.cod !== 200) {

        showDisplaySection(notFoundSection);
        return;

    }

    displayWeather(weatherData);

    await updateForecastInfo(`q=${city}`);

}


/* ================= WEATHER BY GPS ================= */

async function updateWeatherByCoords(lat, lon) {

    const weatherData = await getFetchData('weather', `lat=${lat}&lon=${lon}`);

    displayWeather(weatherData);

    await updateForecastInfo(`lat=${lat}&lon=${lon}`);

}


/* ================= DISPLAY WEATHER ================= */

function displayWeather(weatherData) {

    const {

        name,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }

    } = weatherData;

    countryText.textContent = name;
    tempText.textContent = Math.round(temp) + '°C';
    conditionText.textContent = main;
    humidityValueText.textContent = humidity + '%';
    windValueText.textContent = speed + ' m/s';

    currentDateText.textContent = getCurrentDate();

    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    showDisplaySection(weatherInfoSection);

}


/* ================= FORECAST ================= */

async function updateForecastInfo(query) {

    const forecastData = await getFetchData('forecast', query);

    const timeTaken = '12:00:00';

    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';

    forecastData.list.forEach(item => {

        if (
            item.dt_txt.includes(timeTaken) &&
            !item.dt_txt.includes(todayDate)
        ) {

            updateForecastItems(item);

        }

    });

}


function updateForecastItems(weatherData) {

    const {

        dt_txt: date,
        weather: [{ id }],
        main: { temp },

    } = weatherData;

    const dateTaken = new Date(date);

    const dateResult = dateTaken.toLocaleDateString('en-US', {

        day: '2-digit',
        month: 'short',

    });


    const forecastItem = `

        <div class="forecast-item">

            <h5 class="forecast-item-date regular-text">${dateResult}</h5>

            <img src="assets/weather/${getWeatherIcon(id)}"
                 class="forecast-item-img">

            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>

        </div>

    `;

    forecastItemsContainer.insertAdjacentHTML(
        'beforeend',
        forecastItem
    );

}


/* ================= DISPLAY SWITCH ================= */

function showDisplaySection(section) {

    [weatherInfoSection, searchCitySection, notFoundSection]

        .forEach(sec => sec.style.display = 'none');

    section.style.display = 'flex';

}