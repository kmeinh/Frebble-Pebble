submitButton = $('#submit');
automaticDiscoveryToggle = $('#automatic-discovery');
refreshcycle = $('#refreshcycle');
wancic = $('#wancic');
wanipc = $('#wanipc');
ip = $('#ip');
port = $('#port');

(function(){
	loadOptionsFromQueryParams();
	setupButtons();
})();

function setupButtons(){

submitButton.on('click',function(){
	var returnTo = getQueryParam("return_to","pebblejs://close#");
	document.location = returnTo + encodeURIComponent(JSON.stringify(getConfigData()));
});

automaticDiscoveryToggle.on('change',toggleAutomaticDiscovery);
}

function toggleAutomaticDiscovery(){
	if (automaticDiscoveryToggle[0].checked){
		$("#service-urls-wrapper").css("height","0px");
	}else{
		$("#service-urls-wrapper").css("height","159px");
	}
}



function loadOptionsFromQueryParams(){
	var valueString = getQueryParam("values","");
	if (valueString == ""){
		return;
	}
	valuesObject = JSON.parse(decodeURIComponent(valueString));
	refreshcycle.val(valuesObject.refreshcycle);
	ip.val(valuesObject.ip);
	port.val(valuesObject.port);
	wancic.val(valuesObject.wancic);
	wanipc.val(valuesObject.wanipc);
	automaticDiscoveryToggle[0].checked = valuesObject.automaticDiscovery;
	toggleAutomaticDiscovery();
}

function getConfigData(){
	options = {
		refreshcycle : refreshcycle.val(),
		wancic : wancic.val(),
		wanipc : wanipc.val(),
		automaticDiscovery  : automaticDiscoveryToggle[0].checked,
		ip : ip.val(),
		port : port.val()
	};

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
