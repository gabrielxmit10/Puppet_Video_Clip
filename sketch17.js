/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />



let editor_frame;
let editor_slider;
let editor_input;
let is_playing = false;
let btn_play;
let editor_step = 1;
let cam_info_input;

// AI GENERATED
function updateEditorUI() {
	if (editor_slider && editor_input) {
		editor_slider.value(editor_frame);
		editor_input.value(Math.round(editor_frame * 100) / 100);
	}
}

// AI GENERATED
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






function preload() {
	// Load the texture before setup runs
	// P5 requires textures to be in the same folder or have valid CORS setup
	head_tex = loadImage('head_texture.jpg');
	song = loadSound('Puppet_(John_Michael_Howell).mp3');
  	fontBeforeStart = loadFont('Roboto-VariableFont_wdth,wght.ttf');
}

function keyPressed() {
// -------------------- AI GENERATED NOW START --------------------
  if (key === ' ') {
    if (song.isPlaying()) {
      song.pause(); // Use pause instead of stop so we don't lose our place
      is_playing = false;
      if (typeof btn_play !== 'undefined' && btn_play) btn_play.html('Play');
    } else {
      song.play();
      is_playing = true;
      if (typeof btn_play !== 'undefined' && btn_play) btn_play.html('Pause');
      
      // Jump the song to the correct frame based on the mode
      if (editor_mode === 'editor' || editor_mode === 'editor_forward') {
          song.jump(editor_frame / keyframe_version);
      } else if (editor_mode === 'forward' && song.currentTime() < time_start) {
          song.jump(time_start);
      }
    }
  }
// -------------------- AI GENERATED NOW END --------------------
}



// -------------------- AI GENERATED NOW START --------------------
let global_head_pos;
let global_finger_pos;

function getGlobalPosition() {
	// Steal the current world matrix directly from the p5 renderer
	let m = _renderer.uModelMatrix.mat4;
	
	// The 12th, 13th, and 14th values hold the exact absolute X, Y, and Z
	return createVector(m[12], m[13], m[14]);
}
// -------------------- AI GENERATED NOW END --------------------

// REMOVE LATER (i just ended up doing it inline and the name is unintuitive)
// function time_to_frame(time) { // takes time in seconds and transforms it to steps of 1/framerate with floor(time*fps)/fps
// 	return floor(time * framerate) / framerate;
// }

let canvas_width = 600;
let canvas_height = 600;

let keyframe_version = 24; // This represents the unit of frames we use in our keyframe list
let framerate = 24; // This represents the framerate of our animation

let editor_mode = 'editor';
// 'animation' or '' - runs the animation
// 'fixed' - fixes the animation at a frame frame_start
// 'forward' - starts at frame frame_start and moves forward
// 'loop' - loops the animation between frame_start and frame_end
// 'editor' - allows to choose the frame shown (according to keyframe_version) with a slider, a button to go to next frame and a button to go to previous frame and you can also type the frame you want to go to in an input box. Starts at frame_start
// 'editor_forward' - same as 'editor' but the animation is playing forward by default


let [ frame_start, frame_end ] = [ 30 , 93 ]; // has the same unit as the keyframe_version variable
let [ time_start, time_end ] = [ frame_start / keyframe_version, frame_end / keyframe_version ]; // in seconds, calculated from the frame numbers and the keyframe_version

/** @type {Hand} */
let hand;
/** @type {Puppet} */
let puppet;
let debug_axes = true; // Toggle this to see boxes on the arms to represent direction



function setup() {
	// the canvas has to be created with WEBGL mode
	createCanvas(canvas_width, canvas_height, WEBGL);

	noStroke();

	initPuppetVariables(); // initializes the variables for the puppet (the joint positions and colors)
	initPuppetGeometries(); // initializes the geometries for the puppet (the body parts)
	initHandVariablesAndGeometries(); // initializes the geometries for the hand (the palm and fingers)
	setupEditorUI();



	// Create hand once and keep it for all frames
	// hand = new Hand(); 

	puppet = new Puppet();

	puppet.hidePart('head');

	// puppet.addRotationZ('shoulder_l', new KeyFrame(0, 90));
	puppet.addRotationZ('shoulder_r', new KeyFrame(0, 45, 'constant'));
	puppet.addRotationZ('shoulder_r', new KeyFrame(51, 0, 'constant'));
	puppet.addRotationZ('shoulder_r', new KeyFrame(61, -90, 'constant'));
	puppet.addRotationZ('shoulder_r', new KeyFrame(71, -180, 'constant'));
	puppet.addRotationZ('shoulder_r', new KeyFrame(83, -180-90, 'constant'));
	// puppet.addRotationZ('shoulder_r', new KeyFrame(58, 0, 'constant'));
	// puppet.addRotationZ('shoulder_r', new KeyFrame(200, 90, 'constant'));



	camera(0,-500,1500, 0,-500,0)
	camera(0,0,1500, 0,0,0)
	// camera(0, 133, 3958, 59, -853, 33)
	// camera(0, 16, 3987, 59, -970, 62)
	// camera(211, -2554, 1624, -160, -1615, -354)
}

let time_current1;
let time_current2;
let time_current;

function draw() {
	clear();
	background(50);
	orbitControl();

	if (!song.isPlaying()) {
		songTime = 0;
		// background(255, 0, 0);
		textFont(fontBeforeStart);
		textSize(24);
		fill(255, 255, 255,);
		textAlign(CENTER, CENTER);
		text('Press "Space" to play the song', 0, 0);
  	}



	// CHANGE LATER - these time_current numbered were for debugging, so later you can change them to just time_current
	time_current1 = song.currentTime(); // time in seconds according to the music
	time_current2 = floor(time_current1 * framerate) / framerate;; // transform time in steps of 1/framerate with floor(time*fps)/fps

	// console.log(time_current2);
	
	time_current = handleEditorMode(time_current2);
	
	// print time_current2 and time_current3 to see the difference
	console.log('time_current1:',time_current1,'time_current2:', time_current2, 'time_current3:', time_current);


	// draw each axis

	if (typeof debug_axes !== 'undefined' && debug_axes) {
		stroke(255, 0, 0);
		line(0, 0, 0, 100, 0, 0);
		stroke(0, 255, 0);
		line(0, 0, 0, 0, 100, 0);
		stroke(0, 0, 255);
		line(0, 0, 0, 0, 0, 100);
		stroke(0,0,0)

		push();
		fill(255, 0, 0,100);
		translate(0, -700, -700);
		box(100);
		pop();
	}



	push();
	translate(0, 0, 0);
	scale(0.5);
	puppet.display(time_current);
	pop();



	
	// Update Camera Info UI
	if ((editor_mode === 'editor' || editor_mode === 'editor_forward') && cam_info_input) {
		let cam = _renderer._curCamera; // Grabs the active p5.Camera
		// Only update if the user isn't currently clicking inside the box (so they can copy the text)
		if (cam && document.activeElement !== cam_info_input.elt) {
			let str = `${round(cam.eyeX)}, ${round(cam.eyeY)}, ${round(cam.eyeZ)}, ${round(cam.centerX)}, ${round(cam.centerY)}, ${round(cam.centerZ)}`;
			cam_info_input.value(str);
		}
	}

}


