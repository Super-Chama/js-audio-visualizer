// establish vars
var canvas, ctx, source, context, analyser1, fbc_array, rads,
	center_x, center_y, radius, radius_old, deltarad, shockwave,
	bars, bar_x, bar_y, bar_x_term, bar_y_term, bar_width,
	bar_height, react_x, react_y, intensity, rot, inputURL,
	JSONPThing, JSONResponse, soundCloudTrackName, audio, pause,
	artist, title, img_url, isSeeking;

var img = new Image();
img.src = "sf.png";
var frameTime = 0, lastLoop = new Date, thisLoop;
var filterStrength = 20;
var fpsOut;
var settings;
var bars;
var variation = 0;
var video;
var ramped = false;

// give vars an initial real value to validate

react_x = 0;
react_y = 0;
radius = 0;
deltarad = 0;
shockwave = 0;
rot = 0;
intensity = 0;
pause = 1;
isSeeking = 0;

var audioContent, audioStream, analyser, frequencyArray;

particlesJS("particles-js", {
	particles: {
		"number": {
			"value": 80,
			"density": {
				"enable": false,
				"value_area": 800
			}
		},
		"color": {
			"value": "#ffffff"
		},
		"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#000000"
			},
			"polygon": {
				"nb_sides": 4
			},
			"image": {
				"src": "img/github.svg",
				"width": 100,
				"height": 100
			}
		},
		"opacity": {
			"value": 0.5524033491425908,
			"random": false,
			"anim": {
				"enable": false,
				"speed": 1,
				"opacity_min": 0.1,
				"sync": false
			}
		},
		"size": {
			"value": 4.003458988566119,
			"random": true,
			"anim": {
				"enable": false,
				"speed": 40,
				"size_min": 0.1,
				"sync": false
			}
		},
		"line_linked": {
			"enable": true,
			"distance": 150,
			"color": "#ffffff",
			"opacity": 0.4,
			"width": 1
		},
		"move": {
			"enable": true,
			"speed": 6,
			"direction": "top-right",
			"random": false,
			"straight": false,
			"out_mode": "out",
			"bounce": false,
			"attract": {
				"enable": false,
				"rotateX": 600,
				"rotateY": 1200
			}
		}
	},
	"interactivity": {
		"detect_on": "canvas",
		"events": {
			"onhover": {
				"enable": false,
				"mode": "repulse"
			},
			"onclick": {
				"enable": false,
				"mode": "push"
			},
			"resize": true
		},
		"modes": {
			"grab": {
				"distance": 400,
				"line_linked": {
					"opacity": 1
				}
			},
			"bubble": {
				"distance": 400,
				"size": 40,
				"duration": 2,
				"opacity": 8,
				"speed": 3
			},
			"repulse": {
				"distance": 200,
				"duration": 0.4
			},
			"push": {
				"particles_nb": 4
			},
			"remove": {
				"particles_nb": 2
			}
		}
	},
	"retina_detect": true
});


var soundNotAllowed = function (error) {
	h.innerHTML = "You must allow your microphone.";
	console.log(error);
}

var soundAllowed = function (stream) {
	//Audio stops listening in FF without // window.persistAudioStream = stream;
	window.persistAudioStream = stream;
	audioContent = new AudioContext();
	audioStream = audioContent.createMediaStreamSource(stream);
	analyser = audioContent.createAnalyser();
	audioStream.connect(analyser);
	analyser.fftSize = 1024;

	frequencyArray = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(frequencyArray);

}

function initPage() {
	canvas = document.getElementById("visualizer_render");
	ctx = canvas.getContext("2d");
	video = document.getElementById("bgvid");

	navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);

	fpsOut = document.getElementById('fps');
	settings = {
		Background1: [255, 0, 75],
		Background2: [47, 0, 8],
		FlashFill: [197, 197, 197],
		Style: 'Solid',
		LineColor: [193, 187, 212],
		ShockwaveColor: [255, 255, 255],
		CircleColor1: [255, 255, 255],
		CircleColor2: [177, 177, 177],
		ColorBias1: 255,
		ColorBias2: 255,
		Radius: 80,
		CircleOn: false,
		ShadowOn: true,
		NumberOfBars: 200,
		size: 1.1,
		killAfter: 190,
		hue: 187,
		saturation: 100,
		brightness: 30,
		backgroundSaturation: 17,
		backgroundBrightness: 4,
		backgroundAlpha: 0.04,
		randomSize: 0,
		pushEvery: 1,
		scaleFrom: 680,
		scaleTo: 760,
		scaleMin: -0.4,
		scaleMax: 0.1
	}

	//resize_canvas();

	audio = new Audio();
	audio.crossOrigin = "anonymous";
	audio.controls = true;
	audio.loop = false;
	audio.autoplay = false;

	context = new AudioContext();
	analyser = context.createAnalyser();

	// route audio playback
	source = context.createMediaElementSource(audio);
	source.connect(analyser);
	analyser.connect(context.destination);

	fbc_array = new Uint8Array(analyser.frequencyBinCount);

	//GUI
	var gui = new dat.GUI();
	gui.addColor(settings, 'Background1');
	gui.addColor(settings, 'Background2');
	gui.addColor(settings, 'FlashFill');
	gui.addColor(settings, 'LineColor');
	gui.addColor(settings, 'ShockwaveColor');
	gui.addColor(settings, 'CircleColor1');
	gui.addColor(settings, 'CircleColor2');
	gui.add(settings, 'Style', ['Solid', 'Random', 'Mix']);
	gui.add(settings, 'ColorBias1').min(0).max(255).step(1);
	gui.add(settings, 'ColorBias2').min(0).max(255).step(1);
	gui.add(settings, 'Radius').min(0).max(500).step(1);
	gui.add(settings, 'NumberOfBars').min(0).max(200).step(1);
	gui.add(settings, 'CircleOn');
	gui.add(settings, 'ShadowOn');
	gui.close();

	frameLooper();
}

function resize_canvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

(function () {
	var mouseTimer = null, cursorVisible = true;

	function disappearCursor() {
		mouseTimer = null;
		document.body.style.cursor = "none";
		document.getElementById("button_pause").style.opacity = 0;
		cursorVisible = false;
	}

	document.onmousemove = function () {
		if (mouseTimer) {
			window.clearTimeout(mouseTimer);
		}
		if (!cursorVisible) {
			document.body.style.cursor = "default";
			document.getElementById("button_pause").style.opacity = 100;
			cursorVisible = true;
		}
		mouseTimer = window.setTimeout(disappearCursor, 3000);
	};
})();




function togglepause() {
	if (pause) {
		pause = 0;
		audio.play();
		video.play();
	} else {
		pause = 1;
		audio.pause();
		video.pause();
	}
}

function frameLooper() {

	//video.playbackRate = 1;
	resize_canvas();
	var grd = ctx.createLinearGradient(0, 0, 0, 0.5);
	grd.addColorStop(0, "rgb(" + settings.Background1 + ")");
	grd.addColorStop(1, "rgb(" + settings.Background2 + ")");

	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//ctx.fillStyle = "rgba(" + settings.FlashFill + "," + (intensity * 0.0000125 - 0.4) + ")";
	ctx.fillStyle = "rgba(255, 255, 255, " + (intensity * 0.0000125 - 0.4) + ")";

	ctx.fillRect(0, 0, canvas.width, canvas.height);

	rot = rot + intensity * 0.0000001;

	react_x = 0;
	react_y = 0;
	bars = settings.NumberOfBars;
	if (frequencyArray) {
		analyser.getByteFrequencyData(frequencyArray);
	}

	intensity = 0;

	ctx.translate(center_x, center_y)

	for (var i = 0; i < bars; i++) {
		rads = Math.PI * 2 / bars;

		bar_x = center_x + 5;
		bar_y = center_y;

		//variation = Math.min(99999, Math.max((fbc_array[i] * 2.5 - 200), 0));
		if (!frequencyArray) {
			break;
		}
		variation = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);

		bar_height = variation;
		bar_width = bar_height * 0.02;

		var lineColor;

		switch (settings.Style) {
			case 'Solid':
				lineColor = "rgb(" + settings.LineColor + ")";
				break;
			case 'Random':
				lineColor = "rgb(" + getRandomInt(256) + ", " + settings.ColorBias1 + ", " + settings.ColorBias2 + ")";
				break;
			default:
				lineColor = "rgb(" + settings.LineColor + ")";
			//lineColor = "rgb(" + (fbc_array[i]).toString() + ", " + settings.ColorBias1 + ", " + settings.ColorBias2 + ")";
		}

		barWidth = 2 * Math.PI * 100 / bars;
		ctx.fillStyle = lineColor;
		var angle = i * ((Math.PI * 2) / bars);
		ctx.fillRect(150, -barWidth / 2, variation, barWidth);
		ctx.rotate((Math.PI * 2) / bars);

		react_x += Math.cos(rads * i + rot) * (radius + variation);
		react_y += Math.sin(rads * i + rot) * (radius + variation);

		intensity += variation;
	}

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	center_x = canvas.width / 2 - (react_x * 0.007);
	center_y = canvas.height / 2 - (react_y * 0.007);

	radius_old = radius;
	radius = 25 + (intensity * 0.002);
	deltarad = radius - radius_old;

	image_width = img.width //+ (intensity * 0.002);
	image_height = img.height //+ (intensity * 0.002);

	if (settings.CircleOn) {
		var x = center_x;
		y = center_y;
		// Radius of the entire circle
		radius2 = settings.Radius + (intensity * 0.001);
		// Radii of the white glow
		innerRadius = radius / 12;

		var gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, radius2 + 10);
		gradient.addColorStop(0, "rgb(" + settings.CircleColor1 + ")");
		gradient.addColorStop(1, "rgb(" + settings.CircleColor2 + ")");
		ctx.beginPath();
		ctx.arc(x, y, radius2, 0, 2 * Math.PI, false);

		ctx.fillStyle = gradient;
		ctx.fill();
	}

	// shockwave effect			
	shockwave += 60;

	ctx.lineWidth = 15;
	ctx.strokeStyle = "rgb(" + settings.ShockwaveColor + ")";
	ctx.beginPath();
	ctx.arc(center_x, center_y, shockwave + radius, 0, Math.PI * 2, false);
	ctx.stroke();


	if (deltarad > 15) {
		shockwave = 0;
		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		rot = rot + 0.4;
		rampUp(2);
	}

	if (settings.ShadowOn) {
		ctx.shadowOffsetX = 10;
		ctx.shadowOffsetY = 10;
		ctx.shadowColor = 'black';
		ctx.shadowBlur = 30;
	}
	ctx.drawImage(img, center_x - (image_width / 2), center_y - (image_height / 2), image_width, image_height);

	updateFps();
	window.requestAnimationFrame(frameLooper);
}

function updateFps() {
	var thisFrameTime = (thisLoop = new Date) - lastLoop;
	frameTime += (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;

	fpsOut.innerHTML = Math.ceil(1000 / frameTime) + " fps";
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function rampUp(factor) {
	if (ramped || video.currentTime > 40) {
		return;
	}
	ramped = true;
	video.playbackRate = factor;
	setTimeout(function () {
		video.playbackRate = 0.5;
	}, 1000);
	setTimeout(function () {
		video.playbackRate = 1;
		ramped = false;
	}, 1500);
}

