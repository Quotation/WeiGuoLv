function updateFilteredCount() {
	var count = chrome.extension.getBackgroundPage().getFilteredCount();
	document.getElementById("filtered-count").innerText = count.toString();
}

window.addEventListener("load", function() {
	updateFilteredCount();
}, false);
