var issues = [];
var assignees = [];
function login(){
	var username = document.getElementById("username").value;
	window.localStorage.setItem("username", username);
	var password = document.getElementById("password").value;
	var test = '{"username": ' + username + ', "password": ' + password + '"}';
	console.log("JSON data : " + test);
	console.log(username + "  :  " + password);
	$.ajax({
		cache: false,
		url: 'http://172.25.8.18:8080/rest/auth/1/session',
	    type: 'POST',
	    dataType: 'json',
	    contentType: "application/json",
	    data: '{"username": "' + username + '", "password": "' + password + '"}',
	    headers:{
	    	"X-Atlassian-Token":"nocheck"
	    },
	    success: function(response){
	    	console.log(response);
	    	window.location.href = "selectProblem.html";
	    },
	    error:function(error){
	    	console.log(error);
	    }
	});
}

function createIssues(){
	var summary = "";
	var description = "";
	var name = "";
	var assignee = "";
	var JSONIssue = "";
	for(i = 0 ; i < issues.length ; i++){
		summary = document.getElementById('summary ' + issues[i]).value;
		description = document.getElementById('description ' + issues[i]).value;
		var e = document.getElementById('dropdown ' + issues[i]);
		assignee = e.options[e.selectedIndex].value;
		console.log("the assignee is : " + assignee);
		name = issues[i];
		if(JSONIssue){
			JSONIssue = JSONIssue + ',' + '{ "fields": { "project": { "key": "JA" }, "summary": "'+ summary + '", "description": "'+ description +'", "assignee":{"name":"' + assignee + '"} , "issuetype": { "name": "'+ name + '" } } }';
		}else{
			JSONIssue = '{ "fields": { "project": { "key": "JA" }, "summary": "'+ summary + '", "description": "'+ description +'" , "assignee":{"name":"' + assignee + '"} , "issuetype": { "name": "'+ name + '" } } }';
		}
		console.log(JSONIssue);
	}
	console.log(JSON.stringify(JSONIssue));
	$.ajax({
		cache: false,
		url: 'http://172.25.8.18:8080/rest/api/2/issue/bulk',
	    type: 'POST',
	    dataType: 'json',
	    contentType: "application/json",
	    data: '{ "issueUpdates": [' + JSONIssue + ']}',
	    headers:{
	    	"X-Atlassian-Token":"nocheck"
	    },
	    success: function(response){
	    	console.log(response);
	    },
	    error:function(error){
	    	console.log(error);
	    }
	});
}
function getListOfIssueTypes(){
	$.ajax({
		cache: false,
		url: 'http://172.25.8.18:8080/rest/api/2/issuetype',
		headers: {'X-Requested-With': 'XMLHttpRequest',
			'X-Atlassian-Token': 'no-check'},
	    type: 'GET',
	    contentType: "application/json",
	    dataType: "json",
	    success: function(response){
	    	$("body").append('<div></div>');
	    	$.each(response, function(key, value){
	    	    $("div").append('<p id="'+value.id+'">'+value.name+'</p>');
	    	    $("div").append('<input type="checkbox" id = "' + value.name + '" onchange="whatStateIsCheckBox(this)"  />');
	    	    
	    	});
	    	$("body").append('<hr><a href="sendProblem.html">To submission page</a><br><hr>');
	    	$("body").append('<a href="getAllOpenProblems.html">To open issues page</a><br><hr>');
	    	console.log(response);
	    },
	    error:function(error){
	    	$("body").append('<p>in error</p>');
	    	console.log(error);
	    }
	});
}
function getAssignees(list){
	var url = 'http://172.25.8.18:8080/rest/api/2/project/AM/role/10100';
	$.ajax({
		cache: false,
		url: 'http://172.25.8.18:8080/rest/api/2/user/assignable/search?project=JA',
		type: 'GET',
	    dataType : 'json',
	    headers:{
	    	"X-Atlassian-Token":"nocheck"
	    },
	    success: function(response){
	    	console.log(response);
	    	$.each(response, function(key, value){
	    		assignees.push(value.name);
	    	});
	    	fillInSendProblemPage(list);
	    },
	    error:function(error){
	    	console.log("getassignee error response : " + JSON.stringify(error));
	    }
	});
}

function getIssuesOfReporter(){
	var fullUrl =  'http://172.25.8.18:8080/rest/api/2/search?jql=reporter=' + localStorage.getItem("username");
	$.ajax({
		cache: false,
		url: fullUrl,
	    type: 'GET',
	    dataType : 'json',
	    headers:{
	    	"X-Atlassian-Token":"nocheck"
	    },
	    success: function(response){
	    	console.log(response);
	    	var assignee = "";
	    	var issueType = "";
	    	var summary = "";
	    	var description = "";
	    	var status = "";
	    	var issueId = "";
	    	var html = "";
	    	$.each(response.issues, function(key, value){
	    	    if(status !== "closed" || status !== "read" ||status !== "solved"){	
	    	    	issueId = value.id;
	    	    	assignee = value.fields.assignee.displayName;
		    	    if(assignee == null){
		    	    	assignee = "Assignee is not known";
		    	    }
		    	    issueType = value.fields.issuetype.name;
		    	    if(issueType == null){
		    	    	issueType = "No issue type given";
		    	    }
		    	    summary = value.fields.summary;
		    	    if(summary == null){
		    	    	summary = "No summary given for this issue";
		    	    }
		    	    description = value.fields.description;
		    	    if(description == null){
		    	    	description = "No description given for this issue";
		    	    }
		    	    status = value.fields.status.name;
	    	    	html = '<div id="' + issueId + '">'
		    	    	+ '<p>Type : ' + issueType + '</p>'
		    	    	+ '<p>Status : ' + status + '</p>'
		    	    	+ '<p>Summary : ' + summary + '</p>'
		    	    	+ '<p>Description : ' + description + '</p>'
		    	    	+ '<p>Assignee : ' + assignee + '</p>'
		    	    	+ '<button onclick="createHtmlOfCommentsPage(' + issueId + ')">Comments</button><br>'
		    	    	+ '<hr>'
		    	    	+ '</div>';
		    	    $("body").append(html);
	    	    }
	    	    
	    	});
	    },
	    error:function(error){
	    	console.log("getassignee error response : " + JSON.stringify(error));
	    }
	});
}
function createHtmlOfCommentsPage(id){
	window.localStorage.setItem("issueIdOpenComments", id);
	window.location.href = "http://172.25.8.14:8080/AltenJiraProject/WebContent/commentsOfOpenIssues.html"
}
function getCommentsOfOpenIssues(issueId){
	console.log("issueId = " +issueId);
	var fullUrl = 'http://172.25.8.18:8080/rest/api/2/issue/' + issueId + '/comment';
	console.log(fullUrl);
	$.ajax({
		cache: false,
		url: fullUrl,
	    type: 'GET',
	    dataType: 'json',
	    contentType: "application/json",
	    headers:{
	    	"X-Atlassian-Token":"nocheck"
	    },
	    success: function(response){
	    	$("body").append('<p>test</p>');
	    	var html = '<div>';
	    	$.each(response.comments, function(key, value){
	    		console.log("body = " + value.body);
	    		html = html
	    	    	+ '<p>Comment ' + (key + 1) + ' : Added on ' + value.created + '</p>'
	    	    	+ '<p>Created by : ' + value.author.name + '</p>'
	    	    	+ '<textarea readonly  rows = "20"  style="width:500px;height:200px;background:GhostWhite ;">'+value.body+'</textarea>'
	    	    	+ '<hr>';
	    	});
	    	
	    	html = html + '<p>Add a comment :</p>'
	    				+ '<textarea id="comment" rows = "20" placeholder="Comment" style="width: 500px;height: 200px;"></textarea>'
	    				+ '<button onclick="createCommentByIssueId(' + window.localStorage.getItem("issueIdOpenComments") + ')">Send comment</button>'
	    				+ '<hr></div>';
	    	console.log(html);
	    	$("body").append(html);
	    },
	    error:function(error){
	    	console.log((error));
	    }
	});
}
function createCommentByIssueId(issueId){
	var comment = document.getElementById('comment').value
	var fullUrl = 'http://172.25.8.18:8080/rest/api/2/issue/' + issueId + '/comment';
	console.log(fullUrl);
	$.ajax({
		cache: false,
		url: fullUrl,
	    type: 'POST',
	    contentType: 'application/json',
	    dataType: 'json',
	    contentType: "application/json",
	    headers:{
	    	"X-Atlassian-Token":"nocheck"
	    },
	    data: '{'
	    	+ '"body": "' + comment + '",'
	    	+ '"visibility": {'
	    	+ '"value": "All Users"'
    		+ '}'
			+ '}',
	    success: function(response){
	    	console.log(response);
	    },
	    error:function(error){
	    	console.log((error));
	    }
	});	
}
function fillInSendProblemPage(list){
	console.log("the assignees list size is : " + assignees);
	console.log(list);
	issues = list;
	for(i=0 ; i < list.length; i++){
		var idOne = list[i];
		var html = '<div id="' + idOne +'" >' + idOne +': <textarea id="summary '+ idOne +'" placeholder="Summary"></textarea><br>'
		+ '<textarea id="description '+ idOne + '" placeholder="Description" style="width: 500px;height: 200px"></textarea><br> Send to : ';
		var dropdown ='<select id="dropdown ' + idOne + '" style="width : 150px;">';
		for(j=0 ; j < assignees.length ; j++){
			dropdown = dropdown + '<option value="'+ assignees[j] + '">' + assignees[j] + '</option>';
			console.log("inside for loop for dropdown menu");
		}
		dropdown = dropdown + '</select><br>';
		html = html + dropdown + '<button id="button" onclick="testFunction(this)">Remove this issue</button><hr><br></div>';
		$("body").append(html);
	}
	$("body").append('<button onclick="createIssues()" style="width:500px;">Send issues</button>')
}
function testFunction(element){
	var parent = document.getElementById(element.parentNode.id);
	parent.parentNode.removeChild(element.parentNode);
	console.log("issues in testfunction" + issues);
	var index = issues.indexOf(parent.id);
	if (index !== -1) {
		issues.splice(index, 1);
		window.localStorage.setItem("test", JSON.stringify(issues));
	}
	if(issues.length === 0){
		window.location.href = "http://172.25.8.14:8080/AltenJiraProject/WebContent/selectProblem.html";
	}
}
function whatStateIsCheckBox(element){
	if(element.checked == true){
		issues.push(element.id);
	}else{
		var index = issues.indexOf(element.id);
		if (index !== -1) {
			issues.splice(index, 1);
		}
	}
	console.log(JSON.stringify(issues));
	window.localStorage.setItem("test", JSON.stringify(issues));
}