var blacklist;
var whitelist;
var adBlockList;

var filteredCount;

function initialize() {
	filteredCount = 0;
	
	chrome.extension.sendRequest({rulelist: "black"}, function(response) {
		blacklist = response;
	});
	chrome.extension.sendRequest({rulelist: "white"}, function(response) {
		whitelist = response;
	});
	chrome.extension.sendRequest({rulelist: "adblock"}, function(response) {
		adBlockList = response;
	});
}

function createStatusFromElem(dl) {
	var createSingleStatus = function(content, info) {
		if (!content || content.length == 0)
			return undefined;
		var nick = $("a[nick-name]", content).attr("nick-name");
		var text;
		if (nick) {
			text = $("em", content).text();
		} else {
			text = content.text();
		}
		var source = $("a[rel='nofollow']", info).text();

		return { nick: nick, content: text, source: source };
	};
	
	var createSingleStatusV5 = function(content, info, from) {
		if (!content || content.length == 0)
			return undefined;
		var nick = $("a[nick-name]", info).attr("nick-name");
		var text = content[0].innerText;
		var source = $("a[rel='nofollow']", from).text();

		return { nick: nick, content: text, source: source };
	};
	
	var statusContent = $("dd.content > p[node-type='feed_list_content']");
	var status, repost;
	if (statusContent.length != 0) {
		status = createSingleStatus($("dd.content > p[node-type='feed_list_content']", dl),
									$("dd.content > p.info", dl));
		repost = createSingleStatus($("dd.content > dl.comment > dt", dl),
									$("dd.content > dl.comment > dd.info", dl));
	} else {
		status = createSingleStatusV5($("div.WB_detail > div.WB_text", dl),
									  $("div.WB_detail > div.WB_info", dl),
									  $("div.WB_detail > div.WB_func > div.WB_from", dl));
		var repostElem = $("div.WB_media_expand", dl);
		if (repostElem.length != 0) {
			repost = createSingleStatusV5($("div.WB_text", repostElem),
										  $("div.WB_info", repostElem),
										  $("div.WB_func > div.WB_from", repostElem));
		}
	}
	
	status.repost = repost;
			
	// 新浪页面有异步加载，第一次遍历到的时候可能没有内容。
	// 已经有内容的记为checked，下次不检查。
	if (status && status.content && status.content != "") {
		dl.setAttribute("weiguolv-checked", "true");
	}
	
	return status;
}

function matchStatus(status) {
	var matchText = function(keyword, op, text) {
		if (!keyword || keyword == "" || !op || op == "" || !text || text == "") {
			return false;
		}
		
		text = text.toLowerCase();
		
		if (op == "equal") {
			if (text == keyword.toLowerCase()) {
				return true;
			}
		} else if (op == "contain") {
			if (text.indexOf(keyword.toLowerCase()) >= 0) {
				return true;
			}
		} else if (op == "regex") {
			var pattern = new RegExp(keyword, "i");
			if (pattern.test(text)) {
				return true;
			}
		}
		
		return false;
	};
	
	var matchSingleRule = function(status, rule) {
		if (rule.field == "author" || rule.field == "status+author") {
			if (matchText(rule.keyword, rule.operator, status.nick)) {
				return true;
			}
		}
		if (rule.field == "status" || rule.field == "status+author") {
			if (matchText(rule.keyword, rule.operator, status.content)) {
				return true;
			}
		}
		if (rule.field == "source") {
			if (matchText(rule.keyword, rule.operator, status.source)) {
				return true;
			}
		}
		
		return false;
	};
	
	var matchRule = function(status, rule) {
		if (rule.repost == "status" || rule.repost == "status+repost") {
			if (matchSingleRule(status, rule)) {
				return true;
			}
		}
		
		if (status.repost && (rule.repost == "repost" || rule.repost == "status+repost")) {
			return matchSingleRule(status.repost, rule);
		}
		
		return false;
	};
	
	if (!status)
		return false;
	
	if (whitelist) {
		for (var i = 0; i < whitelist.length; i++) {
			if (matchRule(status, whitelist[i])) {
				return false;
			}
		}
	}
	
	if (blacklist) {
		for (var i = 0; i < blacklist.length; i++) {
			if (matchRule(status, blacklist[i])) {
				return true;
			}
		}
	}
	
	return false;
}

function hideStatusElem(elem) {
//	elem.style.backgroundColor = "lightgray";
	if (elem.parentNode) {
		elem.parentNode.removeChild(elem);
	}
}

function filter() {
	$("dl.feed_list,div.WB_feed_type").each(function() {
		if (this.getAttribute("weiguolv-checked")) {
			return;
		}
			
		if (matchStatus(createStatusFromElem(this))) {
			hideStatusElem(this);
			filteredCount++;
		}
	});
	
	if (adBlockList) {
		for (var i in adBlockList) {
			$(adBlockList[i]).remove();
		}
	}	
	
	chrome.extension.sendRequest({filteredCount: filteredCount});
	
	window.setTimeout("filter()", 1000);
}

initialize();
filter();
