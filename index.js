

const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const searchInput = document.querySelector("[data-searchInput]");
const grantAccessButton = document.querySelector("[data-grantAccess]");



let currentTab = userTab;

const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

currentTab.classList.add("current-tab");

getFromSessionStorage();




function switchTab(clickedTab) {

    if (clickedTab !== currentTab) {

        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // User clicked Search Weather tab
        if (!searchForm.classList.contains("active")) {

            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");

            searchForm.classList.add("active");
        }

        // User clicked Your Weather tab
        else {

            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});



// SESSION STORAGE

function getFromSessionStorage() {

    const localCoordinates =
        sessionStorage.getItem("user-coordinates");

    if (!localCoordinates) {

        grantAccessContainer.classList.add("active");
    }
    else {

        const coordinates = JSON.parse(localCoordinates);

        fetchUserWeatherInfo(coordinates);
    }
}


// FETCH USER WEATHER

async function fetchUserWeatherInfo(coordinates) {

    const { lat, lon } = coordinates;

    grantAccessContainer.classList.remove("active");

    loadingScreen.classList.add("active");

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        loadingScreen.classList.remove("active");

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);

    }
    catch (error) {

        loadingScreen.classList.remove("active");

        alert("Unable to fetch weather data.");
        console.error(error);
    }
}


// DISPLAY WEATHER DATA

function renderWeatherInfo(weatherInfo) {

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;

    countryIcon.src =
        `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    weatherDesc.innerText =
        weatherInfo?.weather?.[0]?.description;

    weatherIcon.src =
        `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    temp.innerText =
        `${weatherInfo?.main?.temp} °C`;

    windspeed.innerText =
        `${weatherInfo?.wind?.speed} m/s`;

    humidity.innerText =
        `${weatherInfo?.main?.humidity}%`;

    cloudiness.innerText =
        `${weatherInfo?.clouds?.all}%`;
}


// GEOLOCATION

function getLocation() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(
            showPosition,
            showLocationError
        );
    }
    else {

        alert("Geolocation is not supported by your browser.");
    }
}

function showPosition(position) {

    const userCoordinates = {

        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    sessionStorage.setItem(
        "user-coordinates",
        JSON.stringify(userCoordinates)
    );

    fetchUserWeatherInfo(userCoordinates);
}

function showLocationError(error) {

    switch (error.code) {

        case error.PERMISSION_DENIED:
            alert("Location access denied.");
            break;

        case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable.");
            break;

        case error.TIMEOUT:
            alert("Location request timed out.");
            break;

        default:
            alert("An unknown error occurred.");
    }
}

grantAccessButton.addEventListener("click", getLocation);


// SEARCH WEATHER

searchForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const cityName = searchInput.value.trim();

    if (cityName === "") {
        return;
    }

    fetchSearchWeatherInfo(cityName);
});


async function fetchSearchWeatherInfo(city) {

    loadingScreen.classList.add("active");

    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        loadingScreen.classList.remove("active");

        if (data.cod !== 200) {

            alert("City not found.");
            return;
        }

        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);

        // Clear input after successful search
        searchInput.value = "";
    }
    catch (error) {

        loadingScreen.classList.remove("active");

        alert("Unable to fetch weather data.");

        console.error(error);
    }
}
