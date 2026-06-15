/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Scene_Class.js" />
/// <reference path="./Scene_01_Dismantled.js" />





// ------------------------------ AI GENERATED START ------------------------------
let editor_frame;
let editor_slider;
let editor_input;
let is_playing = false;
let btn_play;
let editor_step = 1;
let cam_info_input;
function updateEditorUI() {
	if (editor_slider && editor_input) {
		editor_slider.value(editor_frame);
		editor_input.value(Math.round(editor_frame * 100) / 100);
	}
}
function setupEditorUI() {
	editor_frame = frame_start;
	if (editor_mode === 'editor' || editor_mode === 'editor_forward') {
		let ui_div = createDiv().position(10, canvas_height + 20);

		btn_play = createButton('Play').parent(ui_div);
		btn_play.mousePressed(() => {
			is_playing = !is_playing;
			btn_play.html(is_playing ? 'Pause' : 'Play');
// -------------------- AI GENERATED NOW START --------------------
			if (is_playing) {
				song.play();
				song.jump(editor_frame / keyframe_version);
			} else {
				song.pause();
			}
// -------------------- AI GENERATED NOW END --------------------
		});

		if (editor_mode === 'editor_forward') {
			is_playing = true;
			btn_play.html('Pause');
		}

		let btn_prev = createButton('Prev').parent(ui_div);
		btn_prev.mousePressed(() => {
			is_playing = false; btn_play.html('Play');
			editor_frame -= editor_step;
			updateEditorUI();
		});

		editor_slider = createSlider(0, frame_end + 50, frame_start, 0.01).parent(ui_div);
		editor_slider.style('width', '300px');
		editor_slider.input(() => {
			is_playing = false; btn_play.html('Play');
			editor_frame = parseFloat(editor_slider.value());
			editor_input.value(Math.round(editor_frame * 100) / 100);
		});

		let btn_next = createButton('Next').parent(ui_div);
		btn_next.mousePressed(() => {
			is_playing = false; btn_play.html('Play');
			editor_frame += editor_step;
			updateEditorUI();
		});

		editor_input = createInput(frame_start.toString()).parent(ui_div);
		editor_input.size(50);
		editor_input.mousePressed(() => {
			is_playing = false; btn_play.html('Play');
		});
		editor_input.input(() => {
			is_playing = false; btn_play.html('Play');
			let val = parseFloat(editor_input.value());
			if (!isNaN(val)) {
				editor_frame = val;
				editor_slider.value(editor_frame);
			}
		});

		createSpan(' Step: ').parent(ui_div);
		let step_input = createInput(editor_step.toString()).parent(ui_div);
		step_input.size(30);
		step_input.input(() => {
			let val = parseFloat(step_input.value());
			if (!isNaN(val) && val > 0) {
				editor_step = val;
			}
		});

		let cam_div = createDiv().position(10, canvas_height + 60);
		createSpan('Camera (EyeX, EyeY, EyeZ, CenterX, CenterY, CenterZ): ').parent(cam_div);
		cam_info_input = createInput('').parent(cam_div);
		cam_info_input.size(300);
	}
}
function handleEditorMode(time_current) {
	if (editor_mode === 'animation' || editor_mode === '') { }
	else if (editor_mode === 'fixed') {
		// make time_current correspond to frame_start
		time_current = frame_start / keyframe_version;
	}
	else if (editor_mode === 'forward') {
// -------------------- AI GENERATED NOW START --------------------
		// Sync 'forward' mode to the music
		if (song.isPlaying()) {
			if (song.currentTime() < time_start) {
				song.jump(time_start);
			}
			time_current = song.currentTime();
		} else {
			time_current = time_start;
		}
// -------------------- AI GENERATED NOW END --------------------
	}
	else if (editor_mode === 'loop') {
		let duration = time_end - time_start;
		if (duration > 0) {
			// time_current = (time_current % duration) + (frame_start / keyframe_version);
			// when to loop song
			if (song.isPlaying()) {
				if ( song.currentTime() - time_start > duration){
					// case when we just passed the end of the loop and need to jump back
					song.jump(time_start);
					time_current = time_start;
				} else if (song.currentTime() < time_start) {
					// case when we are before the start of the loop 
					// (happens since when we start playing the song it starts at 0 and not at frame_start)
					song.jump(time_start);
					time_current = time_start;
				}
			}

		} else {
			time_current = time_start;
		}
	}
	else if (editor_mode === 'editor' || editor_mode === 'editor_forward') {
// -------------------- AI GENERATED NOW START --------------------
		if (is_playing && song.isPlaying()) {
			// Sync the editor slider directly to the music
			editor_frame = song.currentTime() * keyframe_version;
			
			if (editor_frame > frame_end) {
				editor_frame = frame_start;
				song.jump(time_start);
			}
			updateEditorUI();
		} else {
			// If the user scrubs the slider, make sure the song pauses
			if (song.isPlaying()) {
				song.pause();
			}
		}
		time_current = editor_frame / keyframe_version;
// -------------------- AI GENERATED NOW END --------------------
	}
	return time_current;
}
// ------------------------------ AI GENERATED END ------------------------------






function preload() {
	// Load the texture before setup runs
	// P5 requires textures to be in the same folder or have valid CORS setup
	head_tex = loadImage('head_texture.jpg');
	song = loadSound('Puppet_(John_Michael_Howell).mp3');
  	// fontBeforeStart = loadFont('Roboto-VariableFont_wdth,wght.ttf');
  	fontBeforeStart = loadFont('Roboto-VariableFont_wdth,wght.ttf');
}

// --- PLAYBACK UI (used after pre-rendering completes) ---
let playback_ui_div = null;
let playback_btn_playpause = null;

function setupPlaybackUI(vid) {
  // The video drives the song — wire all sync through its events
  vid.addEventListener('play', () => {
    // stop() first clears any stale paused/stopped state, then jump+play from the right time
    song.stop();
    song.play();
    song.jump(time_start + vid.currentTime);
    if (playback_btn_playpause) playback_btn_playpause.textContent = '⏸ Pause';
  });
  vid.addEventListener('pause', () => {
    song.pause();
    if (playback_btn_playpause) playback_btn_playpause.textContent = '▶ Play';
  });
  vid.addEventListener('ended', () => {
    song.stop();
    if (playback_btn_playpause) playback_btn_playpause.textContent = '▶ Play';
  });
  // We only jump the song when the video first starts playing.
  // The browser will keep them perfectly in sync without constant checking.

  function restartPlayback() {
    vid.pause();
    song.stop();  // stop() fully resets, so the next jump() starts clean
    vid.src = captured_video_blob_url;
    vid.load();
    vid.oncanplay = () => { 
        vid.oncanplay = null; 
        vid.play();  // triggers 'play' event → song.jump(time_start + 0)
    };
  }

  function togglePlayPause() {
    if (vid.paused || vid.ended) {
      if (vid.ended) { restartPlayback(); } else { vid.play(); }
    } else {
      vid.pause();
    }
  }

  // Expose for Space key
  window._playback_toggle = togglePlayPause;
  window._playback_restart = restartPlayback;

  // Build simple UI div below the canvas
  let canvas_elt = document.getElementById('defaultCanvas0');
  playback_ui_div = document.createElement('div');
  playback_ui_div.style.position = 'absolute';
  playback_ui_div.style.left = canvas_elt.offsetLeft + 'px';
  playback_ui_div.style.top = (canvas_elt.offsetTop + canvas_height + 8) + 'px';
  playback_ui_div.style.display = 'flex';
  playback_ui_div.style.gap = '8px';
  playback_ui_div.style.zIndex = '501';
  playback_ui_div.style.fontFamily = 'sans-serif';

  playback_btn_playpause = document.createElement('button');
  playback_btn_playpause.textContent = '▶ Play';
  playback_btn_playpause.onclick = togglePlayPause;

  let btn_restart = document.createElement('button');
  btn_restart.textContent = '↺ Restart';
  btn_restart.onclick = restartPlayback;

  playback_ui_div.appendChild(playback_btn_playpause);
  playback_ui_div.appendChild(btn_restart);
  document.body.appendChild(playback_ui_div);
}
// ---------------------------------------------------------

function keyPressed() {
// -------------------- AI GENERATED NOW START --------------------
  if (key === ' ') {
    if (is_capture_finished) {
      // Delegate entirely to the playback UI logic
      if (window._playback_toggle) window._playback_toggle();
    } else if (song.isPlaying()) {
      // LIVE MODE — pause
      song.pause();
      is_playing = false;
      if (typeof btn_play !== 'undefined' && btn_play) btn_play.html('Play');
    } else {
      // LIVE MODE — play
      song.play();
      is_playing = true;
      if (typeof btn_play !== 'undefined' && btn_play) btn_play.html('Pause');
      if (editor_mode === 'editor' || editor_mode === 'editor_forward') {
          song.jump(editor_frame / keyframe_version);
      } else if (editor_mode === 'forward' && song.currentTime() < time_start) {
          song.jump(time_start);
      }
    }
  }
// -------------------- AI GENERATED NOW END --------------------
}
// function initialText() {
// 	if (!song.isPlaying()) {
// 		songTime = 0;
// 		// background(255, 0, 0);
// 		textFont(fontBeforeStart);
// 		textSize(24);
// 		fill(255, 255, 255,);
// 		textAlign(CENTER, CENTER);
// 		// text('Press "Space" to play the song', 0, 0);
//   	}
// }
function findTimeCurrent() {
	// REMOVE LATER
	// let time_current1 = song.currentTime(); // time in seconds according to the music
	// let time_current2 = floor(time_current1 * framerate) / framerate;; // transform time in steps of 1/framerate with floor(time*fps)/fps
	// let time_current = handleEditorMode(time_current2);
	// console.log('time_current1:',time_current1,'time_current2:', time_current2, 'time_current3:', time_current); // print time_current2 and time_current3 to see the difference

	let time_current = song.currentTime(); // time in seconds according to the music
	time_current = floor(time_current * framerate) / framerate;; // transform time in steps of 1/framerate with floor(time*fps)/fps
	time_current = handleEditorMode(time_current);
	
	return time_current;
}


// -------------------- AI GENERATED NOW START --------------------
let global_head_pos;
let global_finger_pos;

function getGlobalPosition() { // returns vector of the global position of the current local origin after all the transformations applied to it
	// Steal the current world matrix directly from the p5 renderer
	let m = _renderer.uModelMatrix.mat4;
	// The 12th, 13th, and 14th values hold the exact absolute X, Y, and Z
	return createVector(m[12], m[13], m[14]);
}
// -------------------- AI GENERATED NOW END --------------------



// ---------------------------------------- GLOBAL VARIABLES ----------------------------------------
// --- CAPTURE SETTINGS ---
let play_pre_rendered = false; // Toggle this! true = render to video then play. false = live 3D
let capture_test_seconds = 5; // Set to 0 to capture the full animation, or e.g. 5 to only test 5 seconds
let capture_fps = 60;         // Render FPS: use 24 or 30 for faster test renders, 60 for final quality
let capturer = null;
let is_capturing = false;
let is_capture_finished = false;
let captured_video_element = null;
let captured_video_blob_url = null; // Saved so we can restart the video from scratch on replay
let capture_frame_count = 0;
// ------------------------

let canvas_width = 800; let canvas_height = 600;
let keyframe_version = 24; // This represents the unit of frames we use in our keyframe list
let framerate = 60; // This represents the framerate of our animation
let editor_mode = 'editor';
// 'animation' or '' - runs the animation
// 'fixed' - fixes the animation at a frame frame_start
// 'forward' - starts at frame frame_start and moves forward
// 'loop' - loops the animation between frame_start and frame_end
// 'editor' - allows to choose the frame shown (according to keyframe_version) with a slider, a button to go to next frame and a button to go to previous frame and you can also type the frame you want to go to in an input box. Starts at frame_start
// 'editor_forward' - same as 'editor' but the animation is playing forward by default


let [ frame_start, frame_end ] = [ 0, 1335 ]; // Ends exactly when the last scene finishes
let [ time_start, time_end ] = [ frame_start / keyframe_version, frame_end / keyframe_version ]; // in seconds
// let debug_axes = true; // Toggle this to see boxes on the arms to represent direction
let debug_camera_control = true; // toggle this to use orbit control on all scenes to look around (it deactivates the animations of the camera in the scenes. So basically an "if")

let scenes_list = [];
let subtitle_manager;


let rendering_div;

function setup() {
	// WebGL requires this attribute to allow capturing tools to read the canvas pixels without getting a blank screen!
	setAttributes('preserveDrawingBuffer', true);
	
	// the canvas has to be created with WEBGL mode
	createCanvas(canvas_width, canvas_height, WEBGL);

	noStroke();

	rendering_div = createDiv("Rendering video... Please wait.");
	rendering_div.position(10, 10);
	rendering_div.style('color', 'white');
	rendering_div.style('font-size', '24px');
	rendering_div.style('background', 'black');
	rendering_div.style('padding', '10px');
	rendering_div.style('z-index', '1000');
	rendering_div.hide();

	initPuppetVariables(); initPuppetGeometries(); // initializes the variables and geometries for the puppet
	initHandVariablesAndGeometries(); // initializes the variables and geometries for the hand
	initStageVariables();
	setupEditorUI();

	// Create Each Scene and add it to the scenes list
	scenes_list.push(new Scene_00_Intro(0, 51));
	scenes_list.push(new Scene_01_Dismantled(51, 94));
	scenes_list.push(new Scene_02_Play(94, 215));
	scenes_list.push(new Scene_03_Strumming(215, 290));
	scenes_list.push(new Scene_04_Spin(290, 410));
	scenes_list.push(new Scene_05_Theater(410, 596));
	scenes_list.push(new Scene_06_Around(596, 680));
	scenes_list.push(new Scene_07_Pulled(680, 762));
	scenes_list.push(new Scene_08_Clear(762, 850));
	scenes_list.push(new Scene_09_Puppet_to_You(850, 929));
	scenes_list.push(new Scene_10_Done(929, 1010));
	scenes_list.push(new Scene_11_Cut(1010, 1092));
	scenes_list.push(new Scene_12_Falling(1092, 1256));
	scenes_list.push(new Scene_13_Hit(1256, 1267));
	scenes_list.push(new Scene_14_Dismantled(1267, 1335));
	// scenes_list.push(new Scene_13_Hit(, 1333));

	subtitle_manager = new SubtitleManager(fontBeforeStart);

	

	// camera(1532, -17, 93, 33, -1, 81);
	// camera(-1751, -2875, -3289, 80, 10, 45);


	// --- CAPTURE INITIALIZATION ---
	console.log('[CAPTURE] play_pre_rendered =', play_pre_rendered);
	console.log('[CAPTURE] typeof CCapture =', typeof CCapture);
	if (play_pre_rendered) {
		if (typeof CCapture === 'undefined') {
			console.error('[CAPTURE] ERROR: CCapture is not defined! The CDN script did not load. Falling back to live mode.');
			play_pre_rendered = false;
		} else {
			try {
				is_capturing = true;
				capturer = new CCapture({
					format: 'webm',
					framerate: capture_fps,
					verbose: false
				});
				capturer.start();
				console.log('[CAPTURE] CCapture started successfully! Rendering begins...');
				// KEY FIX: noLoop() + redraw() gives the browser time to fully encode
				// each frame before starting the next, instead of flooding the encoder.
				noLoop();
				redraw();
			} catch (e) {
				console.error('[CAPTURE] CCapture threw an error! Falling back to live mode.', e);
				play_pre_rendered = false;
				is_capturing = false;
			}
		}
	}
	// ------------------------------
}

let time_current;

function draw() {
	// Diagnostic: log state every 60 frames ONLY when capturing, so we don't spam the console later
	if (is_capturing && frameCount % 60 === 1) {
		console.log('[DRAW] capturing active... frameCount:', frameCount, '| time_current:', (time_current != null ? time_current.toFixed(2) : 'N/A'), '| capture_frame_count:', capture_frame_count);
	}

	// 1. PLAYBACK MODE (Video is a CSS overlay - just keep the canvas black beneath it)
	if (play_pre_rendered && is_capture_finished) {
		clear();
		background(0); // Black canvas under the overlay
		return; 
	}

	// 2. LIVE MODE OR CAPTURING MODE
	clear();
	background(50);
	perspective(2*atan(height/2/800),width/height,0.1*800, 30 * 800);
	if (!is_capturing) 
		if (debug_camera_control !== undefined && debug_camera_control === true) {
			orbitControl(); // Only allow orbitControl in live mode
		}
		// orbitControl();
	
	// --- TIME LOGIC ---
	if (play_pre_rendered && is_capturing) {
		// Force time_current to perfectly increment from time_start
		time_current = time_start + (capture_frame_count / capture_fps);
	} else {
		// initialText(); // only show initial text if live mode
		time_current = findTimeCurrent();
	}
	
	// Run Scenes ----------------------
	for (let i = scenes_list.length - 1; i >= 0; i--) {
		let scene = scenes_list[i];
		if (scene.isActive(time_current * keyframe_version)) {
			scene.display(time_current);
			break; 
		}
	}

	// Draw Subtitles over the 3D scene
	subtitle_manager.display(time_current, time_current * keyframe_version);


	// code for debugging (axes, plane)
	if (typeof debug_axes !== 'undefined' && debug_axes) {
		push();
		strokeWeight(4);
		stroke(255, 0, 0);
		line(0, 0, 0, 900, 0, 0);
		stroke(0, 255, 0);
		line(0, 0, 0, 0, 900, 0);
		stroke(0, 0, 255);
		line(0, 0, 0, 0, 0, 900);

		// Draw numbers
		if (typeof fontBeforeStart !== 'undefined') {
			textFont(fontBeforeStart);
			textSize(16);
			textAlign(CENTER, CENTER);
			noStroke();
			for (let i = 100; i <= 900; i += 100) {
				// X axis
				push(); translate(i, 0, 0); fill(255, 150, 150); text(i, 0, -15); pop();
				// Y axis
				push(); translate(0, i, 0); fill(150, 255, 150); text(i, -25, 0); pop();
				// Z axis
				push(); translate(0, 0, i); fill(150, 150, 255); text(i, 0, -15); pop();
			}
		}
		pop();
		stroke(0,0,0);
	}

	// ------------------------------ AI GENERATED START: OrbitControl Camera Info UI ------------------------------
	// Update Camera Info UI
	if ((editor_mode === 'editor' || editor_mode === 'editor_forward') && cam_info_input) {
		let cam = _renderer._curCamera; // Grabs the active p5.Camera
		if (cam && document.activeElement !== cam_info_input.elt) {
			let str = `${round(cam.eyeX)}, ${round(cam.eyeY)}, ${round(cam.eyeZ)}, ${round(cam.centerX)}, ${round(cam.centerY)}, ${round(cam.centerZ)}`;
			cam_info_input.value(str);
		}
	}
	// ------------------------------ AI GENERATED END: OrbitControl Camera Info UI ------------------------------

	// --- CAPTURE SAVING LOGIC ---
	if (play_pre_rendered && is_capturing) {
		capturer.capture(document.getElementById('defaultCanvas0'));
		capture_frame_count++;

		// Determine the target end time (test mode or full animation)
		let capture_end_time = (capture_test_seconds > 0) ? (time_start + capture_test_seconds) : time_end;

		// Log progress every 30 frames (every 0.5 seconds)
		if (capture_frame_count % 30 === 0) {
			let total_frames = (capture_end_time - time_start) * framerate;
			console.log('[CAPTURE] Frame ' + capture_frame_count + ' / ' + Math.floor(total_frames) + ' | time_current: ' + time_current.toFixed(2) + 's');
		}

		// Update HTML loading screen
		rendering_div.show();
		let total_frames = (capture_end_time - time_start) * framerate;
		rendering_div.html("Rendering video... Please wait.<br>Frame " + capture_frame_count + " / " + Math.floor(total_frames));
		
		if (time_current >= capture_end_time) {
			console.log('[CAPTURE] All frames captured! Encoding WebM...');
			is_capturing = false;
			capturer.stop();
			rendering_div.html("Processing WebM... Almost done!");
			
			capturer.save((blob) => {
				console.log('[CAPTURE] WebM blob ready! Size:', (blob.size / 1024 / 1024).toFixed(1), 'MB');
				captured_video_blob_url = URL.createObjectURL(blob);

				// Create a raw <video> DOM element and overlay it on the canvas using CSS
				let canvas_elt = document.getElementById('defaultCanvas0');
				let vid = document.createElement('video');
				vid.src = captured_video_blob_url;
				vid.style.position = 'absolute';
				vid.style.left = canvas_elt.offsetLeft + 'px';
				vid.style.top = canvas_elt.offsetTop + 'px';
				vid.style.width = canvas_width + 'px';
				vid.style.height = canvas_height + 'px';
				vid.style.zIndex = '500';
				vid.style.pointerEvents = 'none'; // Prevent the video from intercepting mouse clicks
				vid.volume = 0;
				document.body.appendChild(vid);
				captured_video_element = new p5.Element(vid);

				is_capture_finished = true;
				rendering_div.hide();
				loop();
				setupPlaybackUI(vid); // Wire up UI and song sync
				console.log('[CAPTURE] Playback ready! Press Space to play.');
			});
		} else {
			// Schedule the next frame after a short delay so the browser can breathe
			setTimeout(() => redraw(), 0);
		}
	}
	// ----------------------------
}


