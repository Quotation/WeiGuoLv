function addRuleRow(listID, rule) {
	var list = document.getElementById(listID);
	var newRow = document.createElement("tr");
	newRow.className = "rulerow";
	newRow.innerHTML = 
		"<td class='field-column'>" +
			"<select class='field-select'>" +
				"<option value='status'>内容</option>" +
				"<option value='author'>作者</option>" +
				"<option value='status+author'>内容+作者</option>" +
				"<option value='source'>来源</option>" +
			"</select>" +
		"</td>" +
		"<td class='operator-column'>" +
			"<select class='operator-select'>" +
				"<option value='contain'>包含</option>" +
				"<option value='equal'>等于</option>" +
				"<option value='regex'>正则表达式</option>" +
			"</select>" +
		"</td>" +
		"<td class='keyword-column'><input type='text' class='keyword-input' placeholder='要过滤的内容、昵称'/></td>" +
		"<td class='repost-column'>" +
			"<select class='repost-select'>" +
				"<option value='status+repost'>原文+转发</option>" +
				"<option value='status'>仅原文</option>" +
				"<option value='repost'>仅转发</option>" +
			"</select>" +
		"</td>" +
		"<td class='delete-rule-column'>" +
			"<button class='delete-rule-button' title='删除规则'>X</button>"
		"</td>" +
		"";
	list.appendChild(newRow);
	
	if (rule) {
		newRow.getElementsByClassName("field-select")[0].value = rule.field;
		newRow.getElementsByClassName("operator-select")[0].value = rule.operator;
		newRow.getElementsByClassName("keyword-input")[0].value = rule.keyword;
		newRow.getElementsByClassName("repost-select")[0].value = rule.repost;
	}
	
	newRow.getElementsByClassName("delete-rule-button")[0].addEventListener("click", function() {
		newRow.parentNode.removeChild(newRow);
	}, false);
}

function saveSettings() {
	var rulesFromList = function(list) {
		var rules = new Array();
		if (!list) {
			return rules;
		}
		
		var rows = list.getElementsByTagName("tr");
		if (!rows) {
			return rules;
		}
		
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var rule = new Object();
			rule.field = row.getElementsByClassName("field-select")[0].value;
			rule.operator = row.getElementsByClassName("operator-select")[0].value;
			rule.keyword = row.getElementsByClassName("keyword-input")[0].value;
			rule.repost = row.getElementsByClassName("repost-select")[0].value;
			
			if (rule.keyword && rule.keyword != "") {
				rules.push(rule);
			}
		}
		
		return rules;
	};
	
	var saveRulesFromList = function(storageKey, listID) {
		var list = document.getElementById(listID);
		var rules = rulesFromList(list);
		if (!rules) {
			rules = new Array();
		}
		
		var json = JSON.stringify(rules, null);
		localStorage[storageKey] = json;
	};
	
	saveRulesFromList("com.sinaapp.weiguolv.blacklist", "blackrulelist");
	saveRulesFromList("com.sinaapp.weiguolv.whitelist", "whiterulelist");
	
	alert("设置已保存，请刷新微博页面。");
}

function loadSettings() {
	var loadAndFillRules = function(storageKey, listID) {
		var rules = localStorage[storageKey];
		if (!rules) {
			return;
		}
		rules = JSON.parse(rules, null);
		if (!Array.isArray(rules)) {
			return;
		}
		
		for (var i = 0; i < rules.length; i++) {
			addRuleRow(listID, rules[i]);
		}
	};
	
	loadAndFillRules("com.sinaapp.weiguolv.blacklist", "blackrulelist");
	loadAndFillRules("com.sinaapp.weiguolv.whitelist", "whiterulelist");
}

function initEventListeners() {
	document.getElementById("addBlackRule").addEventListener("click", function() {
		addRuleRow("blackrulelist", null);
	}, false);
	document.getElementById("addWhiteRule").addEventListener("click", function() {
		addRuleRow("whiterulelist", null);
	}, false);
	document.getElementById("btnSave").addEventListener("click", function() {
		saveSettings();
		chrome.extension.getBackgroundPage().reloadRules();
	}, false);
}

window.addEventListener("load", function() {
	loadSettings();
	initEventListeners();
}, false);
