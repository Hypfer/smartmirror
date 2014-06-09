jQuery.fn.updateWithText = function(text, speed)
{
	var dummy = $('<div/>').html(text);

	if ($(this).html() != dummy.html())
	{
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
				//done
			});		
		});
	}
} 

jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function roundVal(temp)
{
	return Math.round(temp * 10) / 10;
}

function kmh2beaufort(kmh)
{
	var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
	for (var beaufort in speeds) {
		var speed = speeds[beaufort];
		if (speed > kmh) {
			return beaufort;
		}
	}
	return 12;
}

jQuery(document).ready(function($) {

	var weatherParams = {
		//'q':'Hameln,Germany',
		'id':'2911271',
		'units':'metric',
		//'lang':'de'
	};
	
	(function updateTime()
	{
		var days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
		var months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

		var now = new Date();

		var day = now.getDay();
		var date = now.getDate();
		var month = now.getMonth();
		var year = now.getFullYear();

		var date = days[day] + ', ' + date+' ' + months[month] + ' ' + year;


		$('.date').html(date);
		$('.time').html(now.toTimeString().substring(0,5) + '<span class="sec">'+now.toTimeString().substring(6,8)+'</span>');

		setTimeout(function() {
			updateTime();
		}, 1000); // 1sec
	})();

	(function updateCalendarData()
	{
		var eventName = '';
		var appointments = [];
		$.getJSON('http://localhost:1336/calendar',function(data){
			for(var i = 0; i < data.feed.entry.length; i++){

				appointments.push([data.feed.entry[i].title.$t,data.feed.entry[i].gd$when[0].startTime]);
			}
			appointments.sort(function(x, y){
				var now = new Date();
     				var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				var ydiff = moment(y[1]).diff(moment(today), 'days')
      				var xdiff = moment(x[1]).diff(moment(today), 'days');
      				return xdiff - ydiff;
  			})


			var theDate = new Date(appointments[0][1]);
			var now = new Date();
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			var days = moment(theDate).diff(moment(today), 'days');
			if(days == 0) {
				daystext="Heute";
			}
			else if(days == 1){
				daystext="Morgen";          
			}
			else {
				daystext="In "+days+" Tagen";
			}	
			eventName = appointments[0][0]+" | "+daystext;
			for(var i = 1; i < appointments.length; i++) {

				var oneDate = new Date(appointments[i][1]);
				var days_in_the_loop = moment(oneDate).diff(moment(today), 'days');
				if (days_in_the_loop == days) {
					eventName += "<br/>"+appointments[i][0]+" | "+daystext;
				}


			}


			$('#nextAppointment').html(eventName);
			});
		
        	setTimeout(function() {
        		updateCalendarData();
        	}, 600000); //10 Min

	})();






	(function updateCurrentWeather()
	{
		var iconTable = {
			'01d':'wi-day-sunny',
			'02d':'wi-day-cloudy',
			'03d':'wi-cloudy',
			'04d':'wi-cloudy-windy',
			'09d':'wi-showers',
			'10d':'wi-rain',
			'11d':'wi-thunderstorm',
			'13d':'wi-snow',
			'50d':'wi-fog',
			'01n':'wi-night-clear',
			'02n':'wi-night-cloudy',
			'03n':'wi-night-cloudy',
			'04n':'wi-night-cloudy',
			'09n':'wi-night-showers',
			'10n':'wi-night-rain',
			'11n':'wi-night-thunderstorm',
			'13n':'wi-night-snow',
			'50n':'wi-night-alt-cloudy-windy'		
		}

		//defining warning notifications
		rain = 0;
		thunderstorm = 0;
		wind = 0;
		snowfall = 0;
		fog = 0;
		ice = 0;

		$.ajax({  
  		url: 'http://api.openweathermap.org/data/2.5/weather',  
  		dataType: 'json',  
  		data: weatherParams,  
  		async: false,  
  		success: function(json){  
	

			var temp = roundVal(json.main.temp);
			var temp_min = roundVal(json.main.temp_min);
			var temp_max = roundVal(json.main.temp_max);
			$('#temphightspan').html(temp_max+'&deg;');
			$('#templowtspan').html(temp_min+'&deg;');
			$('.thermo').css('opacity', "1.0");
			var wind = roundVal(json.wind.speed);

			var iconClass = iconTable[json.weather[0].icon];
			var icon = $('<span/>').addClass('icon').addClass('wi').addClass(iconClass);
			//TODO: Abstufungen?
			if(parseFloat(temp) >= 28) {
				$('.temp').css('color', "red")
			}
			else if (parseFloat(temp) <= 9) {
				$('.temp').css('color', "blue")
			}
			else {
				$('.temp').css('color', "#fff")
			}


			$('.temp').updateWithText(icon.outerHTML()+temp+'&deg;', 1000);
			//if(parseFloat(temp) <= 4) {
			//	ice = 1;
			//}

			//combine stuff

			switch (json.weather[0].main) {
				case "Rain":
					rain = 1;
					break;
				case "Snow":
					snowfall = 1;
					break;
				case "Thunderstorm":
					thunderstorm = 1;
					break;
				case "Atmosphere":
					fog = 1;
					break;
				case "Drizzle":
					rain = 1;
					break;
				case "Clouds":
					break;
				default:
					//console.log("Unhandled Weather State:"+json.weather[0].main);
			}


			// var forecast = 'Min: '+temp_min+'&deg;, Max: '+temp_max+'&deg;';
			// $('.forecast').updateWithText(forecast, 1000);

			var now = new Date();
			var sunrise = new Date(json.sys.sunrise*1000).toTimeString().substring(0,5);
			var sunset = new Date(json.sys.sunset*1000).toTimeString().substring(0,5);

			var windString = '<span class="wi wi-strong-wind "></span> ' + kmh2beaufort(wind) ;
			var sunString = '<span class="wi wi-sunrise "></span> ' + sunrise;
			if (json.sys.sunrise*1000 < now && json.sys.sunset*1000 > now) {
				sunString = '<span class="wi wi-sunset "></span> ' + sunset;
			}

			$('.windsun').updateWithText(windString+' '+sunString, 1000);
		}
		});

		$.ajax({  
  		url: 'http://localhost:1336/weatheralerts',  
  		dataType: 'json',  
  		async: false,  
  		success: function(data){
			for (var i in data.events) {
				//console.log(data.events[i].expires);
				var expires = new Date(data.events[i].expires);
				var now = new Date();
				//console.log(now);
				var diff = moment(expires).diff(moment(now), 'seconds');
				//console.log(diff);
				if (diff < 0) {
					//console.log("Abgelaufen")
				}
				else {
					switch (data.events[i].id) {
						case "31":
							//console.log("Gewitter");
							thunderstorm = 1;
							break;
						case "33":
							//console.log("Gewitter");
							thunderstorm = 1;
							break;
						case "34":
							//console.log("Gewitter");
							thunderstorm = 1;
							break;
						case "36":
							//console.log("Gewitter");
							thunderstorm = 1;
							break;
						case "38":
							//console.log("Gewitter");
							thunderstorm = 1;
							break;
						case "40":
							//console.log("Schweres Gewitter");
							thunderstorm = 1;
							break;
						case "42":
							//console.log("Schweres Gewitter");
							thunderstorm = 1;
							break;
						case "44":
							//console.log("Schweres Gewitter");
							thunderstorm = 1;
							break;
						case "46":
							//console.log("Schweres Gewitter");
							thunderstorm = 1;
							break;
						case "48":
							//console.log("Schweres Gewitter");
							thunderstorm = 1;
							break;
						case "41":
							//console.log("Schweres Gewitter mit extremen Orkanböen");
							thunderstorm = 1;
							wind = 1;
							break;
						case "45":
							//console.log("Schweres Gewitter mit extremen Orkanböen");
							thunderstorm = 1;
							wind = 1;
							break;
						case "49":
							//console.log("Schweres Gewitter mit extremen Orkanböen");
							thunderstorm = 1;
							wind = 1;
							break;
						case "51":
							//console.log("Windböen");
							wind = 1;
							break;
						case "52":
							//console.log("Sturmböen");
							wind = 1;
							break;
						case "53":
							//console.log("Schwere Sturmböen");
							wind = 1;
							break;
						case "54":
							//console.log("Orkanartige Böen");
							wind = 1;
							break;
						case "55":
							//console.log("Orkanböen");
							wind = 1;
							break;
						case "56":
							//console.log("Extreme Orkanböen");
							wind = 1;
							break;
						case "57":
							//console.log("Starkwind");
							wind = 1;
							break;
						case "58":
							//console.log("Sturm");
							wind = 1;
							break;
						case "59":
							//console.log("Nebel");
							fog = 1;
							break;
						case "61":
							//console.log("Starkregen");
							rain = 1;
							break;
						case "62":
							//console.log("Heftiger Starkregen");
							rain = 1;
							break;
						case "63":
							//console.log("Dauerregen");
							rain = 1;
							break;
						case "64":
							//console.log("Ergiebiger Dauerregen");
							rain = 1;
							break;
						case "65":
							//console.log("Extrem Ergiebiger Dauerregen");
							rain = 1;
							break;
						case "66":
							//console.log("Extrem Heftiger Starkregen");
							rain = 1;
							break;
						case "70":
							//console.log("Schneefall");
							snowfall = 1;
							break;
						case "71":
							//console.log("Schneefall");
							snowfall = 1;
							break;
						case "72":
							//console.log("Starker Schneefall");
							snowfall = 1;
							break;
						case "73":
							//console.log("Extrem Starker Schneefall");
							snowfall = 1;
							break;
						case "74":
							//console.log("Schneeverwehung");
							snowfall = 1;
							ice = 1;
							fog = 1;
							break;
						case "75":
							//console.log("Starke Schneeverwehung");
							snowfall = 1;
							ice = 1;
							fog = 1;
							break;
						case "76":
							//console.log("Schneeverwehung");
							snowfall = 1;
							ice = 1;
							fog = 1;
							break;
						case "77":
							//console.log("Starke Schneeverwehung");
							snowfall = 1;
							ice = 1;
							fog = 1;
							break;
						case "78":
							//console.log("Extrem Starke Schneeverwehung");
							snowfall = 1;
							ice = 1;
							fog = 1;
							break;
						case "81":
							//console.log("Frost");
							ice = 1;
							break;
						case "82":
							//console.log("Strenger Frost");
							ice = 1;
							break;
						case "83":
							//console.log("Glätte");
							ice = 1;
							break;
						case "84":
							//console.log("Glätte");
							ice = 1;
							break;
						case "86":
							//console.log("Glätte");
							ice = 1;
							break;
						case "87":
							//console.log("Glätte");
							ice = 1;
							break;
						case "85":
							//console.log("Glatteis");
							ice = 1;
							break;
						case "88":
							//console.log("Tauwetter");
							ice = 1;
							break;
						case "89":
							//console.log("Starkes Tauwetter");
							ice = 1;
							break;
						case "94":
							//console.log("Schweres Gewitter");
							thunderstorm = 1;
							break;
						case "95":
							//console.log("Schweres Gewitter mit extrem heftigen Starkregen");
							thunderstorm = 1;
							rain = 1;
							break;
						case "96":
							//console.log("Schweres Gewitter mit extrem heftigen Starkregen");
							rain = 1;
							thunderstorm = 1;
							break;
						case "247":
							//console.log("Hitze <-- Dich sollte es gar nicht geben eigentlich");
							break;
						default:
							//console.log("Unhandled Warning ID");
							//$('#nextAppointment').html("WARNING: UNHANDLED WARNING ID");
							$('body').css('background', 'red');

						//TODO: UV Strahlung http://www.dwd.de/uvindex

					}
				}
			}
		}
		});
		
		if (rain == 1) {
			if ($("#rain").length <= 0){
					$( ".notifications" ).append( '<img src="font/rain.svg" id="rain">' );
			}
		} else {
				$( "#rain" ).remove();
		}

		if (thunderstorm == 1) {
			if ($("#thunderstorm").length <= 0){
					$( ".notifications" ).append( '<img src="font/thunderstorm.svg" id="thunderstorm">' );
			}
		} else {
				$( "#thunderstorm" ).remove();
		}

		if (wind == 1) {
			if ($("#wind").length <= 0){
					$( ".notifications" ).append( '<img src="font/wind.svg" id="wind">' );
			}
		} else {
				$( "#wind" ).remove();
		}

		if (fog == 1) {
			if ($("#fog").length <= 0){
					$( ".notifications" ).append( '<img src="font/fog.svg" id="fog">' );
			}
		} else {
				$( "#fog" ).remove();
		}

		if (snowfall == 1) {
			if ($("#snowfall").length <= 0){
					$( ".notifications" ).append( '<img src="font/snowfall.svg" id="fog">' );
			}
		} else {
				$( "#snowfall" ).remove();
		}

		if (ice == 1) {
			if ($("#ice").length <= 0){
					$( ".notifications" ).append( '<img src="font/ice.svg" id="ice">' );
			}
		} else {
				$( "#ice" ).remove();
		}
		setTimeout(function() {
			updateCurrentWeather();
		}, 600000); // 10 min
	})();

	(function Diverses()
	{
		$.get( "http://localhost:1336/roggen", function( data ) {
		if(data != 0) {
			if ($("#roggen").length <= 0){
				$( ".notifications" ).append( '<img src="font/roggen.svg" id="roggen" style="opacity: '+ data + ';">' );
			}
		}
		else {
			$( "#roggen" ).remove();
		}
		});

		$.get( "http://localhost:1336/graeser", function( data ) {
		if(data != 0) {
			if ($("#graeser").length <= 0){
				$( ".notifications" ).append( '<img src="font/graeser.svg" id="graeser" style="opacity: '+ data + ';">' );
			}
		}
		else {
			$( "#graeser" ).remove();
		}
		});

		$.get( "http://localhost:1336/banking", function( data ) {
			$( "#Kontostand" ).html(data + ' &euro;');
		});

		setTimeout(function() {
		Diverses();
		}, 600000); //10 min

	})();		
	
	

});
