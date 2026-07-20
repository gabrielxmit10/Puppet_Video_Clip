/// <reference path="./models/Puppet_03_Class.js" />
/// <reference path="./models/Hand_03_Class.js" />
/// <reference path="./scenes/Scene_Class.js" />
/// <reference path="./scenes/Scene_01_Dismantled.js" />





// ------------------------------ AI GENERATED START: Editor Variables/Functions ------------------------------
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
			if (is_playing) {
				song.play();
				song.jump(editor_frame / keyframe_version);
			} else {
				song.pause();
			}
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

		let orbit_checkbox = createCheckbox(' orbitControl', false).parent(ui_div);
		orbit_checkbox.style('display', 'inline-block');
		orbit_checkbox.style('margin-left', '10px');
		orbit_checkbox.changed(() => {
			debug_camera_control = orbit_checkbox.checked();
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
		// Sync 'forward' mode to the music
		if (song.isPlaying()) {
			if (song.currentTime() < time_start) {
				song.jump(time_start);
			}
			time_current = song.currentTime();
		} else {
			time_current = time_start;
		}
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
	}
	return time_current;
}
// ------------------------------ AI GENERATED END: Editor Variables/Functions ------------------------------






function preload() {
	// Load the texture before setup runs
	// P5 requires textures to be in the same folder or have valid CORS setup
	head_tex = loadImage('media/head_texture.jpg');
	song = loadSound('media/audio.mp3');
  	font_loaded = loadFont('media/Roboto-VariableFont_wdth,wght.ttf');
}


// -------------------- AI GENERATED START: Press Space to Play/Pause song --------------------
function keyPressed() {
  if (key === ' ') {
    if (song.isPlaying()) {
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
// -------------------- AI GENERATED END: Press Space to Play/Pause song --------------------
}

function findTimeCurrent() { // finds current time based (capped by the framerate) on song and editor_mode
	let time_current = song.currentTime(); // time in seconds according to the music
	time_current = floor(time_current * framerate) / framerate;; // transform time in steps of 1/framerate with floor(time*fps)/fps
	time_current = handleEditorMode(time_current);
	
	return time_current;
}


// -------------------- AI GENERATED START: Get Global Position Function --------------------
let global_head_pos;
let global_finger_pos;

function getGlobalPosition() { // returns vector of the global position of the current local origin after all the transformations applied to it
	// Steal the current world matrix directly from the p5 renderer
	let m = _renderer.uModelMatrix.mat4;
	// The 12th, 13th, and 14th values hold the exact absolute X, Y, and Z
	return createVector(m[12], m[13], m[14]);
}
// -------------------- AI GENERATED END: Get Global Position Function --------------------



// ---------------------------------------- GLOBAL VARIABLES ----------------------------------------


let canvas_width = 800; let canvas_height = 600;
let keyframe_version = 24; // This represents the unit of frames we use in our keyframe list
let framerate = 24/1; // This represents the framerate of our animation
let editor_mode = 'editor';
// let editor_mode = 'loop';
// 'animation' or '' - runs the animation
// 'fixed' - fixes the animation at a frame frame_start
// 'forward' - starts at frame frame_start and moves forward
// 'loop' - loops the animation between frame_start and frame_end
// 'editor' - allows to choose the frame shown (according to keyframe_version) with a slider, a button to go to next frame and a button to go to previous frame and you can also type the frame you want to go to in an input box. Starts at frame_start
// 'editor_forward' - same as 'editor' but the animation is playing forward by default


// let [ frame_start, frame_end ] = [ 1105, 1105+60 ]; // Ends exactly when the last scene finishes
let [ frame_start, frame_end ] = [ 0, 1335 ]; // Ends exactly when the last scene finishes
let [ time_start, time_end ] = [ frame_start / keyframe_version, frame_end / keyframe_version ]; // in seconds
// let debug_axes = true; // Toggle this to see boxes on the arms to represent direction
let debug_camera_control = false; // toggle this to use orbit control on all scenes to look around (it deactivates the animations of the camera in the scenes. So basically an "if")

let scenes_list = [];
let subtitle_manager;




function setup() {
	// WebGL requires this attribute to allow capturing tools to read the canvas pixels without getting a blank screen!
	setAttributes('preserveDrawingBuffer', true);
	
	// the canvas has to be created with WEBGL mode
	createCanvas(canvas_width, canvas_height, WEBGL);

	noStroke();



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

	subtitle_manager = new SubtitleManager(font_loaded); // create subtitle manager
}

let time_current;

function draw() {
	clear();
	background(50);
	perspective(2*atan(height/2/800),width/height,0.1*800, 30 * 800); // increase 'far'
	if (typeof debug_camera_control !== 'undefined' && debug_camera_control === true) { // debug orbitControl()
		orbitControl(); // Only allow orbitControl in live mode
	}
	time_current = findTimeCurrent(); // find current time (based on editor_mode)
	
	// ------------------------------ Display Scenes ----------------------
	for (let i = scenes_list.length - 1; i >= 0; i--) {
		let scene = scenes_list[i];
		if (scene.isActive(time_current * keyframe_version)) {
			scene.display(time_current);
			break; 
		}
	}

	// display subtitles on top of scenes
	subtitle_manager.display(time_current, time_current * keyframe_version);


	// debug axes
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
		if (typeof font_loaded !== 'undefined') {
			textFont(font_loaded);
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


}


