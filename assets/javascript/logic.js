/****VARIABLES****/

var userLatitude = 41.8898727;
var userLongitude = -87.6271137;
var map;
var service;
var infowindow;

$(document).ready(function() {

    /****EVENTS****/

    focusMap();

    /*Zip Code form area start*/
    //when the user clicks off of the zip field:
    $('#zip').keyup(function() {
        if ($(this).val().length == 5) {
            var zip = $(this).val();
            var city = '';
            var state = '';
            console.log(zip);
            //make a request to the google geocode api
            $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + zip)
                .success(function(response) {
                    //find the city and state
                    var address_components = response.results[0].address_components;
                    // find geo codes
                    var geometry = response.results[0].geometry.location;
                    console.log(geometry);
                    //set the user latitude and longitude variables equal to values returned from this API call
                    userLatitude = response.results[0].geometry.location.lat;
                    userLongitude = response.results[0].geometry.location.lng;
                    console.log(userLatitude);
                    console.log(userLongitude);

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


    /****FUNCTIONS****/

    //focus the map on pre-defined or user-selected latitude and longitude
    function focusMap() {
        var userLocation = new google.maps.LatLng(userLatitude,userLongitude);
        map = new google.maps.Map(document.getElementById('map'), {
            center: userLocation,
            zoom: 15
        });

        var request = {
            location: userLocation,
            radius: '500',
            query: 'restaurant'
        };

        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
    }

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                if (i<3) console.log(place);
                else
                break;
                createMarker(results[i]);
            }
          }
        }

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
    }

});



/*REFERENCE CODE*/

    /* Sample code to initialize firebase; we need to figure out how we are using firebase for 
    this project and copy out the new code 
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAfPrXNiyLnAF9X7NscB0kXXAwyz4evTB4",
        authDomain: "newsbusters-14959.firebaseapp.com",
        databaseURL: "https://newsbusters-14959.firebaseio.com",
        projectId: "newsbusters-14959",
        storageBucket: "newsbusters-14959.appspot.com",
        messagingSenderId: "801909748364"
    };

    firebase.initializeApp(config);
    */

    /*THIS WAS TO CALL GOOGLE PLACES API - PROBABLY NO LONGER NEEDED*/
/*    $('#js-submit').on('click', function() {
        event.preventDefault();
        //var userLocation = $('#js-location option:selected').text();
        var userCuisine = $('#js-cuisine option:selected').text();
        var userMovie = $('#js-movie option:selected').text();

        console.log(app.userLatitude, app.userLongitude);
        console.log(userCuisine);
        console.log(userMovie);

        //construct the URL for the API call
        var queryURL = app.baseURL +
            'query=' + userCuisine +
            '&location=' + app.userLatitude + ',' + app.userLongitude +
            '&radius=8000' +
            '&type=restaurant' +
            '&key=' + app.apiKey; 

        //ISSUE: when this URL logs in the console, the userLatitute and userLongitude are truncated
        //That is causing the API call to fail
        console.log(queryURL);

        //call the API
        $.ajax({
            url: queryURL,
            method: 'GET',
            dataType: 'jsonp'
        }).done(function(response) {
            console.log(response)
        })
    });*/