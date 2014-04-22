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
	parsedDate = new Date(date);
	var month = parsedDate.getMonth();
	var day = parsedDate.getDate();
	var year = parsedDate.getFullYear();
	newdate = day + "/" + month + "/" + year;
	return newdate;
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

 
     