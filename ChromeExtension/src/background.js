var blacklist;
var whitelist;

var filteredCount = 0;

function reloadRules() {
	var loadRules = function(storageKey, listID) {
		var rules = localStorage[storageKey];
		if (!rules) {
			return new Array();
		}
		
		rules = JSON.parse(rules, null);
		if (!Array.isArray(rules)) {
			return new Array();
		}
		
		return rules;
	};
	
	blacklist = loadRules("com.sinaapp.weiguolv.blacklist");
	whitelist = loadRules("com.sinaapp.weiguolv.whitelist");
}

function getFilteredCount() {
	return filteredCount;
}

function initEventListeners() {
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if (request.rulelist == "black") {
			sendResponse(blacklist);
		} else if (request.rulelist == "white") {
			sendResponse(whitelist);
		}
		
		if (request.filteredCount != undefined) {
			filteredCount = request.filteredCount;
			if (filteredCount == 0) {
//				chrome.pageAction.hide(sender.tab.id);
				chrome.pageAction.show(sender.tab.id);
			} else {
				chrome.pageAction.show(sender.tab.id);
			}
		}
	});
}

reloadRules();
initEventListeners();