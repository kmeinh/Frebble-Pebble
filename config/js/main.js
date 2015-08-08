(function(){
	loadOptions();
	submitHandler();
})();

function submitHandler(){
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

function getQueryParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}