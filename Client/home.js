var conn = null;
var urlConnection = 'ws://192.168.0.207:9950';

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
	  /*
	  var msg = {};
	  
	  msg["actionType"] = 1;
	  msg["username"] = username;
	  msg["password"] = password;
	 
	  
	  conn = new WebSocket(urlConnection);
	  conn.onmessage = function(e){ 
	  var obj = JSON.parse(e.data);
	  if(obj.status == 'OK'){
		  var divLogin = $("#divLogin");
		  removeElement(divLogin);
		  $("#usernameLobby").text(obj.username);
		  $("#emailLobby").text(obj.email);
		  $("#statisticsLobby").text("Wins/Losses: " + obj.win + "/" + obj.loss);
		  setTimeout(function(){ $('.divLobby').slideToggle("slow"); }, 1000);
	  }
	  else{
		  alert('Login fail');
	  }
	  
		
	  };
	  conn.onopen = () => conn.send(JSON.stringify(msg));			
	  */
	  var divLogin = $("#divLogin");
		  removeElement(divLogin);
		  setTimeout(function(){ $('.divLobby').slideToggle("slow"); }, 1000);
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
	  var obj = JSON.parse(e.data);
	  if(obj.status == 'OK'){
		  var divLogin = $("#divLogin");
		  removeElement(divLogin);
		  $("#usernameLobby").text(obj.username);
		  $("#emailLobby").text(obj.email);
		  $("#statisticsLobby").text("Wins/Losses: " + obj.win + "/" + obj.loss);
		  setTimeout(function(){ $('.divLobby').slideToggle("slow"); }, 1000);
	  }
	  else{
		  alert('Sign up fail');
	  }
	  
		
	  };
	  conn.onopen = () => conn.send(JSON.stringify(msg));			

	  
	  
  });
  
  $("#enterGameBtn").click(function() {
	  	/*
	  var msg = {};
	  
	  msg["actionType"] = 2;
	  showPleaseWait();
	  $("#enterGameBtn").prop("disabled",true);
	  $("#closeGameBtn").prop("disabled",true);		  
	   
	  conn.onmessage = function(e){ 
	  var obj = JSON.parse(e.data);
	  switch (obj.status) {
			case "OK":
				  hidePleaseWait();
				  var divLobby = $("#divLobby");
				  removeElement(divLobby);
				  setTimeout(function(){ $('.divGame').slideToggle("slow"); }, 1000);
				  $("#enterGameBtn").prop("disabled",false);
				  $("#closeGameBtn").prop("disabled",false);	
				break;
			case "NO_USER_ID":
				alert("No user id");
				break;	
			
		}
	 	
	  };
	  conn.send(JSON.stringify(msg));	
	  */
	  hidePleaseWait();
				  var divLobby = $("#divLobby");
				  removeElement(divLobby);
				  setTimeout(function(){ $('.divGame').slideToggle("slow"); }, 1000);
				  $("#enterGameBtn").prop("disabled",false);
				  $("#closeGameBtn").prop("disabled",false);

	  $('#paddle1').css('left', (document.body.clientWidth / 2) - (955 / 2) + 30);			  
	  $('#paddle2').css('left', (document.body.clientWidth / 2) + (955 / 2) - 23);
	  $('#wall').css('left', (document.body.clientWidth / 2));	  
	  setTimeout(function() {
		startBall(0);
	  }, 2000);
  });
  
  $("#closeGameBtn").click(function() {
	  	
	  conn.close();
	  removeElement(divLobby);
	  setTimeout(function(){ $('.divLogin').slideToggle("slow"); }, 1000);
	  	  
  });
  
  $("#next").click(function () {
	  updateItems(1);
  });
  
  $("#prev").click(function () {
	  updateItems(-1);
  });
  
  
    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

    navigator.getMedia(
        // constraints
        {video:true, audio:false},

        // success callback
        function (mediaStream) {
            var video = document.getElementsByTagName('video')[0];
            video.srcObject = mediaStream;
            video.play();
        },   
        //handle error
        function (error) {
            console.log(error);
        }) 

	$("#capture").click(function () {
		
	  var canvas = document.createElement("canvas");
	  var video = document.getElementById("video");
        canvas.width = 300;
        canvas.height = 300;
        canvas.getContext('2d')
              .drawImage(video, 0, 0, canvas.width, canvas.height);
 
        var img = document.createElement("img");
        img.src = canvas.toDataURL();
        //$("#output").append(img);
		
		var data = canvas.getContext("2d").getImageData(0, 0, 300, 300).data; 
		var stringPicture = '';
		
		for(var i=0; i<data.length; i+=4) {
			for(var t = 0; t < 3; t++){
				if(data[i+t].toString().length < 3){
					for(var j = data[i+t].toString().length; j < 3; j++){
						stringPicture = stringPicture.concat("0");
					}
				}
				stringPicture = stringPicture.concat(data[i+t].toString());
			}
		}
		/*
		var t = 0;
		var myArr = [];
		for (var i = 0; i < 277; i++){
			myArr[i] = [];
			for (var j = 0; j < 220; j++){
				myArr[i][j] = [];
				for(var k = 0; k < 3; k++){
					myArr[i][j][k] = data.data[t];
					t = t + 1;
				}
				t++;
			}
		}
		*/
	  /*		
	  var msg = {};
	  
	  msg["actionType"] = 3;
	  msg["picture"] = stringPicture;
	  		  
	   
	  conn.onmessage = function(e){ 
	  console.log(e.data);
	  	 	
	  };
	  conn.send(JSON.stringify(msg));
	  */
	  
	  
	});
	
	$( window ).resize(function() {
	  $('#paddle1').css('left', (document.body.clientWidth / 2) - (955 / 2) + 30);			  
	  $('#paddle2').css('left', (document.body.clientWidth / 2) + (955 / 2) - 23);
	});
    
});

function showPleaseWait() {
    var modalLoading = '<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false role="dialog">\
        <div class="modal-dialog">\
            <div class="modal-content">\
                <div class="modal-header">\
                    <h1 class="modal-title">Loading...</h1>\
                </div>\
                <div class="modal-body">\
					<div><h4 class="modal-title">Please wait for another player to connect.</h4></div>\
					<div id="loader" class="loader"></div>\
                </div>\
            </div>\
        </div>\
    </div>';
    $(document.body).append(modalLoading);
}

function hidePleaseWait() {
    $("#pleaseWaitDialog").remove();
}

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

function updateItems(delta)
{
    var $items = $('#group').children();
    var $current = $items.filter('.current');
    var index = $current.index();
    var newIndex = index+delta;
    // Range check the new index
    newIndex = (newIndex < 0) ? 0 : ((newIndex > $items.length) ? $items.length : newIndex); 
    if (newIndex != index){
        $current.removeClass('current');
        $current = $items.eq(newIndex).addClass('current');
        // Hide/show the next/prev
        $("#prev").toggle(!$current.is($items.first()));    
        $("#next").toggle(!$current.is($items.last()));    
    }
}


setInterval(function(){ 
	speedOfPaddle1 = 0.3;
}, 3000);
setInterval(function(){ 
	speedOfPaddle1 = 0;
}, 5000);
//var height = $('#idDiv').height();
//var width = $('#idDiv').width()
//var top = $('#idDiv').offset().top;
//var left = $('#idDiv').offset().left;
var paddleHeight = 120;
var paddleWidth = 10;
var ballRadius = 15;
var halfPaddleHeight = paddleHeight / 2;
var speedOfPaddle1 = 0;
var positionOfPaddle1 = 460;
var speedOfPaddle2 = 0;
var positionOfPaddle2 = 460;
var topPositionOfBall = 510;
var leftPositionOfBall = 820;
var topSpeedOfBall = 0;
var leftSpeedOfBall = 0;
var score1 = 0;
var score2 = 0;
function startBall(x) {
	topPositionOfBall = (score1 + score2)/18 * 400 + 300;
	if (x < 0.5) {
		var side = 1;
		leftPositionOfBall = (document.body.clientWidth / 2) - (955 / 2) + 50;
	} else {
		var side = -1;
		leftPositionOfBall = (document.body.clientWidth / 2) + (955 / 2) - 50;
	}
	topSpeedOfBall = 3;
	leftSpeedOfBall = side * 3;
};

document.addEventListener('keydown', function (e) {
     if (e.keyCode == 87 || e.which == 87) { // W key
      speedOfPaddle1 = -10;
     }
     if (e.keyCode == 83 || e.which == 83) { // S Key
      speedOfPaddle1 = 10;
     }
     if (e.keyCode == 38 || e.which == 38) { // up arrow
      speedOfPaddle2 = -10;
     }
     if (e.keyCode == 40 || e.which == 40) { // down arrow
      speedOfPaddle2 = 10;
     }
}, false);
document.addEventListener('keyup', function (e) {
	if (e.keyCode == 87 || e.which == 87) {
		speedOfPaddle1 = 0;
	}
	if (e.keyCode == 83 || e.which == 83) {
		speedOfPaddle1 = 0;
	}
	if (e.keyCode == 38 || e.which == 38) {
		speedOfPaddle2 = 0;
	}
	if (e.keyCode == 40 || e.which == 40) {
		speedOfPaddle2 = 0;
	}
}, false);
function print() {
	console.log(positionOfPaddle1);
}
var gameLoop = window.setInterval(function show() {
	positionOfPaddle1 += speedOfPaddle1;
	positionOfPaddle2 += speedOfPaddle2;
	topPositionOfBall += topSpeedOfBall;
	leftPositionOfBall += leftSpeedOfBall;
	if (positionOfPaddle1 <= 300) {
		positionOfPaddle1 = 300;
	}
	if (positionOfPaddle2 <= 300) {
		positionOfPaddle2 = 300;
	}
	if (positionOfPaddle1 >= 770 -110) {
		positionOfPaddle1 = 770 - 110;
	}
	if (positionOfPaddle2 > 770 - 110) {
		positionOfPaddle2 = 770 - 110;
	}
	if (topPositionOfBall <= 300 || topPositionOfBall >= 770 - ballRadius) {
		topSpeedOfBall = -topSpeedOfBall
	}
	if (leftPositionOfBall <= (window.innerWidth / 2) - (955 / 2) + 28) {
		//alert(topPositionOfBall - ballRadius / 2 + ' ' + positionOfPaddle1 + ' ' + paddleHeight);
		if (topPositionOfBall - ballRadius / 2 > positionOfPaddle1 && topPositionOfBall < positionOfPaddle1 + paddleHeight) {
			leftSpeedOfBall = -leftSpeedOfBall;
		} else {
			score2++;
			if(score1 < 9 && score2 < 9){
				startBall(1);
			}
			else{
				alert("gata");
				window.clearInterval(gameLoop);
			}
			
		}
	}
	if (leftPositionOfBall >= (document.body.clientWidth / 2) + (955 / 2) - 18 - ballRadius) {
		//alert(topPositionOfBall + ' ' + positionOfPaddle2 + ' ' + paddleHeight);
		if (topPositionOfBall > positionOfPaddle2 && topPositionOfBall < positionOfPaddle2 + paddleHeight) {
			leftSpeedOfBall = -leftSpeedOfBall
		} else {
			score1++;
			if(score1 < 9 && score2 < 9){
				startBall(0);
			}
			else{
				alert("gata");
				window.clearInterval(gameLoop);
			}
			
		}
	}
	document.getElementById("paddle1").style.top = (positionOfPaddle1) + "px";
	document.getElementById("paddle2").style.top = (positionOfPaddle2) + "px";
	document.getElementById("ball").style.top = (topPositionOfBall) + "px";
	document.getElementById("ball").style.left = (leftPositionOfBall) + "px";
	$("#player1Score").text(score1);
	$("#player2Score").text(score2);
}, 1000/60);
