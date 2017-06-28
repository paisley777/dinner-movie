/****VARIABLES****/

$(document).ready(function() {

	//set up the variables
	var app = {
		baseURL: 'https://maps.googleapis.com/maps/api/place/textsearch/json?',
		apiKey: 'AIzaSyCF-u9yzrDchVCCHPBslU2CoC3o_JZnczU',
	};



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


/****EVENTS****/

	/*set initial state of page, showing buttons for each interest in array */

	/*on click of submit button, call the API*/
	$('#js-submit').on('click', function() {
		var userLocation = $('#js-location').val();
		var userCuisine = $('#js-cuisine').val();
		var userMovie = $('#js-movie').val();

		//construct the URL for the API call
		var queryURL = app.baseURL + 
			'query=restaurants+in+' + userLocation +
			'&limit=' + app.limit +
			'&key=' + app.apiKey;

		console.log(queryURL);

		//call the API
		$.ajax({
        	url: queryURL,
        	method: 'GET'
      	}).done(function(response) {
      		console.log(response)
      		})

	/****FUNCTIONS****/


});