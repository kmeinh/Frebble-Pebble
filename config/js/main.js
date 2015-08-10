(function(){
	loadOptions();
	setupButtons();
})();

function setupButtons(){
var submitButton = $('#submit');


submitButton.on('click',function(){
	var returnTo = getQueryParam("return_to","pebblejs://close#");
	document.location = returnTo + encodeURIComponent(JSON.stringify(getAndStoreConfigData()));
});

}

function loadOptions(){
	var refreshcycle = $('#refreshcycle');
	var wancic = $('#wancic');
	var wanipc = $('#wanipc');

	if(localStorage.refreshcycle){
		refreshcycle[0].value = localStorage.refreshcycle;
		wancic[0].value=localStorage.wancic;
		wanipc[0].value=localStorage.wanipc;
	}
}

function getAndStoreConfigData(){
	var refreshcycle = $('#refreshcycle');
	var wancic = $('#wancic');
	var wanipc = $('#wanipc');

	options = {
		refreshcycle: refreshcycle.val(),
		wancic: wancic.val(),
		wanipc: wanipc.val()
	};

	localStorage.refreshcycle = options.refreshcycle;
	localStorage.wancic = options.wancic;
	localStorage.wanipc = options.wanipc;

	console.log('options: '+JSON.stringify(options));
	return options;
}

function getQueryParam(variable, defaultValue) {
  // Find all URL parameters
  var query = location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');

    // If the query variable parameter is found, decode it to use and return it for use
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return defaultValue || false;
}
