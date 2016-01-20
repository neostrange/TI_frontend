// JavaScript Document
app.filter('getPercent', function() {
  return function(input, value) {
     console.log(input);
	 console.log(value);
	 
	 var num =Math.floor((input / value) * 100).toFixed(1);
	 
	 if(num < 1){
		 num = "< 1"
	 }
    return num + "%";
  }
});