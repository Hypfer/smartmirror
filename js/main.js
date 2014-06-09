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
		}, 1000);
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
        	}, 300000);

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
		
		//TODO: Bei großer Hitze/Kälte das Icon Rot/Blau einfärben
		//TODO: Die Temperaturvorhersage irgendwie ins Design integrieren
		$.getJSON('http://api.openweathermap.org/data/2.5/weather', weatherParams, function(json, textStatus) {

			var temp = roundVal(json.main.temp);
			var temp_min = roundVal(json.main.temp_min);
			var temp_max = roundVal(json.main.temp_max);

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
			if(parseFloat(temp) <= 4) {
				if ($("#glaette").length <= 0){
					$( ".notifications" ).append( '<img src="font/snowflake.svg" id="glaette">' );
				}
			}
			else {
				$( "#glaette" ).remove();
			}

			//combine stuff
			if(json.weather[0].main == "Rain"){
				if ($("#rain").length <= 0){
					$( ".notifications" ).append( '<img src="font/rain.svg" id="rain">' );
				}
			}
			else {
				$( "#rain" ).remove();
			}
			if(json.weather[0].main == "Thunderstorm"){
				if ($("#thunderstorm").length <= 0){
					$( ".notifications" ).append( '<img src="font/thunderstorm.svg" id="thunderstorm">' );
				}
			}
			else {
				$( "#thunderstorm" ).remove();
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
		});

		setTimeout(function() {
			updateCurrentWeather();
		}, 60000);
	})();

	(function updateWeatherForecast()
	{
			var dayAbbr = ['so','mo','di','mi','do','fr','sa'];	

			$.getJSON('http://api.openweathermap.org/data/2.5/forecast', weatherParams, function(json, textStatus) {

			var forecastData = {};

			for (var i in json.list) {
				var forecast = json.list[i];
				var dateKey  = forecast.dt_txt.substring(0, 10);

				if (forecastData[dateKey] == undefined) {
					forecastData[dateKey] = {
						'timestamp':forecast.dt * 1000,
						'temp_min':forecast.main.temp,
						'temp_max':forecast.main.temp
					};
				} else {
					forecastData[dateKey]['temp_min'] = (forecast.main.temp < forecastData[dateKey]['temp_min']) ? forecast.main.temp : forecastData[dateKey]['temp_min'];
					forecastData[dateKey]['temp_max'] = (forecast.main.temp > forecastData[dateKey]['temp_max']) ? forecast.main.temp : forecastData[dateKey]['temp_max']; 
				}

			}


			var forecastTable = $('<table />').addClass('forecast-table');
			var opacity = 1;
			for (var i in forecastData) {
				var forecast = forecastData[i];
				var dt = new Date(forecast.timestamp);
				var row = $('<tr />').css('opacity', opacity);

				row.append($('<td/>').addClass('day').html(dayAbbr[dt.getDay()]).css('opacity', "0"));
				row.append($('<td/>').addClass('temp-max').html(roundVal(forecast.temp_max)+"&deg;-"));
				row.append($('<td/>').addClass('temp-min').html(roundVal(forecast.temp_min)+"&deg;"));

				forecastTable.append(row);
				opacity -= 0.155;
				break;
			}


			$('.forecast').updateWithText(forecastTable, 1000);
		});

		setTimeout(function() {
			updateWeatherForecast();
		}, 300000);
	})();
	(function updateMoney()
	{
	
		
		$.get( "http://localhost:1336/banking", function( data ) {
			$( "#Kontostand" ).html(data + ' &euro;');
		});

		setTimeout(function() {
			updateMoney();
		}, 300000);
	})();
	(function updatePollen()
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
		setTimeout(function() {
		updatePollen();
		}, 300000);
	(function updateWeatherAlerts()
	{

		$.getJSON('http://localhost:1336/weatheralerts',function(data){
			for (var i in data.events) {
				//console.log(data.events[i].expires);
				var expires = new Date(data.events[i].expires);
				var now = new Date();
				//console.log(now);
				var diff = moment(expires).diff(moment(now), 'seconds');
				//console.log(diff);
				if (diff < 0) {
					console.log("Abgelaufen")
				}
				else {
					switch (data.events[i].id) {
						case "31":
							console.log("Gewitter");
							break;
						case "33":
							console.log("Gewitter");
							break;
						case "34":
							console.log("Gewitter");
							break;
						case "36":
							console.log("Gewitter");
							break;
						case "38":
							console.log("Gewitter");
							break;
						case "40":
							console.log("Schweres Gewitter");
							break;
						case "42":
							console.log("Schweres Gewitter");
							break;
						case "44":
							console.log("Schweres Gewitter");
							break;
						case "46":
							console.log("Schweres Gewitter");
							break;
						case "48":
							console.log("Schweres Gewitter");
							break;
						case "41":
							console.log("Schweres Gewitter mit extremen Orkanböen");
							break;
						case "45":
							console.log("Schweres Gewitter mit extremen Orkanböen");
							break;
						case "49":
							console.log("Schweres Gewitter mit extremen Orkanböen");
							break;
						case "51":
							console.log("Windböen");
							break;
						case "52":
							console.log("Sturmböen");
							break;
						case "53":
							console.log("Schwere Sturmböen");
							break;
						case "54":
							console.log("Orkanartige Böen");
							break;
						case "55":
							console.log("Orkanböen");
							break;
						case "56":
							console.log("Extreme Orkanböen");
							break;
						case "57":
							console.log("Starkwind");
							break;
						case "58":
							console.log("Sturm");
							break;
						case "59":
							console.log("Nebel");
							break;
						case "61":
							console.log("Starkregen");
							break;
						case "62":
							console.log("Heftiger Starkregen");
							break;
						case "63":
							console.log("Dauerregen");
							break;
						case "64":
							console.log("Ergiebiger Dauerregen");
							break;
						case "65":
							console.log("Extrem Ergiebiger Dauerregen");
							break;
						case "66":
							console.log("Extrem Heftiger Starkregen");
							break;
						case "70":
							console.log("Schneefall");
							break;
						case "71":
							console.log("Schneefall");
							break;
						case "72":
							console.log("Starker Schneefall");
							break;
						case "73":
							console.log("Extrem Starker Schneefall");
							break;
						case "74":
							console.log("Schneeverwehung");
							break;
						case "75":
							console.log("Starke Schneeverwehung");
							break;
						case "76":
							console.log("Schneeverwehung");
							break;
						case "77":
							console.log("Starke Schneeverwehung");
							break;
						case "78":
							console.log("Extrem Starke Schneeverwehung");
							break;
						case "81":
							console.log("Frost");
							break;
						case "82":
							console.log("Strenger Frost");
							break;
						case "83":
							console.log("Glätte");
							break;
						case "84":
							console.log("Glätte");
							break;
						case "86":
							console.log("Glätte");
							break;
						case "87":
							console.log("Glätte");
							break;
						case "85":
							console.log("Glatteis");
							break;
						case "88":
							console.log("Tauwetter");
							break;
						case "89":
							console.log("Starkes Tauwetter");
							break;
						case "94":
							console.log("Schweres Gewitter");
							break;
						case "95":
							console.log("Schweres Gewitter mit extrem heftigen Starkregen");
							break;
						case "96":
							console.log("Schweres Gewitter mit extrem heftigen Starkregen");
							break;
						case "96":
							console.log("Hitze <-- Dich sollte es gar nicht geben eigentlich");
							break;
						default:
							console.log("Unhandled Warning ID");
							//$('#nextAppointment').html("WARNING: UNHANDLED WARNING ID");
							$('body').css('background', 'red');
						//TODO: Icons, Handling Usw
						//TODO: UV Strahlung http://www.dwd.de/uvindex

					}
				}
			}
		});
			/*
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
			*/
		
        	setTimeout(function() {
        		updateWeatherAlerts();
        	}, 600000);

	})();		
	
	
	})();

});
