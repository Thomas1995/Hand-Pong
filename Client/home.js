var conn = null;
var urlConnection = 'ws://192.168.43.230:9950';

$(document).ready(function() {
  
  $("#startButton").click(function() {
	var target = $("#intro");
    removeElement(target);
	setTimeout(function(){ $('.divLogin').slideToggle("slow"); }, 1000);
	setTimeout(function(){ $('html').css({'background' : 'url(2.jpg) no-repeat center center fixed',
						   '-webkit-background-size' : 'cover',
						   '-moz-background-size' : 'cover', 
						   '-o-background-size' : 'cover',
						   'background-size' : 'cover'}); 						   
		}, 0);
	
  });
  
  $("#SignUpOption").click(function() {	
	setTimeout(function(){ $('.divMenuLogin').slideToggle("slow"); }, 1000);	
	setTimeout(function(){ $('.divMenuSignUp').slideToggle("slow"); }, 2000);	
	setTimeout(function(){ $('.divMenuSignUp').css({'display' : 'block'}); 						   
			}, 2000);	
  });

  $("#LoginOption").click(function() {
	setTimeout(function(){ $('.divMenuSignUp').slideToggle("slow"); }, 1000);	
	setTimeout(function(){ $('.divMenuLogin').slideToggle("slow"); }, 2000);	
	setTimeout(function(){ $('.divMenuLogin').css({'display' : 'block'}); 						   
			}, 2000);	
  });
  
  $("#loginBtn").click(function() {
	  var username = $("#emailLogin").val();
	  var password = $("#passwordLogin").val();
	  
	  var msg = {};
	  
	  msg["actionType"] = 1;
	  msg["username"] = username;
	  msg["password"] = password;
	 
	  
	  conn = new WebSocket(urlConnection);
	  conn.onmessage = function(e){ 
	  alert("Login");
	  console.log(e.data);
	  var obj = JSON.parse(e.data);
	  if(obj.status == 'OK'){
		  var divLogin = $("#divLogin");
		  removeElement(divLogin);
		  setTimeout(function(){ $('.divLobby').slideToggle("slow"); }, 1000);
	  }
	  else{
		  alert('Login fail');
	  }
	  
		
	  };
	  conn.onopen = () => conn.send(JSON.stringify(msg));			
	  
	  
	  

	  
  });
  
  $("#signUpBtn").click(function() {
	  var username = $("#nameSignUp").val();
	  var email = $("#emailSignUp").val();
	  var password = $("#passwordSignUp").val();
	  
	  var msg = {};
	  
	  msg["actionType"] = 0;
	  msg["username"] = username;
	  msg["password"] = password;
	  msg["email"] = email;
	  	 
	 
	  conn = new WebSocket(urlConnection);
	  conn.onmessage = function(e){ 
	  console.log(e.data);
	  var obj = JSON.parse(e.data);
	  if(obj.status == 'OK'){
		  var divLogin = $("#divLogin");
		  removeElement(divLogin);
		  setTimeout(function(){ $('.divLobby').slideToggle("slow"); }, 1000);
	  }
	  else{
		  alert('Sign up fail');
	  }
	  
		
	  };
	  conn.onopen = () => conn.send(JSON.stringify(msg));			

	  
	  
  });
  
  $("#enterGameBtn").click(function() {
	  	
	  var msg = {};
	  
	  msg["actionType"] = 2;
		
	 
	  conn.onmessage = function(e){ 
	  console.log(e.data);
	  var obj = JSON.parse(e.data);
	  alert(obj.status);
	  switch (obj.status) {
			case "OK":
				alert("Connect successful");
				break;
			case "NO_USER_ID":
				alert("No user id");
				break;	
			
		}
	 	
	  };
	  conn.send(JSON.stringify(msg));			

	  
	
	  
  });
    
});

function removeElement(target) {
  target.animate({
    opacity: "-=1"
  }, 1000, function() {
    target.remove();
  });
}

function dissapearElement(target) {
  target.animate({
    opacity: "-=1"
  }, 1000, function() {
    target.css({'display' : 'none'});
  });
}