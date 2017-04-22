//This takes in the weather underground url and key and appends JSON data to the list.

var weatherUgUrl = "http://api.wunderground.com/api/be14625b079a95c8/conditions/q/AZ/Tempe.json";

$.getJSON(weatherUgUrl, function(data) {
    var list = $(".weather ul");
    detail = data.current_observation;
    list.append('<li>Temp: ' + detail.temp_f + '° F</li>');
    list.append('<li><img style="width: 30px" src="' + detail.icon_url + '">  ' + detail.icon + '</li>');
}).error(function(e){
    //If JSON data is not able to load . The user gets this error message
    //credit https://api.jquery.com/error
        $(".weather").append('<p>Oh snap! Weather Underground is not loading. Please try again later or check your internet connection.');
    });

