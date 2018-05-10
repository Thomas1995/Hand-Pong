	var conn = null;
	var urlConnection = 'ws://192.168.1.6:9950';

$(document).ready(function() {
  
	$("#startButton").click(function() {
		var target = $("#intro");
		removeElement(target);
		setTimeout(function(){ $('.divLogin').slideToggle("slow"); }, 1000);
		setTimeout(function(){ $('html').css({
				'background' : 'url(2.jpg) no-repeat center center fixed',
				'-webkit-background-size' : 'cover',
				'-moz-background-size' : 'cover', 
				'-o-background-size' : 'cover',
				'background-size' : 'cover'}); 						   
	}, 0);
	
  });
  
	$("#SignUpOption").click(function() {	
		setTimeout(function(){ $('.divMenuLogin').slideToggle("slow"); }, 1000);	
		setTimeout(function(){ $('.divMenuSignUp').slideToggle("slow"); }, 2000);	
		setTimeout(function(){ $('.divMenuSignUp').css({'display' : 'block'});}, 2000);	
	});

	$("#LoginOption").click(function() {
		setTimeout(function(){ $('.divMenuSignUp').slideToggle("slow"); }, 1000);	
		setTimeout(function(){ $('.divMenuLogin').slideToggle("slow"); }, 2000);	
		setTimeout(function(){ $('.divMenuLogin').css({'display' : 'block'});}, 2000);	
	});
  
	$("#loginBtn").click(function() {
		var username = $("#emailLogin").val();
		var password = $("#passwordLogin").val();
	  
		var msg = {};
	  
		msg["actionType"] = 1;
		msg["username"] = username;
		msg["password"] = encryptPassword(password);
	  
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
	  
	});
  
	$("#signUpBtn").click(function() {
		var username = $("#nameSignUp").val();
		var email = $("#emailSignUp").val();
		var password = $("#passwordSignUp").val();
	  
		var msg = {};
	  
		msg["actionType"] = 0;
		msg["username"] = username;
		msg["password"] = encryptPassword(password);
		msg["email"] = email;
	 
		if(isEmail(email)) {
	 
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

	    }
		else {
			alert("Email invalid!");
		}
	  
	});
  
	$("#enterGameBtn").click(function() {
	  	
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

					$("#player1Username").text(obj.player1_username);
					$("#player1Statistics").text("Wins/Losses: " + obj.player1_win + "/" + obj.player1_loss);
					$("#player2Username").text(obj.player2_username);
					$("#player2Statistics").text("Wins/Losses: " + obj.player2_win + "/" + obj.player2_loss);	
					
					$('#paddle1').css('left', (document.body.clientWidth / 2) - (955 / 2) + 30);			  
					$('#paddle2').css('left', (document.body.clientWidth / 2) + (955 / 2) - 23);
					$('#wall').css('left', (document.body.clientWidth / 2));
					
					setTimeout(function() {  	 
						$('#wall').css('visibility', 'visible');
						$('#paddle1').css('visibility', 'visible');
						$('#paddle2').css('visibility', 'visible');	  
						startBall(0);
						sendPhoto();
					}, 3000);
					
					navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

					navigator.getMedia(
        
						{video:true, audio:false},


						function (mediaStream) {
							var video = document.getElementsByTagName('video')[0];
							video.srcObject = mediaStream;
							video.play();
						},   
					
						function (error) {
							console.log(error);
						}
					)
					break;
				case "NO_USER_ID":
					alert("No user id");
					break;	
				}
		};
		conn.send(JSON.stringify(msg));	
	  
	  
	  /*
		var generator = setInterval(function(){ 
			console.log('Start');
			window.clearInterval(id1);
			window.clearInterval(id2);
			var player1 = Math.random();
			var player2 = Math.random();
			var deviation1 = Math.floor(400 * player1 + 300);
			var deviation2 = Math.floor(400 * player2 + 300)
			console.log(deviation1 + ' ' + positionOfPaddle1);
			
			var pos1 = positionOfPaddle1;
			var pos2 = positionOfPaddle2;
			var id1 = setInterval(frame1, 1);
			var id2 = setInterval(frame2, 1);
			function frame1() {
				if (pos1 == deviation1) {
					window.clearInterval(id1);
				} 
				else {
					if(deviation1 > positionOfPaddle1){
						pos1++; 
					}		
					else{
						pos1--; 
					}
					positionOfPaddle1 = pos1; 
				}
			};
			  
			function frame2() {
				if (pos2 == deviation2) {
					window.clearInterval(id2);
				} 
				else {
					if(deviation2 > positionOfPaddle2){
						pos2++; 
					}	
					else{
						pos2--; 
					}
					positionOfPaddle2 = pos2; 
				}
			}
			
		}, 1000);
		*/
	});
	
	$("#closeGameBtn").click(function() {
	  	conn.close();
		var divLobby = $("#divLobby");
		removeElement(divLobby);
		setTimeout(function(){ location.reload(); }, 1000);	  	  
	});
  
	$("#next").click(function () {
		updateItems(1);
	});
  
	$("#prev").click(function () {
		updateItems(-1);
	});
	
	$( window ).resize(function() {
		$('#paddle1').css('left', (document.body.clientWidth / 2) - (955 / 2) + 30);			  
		$('#paddle2').css('left', (document.body.clientWidth / 2) + (955 / 2) - 23);
		$('#wall').css('left', (document.body.clientWidth / 2));
	});
    
});

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function encryptPassword(string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }

    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

    return temp.toLowerCase();
}

function sendPhoto() {
		
	var canvas = document.createElement("canvas");
	var video = document.getElementById("video");
	canvas.width = 200;
	canvas.height = 200;
	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
 
	//var img = document.createElement("img");
	//img.src = canvas.toDataURL();
	//$("#output").append(img);
		
	var data = canvas.getContext("2d").getImageData(0, 0, 200, 200).data; 
	var stringPicture = '';
		
	for(var i=0; i<data.length; i+=4) {
		var pixel = 0;
		for(var t = 0; t < 3; t++){
			
			if(t == 0){
				pixel = pixel + Math.floor(data[i+t] * 0.3);
			}
			if(t == 1){
				pixel = pixel + Math.floor(data[i+t] * 0.59);
			}
			if(t == 2){
				pixel = pixel + Math.floor(data[i+t] * 0.11);
			}
		}
		if(pixel.toString().length < 3){
			for(var j = pixel.toString().length; j < 3; j++){
				stringPicture = stringPicture.concat("0");
			}
		}
		stringPicture = stringPicture.concat(pixel.toString());
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
	  		
	var msg = {};
	  
	msg["actionType"] = 3;
	msg["picture"] = getPictureString();
	//msg["ballX"] = topPositionOfBall;
	//msg["ballY"] = leftPositionOfBall;
	msg["scorePlayer1"] = score1;
	msg["scorePlayer2"] = score2;
	  		  
	   
	conn.onmessage = function(e){ 
		var obj = JSON.parse(e.data);
		
		window.clearInterval(id1);
		window.clearInterval(id2);
		
		if(obj.ballX != null){
			//startBall(0);
		}
		
		if(obj.status == "ENEMY_DISCONNECTED" || obj.status == "FINISH_GAME"){
			
			if(obj.status == "ENEMY_DISCONNECTED") {
				var target = $("#divGame");
				removeElement(target);
				setTimeout(function(){ location.reload(); }, 1000);
			}
			if(obj.status == "FINISH_GAME") {
				showResult();
				$("#finalResult-title").text(obj.finalResult);
				setTimeout(function(){ 
					hideResult(); 
					setTimeout(function(){ location.reload(); }, 500);
				}, 3000);
			}
		}
		else {
					
			var deviation1 = Math.floor(400 * (1 - obj.player1coord) + 300);
			var deviation2 = Math.floor(400 * (1 - obj.player2coord) + 300);
				
			var pos1 = positionOfPaddle1;
			var pos2 = positionOfPaddle2;
			var id1 = setInterval(frame1, 1);
			var id2 = setInterval(frame2, 1);
			function frame1() {
				if (pos1 == deviation1) {
					window.clearInterval(id1);
				} 
				else {
					//if(deviation1 > positionOfPaddle1){
					//	pos1++; 
					//}		
					//else{
					//	pos1--; 
					//}
					pos1 = deviation1;
					positionOfPaddle1 = pos1; 
				}
			};
				  
			function frame2() {
				if (pos2 == deviation2) {
					window.clearInterval(id2);
				} 
				else {
					//if(deviation2 > positionOfPaddle2){
					//	pos2++; 
					//}	
					//else{
					//	pos2--; 
					//}
					pos2 = deviation2;
					positionOfPaddle2 = pos2; 
				}
			}
			
			var msg = {};
		  
			msg["actionType"] = 3;
			msg["picture"] = getPictureString();
			//msg["ballY"] = topPositionOfBall;
			//msg["ballX"] = leftPositionOfBall;
			msg["scorePlayer1"] = score1;
			msg["scorePlayer2"] = score2;
			conn.send(JSON.stringify(msg));
	  	} 	
	};
	conn.send(JSON.stringify(msg));
	  
	  
	  
};

function getPictureString(){
	
	var canvas = document.createElement("canvas");
	var video = document.getElementById("video");
	canvas.width = 200;
	canvas.height = 200;
	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
 
	//var img = document.createElement("img");
	//img.src = canvas.toDataURL();
	//$("#output").append(img);
		
	var data = canvas.getContext("2d").getImageData(0, 0, 200, 200).data; 
	var stringPicture = '';
		
	for(var i=0; i<data.length; i+=4) {
		var pixel = 0;
		for(var t = 0; t < 3; t++){
			
			if(t == 0){
				pixel = pixel + Math.floor(data[i+t] * 0.3);
			}
			if(t == 1){
				pixel = pixel + Math.floor(data[i+t] * 0.59);
			}
			if(t == 2){
				pixel = pixel + Math.floor(data[i+t] * 0.11);
			}
		}
		if(pixel.toString().length < 3){
			for(var j = pixel.toString().length; j < 3; j++){
				stringPicture = stringPicture.concat("0");
			}
		}
		stringPicture = stringPicture.concat(pixel.toString());
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
	return stringPicture;
}

function showPleaseWait() {
	var modalLoading = 
		'<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false role="dialog">\
			<div class="modal-dialog">\
				<div class="modal-content">\
					<div class="modal-header">\
						<h1 class="modal-title">Loading...</h1>\
					</div>\
					<div class="modal-body">\
						<div>\
							<h4 class="modal-title">Please wait for another player to connect.</h4>\
						</div>\
						<div id="loader" class="loader">\
						</div>\
					</div>\
				</div>\
			</div>\
		</div>';
	$(document.body).append(modalLoading);
}

function hidePleaseWait() {
	$("#pleaseWaitDialog").remove();
}

function showResult() {
	var modalLoading = 
		'<div class="modal" id="finalResult">\
			<div class="finalResult-dialog">\
				<div class="finalResult-content">\
					<div class="finalResult-header">\
						<h1 id="finalResult-title" class="finalResult-title"/>\
					</div>\
					</div>\
				</div>\
			</div>\
		</div>';
	$(document.body).append(modalLoading);
}

function hideResult() {
	$("#finalResult").remove();
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

function updateItems(delta) {
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
	$('#ball').css('visibility', 'visible');
	topSpeedOfBall = 3;
	leftSpeedOfBall = side * 3;
};


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
				window.clearInterval(gameLoop);
				$('#ball').css('visibility', 'hidden');  
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
				window.clearInterval(gameLoop);
				$('#ball').css('visibility', 'hidden');  
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
