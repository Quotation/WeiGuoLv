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
	
	var saveAdBlockOpts = function(storageKey, listID) {
		var list = document.getElementById(listID);
		var opts = new Array();
		if (list) {
			var checks = list.getElementsByTagName("input");
			if (checks) {
				for (var i in checks) {
					if (checks[i].checked) {
						opts.push(checks[i].value);
					}
				}
			}
		}
		
		var json = JSON.stringify(opts, null);
		localStorage[storageKey] = json;
	};
	
	saveRulesFromList("com.sinaapp.weiguolv.blacklist", "blackrulelist");
	saveRulesFromList("com.sinaapp.weiguolv.whitelist", "whiterulelist");
	saveAdBlockOpts("com.sinaapp.weiguolv.adblockopts", "adblocklist");
	
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
	
	
	var loadAdBlockOpts = function(storageKey, listID) {
		var list = document.getElementById(listID);
		var opts = localStorage[storageKey];
		if (!list || !opts) {
			return;
		}
		
		var checks = list.getElementsByTagName("input");
		if (checks) {
			for (var i in checks) {
				if (opts.indexOf(checks[i].value) != -1) {
					checks[i].checked = true;
				}
			}
		}
	};
	
	loadAndFillRules("com.sinaapp.weiguolv.blacklist", "blackrulelist");
	loadAndFillRules("com.sinaapp.weiguolv.whitelist", "whiterulelist");
	loadAdBlockOpts("com.sinaapp.weiguolv.adblockopts", "adblocklist");
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

function initAdBlockOptions() {
	var opts = [
		{ section: "广告"},	//--------------
		{ title: "纯广告", selector: "div#trustPagelet_ugrowth_invite,"+
									"div#pl_rightmod_ads35,div#pl_rightmod_ads36,"+
									"div.footer_adv,"+
									"div#pl_rightmod_weibodesk" },
		
		{ section: "个人信息"},	//--------------
		{ title: "用户等级", selector: "span.W_level_ico" },
		{ title: "会员皇冠标识", selector: "img.ico_member" },
		{ title: "微博达人标识", selector: "img.ico_club" },
		{ title: "勋章", selector: "div#pl_rightmod_medal,div#pl_content_medal" },
		{ title: "写心情", selector: "div#pl_content_mood" },

		{ section: "系统推荐"},	//--------------
		{ title: "热门话题（输入框上方）", selector: "div[node-type='recommendTopic']" },
		{ title: "热门话题（右侧）", selector: "div#trustPagelete_zt_hottopic" },
		{ title: "热评微博", selector: "div#pl_content_commentTopNav" },
		{ title: "可能感兴趣的人", selector: "div#trustPagelete_recom_interest" },
		{ title: "会员专区", selector: "div#trustPagelet_member_zone" },
		{ title: "微群微刊", selector: "div#trustPagelete_recom_allinone" },
		
		{ section: "帮助"},	//--------------
		{ title: "玩转微博", selector: "div#pl_rightmod_help" },
		{ title: "使用小帮助", selector: "div#Pl_Rightmod_Littlehelp" },
		{ title: "公告栏", selector: "div#pl_rightmod_noticeboard" },
		{ title: "意见反馈", selector: "div#pl_common_feedback" },
		{ title: "举报处理中心", selector: "div#pl_common_reportentry" },
	];
	
	var list = document.getElementById("adblocklist");
	for (var i in opts) {
		if (opts[i].section) {
			var secHeader = document.createElement("p");
			secHeader.className = "adblocksection";
			secHeader.innerText = "== " + opts[i].section + " ==";
			
			list.appendChild(secHeader);
		} else {
			var newOpt = document.createElement("div");
			newOpt.className = "adblockopt";
			newOpt.innerHTML =
			"<input type='checkbox' value=\"" + opts[i].selector + "\"/>" +
			opts[i].title + "&nbsp;&nbsp;";
			
			list.appendChild(newOpt);
		}
	}
}

window.addEventListener("load", function() {
	initAdBlockOptions();
	loadSettings();
	initEventListeners();
}, false);
