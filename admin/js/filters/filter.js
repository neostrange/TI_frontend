// JavaScript Document
app.filter('getPercent', function() {
  return function(input, value) {
     console.log(input);
	 console.log(value);
	 if(input >= 1 ){
			var num =Math.floor((input / value) * 100).toFixed(1);
			if(num < 1 ){
				num = "< 1";
			}
	 }else{
		  num = "0";
	 }
    return num + "%";
  }
});

app.filter('getCapitilize', function() {
  return function(str) {
     var num;
	  if(str =="ssh"){
		num = str.toUpperCase();  
	  }else{
	  num = str.substr(0, 1).toUpperCase() + str.substr(1);
	  }
	  console.log(num);
	  return num;
  }
});

app.filter('dateTimeFilter', function() { 
   return function (date){
	      	if((date != undefined) && (date != "")){
	      		if((typeof date == "string") || (typeof date == "number")){
	//				date = date.replace("T", " ");
	//				date = date.substring(0, date.length - 3);
			      		date = new XDate(date);
			      		date = date.toString('hh:mm:ss tt, dd MMM yyyy');
		      		
	      		} else {
	      			date = "";
	      		}
	      	} 
			return date;
	      };
});