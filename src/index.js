import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import { WebRTCAdaptor } from './js/webrtc_adaptor';
import { appendChat } from './js/chat';
UIkit.use(Icons);
// components can be called from the imported UIkit reference
UIkit.notification('test', 'success');
import $ from 'jquery'
import './index.css';
import moment from 'moment';
import { initClass, fetchStudents, fetchInfo, fetchChat } from './js/axios';
import { ping } from './js/app';
import { handleData } from './js/dataHandler';
var User;
var Client; 
$(document).ready(function () {
    ping().then(() => {
        $('#loading').hide();
        $('#content').show();
    }).catch((error) => {
        $('#loading').hide();
        $('#content').html(`
            <pre>
                ${error}
            </pre>
        `);
    });
});

    var token = null
    var start_publish_button = document.getElementById("start_publish_button");
	var stop_publish_button = document.getElementById("stop_publish_button");	
    var pc_config = {
        'iceServers' : [ {
            'urls': process.env.TURN_SERVER,
            'username': process.env.TURN_USER,
            'credential': process.env.TURN_PASS
        },
        {
            'urls': process.env.STUN_SERVER ,
            'username': process.env.TURN_USER,
            'credential': process.env.TURN_PASS
        }]
    };
    var sdpConstraints = {
        OfferToReceiveAudio : false,
        OfferToReceiveVideo : false
    };

    var mediaConstraints = {
        video : true,
        audio : true
    };
    var autoRepublishEnabled = true;
    var autoRepublishIntervalJob = null;
	var isDataChannelOpen = false;
	const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var streamId = urlParams.get('classId')
    const apiToken = urlParams.get('token')
	var isMicMuted = false;
    var isCameraOff = false;
    var camera_button = $('#camera_toggle');
    var audio_button = $('#audio_toggle');
    document.getElementById("alternateStream").onclick = function() {
        window.open('https://stream.futurelines.live:5443/WebRTCAppEE/index.html?name=' + streamId)		
    };
    initClass(apiToken).then((response) => {
        User = response.data
        localStorage.setItem('user', JSON.stringify(response.data));
        fetchStudents(apiToken, streamId).then(() => {
            $(document).ready( function () {
                var students = document.getElementsByClassName('StudentItem')
                for (let element of students) {
                    $(element).on('click', function() {
                        allowUser(element.id);
                    });
                }
                $('#denyAll').on('click', function() {
                    var obj = {
                        remoteStream: null,
                        order: "DENY_ALL"
                    }
                    Client.publish('/class/' + streamId + "/orders", JSON.stringify(obj));
                });
            });
            });
            $('#userName').text(response.data.name);
            fetchChat(apiToken, streamId, User);
            // Client = mqttInit(apiToken,streamId, User);
            // handleForm();
    });
    $(start_publish_button).on('click', startPublishing);
    $(stop_publish_button).on('click', stopPublishing);
	export function toggle_camera() {
        if(isCameraOff)  {
            $('#camera-disabled').hide();
            turnOnLocalCamera();
        } else { 
            $('#camera-disabled').show();
            turnOffLocalCamera();
        }
    }
    export function toggle_audio() {
        if(isMicMuted)  {
            $('#audio-disabled').hide();
            unmuteLocalMic();
        } else { 
            $('#audio-disabled').show();
            muteLocalMic();
        }
    }
    function sendNotificationEvent(eventType) {
        if(isDataChannelOpen) {
            var notEvent = { streamId: streamId, eventType:eventType };
            console.log(notEvent);
            webRTCAdaptor.sendData(streamId, JSON.stringify(notEvent));
        }    else {
            console.log("Could not send the notification because data channel is not open.");
        }
    }
    
    function turnOffLocalCamera() {
        webRTCAdaptor.turnOffLocalCamera();
        isCameraOff = true;
        sendNotificationEvent("CAM_TURNED_OFF");
    }
    
    function turnOnLocalCamera() {
        webRTCAdaptor.turnOnLocalCamera();
        isCameraOff = false;
        sendNotificationEvent("CAM_TURNED_ON");
    }
    
    function muteLocalMic(){
        webRTCAdaptor.muteLocalMic();
        isMicMuted = true;
        sendNotificationEvent("MIC_MUTED");
    }
    
    function unmuteLocalMic() {
        webRTCAdaptor.unmuteLocalMic();
        isMicMuted = false;
        sendNotificationEvent("MIC_UNMUTED");
    }

	function startPublishing() {
		webRTCAdaptor.publish(streamId, token);
	}

	function stopPublishing() {
		if (autoRepublishIntervalJob != null) {
			clearInterval(autoRepublishIntervalJob);
			autoRepublishIntervalJob = null;
		}
		webRTCAdaptor.stop(streamId);
	}
	
    export function switchVideoMode(chbx) {
        console.log('data changed to : ', chbx)
        if(chbx == "screen") {
            webRTCAdaptor.switchDesktopCapture(streamId);
        }
        else if(chbx == "screen+camera"){
            webRTCAdaptor.switchDesktopCaptureWithCamera(streamId);
      }
      else {
            webRTCAdaptor.switchVideoCameraCapture(streamId, chbx);
        }
    }
    
    export function switchAudioMode(chbx) {
      webRTCAdaptor.switchAudioInputSource(streamId, chbx);
    }

	export function getCameraRadioButton(deviceName, deviceId) {
        return "<option value='" + deviceId + "'>" + deviceName + "</option>";
    }
    
    export function getAudioRadioButton(deviceName, deviceId) {
        return "<option value='" + deviceId + "'>" + deviceName + "</option>";
    }

	function toggleOptions() {
		$(".options").toggle();
	}
	
	function sendData() {
		try {
			var iceState = webRTCAdaptor.iceConnectionState(streamId);
            if (iceState != null && iceState != "failed" && iceState != "disconnected") {
            
				webRTCAdaptor.sendData($("#streamName").val(), $("#dataTextbox").val());
				$("#dataMessagesTextarea").append("Sent: " + $("#dataTextbox").val() + "\r\n");
				$("#dataTextbox").val("");
			}
			else {
				alert("WebRTC publishing is not active. Please click Start Publishing first")
			}
		}
		catch (exception) {
			console.error(exception);
			alert("Message cannot be sent. Make sure you've enabled data channel on server web panel");
		}
	}
	  
	
	function checkAndRepublishIfRequired() {
	 	var iceState = webRTCAdaptor.signallingState(streamId);
	  	if (iceState == null || iceState == "failed" || iceState == "disconnected"){
	  		console.log("Publish has stopped and will try to re-publish");
	  		webRTCAdaptor.stop(streamId);
	  		webRTCAdaptor.closePeerConnection(streamId);
	  		webRTCAdaptor.closeWebSocket();
	  		initWebRTCAdaptor(true, autoRepublishEnabled);
	  	}
	 	
	}

    function startAnimation() {

        $("#broadcastingInfo").fadeIn(800, function () {
          $("#broadcastingInfo").fadeOut(800, function () {
        		var state = webRTCAdaptor.signallingState(streamId);
            if (state != null && state != "closed") {
            	var iceState = webRTCAdaptor.iceConnectionState(streamId);
            	if (iceState != null && iceState != "failed" && iceState != "disconnected") {
              		startAnimation();
            	}
            }
          });
        });
      }

	

	// var appName = location.pathname.substring(0, location.pathname.lastIndexOf("/")+1);
	// var path =  location.hostname + ":" + location.port + appName + "websocket?rtmpForward=" + rtmpForward;
	// var websocketURL =  "ws://" + path;
	
	// if (location.protocol.startsWith("https")) {
	// 	websocketURL = "wss://" + path;
	// }

    var websocketURL = "wss://stream.futurelines.live:5443/WebRTCAppEE/websocket?rtmpForward=false"
	var	webRTCAdaptor = null;
	
	function initWebRTCAdaptor(publishImmediately, autoRepublishEnabled) 
	{
		webRTCAdaptor = new WebRTCAdaptor({
				websocket_url : websocketURL,
				mediaConstraints : mediaConstraints,
				peerconnection_config : pc_config,
				sdp_constraints : sdpConstraints,
				localVideoId : "localVideo",
				debug:true,
				bandwidth:900,
				callback : function(info, obj) {
					if (info == "initialized") {
                        isDataChannelOpen = true;
                        console.log("initialized");
						start_publish_button.disabled = false;
						stop_publish_button.disabled = true;
						if (publishImmediately) {
							webRTCAdaptor.publish(streamId, token)
						}
						
					} else if (info == "publish_started") {
						//stream is being published
						console.log("publish started");
						start_publish_button.disabled = true;
                        stop_publish_button.disabled = false;
                        webRTCAdaptor.enableStats(streamId);
						startAnimation();
						if (autoRepublishEnabled && autoRepublishIntervalJob == null) 
						{
							autoRepublishIntervalJob = setInterval(() => {
								checkAndRepublishIfRequired();
							}, 3000);
							
                        }
                        var timer = setInterval(() => {
                            var state = webRTCAdaptor.signallingState(streamId);
                            if (state != null
                                    && state != "closed") {
                                var iceState = webRTCAdaptor
                                        .iceConnectionState(streamId);
                                if (iceState != null
                                        && iceState != "failed"
                                        && iceState != "disconnected") {
                                    fetchInfo(apiToken, streamId).then((response) => {
                                        $('#viewers').text(response.data.webRTCViewerCount);
                                        $('#speed').text(response.data.speed);
                                        $('#start').text(moment(moment(response.data.startTime).format('YYYYMMDDkkmmss'), 'YYYYMMDDkkmmss').fromNow());
                                    });
                                    webRTCAdaptor.getIceStats(streamId).then((response) => {
                                        console.log(response);
                                    })
                                }
                            }
                        }, 15000);
					} else if (info == "publish_finished") {
						//stream is being finished
                        console.log("publish finished");
                        clearInterval(timer);
						start_publish_button.disabled = false;
                        stop_publish_button.disabled = true;
                        $('#averageSpeed').text('0');
                        $('#currentSpeed').text('0');
					}
					else if (info == "browser_screen_share_supported") {
						$(".video-source").prop("disabled", false);
						
						console.log("browser screen share supported");
						browser_screen_share_doesnt_support.style.display = "none";
					}
					else if (info == "screen_share_stopped") {
						//choose the first video source. It may not be correct for all cases. 
						$(".video-source").first().prop("checked", true);	
						console.log("screen share stopped");
					}
					else if (info == "closed") {
						//console.log("Connection closed");
						if (typeof obj != "undefined") {
							console.log("Connecton closed: " + JSON.stringify(obj));
						}
					}
					else if (info == "pong") {
						//ping/pong message are sent to and received from server to make the connection alive all the time
						//It's especially useful when load balancer or firewalls close the websocket connection due to inactivity
					}
					else if (info == "refreshConnection") {
						checkAndRepublishIfRequired();
					}
					else if (info == "ice_connection_state_changed") {
						console.log("iceConnectionState Changed: ",JSON.stringify(obj));
					}
					else if (info == "updated_stats") {
                        $('#averageSpeed').text(obj.averageOutgoingBitrate);
                        $('#currentSpeed').text(obj.currentOutgoingBitrate);
					}
					else if (info == "data_received") {
                        handleData(obj)
                        // console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
						// $("#dataMessagesTextarea").append("Received: " + obj.event.data + "\r\n");
					}
					else if (info == "available_devices") {
						var videoHtmlContent = "";
                var audioHtmlContent = "";
                obj.forEach(function(device) {
                    if (device.kind == "videoinput") {
                        videoHtmlContent += getCameraRadioButton(device.label, device.deviceId);
                    }
                    else if (device.kind == "audioinput"){
                        audioHtmlContent += getAudioRadioButton(device.label, device.deviceId);
                    }
                }); 
                $(videoHtmlContent).prependTo("#videoSource");
                $("#videoSource").find('option:eq(0)').prop('selected', true);
                
                $(audioHtmlContent).prependTo("#audioSource");
                $(".audio-source").find('option:eq(0)').prop("selected", true);	
					}
					else {
                        console.log( info + " notification received");
                        console.log( obj );
					}
				},
				callbackError : function(error, message) {
					//some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
	
					console.log("error callback: " +  JSON.stringify(error));
					var errorMessage = JSON.stringify(error);
					if (typeof message != "undefined") {
						errorMessage = message;
					}
					var errorMessage = JSON.stringify(error);
					if (error.indexOf("NotFoundError") != -1) {
						errorMessage = "Camera or Mic are not found or not allowed in your device";
					}
					else if (error.indexOf("NotReadableError") != -1 || error.indexOf("TrackStartError") != -1) {
						errorMessage = "Camera or Mic is being used by some other process that does not let read the devices";
					}
					else if(error.indexOf("OverconstrainedError") != -1 || error.indexOf("ConstraintNotSatisfiedError") != -1) {
						errorMessage = "There is no device found that fits your video and audio constraints. You may change video and audio constraints"
					}
					else if (error.indexOf("NotAllowedError") != -1 || error.indexOf("PermissionDeniedError") != -1) {
						errorMessage = "You are not allowed to access camera and mic.";
					}
					else if (error.indexOf("TypeError") != -1) {
						errorMessage = "Video/Audio is required";
					}
					else if (error.indexOf("ScreenSharePermissionDenied") != -1) {
						errorMessage = "You are not allowed to access screen share";
						$(".video-source").first().prop("checked", true);						
					}
					else if (error.indexOf("WebSocketNotConnected") != -1) {
						errorMessage = "WebSocket Connection is disconnected.";
					}
					alert(errorMessage);
				}
			});
    }
    
    
	$(document).ready(function () {
        $('#camera_toggle').on('click', function () {
            toggle_camera();
        })
        $('#audio_toggle').on('click', function () {
            toggle_audio();
        });
        $('#videoSource').on('change', function() {
            switchVideoMode(this.value)
        });
        $('#audiSource').on('change', function() {
            switchAudioMode(this.value)
        });
    });
	//initialize the WebRTCAdaptor
	$(document).ready(function() {
        initWebRTCAdaptor(false, autoRepublishEnabled);
    })

    $('.uk-button').on('click', function (){
        $('.uk-section').toggleClass('uk-dark uk-light');
      
        $('.uk-container > .uk-card').toggleClass('uk-card-default uk-card-secondary');
      
        $('html').toggleClass('uk-background-muted uk-background-secondary');
      });
      
$(document).ready( function () {
    $('#sent').click( function () {
        appendChat('sent', {sender: "samir", message:"hello from js"})
    })
    $('#recieved').click( function () {
        appendChat('recieved', {sender: "samir", message:"hello from js"})
    })
    $('#info').click( function () {
        appendChat('info', {sender: "samir", message:"hello from js"})
        webRTCAdaptor.sendData(streamId, "Hi!");
    })
})