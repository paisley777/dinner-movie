/****VARIABLES****/

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBRfkljGgrEpQeHXHPNwuvfVUDEGorXftg",
    authDomain: "dinner-37e02.firebaseapp.com",
    databaseURL: "https://dinner-37e02.firebaseio.com",
    projectId: "dinner-37e02",
    storageBucket: "",
    messagingSenderId: "169741609516"
};
firebase.initializeApp(config);
// Create a variable to reference the database.
var database = firebase.database();

//variables to store user preferences
var userLatitude; //41.8898727;
var userLongitude;       //-87.6271137;
var userCuisine;
var userMovie;

var restaurant;
var restaurantLatitude;
var restaurantLongitude;
var omdbMovieData;
var moviePoster;

//variables for google maps
var map;
var service;
var infowindow;
var zip;
var city;
var state;


$(document).ready(function() {

    /****EVENTS****/

    init();

    /*Zip Code form area start*/
    //when the user clicks off of the zip field:
    $('#zip').keyup(function() {
        if ($(this).val().length == 5) {
            zip = $(this).val();
            city = '';
            state = '';
            //make a request to the google geocode api
            $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + zip)
                .success(function(response) {
                    //find the city and state
                    var address_components = response.results[0].address_components;
                    // find geo codes
                    var geometry = response.results[0].geometry.location;
                    //set the user latitude and longitude variables equal to values returned from this API call
                    userLatitude = response.results[0].geometry.location.lat;
                    userLongitude = response.results[0].geometry.location.lng;

                    $.each(address_components, function(index, component) {
                        var types = component.types;
                        $.each(types, function(index, type) {
                            if (type == 'locality') {
                                city = component.long_name;
                            }
                            if (type == 'administrative_area_level_1') {
                                state = component.short_name;
                            }
                        });
                    });
                    //pre-fill the city and state
                    var cities = response.results[0].postcode_localities;
                    if (cities) {
                        //turn city into a dropdown if necessary
                        var $select = $(document.createElement('select'));
                        console.log(cities);
                        $.each(cities, function(index, locality) {
                            var $option = $(document.createElement('option'));
                            $option.html(locality);
                            $option.attr('value', locality);
                            if (city == locality) {
                                $option.attr('selected', 'selected');
                            }
                            $select.append($option);
                        });
                        $select.attr('id', 'city');
                        $('#city_wrap').html($select);
                    } else {
                        $('#city').val(city);
                    }
                    $('#state').val(state);
                    focusMap();
                });
        }
    });
    /*Zip Code form area end*/

    //On click of the submit button
    $('#js-submit').on('click', function() {
        event.preventDefault();
        userCuisine = $('#js-cuisine option:selected').text();
        userMovie = $('#js-movie option:selected').text();
        database.ref().set({
            cuisineChoice: userCuisine
        });
        getRestaurants();
        selectMovie();
        $('#download').hide();
        $('#js-result-area').show();
    });

    //On click of the "Show Another Result" button
    $('#js-result').on('click', '#js-another-result', function() {
        event.preventDefault();
        userCuisine = $('#js-cuisine option:selected').text();
        userMovie = $('#js-movie option:selected').text();
        database.ref().set({
            cuisineChoice: userCuisine
        });
        getRestaurants();
        $('#download').hide();
        $('#js-result-area').show();
    });

    //On click of the "Start New Search" button
    $('#js-search-summary').on('click', '#js-new-search', function() {
        reset();
    });

    /****FUNCTIONS****/

    function init() {
        $('#js-result-area').hide();
        //focusMap();
    }

    function reset() {
        $('#js-restaurant').empty();
        $('#js-suggested-movie').empty();
        $('#js-movie-poster').empty();
        $('#js-result-area').hide();
        $('#download').show();
        $('#zip').val('');
        $('#city').val('');
        $('#state').val('');
        $('#js-cuisine').val('');
        $('#js-movie').val('');
    }

    //set initial state of the map
    function focusMap() {
        var userLocation = new google.maps.LatLng(userLatitude, userLongitude);
        $('#map').empty();
        map = new google.maps.Map(document.getElementById('map'), {
            center: userLocation,
            zoom: 15
        });

        service = new google.maps.places.PlacesService(map);
    }


    //identify restaurants in the user's preferred location
    function getRestaurants() {
        var userLocation = new google.maps.LatLng(userLatitude, userLongitude);
        map = new google.maps.Map(document.getElementById('map'), {
            center: userLocation,
            zoom: 15
        });

        var request = {
            location: userLocation,
            radius: '5000',
            type: 'restaurant',
            query: userCuisine,
        };

        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
    }

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            restaurant = results[Math.floor(Math.random() * results.length)];
            restaurantLatitude = restaurant.geometry.location.lat();
            restaurantLongitude = restaurant.geometry.location.lng();
            showResults();
            restaurantMap();
        }
    }

    function restaurantMap() {
        var restaurantLocation = new google.maps.LatLng(restaurantLatitude, restaurantLongitude);
        map = new google.maps.Map(document.getElementById('map'), {
            center: restaurantLocation,
            zoom: 15
        });

        service = new google.maps.places.PlacesService(map);
        createMarker(restaurant);
    }

    function createMarker(restaurant) {
        var placeLoc = restaurant.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: restaurant.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(restaurant.name);
            infowindow.open(map, this);
        });
    }

    function showResults() {
        $('#js-search-summary').empty();
        $('#js-search-summary').append('<button id="js-new-search" name="singlebutton" class="btn btn-primary center-block button-margin">' 
            + 'Start New Search' + '</button>');
        $('#js-search-summary').append('Location: ' + city + ', ' + state + ' (' + zip + ')'
            + ' > ' + 'Cuisine Choice: ' + userCuisine + ' > ' + 'Movie Choice: ' + userMovie);
        $('#js-restaurant').html('');
        $('#js-restaurant').append('<h4> RESTAURANT </h4>')
            .append('<div>' + restaurant.name + '</div>')
            .append('<div>' + restaurant.formatted_address + '</div>')
            .append('<div>' + 'Rating: ' + restaurant.rating + '</div>')
            .append('<div>' + 'Price Level: ' + restaurant.price_level + '</div>');
    }

    // NewYorkTimes Api
    function selectMovie() {
        var queryURLBase = "http://api.nytimes.com/svc/movies/v2/reviews/search.json?critics-pick=Y?order=by-date&offset=40?api-key=";
        var url = "https://api.nytimes.com/svc/movies/v2/reviews/all.json";
        url += '?' + $.param({
            'api-key': "2a07bb238d094d32b7f873239d20c426",
            'offset': 40,
            'order': "by-publication-date"
        });

        $.ajax({
            url: url,
            method: 'GET',
        }).done(function(NYTData) {
            var movieNames = [];
            for (i = 0; i < NYTData.results.length; i++) {
                movieNames.push(NYTData.results[i].display_title);
            };
            // RandomMovie from NYTData
            var movieNameRandom = movieNames[Math.floor(Math.random() * movieNames.length)];

            // OMDB Api call area
            var queryURL = "https://www.omdbapi.com/?t=" + movieNameRandom + "&y=&plot=short&apikey=40e9cece";
            $.ajax({
                url: queryURL,
                method: "GET"
            }).done(function(movieData) {
                omdbMovieData = movieData;
                $('#js-suggested-movie').html('');
                $('#js-movie-poster').html('');
                $('#js-suggested-movie').append('<h4> MOVIE </h4>')
                    .append('<div>' + 'Title: ' + omdbMovieData.Title + '</div>')
                    .append('<div>' + 'Plot: ' + omdbMovieData.Plot + '</div>')
                    .append('<div>' + 'Rated: ' + omdbMovieData.Rated + '</div>');
                var imageUrl = omdbMovieData.Poster;
                var moviePoster = $('<img class="posn-ctr">');
                moviePoster.attr('src', imageUrl);
                $('#js-movie-poster').append(moviePoster); 
            });
        }).fail(function(err) {
            throw err;
            selectMovie();
        });
    }

});


