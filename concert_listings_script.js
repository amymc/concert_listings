//check if there's more than one result in the array
Handlebars.registerHelper('ifMultiple', function(array, options) {
	if(array.length > 1) {
		return options.fn(this);
	}
	else{
		return options.inverse(this);
	}
});

//check if array is empty
Handlebars.registerHelper('ifEmpty', function(array, options) {
	if(array.length == 0) {
		return options.fn(this);
	}
	else{//if there is only one performer result display events
		return options.inverse(this);
	}
});

//parse event dates
Handlebars.registerHelper('parseDate', function(date) {
	date = new Date(date);
	var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
	parsedDate = date.getDate()+
			"-"+monthNames[date.getMonth()]+
			"-"+pad(date.getFullYear());
	return parsedDate;
});

function pad(num) { return ("0"+num).slice(-2); }


//create 'add to calendar' button with concert details as attributes 
Handlebars.registerHelper('createCalendarButton', function(title, venue, address, city, timezone, date) {
	title = Handlebars.Utils.escapeExpression(title);
	venue = Handlebars.Utils.escapeExpression(venue);
	address = Handlebars.Utils.escapeExpression(address);
	city = Handlebars.Utils.escapeExpression(city);
	timezone = Handlebars.Utils.escapeExpression(timezone);
	date = Handlebars.Utils.escapeExpression(date);

	var result = '<button class="calendar btn btn-primary" title="' + title + '" venue="' + venue + '" address="' + address + '" city="' + city + '" timezone="' + timezone +'" date="' + date +'"> Add to Google Calender </button>';

	return new Handlebars.SafeString(result);
});

$('#search').on('click', find_performers);

var performer_id;

function find_performers(e){
	var source = $("#performer_query").html(); 
	var template = Handlebars.compile(source);
	var performer_data, event_data;
 
	$("#performer_results").html('');
		  var performer_query = $('#search_term').val();
	
		  	//make call to the Seat Geek API with users search query		
			$.getJSON("http://api.seatgeek.com/2/performers?q="+performer_query+"&callback=?", function(performer_data) {
			  //if only one performer matches the search term search for upcoming concerts by this performer
			if(performer_data.performers.length==1){
				performer_id = performer_data.performers[0].id;
				find_concerts(performer_id);
			}
			else{
				//if multiple performers match the search term display all the matches
				$('#performer_results').append(template(performer_data)); 
				//when user clicks the 'view_concerts' button search for upcoming concerts by this performer
				$('.view_concerts').on('click', function(){
					performer_id = $(this).attr("performer");
					find_concerts(performer_id);
				});
			}
		});
}

function find_concerts(perfomer_id){
	var source = $("#event_query").html(); 
	var template = Handlebars.compile(source);
	$("#performer_results").hide();
		//make call to the Seat Geek API with id of the selected performer	
		$.getJSON("http://api.seatgeek.com/2/events?performers.id="+performer_id+"&callback=?", function(concert_data) {
			$('#event_results').append(template(concert_data)); 
			console.log(concert_data);
			$('.calendar').on('click', function(){
			var title= $(this).attr("title");
			var venue= $(this).attr("venue");
			var address= $(this).attr("address");
			var city= $(this).attr("city");
			var timezone= $(this).attr("timezone");
			var start_time= $(this).attr("date");
			var location =  venue + ", " + address + ", " + city;
			//Google calendar requires both a start and end time for events
			//Create end time by adding 4 hours to start time
			Date.prototype.addHours= function(h){
				this.setHours(this.getHours()+h);
				return this;
			};
			var end_time =(new Date(start_time).addHours(4));
			add_to_calendar(title, location, start_time, timezone, end_time);
			}); 
		});
} 

$(document).ready(function() {
	//The user can also search by pressing the enter key instead of clicking the search button
	$('#search_term').keyup(function(event) {
		if (event.keyCode == 13) {
			find_performers();
			return false;
		}
	});
});


function add_to_calendar(title, location, start_time, timezone, end_time) {
	var config = {
	    'client_id': '487743626220-b0qltmpuuvj76o31bls2f04o8ctlocvt.apps.googleusercontent.com',
		'scope': 'https://www.googleapis.com/auth/calendar'
	};
	
	gapi.auth.authorize(config, function() {
		console.log('login complete');
		console.log(gapi.auth.getToken());
	});

	gapi.client.load('calendar', 'v3', function() {
		
		var resource = {
			"summary": title,
			"location": location,
			"start": {
				"dateTime": start_time,
				"timeZone": timezone	
			},
			"end": {
				"dateTime": end_time,
				"timeZone": timezone
			}
		};
			
		var request = gapi.client.calendar.events.insert({
			'calendarId': 'primary',
			'resource': resource
		});

	});
}
  
	 