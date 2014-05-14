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
		'q':'Hameln,Germany',
		'units':'metric',
		'lang':'de'
	};
	
	(function updateTime()
	{
		var days = ['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'];
		var months = ['januar','februar','maerz','april','mai','juni','juli','august','september','oktober','november','dezember'];

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
		

		$.getJSON('http://api.openweathermap.org/data/2.5/weather', weatherParams, function(json, textStatus) {

			var temp = roundVal(json.main.temp);
			var temp_min = roundVal(json.main.temp_min);
			var temp_max = roundVal(json.main.temp_max);

			var wind = roundVal(json.wind.speed);

			var iconClass = iconTable[json.weather[0].icon];
			var icon = $('<span/>').addClass('icon').addClass('wi').addClass(iconClass);
			$('.temp').updateWithText(icon.outerHTML()+temp+'&deg;', 1000);
			if(parseFloat(temp) <= 4) {
				if ($("#glaette").length <= 0){
					$( ".notifications" ).append( '<img src="font/snowflake.svg" id="glaette">' );
				}
			}
			else {
				$( "#glaette" ).remove();
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
	(function updateDailyForecast()
	{
			$.getJSON('http://api.openweathermap.org/data/2.5/forecast/daily', weatherParams, function(json, textStatus) {

			if(json.list[0].weather[0].main == "Rain"){
				if ($("#rain").length <= 0){
					$( ".notifications" ).append( '<img src="font/rain.svg" id="rain">' );
				}
			}
			else {
				$( "#rain" ).remove();
			}

		});

		setTimeout(function() {
			updateDailyForecast();
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
		
	
	
	})();

});
