//personal api key for openweather app 3d005f4d0f3648acfe6e759525b9d5aa
fetch("")
    .then(response => response.json())
    .then(citiesFound => {
        let firstCity = citiesFound[0];
        console.log(firstCity.lat);
        console.log(firstCity.lon);

    })

fetch("")
    .then(response => response.json())
    .then(data => {

        console.log(data);
    })