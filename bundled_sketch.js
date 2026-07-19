// ==========================================
// AUTO-BUNDLED P5.JS PROJECT
// Paste this ENTIRE file directly into the Web Editor's sketch.js
// ==========================================



// --- Start of animation/Animation_KFs_01.js ---

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode 
*/
class RotationKeyFrameList {
    constructor( mode = 'XYZ' ) {
        
        this.x = []; this.y = []; this.z = []; // each is a list of keyframes for a specific rotation around the specific axis
        this.mode = mode; // This will determine the default order of rotations
        this.mode_kfs = []; // A list of keyframes to dynamically change the rotation mode

        // mode will apply rotations based on the order of the letters
        //      - Its possible values are all combinations of X, Y and Z: XYZ, XZY, YXZ, YZX, ZXY, ZYX
        //      - You can think about the order in 2 ways:
        //          1. It applies in the order of letters and the gizmo rotates the other axes with it (so YZX will apply rotation on Y, then now the circles of X and Z are tilted with the Y rotation)
        //          2. It applies in the opposite order of the letters and the gizmo stays in place (so YZX will apply rotation on Z without altering anything on the other 2 axes gizmo circles, then X does the same, then Y)
    }

}

class TranslationKeyFrameList {
    constructor() {
        this.x = []; this.y = []; this.z = []; // each is a list of keyframes for a specific translation on the specific axis
    }
}

/**
 * @typedef {"constant"|"linear"|"easeIn"|"easeOut"|"easeInOut"|"easeInOutBezier"|"easeInOutHermite"|"hermite"|"bezierSimple"} InterpolationType
 */
class KeyFrame {

    // static DEFAULT_TYPE_OF_LERP = "easeInOut";
    // static NO_TYPE_OF_LERP = "noType";

    /**
     * @param {number} time 
     * @param {number|Array<number>} value 
     * @param {InterpolationType} type_of_lerp 
     * @param {number|Array<number>} v 
     */
	constructor(time=0, value=0, type_of_lerp = "noType", v = 0) {
		this.time = time;
		this.value = value; // can be a single value or an array (mostly of 3 values)

		// if type_of_lerp is not a string, then put its value on v and type_of_lerp to "noType"
		if (typeof type_of_lerp !== "string") {
			this.velocity = type_of_lerp;
			this.type_of_lerp = "noType";
		} else { // normal case
			this.type_of_lerp = type_of_lerp;
			this.velocity = v;
		}

        // "type_of_lerp":
        // 		"linear": simple lerp
        //      "easeInOut" or "easeInOutBezier" : bezierSimple with [x0,y0,x1,y1] = [0.333, 0, 0.667, 1] 
        // 		"easeIn": t**2 
        // 		"easeOut": 1-(1-t)**2
        //		"hermite": Ahermite that goes from 0 to 1 with velocities v0 and v1. If no v1 is informed, either the one from the next frame is used, or it defaults to 0
        //          - For this, we need 1 in Keyframe for v0 and v1 
        //              (if v0 and v1 are provided, it is an array [v0, v1], else v0 is just a number)
        // 		"easeInOutHermite": hermite interpolation with v0 and v1 = 0
        //		"constant": stays the same as the keyframe, and changes immediately on the next keyframe
        //      "bezierSimple": cubic bezier that goes from 0 to 1, using 2 control points. 
        //          - For this, we need 4 values x0,y0,x1,y1 for the 2 control points, generally between 0 and 1
        //              They need to be provided in an array [x0, y0, x1, y1] in the kf.velocity property
        //	
        //		Each keyframe has their type of lerp, BUT if you dont say the type of interpolation, the program will check for the LAST TYPE USED and use that
        //		If you never said the type of interpolation, it will default to "easeInOut"
	}
}

class Shot {
    // each shot is a list of kfs and a starting frame, and it will be active from its start frame to the next shot's start frame
    // it represents that at start_frame, the kf_list will turn active and will keep its keyframes until the next shot's start_frame
    constructor(start_frame, kf_list) {
        this.start_frame = start_frame;
        this.kf_list = kf_list;
    }
}

function find_kf_and_type(frame_current, kf_list) { // finds the 2 keyframes that frame_current is between and the type of lerp of the keyframe before it

    // Handling list with not enough keyframes
    if (kf_list.length < 2) { // throw error
        throw new Error("find_kf_and_type() requires at least 2 keyframes to find an interval.");
    }
    
    let low = 0;
    let high = kf_list.length - 2;
    let found_index = 0;

    // Binary search to find the correct interval [i, i+1]
    while (low <= high) { 
        let mid = Math.floor((low + high) / 2);
        let kf1 = kf_list[mid];
        let kf2 = kf_list[mid + 1];

        if (frame_current >= kf1.time && frame_current <= kf2.time) { // if frame_current is between these 2 kfs, we've found the correct interval
            found_index = mid;
            break;
        } else if (frame_current < kf1.time) { // if frame_current is before kf1, we need to look at the left half
            high = mid - 1;
        } else { // if frame_current is after kf2, we need to look at the right half
            low = mid + 1;
        }
    }

    if (low > high) {
        throw new Error(`frame_current (${frame_current}) is out of bounds in find_kf_and_type`);
    }

    let kf1 = kf_list[found_index];
    let kf2 = kf_list[found_index + 1];

    // Find the type of lerp by looking backwards for the last informed type
    let type_of_lerp = "easeInOut";
    for (let i = found_index; i >= 0; i--) { // if not set, look backwards 
        if (kf_list[i].type_of_lerp !== "noType") { 
            type_of_lerp = kf_list[i].type_of_lerp;
            break;
        }
    }

    return [kf1, kf2, type_of_lerp];

}

function animate_kfs(time_current, kf_list) { // takes the current time in seconds and a list of keyframes and returns the interpolated value (number, array or p5.Vector) for that time according to the keyframes

    // Handling Problems
    // if there are no keyframes, throw an error happened in the animate_kfs function
    if (kf_list.length == 0) {
        throw new Error("No keyframes in the list given to animate_kfs()");
    }

    // If there is only 1 keyframe, return its value (in number, array, or p5.Vector)
    if (kf_list.length == 1) {
        let val = kf_list[0].value;
        return Array.isArray(val) ? (val.length > 3 ? val : createVector(...val)) : val;
    }

    let frame_current = time_current * keyframe_version; // convert time_current to keyframe space

    // if frameNumber is outside the range of keyframes, return the value of the closest keyframe
	if (frame_current < kf_list[0].time) {
		let val = kf_list[0].value;
		return Array.isArray(val) ? (val.length > 3 ? val : createVector(...val)) : val;
	} else if (frame_current > kf_list[kf_list.length - 1].time) {
		let val = kf_list[kf_list.length - 1].value;
		return Array.isArray(val) ? (val.length > 3 ? val : createVector(...val)) : val;
	}

	// if frameNumber is within the range of keyframes, 
	// 		find the two keyframe objects it is between and interpolate with the type chosen
	let [kf1, kf2, type_of_lerp] = find_kf_and_type(frame_current, kf_list);

	let t = clamp ( (frame_current - kf1.time) / (kf2.time - kf1.time) , 0 , 1 ); // value from 0 to 1 of how far frame_current is between kf1 and kf2

	return kf_lerp(kf1, kf2, t, type_of_lerp);

}

function animate_shots(time_current, shots_list) { // takes the current time and a list of shots [{start_frame: 0, kf_list: []}, ...] and returns the interpolated value for the active shot
    if (!shots_list || shots_list.length === 0) return null;
    
    let frame_current = time_current * keyframe_version;
    let active_kf_list = shots_list[0].kf_list;

    // Find the shot that should be active at the current frame 
    // (the shots dont need to be in order, but the shot chosen will be the one that is the one with largest start_frame that is less than frame_current)
    for (let i = 0; i < shots_list.length; i++) {
        if (frame_current >= shots_list[i].start_frame) {
            active_kf_list = shots_list[i].kf_list;
        } 
        // else {
        //     break; // Shots should be added in chronological order
        // }
    }

    // Reuse the existing animation logic on the active shot
    return animate_kfs(time_current, active_kf_list);
}

function kf_lerp(kf1, kf2, t, type_of_lerp) { // takes keyframes and the t between them and returns the interpolated value
    // if (type_of_lerp === "constant") return kf1.value;

    // Calculate new t based on the type of lerp between kfs
    let t_new = calculate_easing_t(kf1, kf2, t, type_of_lerp);

    // Apply that t_new to the values (regardless of whether they are numbers, vectors, or arrays)
    return interpolate_values(kf1.value, kf2.value, t_new);
}

function calculate_easing_t(kf1, kf2, t, type_of_lerp) {
    // This function purely handles the math of warping time (t -> t_new)
    if (type_of_lerp === "constant") return t >= 1 ? 1 : 0; // Snap exactly at the next keyframe
    if (type_of_lerp === "linear") return t;
    if (type_of_lerp === "easeIn") return t * t;
    if (type_of_lerp === "easeOut") return 1 - (1 - t) * (1 - t);
    if (type_of_lerp === "easeInOut" || type_of_lerp === "easeInOutBezier") {
        return interpolate_bezierSimple(t, 0.333, 0, 0.667, 1);
    }
    if (type_of_lerp === "easeInOutHermite") {
        return (3 * t * t) - (2 * t * t * t); // Smoothstep (hermite with v0,v1=0)
    }
    if (type_of_lerp === "hermite") {
        let v0 = 0, v1 = 0;
        // handling kf.velocity (can be a number or an array of 2 numbers for v0 and v1)
        if (Array.isArray(kf1.velocity) && kf1.velocity.length === 2) { 
            v0 = kf1.velocity[0]; v1 = kf1.velocity[1];
        } else if (Array.isArray(kf2.velocity) && kf2.velocity.length === 2) { 
            v0 = kf1.velocity; v1 = kf2.velocity[0];            
        } else { 
            v0 = kf1.velocity; v1 = kf2.velocity;
        }
        return interpolate_hermiteSimple(t, v0, v1);
    }
    if (type_of_lerp === "bezierSimple") {
        // Fallback to easeInOut if the velocity isn't a perfect 4-element array
        let x0, y0, x1, y1;
        if (!Array.isArray(kf1.velocity) || kf1.velocity.length !== 4) { // case of not correct format
            [x0, y0, x1, y1] = [0.333, 0, 0.667, 1]; // do "easeInOutBezier"/"easeInOut"
		} else {
            [x0, y0, x1, y1] = kf1.velocity;
        }
        return interpolate_bezierSimple(t, x0, y0, x1, y1);
    }
    return t; // fallback to linear
}

function interpolate_hermiteSimple(t, v0, v1) { // interpolates from 0 to 1 using v0 and v1 as hermite velocity values
    let t2 = t * t;
    let t3 = t2 * t;
    return (-2 * t3 + 3 * t2) + (t3 - 2 * t2 + t) * v0 + (t3 - t2) * v1;
}

function interpolate_bezierSimple(bezier_x, x0, y0, x1, y1) { // interpolates from 0 to 1 using the given 4 values as control points

    if (bezier_x === 0 || bezier_x === 1) return bezier_x; // the endpoints are the same, no need to calculate

    // we want to find bezier_y based on bezier_x, so we need to find 'u' such that bezier_x(u) == bezier_x

    // Binary search to find u such that bezier_x(u) == bezier_x, 
    //      so that we can find bezier_y for that u
    let u_low = 0;
    let u_high = 1;
    let u = bezier_x; // initial guess
    let iterations = 15; // limit search to 15 iterations
    
    for (let i = 0; i < iterations; i++) {
        // evaluate bezier x for current u
        let u_inv = 1 - u;
        // bezier formula simplified considering p0=(0,0) and p3=(1,1)
        let current_x = 3 * u_inv*u_inv * u * x0 + 3 * u_inv * u*u * x1 + u*u*u; 
        
        // get out of loop if we found a close enough x for current u
        if (Math.abs(current_x - bezier_x) < 0.001) break;
        
        if (current_x < bezier_x) u_low = u; // if we are under the value, make the low go to u
        else u_high = u; // if we are above, make the high go to u
        
        u = (u_low + u_high) / 2;
    }

    // return bezier y for the found u
    let u_inv = 1 - u;
    // bezier formula simplified considering p0=(0,0) and p3=(1,1)
    return 3 * u_inv*u_inv * u * y0 + 3 * u_inv * u*u * y1 + u*u*u;
}

function interpolate_values(value1, value2, t_new) { // handles the structure of the data (p5.Vector, Array, or Number)
    
    // Handle strings
    if (typeof value1 === 'string') {
        return t_new < 1 ? value1 : value2;
    }

    // Handle p5.Vector
    if (value1 instanceof p5.Vector && value2 instanceof p5.Vector) {
        return p5.Vector.lerp(value1, value2, t_new);
    }
    
    // Handle arrays/lists
    if (Array.isArray(value1) && Array.isArray(value2)) {
        let result = [];
        for (let i = 0; i < value1.length; i++) {
            if (typeof value1[i] === 'string') {
                result[i] = t_new < 1 ? value1[i] : value2[i];
            } else {
                result[i] = lerp(value1[i], value2[i], t_new);
            }
        }
        return result.length > 3 ? result : createVector(...result);
    }

    // Handle single numbers
    return lerp(value1, value2, t_new);
}

function noise_func(time_current, amplitude, frequency) {
    // time_current can be a number or an array of numbers, and the function will return the noise for each of them based on the amplitude and frequency given (which can also be single numbers or arrays of the same length as time_current)
    noiseSeed(99); // set a fixed seed for consistent noise
    if (Array.isArray(time_current)) {
        let result = [];
        for (let i = 0; i < time_current.length; i++) {
            result[i] = noise_func(time_current[i], amplitude[i], frequency[i]);
        }
        return result;
    } else {
        return (noise(time_current * frequency) - 0.5) * 2 * amplitude; // noise between -amplitude and +amplitude
    }
}

function noise_func_to_value(value, time_current, amplitude, frequency) {
    // value can be a vector, array, or number and time_current has to be the same type as value (so each time_current[i] applies to value[i])
    // amplitude and frequency have to be lists of the same length as value or single numbers if the value is a single number
    if (value instanceof p5.Vector) {
        return createVector(
            value.x + noise_func(time_current.x, amplitude[0], frequency[0]),
            value.y + noise_func(time_current.y, amplitude[1], frequency[1]),
            value.z + noise_func(time_current.z, amplitude[2], frequency[2])
        );
    } else if (Array.isArray(value)) { // returns array if != 3, else vector
        let result = [];
        for (let i = 0; i < value.length; i++) {
            result[i] = value[i] + noise_func(time_current[i], amplitude[i], frequency[i]);
        }
        return result.length != 3 ? result : createVector(...result);
    } else { // single number
        return value + noise_func(time_current, amplitude, frequency);
    }
}

function stepDouble(t, start, end) { // returns 1 when t in [start, end)], else 0
    if (t >= start && t < end) {
        return 1;
    } else return 0;
}





// --- End of animation/Animation_KFs_01.js ---


// --- Start of models/Puppet_01_Variables.js ---

// ALL VARIABLES WE WILL NEED

// BODY part related variables
// Geometry: --------------------

// Head geometry and texture
let head_shape;
// Body geometry
let body_shape;
// Arm geometries
let upper_arm_shape;
let lower_arm_shape;
let hand_shape;
// Leg geometries
let upper_leg_shape;
let lower_leg_shape;
let foot_shape;

// Colors: --------------------
// Head colors (texture)
let head_tex;
// Body colors (128)
let color_body;
// Arm colors (110)
let color_upper_arm;
let color_lower_arm;
let color_hand;
// Leg colors (110)
let color_upper_leg;
let color_lower_leg;
let color_foot;



// Sizes of Shapes: --------------------
// Head Sizes
let radius_head = 100;
// Body Sizes
let radius_body = 90;
// Arm Sizes
let radius_upper_arm = 25;
let height_upper_arm = 130; // this is the height of the cylinder, not from the top and bottom of the capsule that forms the upper arm
let radius_lower_arm = 25;
let height_lower_arm = 130; // this is the height of the cylinder, not from the top and bottom of the capsule that forms the lower arm
let radius_hand = 40;
// Leg Sizes
let radius_upper_leg = 30;
let height_upper_leg = 160;
let radius_lower_leg = 30;
let height_lower_leg = 130;
let radius_foot = 40;
let height_factor_foot = 1.2; // this is the factor that scales the foot in the y direction, making it taller
let depth_factor_foot = 1.6; // this is the factor that scales the foot in the z direction, making it deeper and more like a shoe


// Necessary Joints Positions: --------------------
let shoulder_r_pos;
let shoulder_l_pos;

// ------------------------------ Variables Initialization Function ------------------------------
function initPuppetVariables(){ // colors and joint position
    // Initialize colors
    color_body = color("rgba(128, 128, 128, 1)");
    color_upper_arm = color("rgba(110, 110, 110, 1)");
    color_lower_arm = color_upper_arm;
    color_hand = color_upper_arm;
    color_upper_leg = color_upper_arm;
    color_lower_leg = color_upper_arm;
    color_foot = color_upper_arm;

    // Initialize joint positions
    shoulder_r_pos = createVector(60, 40, 0);
    shoulder_l_pos = createVector(-60, 40, 0);
}

// ------------------------------ Geometry Initialization Function ------------------------------
function initPuppetGeometries() { // this has to be called in setup
  // -------------------- Head Geometry Start --------------------
  beginGeometry();
  create_puppet_head(radius_head);
  head_shape = endGeometry();
  // -------------------- Head Geometry End --------------------

  // -------------------- Body Geometry Start --------------------
  beginGeometry();
  create_puppet_body(radius_body, color_body);
  body_shape = endGeometry();
  // -------------------- Body Geometry End --------------------

  // -------------------- Arm Geometries Start --------------------
  beginGeometry();
  create_puppet_upper_arm(radius_lower_arm, height_upper_arm, color_upper_arm);
  upper_arm_shape = endGeometry();

  beginGeometry();
  create_puppet_lower_arm(radius_lower_arm, height_lower_arm, color_lower_arm);
  lower_arm_shape = endGeometry();

  beginGeometry();
  create_puppet_hand(radius_hand, color_hand);
  hand_shape = endGeometry();
  // -------------------- Arm Geometries End --------------------

  // -------------------- Leg Geometries Start --------------------
  beginGeometry();
  create_puppet_upper_leg(radius_upper_leg, height_upper_leg, color_upper_leg);
  upper_leg_shape = endGeometry();

  beginGeometry();
  create_puppet_lower_leg(radius_lower_leg, height_lower_leg, color_lower_leg);
  lower_leg_shape = endGeometry();

  beginGeometry();
  create_puppet_foot(radius_foot, height_factor_foot, depth_factor_foot, color_foot);
  foot_shape = endGeometry();
  // -------------------- Leg Geometries End --------------------
}

// --- End of models/Puppet_01_Variables.js ---


// --- Start of models/Puppet_02_Functions.js ---




// ------------------------------ Functions to Create Shapes ------------------------------
function create_puppet_hemisphere(radius, res_rotations, res_horizontal) {
	beginShape(QUADS);

	for (let i = 0; i < res_horizontal; i++) {
		// latitude ranges from 0 (equator) to -PI/2 (top pole, since Y grows downwards in p5)
		let lat0 = map(i, 0, res_horizontal, 0, -HALF_PI);
		let lat1 = map(i + 1, 0, res_horizontal, 0, -HALF_PI);

		for (let j = 0; j < res_rotations; j++) {
			let lon0 = map(j, 0, res_rotations, 0, TWO_PI);
			let lon1 = map(j + 1, 0, res_rotations, 0, TWO_PI);

			// Vertex 1: upper left
			let x1 = radius * cos(lat0) * cos(lon0);
			let y1 = radius * sin(lat0);
			let z1 = radius * cos(lat0) * sin(lon0);

			// Vertex 2: bottom left
			let x2 = radius * cos(lat1) * cos(lon0);
			let y2 = radius * sin(lat1);
			let z2 = radius * cos(lat1) * sin(lon0);

			// Vertex 3: bottom right
			let x3 = radius * cos(lat1) * cos(lon1);
			let y3 = radius * sin(lat1);
			let z3 = radius * cos(lat1) * sin(lon1);

			// Vertex 4: upper right
			let x4 = radius * cos(lat0) * cos(lon1);
			let y4 = radius * sin(lat0);
			let z4 = radius * cos(lat0) * sin(lon1);

			vertex(x1, y1, z1);
			vertex(x2, y2, z2);
			vertex(x3, y3, z3);
			vertex(x4, y4, z4);
		}
	}

	endShape();
}

function create_puppet_bezier_surface(x_pts, y_pts, res_rotations, res_horizontal) {
	// -------------------- Matrix Creation Start --------------------
	//    build matrix of points to draw the bottom of the head


	let axis = createVector(0, 1, 0); // rotate around y axis

	// each line of the matrix will be in the same t, meaning its the same height of the head (curvas de nível)
	// each column will be in the same bezier curve
	let head_matrix = [];
	for (let i = 0; i <= res_horizontal; i++) { // t goes from 0 to 1

		let t = 1 * (i / res_horizontal);
		// we will create a vector first, and then rotate it around the y axis in the next loop
		let v = createVector(
			bezierPoint(...x_pts, t), // x
			bezierPoint(...y_pts, t), // y
			0 // z
		);

		let head_matrix_line = [];
		for (let j = 0; j <= res_rotations; j++) { // angle goes from 0 to TWO_PI
			let theta = TWO_PI * (j / res_rotations);
			let v_rotated = createVector( // rotate around y axis
				v.x * cos(theta),
				v.y,
				v.x * sin(theta)
			);
			head_matrix_line.push(v_rotated);
		}

		head_matrix.push(head_matrix_line);
	}
	// -------------------- Matrix Creation End --------------------



	push()


	// -------------------- Bottom of the Head (bezier rotated) --------------------
	beginShape(QUADS);
	for (let i = 0; i < head_matrix.length - 1; i++) {
		for (let j = 0; j < head_matrix[0].length - 1; j++) {
			// each quad will be in a block of 2x2 in the matrix, with the order (upper left, bottom left, bottom right, upper right)

			// we dont have to think about the end of the matrix cause we used length-1 in the loop and the last column is the same as the first one (theta = 0 and theta = TWO_PI are the same point)

			vertex(head_matrix[i][j].x, head_matrix[i][j].y, head_matrix[i][j].z); // upper left
			vertex(head_matrix[i + 1][j].x, head_matrix[i + 1][j].y, head_matrix[i + 1][j].z); // bottom left
			vertex(head_matrix[i + 1][j + 1].x, head_matrix[i + 1][j + 1].y, head_matrix[i + 1][j + 1].z); // bottom right
			vertex(head_matrix[i][j + 1].x, head_matrix[i][j + 1].y, head_matrix[i][j + 1].z); // upper right
		}

	}
	endShape();

	pop();

}

function create_puppet_capsule(radius, cylinder_height, res_rotations = 20, res_hemispheres = 10) {
	push()

	translate(0, cylinder_height / 2, 0); // translate to make the center of the upper hemisphere be in [0,0,0]

	// Upper Hemisphere (shoulder)
	push()

	translate(0, -cylinder_height / 2, 0); // translate connect to cylinder
	create_puppet_hemisphere(radius, res_rotations, res_hemispheres);
	pop()

	// Cylinder (upper arm)
	push()
	cylinder(radius, cylinder_height, res_rotations);
	pop()

	// Lower Hemisphere (elbow)
	push()
	translate(0, cylinder_height / 2, 0); // translate connect to cylinder
	rotateX(PI); // flip hemisphere
	create_puppet_hemisphere(radius, res_rotations, res_hemispheres);
	pop()

	if (typeof debug_axes !== 'undefined' && debug_axes) { // tests if debug_axes was created

		push();
		fill("rgba(0, 47, 255, 1)"); // Blue box indicating the FRONT (Z > 0)
		translate(0, 0, radius * 0.8); // Move to the front surface
		box(radius * 0.5, cylinder_height * 0.8, radius * 0.5);
		pop();

		// push();
		// fill("rgba(187, 0, 255, 1)"); // Purple box indicating the BACK (Z < 0)
		// translate(0, 0, -radius * 0.8); // Move to the back surface
		// box(radius * 0.5, cylinder_height * 0.8, radius * 0.5);
		// pop();

		// push();
		// fill("rgba(255, 0, 0, 1)"); // Red box indicating the RIGHT (X > 0)
		// translate(radius * 0.8, 0, 0); // Move to the right surface
		// box(radius * 0.5, cylinder_height * 0.8, radius * 0.5);
		// pop();

		// push();
		// fill("rgba(217, 255, 0, 1)"); // Yellow box indicating the LEFT (X < 0)
		// translate(-radius * 0.8, 0, 0); // Move to the left surface
		// box(radius * 0.5, cylinder_height * 0.8, radius * 0.5);
		// pop();
	}

	pop()
}



// ------------------------------ Functions to Create Body Parts ------------------------------

// -------------------- Create Head --------------------
function create_puppet_head(radius = 100, res_rotations = 50, res_bottom_head = 30, res_top_head = 30) {
	// -------------------- Matrix Creation Start --------------------
	//    build matrix of points to draw the bottom of the head

	// initial bezier controls
	// P0 = (0,0)
	// P1 = (40,0)
	// P2 = (100,-75)
	// P3 = (100,-160)


	let axis = createVector(0, 1, 0); // rotate around y axis

	// each line of the matrix will be in the same t, meaning its the same height of the head (curvas de nível)
	// each column will be in the same bezier curve
	let head_matrix = [];
	for (let i = 0; i <= res_bottom_head; i++) { // t goes from 0 to 1

		let t = 1 * (i / res_bottom_head);
		// we will create a vector first, and then rotate it around the y axis in the next loop
		let v = createVector(
			bezierPoint(0, 40, radius, radius, t), // x
			bezierPoint(0, 0, -75, -160, t), // y
			0 // z
		);

		let head_matrix_line = [];
		for (let j = 0; j <= res_rotations; j++) { // angle goes from 0 to TWO_PI
			let theta = TWO_PI * (j / res_rotations);
			let v_rotated = createVector( // rotate around y axis
				v.x * cos(theta),
				v.y,
				v.x * sin(theta)
			);


			// --- TEXTURE MAPPINGS FOR HEAD BOTTOM ONLY --- (bezier rotated shape)
			// 	Store U, V coordinates alongside the 3D position
			// 		U goes from 0 to 1 around the cylinder (j)
			// 		V goes from 0.5 to 1.0 for the bottom part of the head (i)
			//		- In the texture it is the bottom of the image
			let u = j / res_rotations;
			let v_tex = map(i, 0, res_bottom_head, 0.5, 1.0); // bottom half of texture

			head_matrix_line.push({ pos: v_rotated, u: u, v: v_tex });
		}

		head_matrix.push(head_matrix_line);
	}
	// -------------------- Matrix Creation End --------------------



	push()

	// translate(0, -60, 0); // translate to make the bottom of the head be in [0,0,0]

	// Head Color / Texture
	// fill(128);
	texture(head_tex);
	textureMode(NORMAL); // Uses 0 to 1 for UV mapping

	// -------------------- Bottom of the Head (bezier rotated) --------------------
	beginShape(QUADS);
	for (let i = 0; i < head_matrix.length - 1; i++) {
		for (let j = 0; j < head_matrix[0].length - 1; j++) {
			// each quad will be in a block of 2x2 in the matrix, with the order (upper left, bottom left, bottom right, upper right)

			// we dont have to think about the end of the matrix cause we used length-1 in the loop and the last column is the same as the first one (theta = 0 and theta = TWO_PI are the same point)

			let p1 = head_matrix[i][j];
			let p2 = head_matrix[i + 1][j];
			let p3 = head_matrix[i + 1][j + 1];
			let p4 = head_matrix[i][j + 1];

			// Add vertex(x, y, z, u, v)
			vertex(p1.pos.x, p1.pos.y, p1.pos.z, p1.u, p1.v); // upper left
			vertex(p2.pos.x, p2.pos.y, p2.pos.z, p2.u, p2.v); // bottom left
			vertex(p3.pos.x, p3.pos.y, p3.pos.z, p3.u, p3.v); // bottom right
			vertex(p4.pos.x, p4.pos.y, p4.pos.z, p4.u, p4.v); // upper right
		}

	}
	endShape(); //


	// -------------------- Top of the Head (upper hemisphere only) --------------------
	push()
	// translate to make the top connect to the bottom of the head
	translate(0, -160, 0);
	beginShape(QUADS);

	for (let i = 0; i < res_top_head; i++) {
		// latitude ranges from 0 (equator) to -PI/2 (top pole, since Y grows downwards in p5)
		let lat0 = map(i, 0, res_top_head, 0, -HALF_PI);
		let lat1 = map(i + 1, 0, res_top_head, 0, -HALF_PI);

		for (let j = 0; j < res_rotations; j++) {
			let lon0 = map(j, 0, res_rotations, 0, TWO_PI);
			let lon1 = map(j + 1, 0, res_rotations, 0, TWO_PI);

			// Vertex 1: upper left
			let x1 = radius * cos(lat0) * cos(lon0);
			let y1 = radius * sin(lat0);
			let z1 = radius * cos(lat0) * sin(lon0);

			// Vertex 2: bottom left
			let x2 = radius * cos(lat1) * cos(lon0);
			let y2 = radius * sin(lat1);
			let z2 = radius * cos(lat1) * sin(lon0);

			// Vertex 3: bottom right
			let x3 = radius * cos(lat1) * cos(lon1);
			let y3 = radius * sin(lat1);
			let z3 = radius * cos(lat1) * sin(lon1);

			// Vertex 4: upper right
			let x4 = radius * cos(lat0) * cos(lon1);
			let y4 = radius * sin(lat0);
			let z4 = radius * cos(lat0) * sin(lon1);


			// --- TEXTURE MAPPINGS FOR HEAD TOP ONLY --- (hemisphere shape)
			// Calculate Texture UV mappings for the hemisphere
			// 		U is horizontal rotation (0 to 1) -> corresponds to j
			// 		V is vertical height (0 to 0.5) -> corresponds to i. (top half of image goes on hemisphere)
			let u0 = j / res_rotations;
			let u1 = (j + 1) / res_rotations;

			let v0 = map(i, 0, res_top_head, 0.5, 0.0);
			let v1 = map(i + 1, 0, res_top_head, 0.5, 0.0);

			vertex(x1, y1, z1, u0, v0);
			vertex(x2, y2, z2, u0, v1);
			vertex(x3, y3, z3, u1, v1);
			vertex(x4, y4, z4, u1, v0);
		}
	}

	endShape();
	pop()

	pop()
}
// -------------------- Create Body --------------------
function create_puppet_body(radius = 90, color_body = 128, res_rotations = 50, res_top_body = 30, res_bottom_body = 30) {
	push()
	// Body Color
	fill(color_body);



	// -------------------- Top of Body (bezier) -------------------- 
	create_puppet_bezier_surface(
		[0, 50, radius, radius],
		[0, 0, 25, 220],
		res_rotations, res_top_body);



	// -------------------- Bottom of Body (hemisphere) -------------------- 
	push()


	translate(0, 220, 0);// translate to make the top connect to the bottom of the head
	scale(1, 1, 1);
	rotateX(PI); // flip the hemisphere upside down
	create_puppet_hemisphere(radius, res_rotations, res_bottom_body);
	pop()

	pop()
}


// -------------------- Create Arms --------------------
function create_puppet_upper_arm(radius = 25, cylinder_height = 130, color = 110, res_rotations = 20, res_hemispheres = 10) {
	push()
	// Upper Arm Color
	fill(color);


	create_puppet_capsule(radius, cylinder_height, res_rotations, res_hemispheres);

	pop()
}

function create_puppet_lower_arm(radius = 25, cylinder_height = 130, color = 110, res_rotations = 20, res_hemispheres = 10) {
	push()
	// Lower Arm Color
	fill(color);

	create_puppet_capsule(radius, cylinder_height, res_rotations, res_hemispheres);

	pop()
}

function create_puppet_hand(radius = 40, color = 110, res_rotations = 20, res_hemispheres = 10) {
	push()
	// Hand Color
	fill(color);

	sphere(radius, res_rotations, res_hemispheres);

	pop()
}


// -------------------- Create Legs --------------------
function create_puppet_upper_leg(radius = 30, upper_leg_height = 160, color = 110, res_rotations = 20, res_hemispheres = 10) {
	push()
	// Thigh Color
	fill(color);
	create_puppet_capsule(radius, upper_leg_height, res_rotations, res_hemispheres);
	pop()
}

function create_puppet_lower_leg(radius = 30, lower_leg_height = 130, color = 110, res_rotations = 20, res_hemispheres = 10) {
	push()
	// Lower Leg Color
	fill(color);
	create_puppet_capsule(radius, lower_leg_height, res_rotations, res_hemispheres);
	pop()
}

function create_puppet_foot(radius = 40, height_factor_foot = 1.2, depth_factor_foot = 1.6, color = 110, res_rotations = 20, res_hemispheres = 10) {
	push()
	// Foot Color
	fill(color);

	translate(0, 0, radius / 2); // translate to connect the foot to the lower leg
	scale(1, height_factor_foot, depth_factor_foot); // scale to make the foot more like a shoe
	create_puppet_hemisphere(radius, res_rotations, res_hemispheres);

	pop();
}

// ------------------------------------------------------------------------------------------



// --- End of models/Puppet_02_Functions.js ---


// --- Start of models/Puppet_03_Class.js ---

/**
     * @typedef {"shoulder_r"|"elbow_r"|"shoulder_l"|"elbow_l"|"hips_leg_r"|"knee_r"|"ankle_r"|"hips_leg_l"|"knee_l"|"ankle_l"|"full_body"|"hips"|"neck"} JointsNamesPuppet
     * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode
     * @typedef {"arm_r"|"arm_l"|"leg_r"|"leg_l"|"upper_leg_r"|"lower_leg_r"|"foot_r"|"upper_leg_l"|"lower_leg_l"|"foot_l"|"head"|"body"|"upper_arm_r"|"lower_arm_r"|"hand_r"|"upper_arm_l"|"lower_arm_l"| "hand_l"} PuppetBodyPartsNames
     */

class Puppet {
    // Guide of use (methods):
    //      - addRotationX(s, kf) to add a keyframe for rotation in X axis (same for Y and Z)
    //      - addRotation(s, kf) to add a keyframe for rotation in all axes at once (kf.value needs to be an array of 3 values for each axis)
    //      - changeRotationMode(s, mode) to change the order of rotation for a specific joint (s) with the mode string (like "YZX")
    //      - addRotationMode(s, kf) to add a keyframe for rotation mode for a specific joint (s) with the mode string (like "YZX") ( to use do like this.addRotationMode('neck', new KeyFrame(0, 'YZX')) )
    //      - hidePart(b) and showPart(b) to hide/show specific body parts of the puppet
    //      - hideAll() and showAll() to hide/show all body parts of the puppet
    //      - hideExcept(b) to hide all body parts except b (b can be the name of a body part)
    //      - display(time_current) to display the puppet

    // The names (s) of joints are:
    //      - Body: 
    //              full_body, hips, neck
    //      - Arms: 
    //              shoulder_r, elbow_r, 
    //              shoulder_l, elbow_l
    //      - Legs: 
    //              hips_leg_r, knee_r, ankle_r, 
    //              hips_leg_l, knee_l, ankle_l

    // The names (s) of body parts are:
    //      - Body: 
    //              head, body
    //      - Arms: 
    //              upper_arm_r, lower_arm_r, hand_r, (or arm_r for all the arm)
    //              upper_arm_l, lower_arm_l, hand_l, (or arm_l for all the arm)
    //      - Legs: 
    //              upper_leg_r, lower_leg_r, foot_r, (or leg_r for all the leg)
    //              upper_leg_l, lower_leg_l, foot_l, (or leg_l for all the leg)

    constructor() {

        // Each rotation property will have a list of Keyframes that will have a mode
        this.full_body_rot_kfs = new RotationKeyFrameList();
        
        this.full_body_trans_kfs = new TranslationKeyFrameList();

            this.hips_rot_kfs = new RotationKeyFrameList();

                this.neck_rot_kfs = new RotationKeyFrameList();

                this.shoulder_r_rot_kfs = new RotationKeyFrameList();
                    this.elbow_r_rot_kfs = new RotationKeyFrameList();

                this.shoulder_l_rot_kfs = new RotationKeyFrameList();
                    this.elbow_l_rot_kfs = new RotationKeyFrameList();

            this.hips_leg_r_rot_kfs = new RotationKeyFrameList();
                this.knee_r_rot_kfs = new RotationKeyFrameList();
                    this.ankle_r_rot_kfs = new RotationKeyFrameList();

            this.hips_leg_l_rot_kfs = new RotationKeyFrameList();
                this.knee_l_rot_kfs = new RotationKeyFrameList();
                    this.ankle_l_rot_kfs = new RotationKeyFrameList();

        // Map names to rotation kf lists
        this.rot_kfs_map = {
            'shoulder_r': this.shoulder_r_rot_kfs,
            'elbow_r': this.elbow_r_rot_kfs,
            'shoulder_l': this.shoulder_l_rot_kfs,
            'elbow_l': this.elbow_l_rot_kfs,
            'hips_leg_r': this.hips_leg_r_rot_kfs,
            'knee_r': this.knee_r_rot_kfs,
            'ankle_r': this.ankle_r_rot_kfs,
            'hips_leg_l': this.hips_leg_l_rot_kfs,
            'knee_l': this.knee_l_rot_kfs,
            'ankle_l': this.ankle_l_rot_kfs,
            'full_body': this.full_body_rot_kfs,
            'hips': this.hips_rot_kfs,
            'neck': this.neck_rot_kfs,
        };

        this.trans_kfs_map = {
            'full_body': this.full_body_trans_kfs,
        };

        // Procedural animations map
        this.procedural_functions = {};

        // Visibility map for body parts
        this.visibility_kfs_map = {}; // Maps body parts to an array of visibility keyframes (0 for hide, 1 for show)
        this.show_map = {
            // you can also hide groups like "arm_r" or "leg_l"
            'upper_leg_r': true,
            'lower_leg_r': true,
            'foot_r': true,
            'upper_leg_l': true,
            'lower_leg_l': true,
            'foot_l': true,
            'head': true,
            'body': true,
            'upper_arm_r': true,
            'lower_arm_r': true,
            'hand_r': true,
            'upper_arm_l': true,
            'lower_arm_l': true,
            'hand_l': true
        };

        // Global positions of certain parts for specifc uses in animation
        this.global_string_pos_upper_arm_r; // position to allow a string to be tied to the upper right arm (near elbow)
        this.global_string_pos_upper_arm_l; // position to allow a string to be tied to the upper left arm (near elbow)
        this.global_string_pos_lower_arm_r; // position to allow a string to be tied to the lower right arm
        this.global_string_pos_lower_arm_l; // position to allow a string to be tied to the lower left arm
        this.global_string_pos_neck; // position to allow a string to be tied to the neck joint
    }

    /**
     * @param {JointsNamesPuppet} s
     * @param {RotationMode} mode
     */
    changeRotationMode(s, mode) {
        if (this.rot_kfs_map[s]) {
            this.rot_kfs_map[s].mode = mode;
        }
        else { // throw error
            throw new Error('Joint ' + s + ' not found in changeRotationMode()');
        }
    }

    /**
     * @param {JointsNamesPuppet} s
     */
    addRotationMode(s, kf) {
        if (this.rot_kfs_map[s]) {
            kf.type_of_lerp = 'constant'; // Rotation modes should change instantaneously
            this.pushKeyFrame(kf, this.rot_kfs_map[s].mode_kfs);
        } else {
            throw new Error('Joint ' + s + ' not found in addRotationMode()');
        }
    }

    // private method to push kf to a list of keyframes (so that they maintain their order and the user can add keyframes in any order they want)
    //      This function should also overwrite if the kf.time is the same as an existing kf in the list
    pushKeyFrame(kf, ordered_kf_list) { // pushes into the ordered_list of kfs
        // make a binary search to find the right place to insert the kf

        if (ordered_kf_list.length == 0) { // since this is the first, we set its type_of_lerp to the default one if it was not set by the user (so if it is NO_TYPE_OF_LERP)
            if (kf.type_of_lerp == "noType") kf.type_of_lerp = "easeInOut";
            ordered_kf_list.push(kf);
            return;
        }

        // Binary Search for where to push kf
        let low = 0;
        let high = ordered_kf_list.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (ordered_kf_list[mid].time === kf.time) { // Overwrite if same time
                if (kf.type_of_lerp == "noType") {
                    kf.type_of_lerp = (mid > 0) ? ordered_kf_list[mid - 1].type_of_lerp : "easeInOut";
                }
                ordered_kf_list[mid] = kf;
                return;
            } else if (kf.time > ordered_kf_list[mid].time) { // kf.time in the right of the list
                low = mid + 1; // move search to the right half
            } else { // kf.time in the left of the list
                high = mid - 1; // move search to the left half
            }
        }

        // Find the type of lerp by looking backwards for the last informed type
        if (kf.type_of_lerp == "noType") { // if not set, look backwards
            kf.type_of_lerp = (low > 0) ? ordered_kf_list[low - 1].type_of_lerp : "easeInOut";
        }
        ordered_kf_list.splice(low, 0, kf); // insert kf in the list
    }

    resetAllRotations(frame_number, type_of_lerp = 'constant') { // turns all rotations into [0,0,0] by adding kfs to each parts kf lists at frame_number
        for (let s in this.rot_kfs_map) {
            this.addRotationX(s, new KeyFrame(frame_number, 0, type_of_lerp));
            this.addRotationY(s, new KeyFrame(frame_number, 0, type_of_lerp));
            this.addRotationZ(s, new KeyFrame(frame_number, 0, type_of_lerp));
        }
    }

    /**
     * @param {JointsNamesPuppet} s
     */
    addRotationX(s, kf) { // method to add kf to axis from outside
        if (this.rot_kfs_map[s]) {
            this.pushKeyFrame(kf, this.rot_kfs_map[s].x);
        }
    }
    /**
     * @param {JointsNamesPuppet} s
     */
    addRotationY(s, kf) { // method to add kf to axis from outside
        if (this.rot_kfs_map[s]) {
            this.pushKeyFrame(kf, this.rot_kfs_map[s].y);
        }
    }
    /**
     * @param {JointsNamesPuppet} s
     */
    addRotationZ(s, kf) { // method to add kf to axis from outside
        if (this.rot_kfs_map[s]) {
            this.pushKeyFrame(kf, this.rot_kfs_map[s].z);
        }
    }
    /**
     * @param {JointsNamesPuppet} s
     */
    addRotation(s, kf) { // function to add kf to multiple axes from outside at once
        if (this.rot_kfs_map[s]) {
            // create keyframe of each
            let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
            let kf_y = new KeyFrame(kf.time, kf.value[1], kf.type_of_lerp, kf.velocity);
            let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
            this.pushKeyFrame(kf_x, this.rot_kfs_map[s].x);
            this.pushKeyFrame(kf_y, this.rot_kfs_map[s].y);
            this.pushKeyFrame(kf_z, this.rot_kfs_map[s].z);
        }
    }

    addTranslationX(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.pushKeyFrame(kf, this.trans_kfs_map[s].x);
        }
    }
    addTranslationY(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.pushKeyFrame(kf, this.trans_kfs_map[s].y);
        }
    }
    addTranslationZ(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.pushKeyFrame(kf, this.trans_kfs_map[s].z);
        }
    }
    addTranslation(s, kf) { 
        if (this.trans_kfs_map[s]) {
            let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
            let kf_y = new KeyFrame(kf.time, kf.value[1], kf.type_of_lerp, kf.velocity);
            let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
            this.pushKeyFrame(kf_x, this.trans_kfs_map[s].x);
            this.pushKeyFrame(kf_y, this.trans_kfs_map[s].y);
            this.pushKeyFrame(kf_z, this.trans_kfs_map[s].z);
        }
    }

    /**
     * @param {JointsNamesPuppet} s
     * @param {Function} func - function(time_current, [kf_x, kf_y, kf_z]) => [new_x, new_y, new_z]
     */
    addProcedural(s, func) { // adds a procedural transformation to the ending values of the kfs interpolation
        if (this.rot_kfs_map[s]) { // tests if s is one of the joints before adding the procedural function
            this.procedural_functions[s] = func;
        } else { // else it throws an error
            throw new Error('Joint ' + s + ' not found for addProcedural()');
        }
    }

    /**
     * @param {PuppetBodyPartsNames} b
     */
    addVisibility(b, kf) {
        if (!this.visibility_kfs_map[b]) {
            this.visibility_kfs_map[b] = [];
        }
        kf.type_of_lerp = 'constant'; // Visibility transitions should be instantaneous
        this.pushKeyFrame(kf, this.visibility_kfs_map[b]);
    }

    applyVisibility(time_current) {
        for (let b in this.visibility_kfs_map) {
            let kf_list = this.visibility_kfs_map[b];
            if (kf_list.length > 0) {
                let val = animate_kfs(time_current, kf_list);
                if (val > 0.5) {
                    this.showPart(b);
                } else {
                    this.hidePart(b);
                }
            }
        }
    }

    applyTranslation(time_current, tkf_list, joint_name = null) { 
        let trans_x = tkf_list.x.length > 0 ? animate_kfs(time_current, tkf_list.x) : 0;
        let trans_y = tkf_list.y.length > 0 ? animate_kfs(time_current, tkf_list.y) : 0;
        let trans_z = tkf_list.z.length > 0 ? animate_kfs(time_current, tkf_list.z) : 0;

        // If a procedural function exists, let it modify translations too
        if (joint_name && this.procedural_functions[joint_name]) {
            let result = this.procedural_functions[joint_name](time_current, [trans_x, trans_y, trans_z]);
            trans_x = result[0];
            trans_y = result[1];
            trans_z = result[2];
        }

        translate(trans_x, trans_y, trans_z);
    }

    applyRotation(time_current, rkf_list, joint_name = null){ // takes a list of rotation keyframes and applies the correct rotation for the current time, interpolating (animate_kfs) and applying procedural functions (if they exist)
        
        // 1. Calculate base keyframe values (interpolate to the current time)
        let rot_x = rkf_list.x.length > 0 ? animate_kfs(time_current, rkf_list.x) : 0;
        let rot_y = rkf_list.y.length > 0 ? animate_kfs(time_current, rkf_list.y) : 0;
        let rot_z = rkf_list.z.length > 0 ? animate_kfs(time_current, rkf_list.z) : 0;

        // 2. If a procedural function exists, pass the time and the base keyframe values, and let the user return the final values!
        if (joint_name && this.procedural_functions[joint_name]) {
            let result = this.procedural_functions[joint_name](time_current, [rot_x, rot_y, rot_z]);
            rot_x = result[0];
            rot_y = result[1];
            rot_z = result[2];
        }

        // Determine the current rotation mode (overwrite with keyframes if they exist)
        let current_mode = rkf_list.mode;
        if (rkf_list.mode_kfs && rkf_list.mode_kfs.length > 0) {
            current_mode = animate_kfs(time_current, rkf_list.mode_kfs);
        }

        // 3. Apply the rotations in the correct order based on the mode
        for (let i = 0; i < current_mode.length; i++) { 
            if (current_mode[i] == 'X') {
                if (rot_x !== 0 || rkf_list.x.length > 0) rotateX(radians(rot_x));
            } 
            else if (current_mode[i] == 'Y') {
                if (rot_y !== 0 || rkf_list.y.length > 0) rotateY(radians(rot_y));
            }
            else if (current_mode[i] == 'Z') {
                if (rot_z !== 0 || rkf_list.z.length > 0) rotateZ(radians(rot_z));
            }
        }
    }

    drawPart(shape, s) { 
        if (this.show_map[s]) { // tests if the shape is set to be shown or hid 
            model(shape);
        } else {
            // instead of hiding/not showing
            //      scale it down by a lot to make the scene still render things
            //      like textures and geometries and cache them 
            // (the lag I had here was in scene_05_theater when the camera changed and the head had to be loaded again)
            
            push();
            scale(0.0001); 
                model(shape);
            pop();
        }
    }

    /**
     * @param {PuppetBodyPartsNames} b
     */
    hidePart(b) { // hides the part of the body
        if (Object.hasOwn(this.show_map, b)) {
            this.show_map[b] = false;
        }
        else if (b == "arm_r") {
            this.hidePart('upper_arm_r');
            this.hidePart('lower_arm_r');
            this.hidePart('hand_r');
        }
        else if (b == "arm_l") {
            this.hidePart('upper_arm_l');
            this.hidePart('lower_arm_l');
            this.hidePart('hand_l');
        }
        else if (b == "leg_r") {
            this.hidePart('upper_leg_r');
            this.hidePart('lower_leg_r');
            this.hidePart('foot_r');
        }
        else if (b == "leg_l") {
            this.hidePart('upper_leg_l');
            this.hidePart('lower_leg_l');
            this.hidePart('foot_l');
        }
        else {
            throw new Error('Part ' + b + ' not found for hidePart()');
        }
    }
    /**
     * @param {PuppetBodyPartsNames} b
     */
    showPart(b) { // shows the part of the body 
        if (Object.hasOwn(this.show_map, b)) {
            this.show_map[b] = true;
        }
        else if (b == "arm_r") {
            this.showPart('upper_arm_r');
            this.showPart('lower_arm_r');
            this.showPart('hand_r');
        }
        else if (b == "arm_l") {
            this.showPart('upper_arm_l');
            this.showPart('lower_arm_l');
            this.showPart('hand_l');
        }
        else if (b == "leg_r") {
            this.showPart('upper_leg_r');
            this.showPart('lower_leg_r');
            this.showPart('foot_r');
        }
        else if (b == "leg_l") {
            this.showPart('upper_leg_l');
            this.showPart('lower_leg_l');
            this.showPart('foot_l');
        }
        else {
            throw new Error('Body part ' + b + ' not found for showPart()');
        }
    }
    hideAll() { // hides all of the puppets body parts
        for (let b in this.show_map) {
            this.hidePart(b);
        }
    }
    showAll() { // shows all of the puppets body parts
        for (let b in this.show_map) {
            this.showPart(b);
        }
    }
    /**
     * @param {PuppetBodyPartsNames} b
     */
    hideExcept(b) { // hides all body parts except the one given
        this.hideAll();
        this.showPart(b);
    }

    // ------------------------------ AI GENERATED START ------------------------------
    getNeckOffset(time_current) {
        push();
        resetMatrix(); // Ensure we are calculating the offset from (0,0,0) without any external scene translations
        
        // 1. Full Body transformations
        this.applyTranslation(time_current, this.full_body_trans_kfs, 'full_body');
        this.applyRotation(time_current, this.full_body_rot_kfs, 'full_body');

        // 2. Hips transformations
        translate(0, 220, 0);
        this.applyRotation(time_current, this.hips_rot_kfs, 'hips');
        translate(0, -220, 0);

        // 3. Neck transformations
        this.applyRotation(time_current, this.neck_rot_kfs, 'neck');

        let offset = getGlobalPosition();
        pop();
        
        return offset;
    }
    // ------------------------------ AI GENERATED END ------------------------------

    display( time_current = 0 ) { 
        push();

        // Apply visibility keyframes
        this.applyVisibility(time_current);

        // TRANSLATIONS OF FULL_BODY WILL BE PLACED HERE
        this.applyTranslation(time_current, this.full_body_trans_kfs, 'full_body');

        
        this.applyRotation(time_current,this.full_body_rot_kfs, 'full_body');

        
        // -------------------- Legs Start --------------------
        // ---------- Right Leg ----------
        
        push();

        // Upper Leg
        translate(50, 250, 0);
        
        this.applyRotation(time_current,this.hips_leg_r_rot_kfs, 'hips_leg_r');
        this.drawPart(upper_leg_shape, 'upper_leg_r');

        // Lower Leg
        translate(0, height_upper_leg, 0);
        
        this.applyRotation(time_current,this.knee_r_rot_kfs, 'knee_r');
        this.drawPart(lower_leg_shape, 'lower_leg_r');

        // Foot
        translate(0, height_lower_leg + radius_lower_leg, 0);
        
        translate(0, -30, 10)
        this.applyRotation(time_current,this.ankle_r_rot_kfs, 'ankle_r');
        translate(0, 30, -10)
        this.drawPart(foot_shape, 'foot_r');

        pop();

        // ---------- Left Leg ----------
        push();

        
        // Upper Leg
        translate(-50, 250, 0);
        
        this.applyRotation(time_current,this.hips_leg_l_rot_kfs, 'hips_leg_l');
        this.drawPart(upper_leg_shape, 'upper_leg_l');

        // Lower Leg
        translate(0, height_upper_leg, 0);
        
        this.applyRotation(time_current,this.knee_l_rot_kfs, 'knee_l');
        this.drawPart(lower_leg_shape, 'lower_leg_l');

        // Foot
        translate(0, height_lower_leg + radius_lower_leg, 0);
        
        translate(0, -30, 10)
        this.applyRotation(time_current,this.ankle_l_rot_kfs, 'ankle_l');
        translate(0, 30, -10)
        this.drawPart(foot_shape, 'foot_l');

        pop();

        // -------------------- Legs End --------------------


        translate(0, 220, 0);
        
        this.applyRotation(time_current,this.hips_rot_kfs, 'hips');
        translate(0, -220, 0);

        // -------------------- Head Start --------------------
        push();
        
        // Get the global position of a part of the neck to allow positioning the string
        this.applyRotation(time_current,this.neck_rot_kfs, 'neck');
        global_head_pos = getGlobalPosition();
        this.global_string_pos_neck = global_head_pos;

        // draw head
        texture(head_tex);
        this.drawPart(head_shape, 'head');
        pop();
        // -------------------- Head End --------------------




        // -------------------- Body Start --------------------
        push();
        
        this.drawPart(body_shape, 'body');
        pop();
        // -------------------- Body End --------------------


        



        // -------------------- Arms Start --------------------
        // ---------- Right Arm ----------
        push();
        
        // Upper Arm ------------------------------
        translate(shoulder_r_pos);
        this.applyRotation(time_current,this.shoulder_r_rot_kfs, 'shoulder_r');

        // Get the global position of a part of the upper arm to allow a string to be tied to it
        push();
            translate(0,-20,0);
            translate(0, height_upper_arm - 20, 0); // translated towards the elbow
            this.global_string_pos_upper_arm_r = getGlobalPosition();
        pop();

        this.drawPart(upper_arm_shape, 'upper_arm_r');
        

        // Lower Arm ------------------------------
        translate(0, height_upper_arm, 0); // place at the end of upper arm
        
        this.applyRotation(time_current,this.elbow_r_rot_kfs, 'elbow_r');

        // Get the global position of a part of the lower arm to allow a string to be tied to it (in scene 02)
        push();
            translate(0, height_lower_arm-radius_hand-20, 0); // translate to right above the hand
            this.global_string_pos_lower_arm_r = getGlobalPosition(); // Get the global position
        pop();

        this.drawPart(lower_arm_shape, 'lower_arm_r');
        

        // Hand ------------------------------
        translate(0, height_lower_arm, 0); // place at the end of lower arm
        this.drawPart(hand_shape, 'hand_r');
        

        pop();

        // ---------- Left Arm ----------
        push();
        // Upper Arm ------------------------------
        translate(shoulder_l_pos);        
        this.applyRotation(time_current,this.shoulder_l_rot_kfs, 'shoulder_l');

        // Get the global position of a part of the upper arm to allow a string to be tied to it
        push();
            translate(0,-20,0);
            translate(0, height_upper_arm - 20, 0); // translated towards the elbow
            this.global_string_pos_upper_arm_l = getGlobalPosition();
        pop();

        this.drawPart(upper_arm_shape, 'upper_arm_l');
        
        
        // Lower Arm ------------------------------
        translate(0, height_upper_arm, 0); // place at the end of upper arm
        
        this.applyRotation(time_current,this.elbow_l_rot_kfs, 'elbow_l');   
        
        // Get the global position of a part of the lower arm to allow a string to be tied to it (in scene 02)
        push();
            translate(0, height_lower_arm-radius_hand-20, 0); // translate to right above the hand
            this.global_string_pos_lower_arm_l = getGlobalPosition(); // Get the global position
        pop();
        
        this.drawPart(lower_arm_shape, 'lower_arm_l');
        

        // Hand ------------------------------
        translate(0, height_lower_arm, 0); // place at the end of lower arm
        this.drawPart(hand_shape, 'hand_l');
        pop();

        // -------------------- Arms End --------------------






        


        pop();
    }
}


// --- End of models/Puppet_03_Class.js ---


// --- Start of models/Hand_01_Variables.js ---


// ALL VARIABLES WE WILL NEED

// Geometry: --------------------

// Palm geometry
let hand_palm_shape;
// Arm geometries
let hand_arm_shape;
// Finger geometries
let hand_finger_shapes = { // contains lists for each finger that will have their shapes (return value of endGeometry())
	pinky: [],
	ring: [],
	middle: [],
	index: [],
	thumb: []
};


// Colors: --------------------
// Stroke Color for all hand parts
let color_hand_stroke;
// Palm colors
let color_hand_palm;
// Arm colors
let color_hand_arm;
// Finger colors
let color_hand_finger;



// Sizes of Shapes: --------------------
// Stroke Weight for all hand parts
let hand_stroke_weight = 1.5;
// Palm Sizes
let hand_palm_depth = 100;
// Arm Sizes
let hand_arm_radius = 60;
let hand_arm_height = 500;
// Finger Sizes
let hand_finger_heights = {
	pinky:  [80, 60, 80],
	ring:   [70, 80, 80],
	middle: [110, 100, 70],
	index:  [100, 90, 60],
	thumb:  [80, 90, 60] // radius of thumb sphere and the 2 heights
};
// fingers have a shorter radius in the middle section then on the other sections
let short_radius_fingers = 18;
let short_radius_thumb = 25;
let long_radius_fingers = 20;
let long_radius_thumb = 27;
let radius_x_factor = 0.85; // this is the factor that scales the thumb sphere in the x direction



// ------------------------------ Variables and Geometry Initialization Function ------------------------------
function initHandVariablesAndGeometries() { // Function to initialize the geometries for the hand parts (palm and fingers), to be called in setup()

	// Initialize colors for hand parts
	color_hand_stroke = color("rgba(213, 213, 213, 1)");
	let unique_hand_color = color("rgb(79, 79, 79)");
	color_hand_palm = unique_hand_color;
	color_hand_arm = unique_hand_color;
	color_hand_finger = unique_hand_color;

	stroke(color_hand_stroke);

	// Initializing fingers geometries
	for (let finger_name in hand_finger_heights) {
		if (finger_name == "thumb") {
			
			// create the deformed sphere for the thumb
			beginGeometry();
				let radius = hand_finger_heights[finger_name][0];
				create_hand_thumb_sphere(radius, radius_x_factor);
			hand_finger_shapes[finger_name].push( endGeometry() );
			
			
			// create each thumb section with their different radii
			beginGeometry();
				let h2 = hand_finger_heights[finger_name][1];
				create_hand_finger_section(short_radius_thumb, h2);
			hand_finger_shapes[finger_name].push( endGeometry() );
			
			
			beginGeometry();
				let h3 = hand_finger_heights[finger_name][2];
				create_hand_finger_section(long_radius_thumb, h3);
			hand_finger_shapes[finger_name].push( endGeometry() );

		} else {
			
			// create each geometry for each section of the finger and save it in the hand_finger_shapes list for that finger
			beginGeometry();
				let h1 = hand_finger_heights[finger_name][0];
				create_hand_finger_section(long_radius_fingers, h1);
			hand_finger_shapes[finger_name].push( endGeometry() );

			
			beginGeometry();
				let h2 = hand_finger_heights[finger_name][1];
				create_hand_finger_section(short_radius_fingers, h2);
			hand_finger_shapes[finger_name].push( endGeometry() );
			
			
			beginGeometry();
				let h3 = hand_finger_heights[finger_name][2];
				create_hand_finger_section(long_radius_fingers, h3);
			hand_finger_shapes[finger_name].push( endGeometry() );


		}

	}

	// Initializing palm geometry
	beginGeometry();
		create_hand_palm(hand_palm_depth);
	hand_palm_shape = endGeometry();

	// Initializing arm geometry
	beginGeometry();
		create_hand_arm(hand_arm_radius, hand_arm_height);
	hand_arm_shape = endGeometry();

}


// --- End of models/Hand_01_Variables.js ---


// --- Start of models/Hand_02_Functions.js ---




// ------------------------------ Functions to Create Shapes ------------------------------ (helper functions to hand parts functions)
function create_hand_palm_face(z_offset = 0) {
	push();
	// creates the main face of the palm
	//		Starts from y = 0 and goes upwards (y = -200)
	// 		Z is decided by the z_offset parameter
	//		
	beginShape();
		vertex(-70, 0, z_offset); // left bottom
		vertex(-105, -150, z_offset); // left top left
		vertex(-70, -200, z_offset); // left top right
		vertex(90, -200, z_offset); // right top
		vertex(80, 0, z_offset); // right bottom
		vertex(-70, 0, z_offset); // left bottom
	endShape();
	pop();
}

function create_hand_palm_sides(z_positive_offset) {
	push();
	beginShape(QUADS);

		// Left Bottom
		vertex(-70, 0, z_positive_offset);
		vertex(-70, 0, -z_positive_offset);
		vertex(-105, -150, -z_positive_offset);
		vertex(-105, -150, z_positive_offset);

		// Left Top
		vertex(-105, -150, z_positive_offset);
		vertex(-105, -150, -z_positive_offset); 
		vertex(-70, -200, -z_positive_offset);
		vertex(-70, -200, z_positive_offset);

		// Top
		vertex(-70, -200, z_positive_offset);
		vertex(-70, -200, -z_positive_offset);
		vertex(90, -200, -z_positive_offset);
		vertex(90, -200, z_positive_offset);

		// Right
		vertex(90, -200, z_positive_offset);
		vertex(90, -200, -z_positive_offset);
		vertex(80, 0, -z_positive_offset);
		vertex(80, 0, z_positive_offset);

		// Bottom
		vertex(80, 0, z_positive_offset);
		vertex(80, 0, -z_positive_offset);
		vertex(-70, 0, -z_positive_offset);
		vertex(-70, 0, z_positive_offset);

	endShape();
	pop();
}

// ------------------------------ Functions to Create Full Hand Parts ------------------------------

// -------------------- Create Fingers --------------------
function create_hand_finger_section(radius, height, resolution_x = 5, resolution_y = 1) {
	push();
	fill(color_hand_finger);
	

	translate(0, -height/2, 0); // puts bottom of section in the origin (for easier rotation)
	
	cylinder(radius, height, resolution_x, resolution_y);
	pop();
}

function create_hand_thumb_sphere(radius, radius_x_factor, resolution_x = 5, resolution_y = 5) {
	push();
	fill(color_hand_finger);
	

	// we rotate to be like the original gloom_hand 
	// (this seems to not make a difference, but since the model has low resolution_x and resolution_y it actually does, if the resolution was higher it would look the same without the rotation and just applying radius_x_factor to x)
	rotateZ(PI/2);
	scale(1, radius_x_factor, 1); // scales the sphere in the x direction (its in the y, but we rotate above so its as if it was for x)

	sphere(radius, resolution_x, resolution_y);
	pop();
}


// -------------------- Create Palm --------------------
function create_hand_palm(depth = 100) {
	push();
	fill(color_hand_palm);
	
	
	

	half_depth = depth / 2; // this is the offset that will be used to create the two main faces of the palm and the sides
	
	// create main faces
	create_hand_palm_face(half_depth); // front face
	create_hand_palm_face(-half_depth); // back face

	// create the sides around the palm
	create_hand_palm_sides(half_depth);
	pop();
}

// -------------------- Create Arm --------------------
function create_hand_arm(radius, height, resolution_x = 5, resolution_y = 1) {
	push();
	fill(color_hand_arm);
	

	translate(0, -height/2, 0); // puts bottom of arm in the origin (for easier rotation)
	cylinder(radius, height, resolution_x, resolution_y);
	pop();
}






// --- End of models/Hand_02_Functions.js ---


// --- Start of models/Hand_03_Class.js ---


/**
 * @typedef {"arm"|"palm"|"pinky0"|"pinky1"|"pinky2"|"ring0"|"ring1"|"ring2"|"middle0"|"middle1"|"middle2"|"index0"|"index1"|"index2"|"thumb0"|"thumb1"|"thumb2"} JointsNamesHand
 * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode
*/


class Hand {

	constructor() {

		this.arm_rot_kfs = new RotationKeyFrameList();
		this.palm_rot_kfs = new RotationKeyFrameList();
		this.finger_rot_kfs = { // each finger has 3 sections, so it will have 3 rotation kf lists
			// by default, fingers will rotate first in Z (moving left and right), then in X (moving front and back), so the mode is "ZYX" for all
            pinky: [new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX")], 
			ring: [new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX")],
			middle: [new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX")],
			index: [new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX")],
			thumb: [new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX"), new RotationKeyFrameList("ZYX")]
		};


		// Map names to rotation kf lists
        this.main_rot_kfs_map = { // these can rotate in all axes
			'arm': this.arm_rot_kfs,
			'palm': this.palm_rot_kfs,			
        };

		// Map just for fingers 
		this.finger_rot_kfs_map = { //(they can only rotate in X and Z, so the way we deal with them is different)
			// fingers (format is fingerName + sectionIndex, ex: pinky0 for the first section of the pinky)
			'pinky0': this.finger_rot_kfs.pinky[0],
			'pinky1': this.finger_rot_kfs.pinky[1],
			'pinky2': this.finger_rot_kfs.pinky[2],
			'ring0': this.finger_rot_kfs.ring[0],
			'ring1': this.finger_rot_kfs.ring[1],
			'ring2': this.finger_rot_kfs.ring[2],
			'middle0': this.finger_rot_kfs.middle[0],
			'middle1': this.finger_rot_kfs.middle[1],
			'middle2': this.finger_rot_kfs.middle[2],
			'index0': this.finger_rot_kfs.index[0],
			'index1': this.finger_rot_kfs.index[1],
			'index2': this.finger_rot_kfs.index[2],
			'thumb0': this.finger_rot_kfs.thumb[0],
			'thumb1': this.finger_rot_kfs.thumb[1],
			'thumb2': this.finger_rot_kfs.thumb[2]
		};

		// Map for fingers overall (used to rotate all joints in a finger at once in one of the addRotation functions)
		this.finger_rot_kfs_overall_map = {
			'pinky': this.finger_rot_kfs.pinky,
			'ring': this.finger_rot_kfs.ring,
			'middle': this.finger_rot_kfs.middle,
			'index': this.finger_rot_kfs.index,
			'thumb': this.finger_rot_kfs.thumb
		};

		// Procedural animations map
		this.procedural_functions = {};

		// Global positions of finger tips for animation use
		this.global_string_pos_pinky;
		this.global_string_pos_ring;
		this.global_string_pos_middle;
		this.global_string_pos_index;
		this.global_string_pos_thumb;
	}

	/**
     * @param {JointsNamesHand} s
     * @param {RotationMode} mode
     */
	changeRotationMode(s, mode) {
        if (this.main_rot_kfs_map[s] ) {
            this.main_rot_kfs_map[s].mode = mode;
        } else if (this.finger_rot_kfs_map[s]) {
			this.finger_rot_kfs_map[s].mode = mode;
		}
        else { // throw error
            throw new Error('Joint ' + s + ' not found in changeRotationMode()');
        }
    }

	addRotationMode(s, kf) {
		if (this.main_rot_kfs_map[s]) {
			kf.type_of_lerp = 'constant';
			this.pushKeyFrame(kf, this.main_rot_kfs_map[s].mode_kfs);
		} else if (this.finger_rot_kfs_map[s]) {
			kf.type_of_lerp = 'constant';
			this.pushKeyFrame(kf, this.finger_rot_kfs_map[s].mode_kfs);
		} else {
			throw new Error('Joint ' + s + ' not found in addRotationMode()');
		}
	}

	// private method to push kf to a list of keyframes (so that they maintain their order and the user can add keyframes in any order they want)
    //      This function should also overwrite if the kf.time is the same as an existing kf in the list
    pushKeyFrame(kf, ordered_kf_list) { // pushes into the ordered_list of kfs
        // make a binary search to find the right place to insert the kf

        if (ordered_kf_list.length == 0) { // since this is the first, we set its type_of_lerp to the default one if it was not set by the user (so if it is NO_TYPE_OF_LERP)
            if (kf.type_of_lerp == "noType") kf.type_of_lerp = "easeInOut";
            ordered_kf_list.push(kf);
            return;
        }

        // Binary Search for where to push kf
        let low = 0;
        let high = ordered_kf_list.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (ordered_kf_list[mid].time === kf.time) { // Overwrite if same time
                if (kf.type_of_lerp == "noType") {
                    kf.type_of_lerp = (mid > 0) ? ordered_kf_list[mid - 1].type_of_lerp : "easeInOut";
                }
                ordered_kf_list[mid] = kf;
                return;
            } else if (kf.time > ordered_kf_list[mid].time) { // kf.time in the right of the list
                low = mid + 1; // move search to the right half
            } else { // kf.time in the left of the list
                high = mid - 1; // move search to the left half
            }
        }

        // Find the type of lerp by looking backwards for the last informed type
        if (kf.type_of_lerp == "noType") { // if not set, look backwards 
            kf.type_of_lerp = (low > 0) ? ordered_kf_list[low - 1].type_of_lerp : "easeInOut";
        }
        ordered_kf_list.splice(low, 0, kf); // insert kf in the list
    }

	/**
     * @param {JointsNamesHand} s
     */
    addRotationX(s, kf) { // method to add kf to axis from outside
        if (this.main_rot_kfs_map[s]) {
            this.pushKeyFrame(kf, this.main_rot_kfs_map[s].x);
        } else if (this.finger_rot_kfs_map[s]) {
			this.pushKeyFrame(kf, this.finger_rot_kfs_map[s].x);
		} else if (this.finger_rot_kfs_overall_map[s]) { // if the user is trying to add a rotation to all sections of a finger at once
			for (let i = 0; i < 3; i++) {
				// keyframe values go to each joint of the finger 
				// (ex: if value is [10,20,30], the first joint will get 10, the second 20 and the third 30 in the X axis)
				let kf_x = new KeyFrame(kf.time, kf.value[i], kf.type_of_lerp, kf.velocity);
				this.pushKeyFrame(kf_x, this.finger_rot_kfs_overall_map[s][i].x);
			}
		} else { // throw error
			throw new Error('Joint ' + s + ' does not have addRotationX()');
		}
    }
	/**
     * @param {JointsNamesHand} s
     */
    addRotationY(s, kf) { // method to add kf to axis from outside
        if (this.main_rot_kfs_map[s]) {
            this.pushKeyFrame(kf, this.main_rot_kfs_map[s].y);
        }
		else { // throw error
			throw new Error('Joint ' + s + ' does not have addRotationY()');
		}
    }
	/**
     * @param {JointsNamesHand} s
     */
    addRotationZ(s, kf) { // method to add kf to axis from outside
        if (this.main_rot_kfs_map[s]) {
            this.pushKeyFrame(kf, this.main_rot_kfs_map[s].z);
        } else if (this.finger_rot_kfs_map[s]) {
			this.pushKeyFrame(kf, this.finger_rot_kfs_map[s].z);
		} else if (this.finger_rot_kfs_overall_map[s]) { // if the user is trying to add a rotation to all sections of a finger at once
			// keyframe values go to each joint of the finger 
			// (ex: if value is [10,20,30], the first joint will get 10, the second 20 and the third 30 in the z axis)
			let kf_z = new KeyFrame(kf.time, kf.value[i], kf.type_of_lerp, kf.velocity);
			this.pushKeyFrame(kf_z, this.finger_rot_kfs_overall_map[s][i].z);
		} else { // throw error
			throw new Error('Joint ' + s + ' does not have addRotationZ()');
		}
    }
	/**
     * @param {JointsNamesHand} s
     */
    addRotation(s, kf) { // function to add kf to multiple axes from outside at once
        if (this.main_rot_kfs_map[s]) {
            // create keyframe of each
            let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
            let kf_y = new KeyFrame(kf.time, kf.value[1], kf.type_of_lerp, kf.velocity);
            let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
            this.pushKeyFrame(kf_x, this.main_rot_kfs_map[s].x);
            this.pushKeyFrame(kf_y, this.main_rot_kfs_map[s].y);
            this.pushKeyFrame(kf_z, this.main_rot_kfs_map[s].z);
        } else if (this.finger_rot_kfs_map[s]) {
			// create keyframe of each
			let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
			let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
			this.pushKeyFrame(kf_x, this.finger_rot_kfs_map[s].x);
			this.pushKeyFrame(kf_z, this.finger_rot_kfs_map[s].z);
			if (kf.value[1] != 0) {
				console.warn('Warning: trying to add rotation keyframe with non zero Y value to finger joint ' + s + ' which does not rotate in Y. The Y value will be ignored.');
			}
		}
    }

    /**
     * @param {JointsNamesHand} s
     * @param {Function} func - function(time_current, [kf_x, kf_y, kf_z]) => [new_x, new_y, new_z]
     */
    addProcedural(s, func) { // adds a procedural transformation to the ending values of the kfs interpolation
        if (this.main_rot_kfs_map[s] || this.finger_rot_kfs_map[s]) { 
            this.procedural_functions[s] = func;
        } else if (this.finger_rot_kfs_overall_map[s]) {
            // Apply it to all 3 sections!
            this.procedural_functions[s + '0'] = func;
            this.procedural_functions[s + '1'] = func;
            this.procedural_functions[s + '2'] = func;
        } else { // else it throws an error
            throw new Error('Joint ' + s + ' not found for addProcedural()');
        }
    }

	applyRotation(time_current, rkf_list, joint_name = null){ // takes a list of rotation keyframes and applies the correct rotation for the current time (will be called in display)
        
        let rot_x = rkf_list.x.length > 0 ? animate_kfs(time_current, rkf_list.x) : 0;
        let rot_y = rkf_list.y.length > 0 ? animate_kfs(time_current, rkf_list.y) : 0;
        let rot_z = rkf_list.z.length > 0 ? animate_kfs(time_current, rkf_list.z) : 0;

        // If a procedural function exists, pass the time and the base keyframe values, and let the user return the final values!
        if (joint_name && this.procedural_functions[joint_name]) {
            let result = this.procedural_functions[joint_name](time_current, [rot_x, rot_y, rot_z]);
            rot_x = result[0];
            rot_y = result[1];
            rot_z = result[2];
        }

        // check modes to rotate in the right order with the value from animate_kfs(time_current, kf_list)

        let current_mode = rkf_list.mode;
        if (rkf_list.mode_kfs && rkf_list.mode_kfs.length > 0) {
            current_mode = animate_kfs(time_current, rkf_list.mode_kfs);
        }

        for (let i = 0; i < current_mode.length; i++) { 
            if (current_mode[i] == 'X') {
                if (rot_x !== 0 || rkf_list.x.length > 0) rotateX( radians( rot_x ) );
            } 
            else if (current_mode[i] == 'Y') {
                if (rot_y !== 0 || rkf_list.y.length > 0) rotateY( radians( rot_y ) );
            }
            else if (current_mode[i] == 'Z') {
                if (rot_z !== 0 || rkf_list.z.length > 0) rotateZ( radians( rot_z ) );
            }
        }
    }
    drawPart(shape) { // tests if the shape is not null before drawing (with model(shape))
        if (shape) { 
            // this if is done so the program doesn't crash if the puppet is not fully made yet
            model(shape);
        }
    }

	apply_and_draw_finger_section(time_current, heights_list, shapes_list, rot_kfs_list, finger_name) {
		// this function applies the rotations and draws a section of a finger (used for all sections of all fingers in display())
		push();
		// section 0 (no translate since it is at the origin here)
		this.applyRotation(time_current, rot_kfs_list[0], finger_name + '0');
		this.drawPart(shapes_list[0]);

		// section 1 (translate to top of section 0)
		translate(0, -heights_list[0], 0);
		this.applyRotation(time_current, rot_kfs_list[1], finger_name + '1');
		this.drawPart(shapes_list[1]);

		// section 2 (translate to top of section 1)
		translate(0, -heights_list[1], 0);
		this.applyRotation(time_current, rot_kfs_list[2], finger_name + '2');

		// get global position of the finger tip
		push();
		translate(0, -heights_list[2]/2, 0); 
		this['global_string_pos_' + finger_name] = getGlobalPosition();
		pop();

		this.drawPart(shapes_list[2]);
		
		pop();
	} 

	apply_and_draw_thumb_section(time_current, thumb_heights_list, shapes_list, rot_kfs_list, finger_name) {
		// this function applies the rotations and draws a section of a finger (used for all sections of all fingers in display())
		push();
		// section 0 (no translate since it is at the origin here)
		this.applyRotation(time_current, rot_kfs_list[0], finger_name + '0');
		this.drawPart(shapes_list[0]);

		// section 1 (translate here is a bit different, cause we want the bottom of section 1 to sit a bit inside the sphere of section 0)
		translate(0, -thumb_heights_list[1]/2, 0);
		this.applyRotation(time_current, rot_kfs_list[1], finger_name + '1');
		this.drawPart(shapes_list[1]);

		// section 2 (translate to top of section 1)
		translate(0, -thumb_heights_list[1], 0);
		this.applyRotation(time_current, rot_kfs_list[2], finger_name + '2');

		// get global position of the thumb tip
		push();
		translate(0, -thumb_heights_list[2]/2, 0); 
		this['global_string_pos_' + finger_name] = getGlobalPosition();
		pop();

		this.drawPart(shapes_list[2]);
		
		pop();
	}

	display( time_current ) {
		push();
		strokeWeight(hand_stroke_weight);
		stroke(color_hand_stroke);
		linePerspective(false);

		// Arm
		this.applyRotation(time_current, this.arm_rot_kfs, 'arm');
		this.drawPart(hand_arm_shape);

		// Palm
		translate(0, -hand_arm_height, 0); // translate to the top of the arm where the palm is
		this.applyRotation(time_current, this.palm_rot_kfs, 'palm');
		this.drawPart(hand_palm_shape);

		// -------------------- Fingers (pinky to thumb)--------------------

		// because of the palm translate, we are at the base of the palm now
		// each section of finger will then translate to their correct position on the palm and then apply their rotations and draw themselves

		// Pinky
		push();
		translate(-90, -170, 0); // translate to the base of the pinky
		rotateY(PI/24); rotateZ(-PI/4); // apply natural rotation of pinky in relation to the palm
		// function to apply the rotations and draw the sections
		this.apply_and_draw_finger_section(time_current, hand_finger_heights.pinky, hand_finger_shapes.pinky, this.finger_rot_kfs.pinky, 'pinky');
		pop();

		// Ring
		push();
		translate(-55, -200, 0); // translate to the base of the ring finger
		rotateZ(-PI/20); // apply natural rotation of ring finger in relation to the palm
		this.apply_and_draw_finger_section(time_current, hand_finger_heights.ring, hand_finger_shapes.ring, this.finger_rot_kfs.ring, 'ring');
		pop();

		// Middle
		push();
		translate(0, -200, 0); // translate to the base of the middle finger
		this.apply_and_draw_finger_section(time_current, hand_finger_heights.middle, hand_finger_shapes.middle, this.finger_rot_kfs.middle, 'middle');
		pop();

		// Index
		push();
		translate(60, -200, 0); // translate to the base of the index finger
		rotateZ(PI/10); // apply natural rotation of index finger in relation to the palm
		this.apply_and_draw_finger_section(time_current, hand_finger_heights.index, hand_finger_shapes.index, this.finger_rot_kfs.index, 'index');
		pop();

		// Thumb
		push();
		translate(75, -65, 0); // translate to where the center of the ball is related to the palm joint at the origin
		rotateZ(PI/2-PI/8); // apply natural rotation of thumb in relation to the palm
		this.apply_and_draw_thumb_section(time_current, hand_finger_heights.thumb, hand_finger_shapes.thumb, this.finger_rot_kfs.thumb, 'thumb');
		pop();

		pop();
	}
}


// --- End of models/Hand_03_Class.js ---


// --- Start of models/Stage_03_Class.js ---

/**
 * @typedef {"floor"|"back_wall"|"ceiling"|"top_curtains"|"right_curtains"|"left_curtains"} StageParts
 * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode
 */

// -----------------------------------------------------------------------------
// --- 1. Variables ------------------------------------------------------------
// -----------------------------------------------------------------------------

let color_front_stage, color_back_stage;
let color_floor_stage, color_floor_top_stage;
let color_wall_stage, color_ceiling_stage, color_ceiling_bottom_stage;

let floor_width, floor_height, floor_depth;
let wall_width, wall_height;
let ceiling_width, ceiling_height, ceiling_depth;

let top_curtain_width, circle_radius_stage;
let n_half_cylinders, half_cylinder_radius, half_cylinder_height, half_cylinder_res_rotations;

// --- Shapes ---
let stage_floor_shape;
let stage_back_wall_shape;
let stage_ceiling_shape;
let stage_top_curtains_shape;
let stage_side_curtains_shape;


// -----------------------------------------------------------------------------
// --- 2. Functions (Initialization & Geometry) --------------------------------
// -----------------------------------------------------------------------------

function initStageVariables() {
    // We initialize colors here because color() can only be called inside/after setup() in p5.js
    color_front_stage = color(120);
    color_back_stage = color(110);

    color_floor_stage = color(150);
    color_floor_top_stage = color(140);
    color_wall_stage = color(90);
    color_ceiling_stage = color(150);
    color_ceiling_bottom_stage = color(100);

    floor_width = 1660 * 2;
    floor_height = 300;
    floor_depth = 1660 * 1.5;

    wall_width = 1660 * 2;
    wall_height = 1660;

    ceiling_width = floor_width;
    ceiling_height = floor_height;
    ceiling_depth = floor_depth;

    top_curtain_width = floor_width;
    circle_radius_stage = 350;

    n_half_cylinders = 14;
    half_cylinder_radius = 100;
    half_cylinder_height = wall_height;
    half_cylinder_res_rotations = 20;
}

function initStageGeometries() {
    initStageVariables(); // Variables must be initialized first

    stage_floor_shape = buildGeometry(() => {
        push();
            translate(0, 0.1, 0);
            noStroke();
            fill(color_floor_stage);
            
            push(); // top part of floor
                fill(color_floor_top_stage); 
                translate(0, -0.1, 0);
                rotateX(HALF_PI);
                plane(floor_width, floor_depth);
            pop();
            translate(0, floor_height / 2, 0);
            box(floor_width, floor_height, floor_depth);
        pop();
    });

    stage_back_wall_shape = buildGeometry(() => {
        push();
            fill(color_wall_stage);
            noStroke();
            translate(0, -wall_height / 2, -floor_depth / 2);
            plane(wall_width, wall_height);
        pop();
    });

    stage_ceiling_shape = buildGeometry(() => {
        push();
            noStroke();
            fill(color_ceiling_stage); 
            translate(0, -0.1, 0);

            push(); // bottom part of ceiling
                fill(color_ceiling_bottom_stage); 
                translate(0, 0.1, 0);
                translate(0, -wall_height, 0);
                rotateX(HALF_PI);
                plane(ceiling_width, ceiling_depth);
            pop();
            translate(0, -wall_height - ceiling_height / 2, 0);
            box(ceiling_width, ceiling_height, ceiling_depth);
        pop();
    });

    stage_top_curtains_shape = buildGeometry(() => {
        push();
            translate(0, -wall_height, floor_depth / 2 + 1);
            create_top_curtains(top_curtain_width, circle_radius_stage, color_front_stage, color_back_stage);
        pop();
    });

    stage_side_curtains_shape = buildGeometry(() => {
        push();
            noStroke();
            translate(0, 0, floor_depth / 2 - half_cylinder_radius);
            // back of the curtains
            create_curtains(half_cylinder_radius, half_cylinder_height, n_half_cylinders, color_back_stage, color_front_stage, half_cylinder_res_rotations);
            translate(0, 0, 1); 
            // front of the curtains
            create_curtains(half_cylinder_radius, half_cylinder_height, n_half_cylinders, color_front_stage, color_back_stage, half_cylinder_res_rotations);
        pop();
    });
}

function create_half_cylinder(radius, height, res_rotations) {
    beginShape(QUAD_STRIP);
        for (let i = 0 ; i < res_rotations; i++) {
            let angle = map(i, 0, res_rotations-1, 0, PI);
            let x = cos(angle) * radius;
            let z = sin(angle) * radius;
            vertex(x, -height/2, z); // bottom
            vertex(x, height/2, z);  // top
        }
    endShape();
} 

function create_curtains(radius, height, n_half_cylinders, color_front = color(255,0,0), color_back = color(0,255,0), res_rotations=10) {
    push();
        translate(-radius, 0, 0); // so it starts at 0 and goes to the right
        for (let i = 0 ; i < n_half_cylinders; i++) {
            translate(radius*2, 0, 0);
            if (i%2 == 1) {
                push();
                fill(color_back);
                rotateY(PI);
                create_half_cylinder(radius, height, res_rotations);
                pop();
            } else {
                push();
                fill(color_front);
                create_half_cylinder(radius, height, res_rotations);
                pop();
            }
        }
    pop();
}

function create_top_curtains(top_curtain_width_local, circle_radius_local, color_front = color(255,0,0), color_back = color(0,255,0)) {
    let circle_ds = [ // circle diameters
        circle_radius_local*2,
        circle_radius_local*2/1.2,
        circle_radius_local*2/2,
        circle_radius_local*2/2.5,
        circle_radius_local*2/3,
    ];

    let circle_xs = [ // x positions of the circles
        0,
        500,
        300+600,
        300+800,
        300+1000,
    ];

    let last_idx = 3; 
    let local_width = (circle_xs[last_idx] * 2) + circle_ds[last_idx]; 

    let scale_x_factor = top_curtain_width_local / local_width; 
    push();
    noStroke();
    scale(scale_x_factor, 1, 1); 
    translate(0, 0, 2);

    let radius_ratio = 0.8;

    // Draw central circle
    fill(color_back);
    arc(0, 0, circle_ds[0], circle_ds[0], 0, PI);
    push();
        translate(0, 0, 1);
        fill(color_front);
        arc(0, 0, circle_ds[0]*radius_ratio, circle_ds[0]*radius_ratio, 0, PI);
    pop();

    for (let i = 1; i <= last_idx; i++) {
        // Right side
        push();
            translate(circle_xs[i], 0, 0);
            fill(color_back);
            arc(0, 0, circle_ds[i], circle_ds[i], 0, PI);
            push();
                translate(0, 0, 1);
                fill(color_front);
                arc(0, 0, circle_ds[i]*radius_ratio, circle_ds[i]*radius_ratio, 0, PI);
            pop();
        pop();

        // Left side
        push();
            translate(-circle_xs[i], 0, 0);
            fill(color_back);
            arc(0, 0, circle_ds[i], circle_ds[i], 0, PI);
            push();
                translate(0, 0, 1);
                fill(color_front);
                arc(0, 0, circle_ds[i]*radius_ratio, circle_ds[i]*radius_ratio, 0, PI);
            pop();
        pop();
    }
    pop();
}


// -----------------------------------------------------------------------------
// --- 3. Stage Class ----------------------------------------------------------
// -----------------------------------------------------------------------------

class Stage {
    constructor() {
        this.right_curtains_trans_kfs = new TranslationKeyFrameList();
        this.left_curtains_trans_kfs = new TranslationKeyFrameList();

        this.trans_kfs_map = {
            'right_curtains': this.right_curtains_trans_kfs,
            'left_curtains': this.left_curtains_trans_kfs,
        };

        this.procedural_functions = {};
    }

    pushKeyFrame(kf, ordered_kf_list) { 
        if (ordered_kf_list.length == 0) { 
            if (kf.type_of_lerp == "noType") kf.type_of_lerp = "easeInOut";
            ordered_kf_list.push(kf);
            return;
        }

        let low = 0;
        let high = ordered_kf_list.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (ordered_kf_list[mid].time === kf.time) { 
                if (kf.type_of_lerp == "noType") {
                    kf.type_of_lerp = (mid > 0) ? ordered_kf_list[mid - 1].type_of_lerp : "easeInOut";
                }
                ordered_kf_list[mid] = kf;
                return;
            } else if (kf.time > ordered_kf_list[mid].time) { 
                low = mid + 1; 
            } else { 
                high = mid - 1; 
            }
        }
        
        if (kf.type_of_lerp == "noType") {
            kf.type_of_lerp = (low > 0) ? ordered_kf_list[low - 1].type_of_lerp : "easeInOut";
        }
        ordered_kf_list.splice(low, 0, kf); 
    }

    addTranslationX(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.pushKeyFrame(kf, this.trans_kfs_map[s].x);
        }
    }
    addTranslationY(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.pushKeyFrame(kf, this.trans_kfs_map[s].y);
        }
    }
    addTranslationZ(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.pushKeyFrame(kf, this.trans_kfs_map[s].z);
        }
    }
    addTranslation(s, kf) { 
        if (this.trans_kfs_map[s]) {
            let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
            let kf_y = new KeyFrame(kf.time, kf.value[1], kf.type_of_lerp, kf.velocity);
            let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
            this.pushKeyFrame(kf_x, this.trans_kfs_map[s].x);
            this.pushKeyFrame(kf_y, this.trans_kfs_map[s].y);
            this.pushKeyFrame(kf_z, this.trans_kfs_map[s].z);
        }
    }

    addProcedural(s, func) { 
        if (this.trans_kfs_map[s]) { 
            this.procedural_functions[s] = func;
        } else { 
            throw new Error('Part ' + s + ' not found for addProcedural()');
        }
    }

    applyTranslation(time_current, tkf_list, part_name = null) { 
        let trans_x = tkf_list.x.length > 0 ? animate_kfs(time_current, tkf_list.x) : 0;
        let trans_y = tkf_list.y.length > 0 ? animate_kfs(time_current, tkf_list.y) : 0;
        let trans_z = tkf_list.z.length > 0 ? animate_kfs(time_current, tkf_list.z) : 0;

        if (part_name && this.procedural_functions[part_name]) {
            let result = this.procedural_functions[part_name](time_current, [trans_x, trans_y, trans_z]);
            trans_x = result[0];
            trans_y = result[1];
            trans_z = result[2];
        }

        translate(trans_x, trans_y, trans_z);
    }

    display(time_current = 0) { 
        // Auto-initialize geometries if they haven't been created yet!
        if (!stage_floor_shape) {
            initStageGeometries();
        }

        push();

        // -------------------- Static Geometry --------------------
        model(stage_floor_shape);
        model(stage_back_wall_shape);
        model(stage_ceiling_shape);
        model(stage_top_curtains_shape);

        // -------------------- Animated Curtains --------------------
        push(); 
            noStroke();
            translate(0, -wall_height / 2, 0);
            
            // Right curtains
            push(); 
                scale(0.5, 1, 1);
                this.applyTranslation(time_current, this.right_curtains_trans_kfs, 'right_curtains');
                model(stage_side_curtains_shape);
            pop();
            
            // Left curtains
            push(); 
                scale(0.5, 1, 1);
                scale(-1, 1, 1);
                this.applyTranslation(time_current, this.left_curtains_trans_kfs, 'left_curtains');
                model(stage_side_curtains_shape);
            pop();
        pop();

        pop();
    }
}


// --- End of models/Stage_03_Class.js ---


// --- Start of scenes/Scene_Class.js ---

class Scene {
    /**
     * @param {number} start_frame The frame unit when this scene begins.
     * @param {number} end_frame The frame unit when this scene ends.
     */
    constructor(start_frame, end_frame) {
        this.start_frame = start_frame;
        this.end_frame = end_frame;
    }

    /**
     * Checks if the scene should be active based on the global current frame
     * @param {number} frame_current 
     * @returns {boolean}
     */
    isActive(frame_current) {
        return frame_current >= this.start_frame && frame_current <= this.end_frame;
    }

    /**
     * Sets up the geometries, keyframes, and variables for the scene.
     * Should be called once during setup.
     */
    setup() {
        // To be implemented by child classes
    }

    /**
     * Displays the scene on the canvas. 
     * Applies the camera and renders the objects.
     * @param {number} time_current The current global time in seconds
     */
    display(time_current) {
        // To be implemented by child classes
    }
}


// --- End of scenes/Scene_Class.js ---


// --- Start of scenes/Scene_00_Intro.js ---

/// <reference path="./Scene_Class.js" />

class Scene_00_Intro extends Scene {
    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 0, 51
    }

    display(time_current) {
        // background(255,0,0); 
        background(50);
        // Add text animation here later
    }
}


// --- End of scenes/Scene_00_Intro.js ---


// --- Start of scenes/Scene_01_Dismantled.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

class Scene_01_Dismantled extends Scene {
    constructor(start_frame, end_frame) {
        super(start_frame, end_frame);
        
        // Setup puppets
        this.puppet_head = new Puppet(); this.puppet_head.hideExcept('head'); 
        this.puppet_body = new Puppet(); this.puppet_body.hideExcept('body');
        this.puppet_arm_r = new Puppet(); this.puppet_arm_r.hideExcept('arm_r');
        this.puppet_arm_l = new Puppet(); this.puppet_arm_l.hideExcept('arm_l');
        this.puppet_leg_r = new Puppet(); this.puppet_leg_r.hideExcept('leg_r');
        this.puppet_leg_l = new Puppet(); this.puppet_leg_l.hideExcept('leg_l');
        
        // KeyFrames for the puppet's dismantled body parts
        this.puppet_head.addRotationX('neck', new KeyFrame(0, 90));
        this.puppet_body.addRotationX('full_body', new KeyFrame(0, -90));
        this.puppet_arm_r.addRotation('shoulder_r', new KeyFrame(0, [-90,-100,0]));
        this.puppet_arm_r.addRotation('elbow_r', new KeyFrame(0, [60,0,0]));
        this.puppet_arm_l.addRotation('shoulder_l', new KeyFrame(0, [-90,-90,0]));
        this.puppet_arm_l.addRotation('elbow_l', new KeyFrame(0, [60,0,0]));
        this.puppet_leg_r.addRotation('hips_leg_r', new KeyFrame(0, [90,-90,0]));
        this.puppet_leg_r.addRotation('knee_r', new KeyFrame(0, [-70,0,0]));
        this.puppet_leg_l.addRotation('hips_leg_l', new KeyFrame(0, [90,-90,0]));
        this.puppet_leg_l.addRotation('knee_l', new KeyFrame(0, [-70,0,0]));

        // Keyframes for the camera
        this.camera_kf_list = [];
        // this.camera_kf_list.push(new KeyFrame(0, [0,0,0,0,0,0], 'constant'));
        this.camera_kf_list.push(new KeyFrame(51, [124, -556, 391, 153, -513, 453], 'constant'));
        this.camera_kf_list.push(new KeyFrame(61, [426, -501, -482, 676, -256, -119], 'constant'));
        this.camera_kf_list.push(new KeyFrame(71, [-1108, -1862, -2118, 80, 10, 45], 'constant'));
        this.camera_kf_list.push(new KeyFrame(83, [-1751, -2875, -3289, 80, 10, 45], 'constant'));
        // this.camera_kf_list.push(new KeyFrame(94, [0,0,0,0,0,0], 'constant'));
    }

    display(time_current) {
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }

        // Puppet --------------------
        push(); // head
            translate(300, -40, 1000);
            rotateY(PI+PI/2);
            rotateX(-PI/8);
            this.puppet_head.display();
        pop();

        push(); // body
            translate(0, -40, 0);
            this.puppet_body.display();
        pop();

        // Arms
        push(); 
            translate(800, -65, 200);
            rotateY(-PI/2+PI/8);
            this.puppet_arm_r.display();
        pop();
        push();
            translate(-500, -65, 600);
            rotateY(PI/2);
            this.puppet_arm_l.display();
        pop();

        // Legs
        push();
            translate(400, -280, -700);
            rotateY(PI-PI/4);
            this.puppet_leg_r.display();
        pop();
        push();
            translate(-600, 230, -700);
            rotateX(PI);
            rotateY(-PI+PI/4);
            this.puppet_leg_l.display();
        pop();


        push();
            noStroke();
            fill(50);
            translate(0,200,0);
            model(background_shape);
            rotateX(PI/2);
            // circle(0,0,10000);
            plane(10000);
        pop();
    }
}


// --- End of scenes/Scene_01_Dismantled.js ---


// --- Start of scenes/Scene_02_Play.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

class Scene_02_Play extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 94, 215

        this.puppet = new Puppet();
        this.camera_kf_list = [];
        this.string_control_point1_kf_list = [];
        this.string_control_point2_kf_list = [];

        this.end_pos_x = 1500; // arbitrary point to the right of the puppet where the string is tied

        // 94, 129, 143, 164, 169, 175, 215(end)
        // base positions of the arms at the start
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(90, -20));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(90, 15));


        // animating the pull of the arm
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(130, -20, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(135, -45, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(150, -20, 'easeOut'));
        
        // reaction of the body to the arm pull
        this.puppet.addRotationZ("hips", new KeyFrame(132, 0, 'easeInOut'));
        this.puppet.addRotationZ('hips', new KeyFrame(140, 2, 'easeInOut'));
        this.puppet.addRotationZ('hips', new KeyFrame(150, 0, 'easeOut'));
        
        // reaction of the other arm to the arm pull
        this.puppet.addRotationZ("shoulder_l", new KeyFrame(132, 0+15, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(140, 2+15, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(150, 0+15, 'easeOut'));

        // animating the head turn that needs to be in the middle of the camera constant change (163)
        this.puppet.addRotation('neck', new KeyFrame(155, [0,0,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(169, [0,60,0], 'easeInOut'));

        // animating the control points of the string to make it straighter when pulled
        this.string_control_point1_kf_list.push(new KeyFrame(125, [this.end_pos_x/2-200, 300+50, 0], 'easeIn'));
        this.string_control_point1_kf_list.push(new KeyFrame(131, [this.end_pos_x/2-200, 300-100, 0], 'easeInOut'));
        this.string_control_point1_kf_list.push(new KeyFrame(135, [this.end_pos_x/2-200, 300-100, 0], 'easeInOut'));
        this.string_control_point1_kf_list.push(new KeyFrame(150-5, [this.end_pos_x/2-200, 300, 0], 'easeInOut'));

        this.string_control_point2_kf_list.push(new KeyFrame(125, [this.end_pos_x/2+200, 300+50, 0], 'easeIn'));
        this.string_control_point2_kf_list.push(new KeyFrame(131, [this.end_pos_x/2+200, 300-100, 0], 'easeInOut'));
        this.string_control_point2_kf_list.push(new KeyFrame(135, [this.end_pos_x/2+200, 300-100, 0], 'easeInOut'));
        this.string_control_point2_kf_list.push(new KeyFrame(150-5, [this.end_pos_x/2+200, 300, 0], 'easeInOut'));

        
        // animating the camera
        this.camera_kf_list.push(new KeyFrame(94, [312-50, -61, 1244, 255-50, 7, -5], 'easeInOut'));
        // this.camera_kf_list.push(new KeyFrame(134, [312, -61, 1244, 255, 7, -5], 'constant'));
        this.camera_kf_list.push(new KeyFrame(159, [312, -61, 1244, 255, 7, -5], 'easeIn'));
        this.camera_kf_list.push(new KeyFrame(162, [312+30, -61, 1244, 255+30, 7, -5], 'constant'));
        this.camera_kf_list.push(new KeyFrame(163, [1106, -39, 6, 5, 4, -1+15], 'easeOut'));
        this.camera_kf_list.push(new KeyFrame(195, [1106, -39, 6, 5, 4, -1-15], 'constant'));
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        // camera(...[312, -61, 1244, 255, 7, -5])
        // camera(...[1106, -39, 6, 5, 4, -1])
        
        push();

        this.puppet.display(time_current);
        
        strokeWeight(10);
        noFill()
        stroke(191);

        let string_start = this.puppet.global_string_pos_lower_arm_r;
        let string_control_point1 = animate_kfs(time_current, this.string_control_point1_kf_list); // arbitrary point to the right of the puppet
        let string_control_point2 = animate_kfs(time_current, this.string_control_point2_kf_list); // arbitrary point to the right of the puppet
        // let string_control_point2 = createVector(this.end_pos_x/2+200, 300-100, 0); // arbitrary point to the right of the puppet
        let string_end = createVector(this.end_pos_x, 170, 0); // arbitrary point to the right of the puppet
        // line(string_start.x, string_start.y, string_start.z, string_end.x, string_end.y, string_end.z);
        bezier(string_start.x, string_start.y, string_start.z,
               string_control_point1.x, string_control_point1.y, string_control_point1.z,
               string_control_point2.x, string_control_point2.y, string_control_point2.z,
               string_end.x, string_end.y, string_end.z);


        pop();
    }

}

// --- End of scenes/Scene_02_Play.js ---


// --- Start of scenes/Scene_03_Strumming.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames 
//      (take notes of the start and end to put as comments here as well)

class Scene_03_Strumming extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 215, 290 

        // Initialize necessary objects and lists
        this.hand = new Hand();
        this.camera_kf_list = [];
        this.hand_translate_kf_list = [];
        this.string_control_points_kf_list = [ // has each control point's kf_list 
            // (the 2 control points of a same string will have the same position for this animation, so I just create one per string)
            [], [], [],
        ]

        this.string_height = 1000; // is actually half the height (is the distance of the end points to y=0)
        this.string_offset = 600;



        // 215,238,260,290(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));

        // putting the hand in the strumming position
        // this.hand.addRotation('arm', new KeyFrame(215, [-90 + 10, -90 + 10, 0]));

        // close all fingers except thumb and index
        this.hand.addRotation('pinky0', new KeyFrame(215, [-60, 0, 30]));
        this.hand.addRotation('pinky1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('pinky2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('ring0', new KeyFrame(215, [-50, 0, 0]));
        this.hand.addRotation('ring1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('ring2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('middle0', new KeyFrame(215, [-60, 0, 0]));
        this.hand.addRotation('middle1', new KeyFrame(215, [-100, 0, 0]));
        this.hand.addRotation('middle2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotationZ('index0', new KeyFrame(215, -5));
        // this.hand.addRotation('index0', new KeyFrame(215, [0,0,-5]));
        // this.hand.addRotation('index1', new KeyFrame(215, [-10,0,0]));
        // this.hand.addRotation('index2', new KeyFrame(215, [0,0,0]));

        this.hand.addRotationX('thumb0', new KeyFrame(48, -20));
        this.hand.addRotationX('thumb1', new KeyFrame(48, 0));
        this.hand.addRotationX('thumb2', new KeyFrame(48, -15));


        // animating the strumming movement (palm and index)

        let pulling_time = 7;
        let release_time = 3;
        let string_to_string_time = 15;
        let pull_animation_type = 'easeOut';
        let release_animation_type = 'easeOut';

        let touch_t = [];
        let pulled_t = [];
        let released_t = [];

        touch_t[0] = 215;
        pulled_t[0] = touch_t[0] + pulling_time; // 222
        released_t[0] = pulled_t[0] + release_time; // 225
        
        touch_t[1] = released_t[0] + string_to_string_time; // 240
        pulled_t[1] = touch_t[1] + pulling_time; // 247
        released_t[1] = pulled_t[1] + release_time; // 250
        
        touch_t[2] = released_t[1] + string_to_string_time; // 265
        pulled_t[2] = touch_t[2] + pulling_time; // 272
        released_t[2] = pulled_t[2] + release_time; // 275


        let palm_touch_x = 10;
        let palm_pulled_x = 5;
        let palm_released_x = 30;

        this.hand.addRotationX('palm', new KeyFrame(touch_t[0], palm_touch_x, pull_animation_type));
        // contract hand to pull string 0
        this.hand.addRotationX('palm', new KeyFrame(pulled_t[0], palm_pulled_x, release_animation_type));
        // relax hand to release string 0 (move the palm back)
        this.hand.addRotationX('palm', new KeyFrame(released_t[0], palm_released_x));
        // contract hand (move palm forward to be ready for the next strum)
        
        this.hand.addRotationX('palm', new KeyFrame(touch_t[1], palm_touch_x, pull_animation_type));
        // contract hand to pull string 1
        this.hand.addRotationX('palm', new KeyFrame(pulled_t[1], palm_pulled_x, release_animation_type));
        // relax hand to release string 1 (move the palm back)
        this.hand.addRotationX('palm', new KeyFrame(released_t[1], palm_released_x));
        // contract hand (move palm forward to be ready for the next strum)
        
        this.hand.addRotationX('palm', new KeyFrame(touch_t[2], palm_touch_x, pull_animation_type));
        // contract hand to pull string 2
        this.hand.addRotationX('palm', new KeyFrame(pulled_t[2], palm_pulled_x, release_animation_type));
        // relax hand to release string 2 (move the palm back)
        this.hand.addRotationX('palm', new KeyFrame(released_t[2], palm_released_x));


        let index_touch_x = [-30, -20, -40];
        // let index_pulled_x = [-30, -80, 10];
        let index_pulled_x = [-30, -80, -10];
        let index_released_x = [-20, -50, -10];
        
        
        this.hand.addRotationX('index', new KeyFrame(touch_t[0], index_touch_x, pull_animation_type));
        // contract finger, move to pull string 0 (this one joint might not contract though, but here is the moment of pulling the string)
        this.hand.addRotationX('index', new KeyFrame(pulled_t[0], index_pulled_x, release_animation_type));
        // relax finger, move to release string 0 (should be a faster movement I think)
        this.hand.addRotationX('index', new KeyFrame(touch_t[1], index_touch_x, pull_animation_type));
        // contract finger, move to pull string 1
        this.hand.addRotationX('index', new KeyFrame(pulled_t[1], index_pulled_x, release_animation_type));
        // relax finger, move to release string 1
        this.hand.addRotationX('index', new KeyFrame(touch_t[2], index_touch_x, pull_animation_type));
        // contract finger, move to pull string 2
        this.hand.addRotationX('index', new KeyFrame(pulled_t[2], index_pulled_x, release_animation_type));
        // relax finger, move to release string 2
        this.hand.addRotationX('index', new KeyFrame(released_t[2], index_released_x));

        // animating arm rotation

        this.hand.changeRotationMode('arm', 'XZY');
        this.hand.addRotation('arm', new KeyFrame(touch_t[0], [-80, -80, 0]));
        this.hand.addRotation('arm', new KeyFrame(pulled_t[0], [-80, -80, 0], 'easeOut'));
        this.hand.addRotation('arm', new KeyFrame(released_t[0]+3, [-80, -80, 10]));

        this.hand.addRotation('arm', new KeyFrame(touch_t[1], [-80, -80, 0]));
        this.hand.addRotation('arm', new KeyFrame(pulled_t[1], [-80, -80, 0], 'easeOut'));
        this.hand.addRotation('arm', new KeyFrame(released_t[1]+3, [-80, -80, 10]));

        this.hand.addRotation('arm', new KeyFrame(touch_t[2], [-80, -80, 0]));
        this.hand.addRotation('arm', new KeyFrame(pulled_t[2], [-80, -80, 0], 'easeOut'));
        this.hand.addRotation('arm', new KeyFrame(released_t[2]+3, [-80, -80, 10]));




        // animating Hand Translation
        let hand_translate_x = 130; let hand_translate_y = -50;
        let hand_translate_z_center = -850+15; // z we need to translate for the hand to be able to touch the middle string
        this.hand_translate_kf_list.push(new KeyFrame(touch_t[0], [hand_translate_x, hand_translate_y, hand_translate_z_center + this.string_offset], 'easeInOut'));
        this.hand_translate_kf_list.push(new KeyFrame(pulled_t[0], [hand_translate_x, hand_translate_y, hand_translate_z_center + this.string_offset], 'easeInOut'));
        // move from string 0 to string 1 (z-=this.string_offset)
        this.hand_translate_kf_list.push(new KeyFrame(touch_t[1], [hand_translate_x, hand_translate_y, hand_translate_z_center]));
        // wait in string 1
        this.hand_translate_kf_list.push(new KeyFrame(pulled_t[1], [hand_translate_x, hand_translate_y, hand_translate_z_center]));
        // move from string 1 to string 2 (z-=this.string_offset)
        this.hand_translate_kf_list.push(new KeyFrame(touch_t[2], [hand_translate_x, hand_translate_y, hand_translate_z_center - this.string_offset ]));
        this.hand_translate_kf_list.push(new KeyFrame(pulled_t[2], [hand_translate_x, hand_translate_y, hand_translate_z_center - this.string_offset ], 'easeOut'));
        // this.hand_translate_kf_list.push(new KeyFrame(290, [hand_translate_x, hand_translate_y, hand_translate_z_center - this.string_offset ]));
        this.hand_translate_kf_list.push(new KeyFrame(released_t[2]+string_to_string_time, [hand_translate_x, hand_translate_y, hand_translate_z_center - 2*this.string_offset + 20 ]));



        
        // Animating Control Points
        let control_point_move = 100; // how much the control point moves to the right when strummed (to simulate the touch)

        this.string_control_points_kf_list[0].push(new KeyFrame(touch_t[0], [0, 0, this.string_offset], pull_animation_type));
        // move control point to the right (to simulate the touch)
        this.string_control_points_kf_list[0].push(new KeyFrame(pulled_t[0], [0, 0, this.string_offset - control_point_move]));

        this.string_control_points_kf_list[1].push(new KeyFrame(touch_t[1], [0, 0, 0], pull_animation_type));
        // move control point to the right (to simulate the touch)
        this.string_control_points_kf_list[1].push(new KeyFrame(pulled_t[1], [0, 0, -control_point_move]));

        this.string_control_points_kf_list[2].push(new KeyFrame(touch_t[2], [0, 0, -this.string_offset], pull_animation_type));
        // move control point to the right (to simulate the touch)
        this.string_control_points_kf_list[2].push(new KeyFrame(pulled_t[2], [0, 0, -this.string_offset - control_point_move]));

        // this part of the control points is super confusing, but I basically made a decaying oscillation movement for each string 
        //      at their right moment in time, alternating manually between the sides with keyframes
        let control_point_interval = 2; let string_offsets_list = [this.string_offset, 0, -this.string_offset];
        let delay_after_pulled_t = 2; // how many frames after the pulled_t the string starts going back (as the hand releases the string)
        let elastic_factor = 1; let decay_factor = 0.7;
        let string_iterations = 5; // how many times the string will go back and forth before stabilizing
        
        for (let s = 0; s < 3; s++) { // one for each string
            for (let i = 0; i <= string_iterations; i++) { // decreases the control point distance from the middle every 'control_point_interval' frames and alternates the side
                if (i == 0) { // the start of the string going back (I did manually so it looks good with how the index finger releases)
                    this.string_control_points_kf_list[s].push(new KeyFrame(pulled_t[s]+delay_after_pulled_t, [0, 0, string_offsets_list[s]-control_point_move+10]));
                } 
                else if (i == string_iterations) { // the end of the string going back (stabilized in the original position)
                    this.string_control_points_kf_list[s].push(new KeyFrame(pulled_t[s]+delay_after_pulled_t+control_point_interval*(i+1), [0, 0, string_offsets_list[s]]));
                } else {
                    this.string_control_points_kf_list[s].push(
                        new KeyFrame(
                            pulled_t[s]+delay_after_pulled_t+control_point_interval*i, 
                            [
                                0, 
                                0, 
                                string_offsets_list[s] + Math.pow(-1, i+1)*control_point_move*Math.pow(decay_factor, i)*elastic_factor
                            ]
                        )
                    );
                }
            }
        }


        // animating the camera
        // this.camera_kf_list.push(new KeyFrame(215, [1800, -344, 0, 0, 0, 0], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(290, [1800, 344, 0, 0, 0, 0], 'easeInOut'));
        // this.camera_kf_list.push(new KeyFrame(215, [1800, -344, 300, 0, 0, 300], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(290, [1800, -344, -300, 0, 0, -300], 'easeInOut'));
        
        // this.camera_kf_list.push(new KeyFrame(215, [1988, 0, 0, 0, 0, 0], 'linear'));
        this.camera_kf_list.push(new KeyFrame(215, [1800, -200, 300, 0, 0, 300], 'linear'));
        this.camera_kf_list.push(new KeyFrame(290, [1800, 200, -100, 0, 0, -100], 'easeInOut'));
        

        
    }

    display(time_current) {

        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        // camera(1292, 0, 0, 0, 0, 0);
        // camera(2018, 0, 0, 0, 0, 0);

        // Display objects ----------------------



        push();
            // adding a bit of vertical noise to the hand translation to make it look more natural
            let animate_hand_translate = animate_kfs(time_current, this.hand_translate_kf_list);
            let times = createVector(0, time_current, 0);
            let amplitude = [0,200,0]; let frequency = [0,0.3,0];

            animate_hand_translate = noise_func_to_value(animate_hand_translate, times, amplitude, frequency);
            translate(animate_hand_translate);
            scale(1, -1, 1);
            this.hand.display(time_current);
        pop();

        // strings

        
        push();
            stroke(191);
            strokeWeight(7);
            noFill();
            curveTightness(10);

            // string 0
            let control_point_0 = animate_kfs(time_current, this.string_control_points_kf_list[0]);
            beginShape(); 
                curveVertex(0, -this.string_height - 100, this.string_offset); // Extrapolated start control
                curveVertex(0, -this.string_height, this.string_offset);       // Actual start anchor
                curveVertex(control_point_0.x, control_point_0.y, control_point_0.z); // Finger touch
                curveVertex(0, this.string_height, this.string_offset);        // Actual end anchor
                curveVertex(0, this.string_height + 100, this.string_offset);  // Extrapolated end control
            endShape();

            // string 1
            let control_point_1 = animate_kfs(time_current, this.string_control_points_kf_list[1]);
            beginShape();
                curveVertex(0, -this.string_height - 100, 0); 
                curveVertex(0, -this.string_height, 0); 
                curveVertex(control_point_1.x, control_point_1.y, control_point_1.z);
                curveVertex(0, this.string_height, 0); 
                curveVertex(0, this.string_height + 100, 0); 
            endShape();

            // string 2
            let control_point_2 = animate_kfs(time_current, this.string_control_points_kf_list[2]);
            beginShape();
                curveVertex(0, -this.string_height - 100, -this.string_offset); 
                curveVertex(0, -this.string_height, -this.string_offset); 
                curveVertex(control_point_2.x, control_point_2.y, control_point_2.z);
                curveVertex(0, this.string_height, -this.string_offset); 
                curveVertex(0, this.string_height + 100, -this.string_offset); 
            endShape();
        pop();

    }

}

// --- End of scenes/Scene_03_Strumming.js ---


// --- Start of scenes/Scene_04_Spin.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_04_Spin extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 290, 425 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        // this.hand = new Hand();
        this.camera_kf_list = [];
        this.camera_spin_kf_list = [];

        // start,,,,,end(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)

        // set the puppet to a more natural pose
        this.puppet.changeRotationMode('shoulder_r', 'ZYX');
        this.puppet.changeRotationMode('shoulder_l', 'ZYX');
        this.puppet.addRotation('shoulder_r', new KeyFrame(0, [-10,0,-20]));
        this.puppet.addRotation('shoulder_l', new KeyFrame(0, [-10,0,20]));
        this.puppet.addRotation('elbow_r', new KeyFrame(0, [20,0,0]));
        this.puppet.addRotation('elbow_l', new KeyFrame(0, [20,0,0]));

        // making the procedural animations for the head spin in a circle
        this.puppet.addProcedural(
            'neck', 
            (time_current, [x, y, z]) => { 
                let speed = 2.5; let strength = 40; 
                let t_start = 290 / 24; let t_end = 420 / 24;
                let a = 1/(t_start-t_end); let b = -a*t_end;
                let decreasing_factor = max(a*time_current+b,0);
                let new_x = cos(time_current*speed)*strength*decreasing_factor;
                let new_z = sin(time_current*speed)*strength*decreasing_factor;
                return [new_x, y, new_z];
            }
        );
        this.puppet.addProcedural(
            'hips', 
            (time_current, [x, y, z]) => { 
                let speed = 2.5; let strength = 5; 
                let t_start = 290 / 24; let t_end = 427 / 24;
                let a = 1/(t_start-t_end); let b = -a*t_end;
                let decreasing_factor = max(a*time_current+b,0);
                let new_x = cos(time_current*speed)*strength*decreasing_factor;
                let new_z = sin(time_current*speed)*strength*decreasing_factor;
                return [new_x, y, new_z];
            }
        );


        // animating the camera
        this.camera_kf_list.push(new KeyFrame(290, [0, 0, 1300, 0, 0, 0], '0, 44, 2351, 0, 0, 0'));
        this.camera_kf_list.push(new KeyFrame(425, [0, 0, 1000, 0, 0, 0], '0, 44, 2351, 0, 0, 0'));

        this.camera_spin_kf_list.push(new KeyFrame(290, 20, 'easeOut'));
        this.camera_spin_kf_list.push(new KeyFrame(420, 0));
        // this.camera_spin_kf_list.push(new KeyFrame(290, 20, 'easeInOut'));
        // this.camera_spin_kf_list.push(new KeyFrame(420, -5));



        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        
    }

    display(time_current) {
        
        
        // Camera ----------------------

        push();
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list),0,1,0);
        }
        _renderer._curCamera.roll(radians(animate_kfs(time_current, this.camera_spin_kf_list)));
        // Display objects ----------------------
        
        translate(0, 0, 0);
        this.puppet.display(time_current);
        pop();
    }

}

// --- End of scenes/Scene_04_Spin.js ---


// --- Start of scenes/Scene_05_Theater.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_05_Theater extends Scene {
    
    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 425, 596 
        
        // Initialize necessary objects and lists
        this.puppet = new Puppet(); 
        
        // Setting up visibility keyframes for the head
        this.puppet.addVisibility('head', new KeyFrame(0, 0));
        this.puppet.addVisibility('head', new KeyFrame(-0+505, 1));
        
        this.stage = new Stage();
        this.camera1_kf_list = [];
        this.camera2_kf_list = [];
        this.camera_shot_list = [];

        // 25,39,54,67,79, (head: down, left, down, right, down)
        // 93,18,25, (curtains: open, closing, closed)
        // 55,63,70,79 (opening cte kfs)
        // 96 (end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        // posing the puppets arms
        this.puppet.changeRotationMode('shoulder_r', 'ZYX');
        this.puppet.changeRotationMode('shoulder_l', 'ZYX');
        this.puppet.addRotation('shoulder_r', new KeyFrame(0, [0,0,-90], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(0, [0,0,90], 'constant'));
        
        // this.camera1_kf_list.push(new KeyFrame(420, [-1, -796, -134, -1, -711, -29], 'constant')); // wait
        this.camera1_kf_list.push(new KeyFrame(415, [-1, -796, -134, -1, -711, -29], 'easeInOut'));
        this.camera1_kf_list.push(new KeyFrame(432, [-112, -767, -82, -1, -711, -29], 'constant')); // wait
        this.camera1_kf_list.push(new KeyFrame(435, [-112, -767, -82, -1, -711, -29], 'easeInOut'));
        this.camera1_kf_list.push(new KeyFrame(470, [112, -767, -82, 1, -711, -29], 'constant')); // wait
        this.camera1_kf_list.push(new KeyFrame(475, [112, -767, -82, 1, -711, -29], 'easeInOut'));
        this.camera1_kf_list.push(new KeyFrame(500, [-1, -796, -134, -1, -711, -29])); 
        
        this.camera2_kf_list.push(new KeyFrame(475, [0, -752, 3734-1000, 0, -699, 62], 'easeOut')); // 
        this.camera2_kf_list.push(new KeyFrame(554, [0, -752, 3734+200, 0, -699, 62+200], 'constant'));


        


        this.puppet.changeRotationMode('neck', 'YXZ');
        this.puppet.addRotationX('neck', new KeyFrame(5-15+440+7+3+25+10+5+25, -30, 'easeInOut'));
        this.puppet.addRotationX('neck', new KeyFrame(5-15+440+7+3+25+10+5+25+5+20-5, -0));
        // this.puppet.addRotationY('neck', new KeyFrame(-15+440+7+3+25+10+5, -90, 'easeOut'));
        // this.puppet.addRotationY('neck', new KeyFrame(5-15+440+7+3+25+10+5+25, 0, 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));


        this.stage.addTranslation('right_curtains', new KeyFrame(505, [1000,0,0],'easeInOut'));
        this.stage.addTranslation('right_curtains', new KeyFrame(535, [0,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(505, [1000,0,0],'easeInOut'));
        this.stage.addTranslation('left_curtains', new KeyFrame(535, [0,0,0], 'constant'));
        
        // frame by frame part (4 frames -> 555,563,570,579)

        this.puppet.resetAllRotations(535);

        let camera_zoom = 0;
        // frame 555
        this.camera2_kf_list.push(new KeyFrame(555, [0, -752, 3934-camera_zoom, 0, -699, 262-camera_zoom], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(0, [0,0,0], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(555, [100,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(555, [100,0,0], 'constant'));
        // this.stage.addTranslation('right_curtains', new KeyFrame(555, [400,0,0], 'constant'));
        // this.stage.addTranslation('left_curtains', new KeyFrame(555, [400,0,0], 'constant'));
        
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(555, 'YXZ'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(555, 'YXZ'));
        this.puppet.addRotation('neck', new KeyFrame(555, [20,0,-5], 'constant'));
        this.puppet.addRotation('hips', new KeyFrame(555, [0,0,5], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(555, [90-10,0,10], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(555, [90-0,0,-5], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(555, [0,0,floor_depth/2-400], 'constant'));
        
        
        this.puppet.addRotation('hips_leg_l', new KeyFrame(555, [-20,-20,5], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(555, [20,0,-5], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(555, [-20,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(555, [-20,0,0], 'constant'));
        
        
        
        
        // frame 563
        this.camera2_kf_list.push(new KeyFrame(563, [0, -752, 3934-camera_zoom*2, 0, -699, 262-camera_zoom*2], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(563, [300,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(563, [200,0,0], 'constant'));
        // this.stage.addTranslation('right_curtains', new KeyFrame(563, [900,0,0], 'constant'));
        // this.stage.addTranslation('left_curtains', new KeyFrame(563, [900,0,0], 'constant'));
        
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(563, 'YZX'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(563, 'YZX'));
        this.puppet.addRotation('neck', new KeyFrame(563, [20,0,-5], 'constant'));
        this.puppet.addRotation('hips', new KeyFrame(563, [-20,0,0], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(563, [-30,-90,-90], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(563, [-10,90,120], 'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(563, [20,0,0], 'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(563, [20,0,0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(563, [0,0,floor_depth/2-320], 'constant'));
        
        
        this.puppet.addRotation('hips_leg_l', new KeyFrame(563, [60,-10,5], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(563, [0,0,-5], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(563, [-90,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(563, [-20,0,0], 'constant'));
        
        
        
        // frame 570
        this.camera2_kf_list.push(new KeyFrame(570, [0, -752, 3934-camera_zoom*3, 0, -699, 262-camera_zoom*3], 'constant'));
        // this.camera2_kf_list.push(new KeyFrame(570, [-218, -695, 3728, 41, -700, 65], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(570, [400,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(570, [550,0,0], 'constant'));
        // this.stage.addTranslation('right_curtains', new KeyFrame(570, [1000,0,0], 'constant'));
        // this.stage.addTranslation('left_curtains', new KeyFrame(570, [1000,0,0], 'constant'));
        
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(570, 'YZX'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(570, 'YZX'));
        this.puppet.addRotation('neck', new KeyFrame(570, [30,0,0], 'constant'));
        this.puppet.addRotationMode('hips', new KeyFrame(570, 'YZX'));
        this.puppet.addRotation('hips', new KeyFrame(570, [-30,-5,0], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(570, [-100,-120,-90], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(570, [-50+(10),90,130], 'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(570, [40,0,0], 'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(570, [40+(0*2),0,0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(570, [-70,-30,floor_depth/2-100], 'constant'));
        
        
        this.puppet.addRotation('hips_leg_l', new KeyFrame(570, [80,0,10], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(570, [-20,0,-15], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(570, [-50,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(570, [-20,0,0], 'constant'));
        
        
        
        
        
        
        
        
        // frame 582 (final pose)
        this.camera2_kf_list.push(new KeyFrame(582, [0-0, -752, 3934-camera_zoom*4, 0-0, -699, 262-camera_zoom*4], 'constant'));
        // this.camera2_kf_list.push(new KeyFrame(582, [-308, -855, 3723, 37, -552, 79], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(582, [550,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(582, [750,0,-80], 'constant'));
        
        this.puppet.addRotation('full_body', new KeyFrame(582, [10,5,0], 'constant'));
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(582, 'YZX'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(582, 'YZX'));
        this.puppet.addRotation('neck', new KeyFrame(582, [10,0,0], 'constant'));
        this.puppet.addRotationMode('hips', new KeyFrame(582, 'YZX'));
        this.puppet.addRotation('hips', new KeyFrame(582, [-10,-15,0], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(582, [-140,-120,-120], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(582, [-140,90,120], 'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(582, [0,0,0], 'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(582, [40,0,0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(582, [-100,-90,floor_depth/2+200], 'constant'));
        
        // this.puppet.addRotationMode('hips_leg_l', new KeyFrame(582, 'YZX'));
        this.puppet.addRotation('hips_leg_l', new KeyFrame(582, [90,0,20], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(582, [-50,0,-15], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(582, [-30,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(582, [-20,0,0], 'constant'));
        





        this.camera_shot_list.push( new Shot (0, this.camera1_kf_list)); // adding first camera starting from 0 (from the start)
        this.camera_shot_list.push( new Shot (-0+505, this.camera2_kf_list)); // adding second camera starting in the middle of the head turn
    }

    display(time_current) {

        let frame_current = time_current * keyframe_version;
        
        // Camera ----------------------

        push();
        // camera(-1, -796, -134, -1, -711, -29);
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_shots(time_current, this.camera_shot_list));
        }

        let noise_start = 410/keyframe_version; let noise_end = (-0+505)/keyframe_version; // only apply noise to the camera in this time window (when we are in the puppets vision)
        let amplitudes = [0.1*2, 0.02*2, 0.05*2];
        amplitudes = amplitudes.map(x => x*stepDouble(time_current, noise_start,noise_end)); // limits noise to where I want it to apply to
        let frequencies = [0.5, 0.5, 0.35];
        let times = [time_current+0, time_current+1500+0, time_current+2000+0];
        let noise_for_cam = noise_func(times, amplitudes, frequencies);
        
        // noise_for_cam = noise_for_cam.map(x => x);

        _renderer._curCamera.pan(noise_for_cam[0]); // left right
        _renderer._curCamera.tilt(noise_for_cam[1]); // up down
        _renderer._curCamera.roll(noise_for_cam[2]); // rotate

        translate(0,0,20);
        // Display objects ----------------------
        
        let string_start_r; let string_start_l;
        push();
        translate(0, -570, 0);
        this.puppet.display(time_current);
        string_start_r = this.puppet.global_string_pos_lower_arm_r;
        string_start_l = this.puppet.global_string_pos_lower_arm_l;
        pop();
        
        push();
        this.stage.display(time_current);
        pop();
        
        push();
            translate(0,0,-20);
            strokeWeight(10);
            noFill()
            stroke(191);
            // stroke(255, 0, 0);
            if (frame_current < 535) {
                line(string_start_r.x, string_start_r.y, string_start_r.z, 1660*4, -500, 0);
                line(string_start_l.x, string_start_l.y, string_start_l.z, -1660*4, -500, 0);
            } else {}
        pop();

        pop();
    }

}

// --- End of scenes/Scene_05_Theater.js ---


// --- Start of scenes/Scene_06_Around.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_06_Around extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 96, 80 

        // Initialize necessary objects and lists
        this.puppet = new Puppet(); this.puppet_opacity_kf_list = [];
        this.hand = new Hand(); this.hand_opacity_kf_list = [];
        this.camera_kf_list = [];
        this.puppet_layer = createFramebuffer(); // buffer for puppet fading
        this.hand_layer = createFramebuffer(); // buffer to display hand on top of everything and to fade out

        this.circle_radius = 350;
        this.spin_speed = 2.5;
        // this.circle_radius = 150;

        // 96,35,80(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        
        // setting the hand positions
        this.hand.addRotation('pinky0', new KeyFrame(215, [-60, 0, 30]));
        this.hand.addRotation('pinky1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('pinky2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('ring0', new KeyFrame(215, [-50, 0, 0]));
        this.hand.addRotation('ring1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('ring2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('middle0', new KeyFrame(215, [-60, 0, 0]));
        this.hand.addRotation('middle1', new KeyFrame(215, [-100, 0, 0]));
        this.hand.addRotation('middle2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('index0', new KeyFrame(215, [-0,0,-5]));
        this.hand.addRotation('index1', new KeyFrame(215, [-0,0,0]));
        this.hand.addRotation('index2', new KeyFrame(215, [0,0,0]));

        this.hand.addRotationX('thumb0', new KeyFrame(48, -20));
        this.hand.addRotationX('thumb1', new KeyFrame(48, -70));
        this.hand.addRotationX('thumb2', new KeyFrame(48, -90));
        
        this.hand.addRotation('arm', new KeyFrame(48, [-160,0,0]));

        // setting puppet rotations
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -20));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(0, 20));
        this.puppet.addRotationY('full_body', new KeyFrame(0, 90));
        this.puppet_opacity_kf_list.push(new KeyFrame(596, 0));
        this.puppet_opacity_kf_list.push(new KeyFrame(670, 255));

        // hand rotations
        this.hand.addProcedural( // palm rotation
            'palm', 
            (time_current, [x, y, z]) => { 
                let speed = this.spin_speed; let strength = 40; let phase = PI/2;
                let new_x = cos(time_current*speed+phase)*strength;
                let new_z = sin(time_current*speed+phase)*strength/1.1;

                // let amplitudes = [0,0,0];
                // let frequencies = [0.5, 0.5, 0.5];
                // let times = [time_current, time_current+1500, time_current+2000];
                // let xyz_list = noise_func(times, amplitudes, frequencies);
                // return [new_x+xyz_list[0], y, new_z+xyz_list[2]];


                return [new_x, y, new_z];
            }
        );
        this.hand.addProcedural( // arm noise rotations
            'arm', 
            (time_current, [x, y, z]) => { 
                let amplitudes = [3,0,3];
                let frequencies = [0.7, 0, 0.7];
                let times = [time_current, 0, time_current+1500];
                let xyz_list = noise_func(times, amplitudes, frequencies);
                return [x+xyz_list[0], y, z+xyz_list[2]];
            }
        );
        this.hand_opacity_kf_list.push(new KeyFrame(596, 255));
        this.hand_opacity_kf_list.push(new KeyFrame(680, 0));

        // puppet rotations around the circle
        

        // camera movement
        this.camera_kf_list.push(new KeyFrame(596, [121, -647, 312, 73, 732, 335], 'easeInOut'));
        this.camera_kf_list.push(new KeyFrame(680-0, [1321, 2054+0, 464, 13, 792+0, 325], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(680, [1688, 996, -32, 369, 980, 225], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(680, [96, 84, 324, 73, 732, 335], 'linear'));

    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        
        // Display objects ----------------------
        

        push();
            // translate(100,1500,300)
            // let eye_point = createVector(121, -647, 312);
            // let looked_at_point = createVector(73, 732, 335);
            let eye_point = createVector(60, -627, 330);
            let looked_at_point = createVector(77, 732, 322);
            let eye_vector = p5.Vector.sub(looked_at_point, eye_point);
            eye_vector.normalize(); eye_vector.mult(1900);
            let translate_point = p5.Vector.add(eye_point, eye_vector);
            translate(translate_point)
            rotateX(PI/2);
            push()
                noFill();
                stroke(191);
                strokeWeight(10);
                circle(0,0,this.circle_radius*2);
            pop();
            noStroke();
            // plane(1000);
        pop();

        push();
        // this.hand.display(time_current);
        pop();

        push();
            this.puppet_layer.begin();
                clear(); // erase the puppet from last frame
                if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
                camera(...animate_kfs(time_current, this.camera_kf_list));
                }
                
                translate(translate_point);
                let translate_rotation = (time,radius) => {
                    let speed = -this.spin_speed; let phase = 0;
                    let new_x = cos(time*speed+phase)*radius;
                    let new_z = sin(time*speed+phase)*radius;
                    return [new_x, 0, new_z];
                };
                
                translate(...translate_rotation(time_current, this.circle_radius));
                scale(0.2);
                translate(0,-540,0);
                this.puppet.display(time_current);
            this.puppet_layer.end();
            
            // let current_puppet_alpha = 255;
            let current_puppet_alpha = animate_kfs(time_current, this.puppet_opacity_kf_list);
            // if (this.puppet_opacity_kf_list.length > 0) {
            //     current_puppet_alpha = animate_kfs(time_current, this.puppet_opacity_kf_list);
            // }

            // reset model matrix to use the default camera (z=800) to display the puppet
            resetMatrix();
            if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
            camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
            }

            // applying opacity and draw the image of the puppet
            tint(255, current_puppet_alpha); 
            imageMode(CENTER);
            image(this.puppet_layer, 0, 0);
        pop();

        push();
             
            this.hand_layer.begin();
                clear(); // erase the hand from last frame
                // apply the exact same camera to the layer so it captures the 3D perspective
                if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
                camera(...animate_kfs(time_current, this.camera_kf_list));
                }
                this.hand.display(time_current);
            this.hand_layer.end();

            // Calculate your alpha using your keyframes (0 to 255)
            // let current_hand_alpha = animate_kfs(time_current, this.hand_opacity_kf_list); 
            let current_hand_alpha = 255; 
            
            // reset model matrix to use the default camera (z=800) to display the hand
            resetMatrix();
            if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
            camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
            }

            // applying opacity and draw the image of the hand
            tint(255, current_hand_alpha); 
            imageMode(CENTER);
            image(this.hand_layer, 0, 0);
        pop();

        
    }

}

// --- End of scenes/Scene_06_Around.js ---


// --- Start of scenes/Scene_07_Pulled.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_07_Pulled extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 680, 762 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        // this.camera_kf_list = [];
        this.ang_cam_kf_list = [];
        this.string_points = [[],[],[]]; // here i have the start (neck), control point(s) and end (above)
        this.control_point1_kf_list = [];
        this.control_point2_kf_list = [];
        

        // 680,,,,,762(end)

        // this.camera_kf_list.push(new KeyFrame(680, [1985, -450, 1979, 23, -389, -34], 'constant'));
        // let ang_cam = radians(45); 
        this.ang_cam_kf_list.push(new KeyFrame(680, radians(45-15), 'linear'));
        this.ang_cam_kf_list.push(new KeyFrame(762, radians(90+45-15), 'linear'));
        this.raio = 2000; this.altura = -600; this.under_altura = 1000;
        // camera(cos(ang_cam)*raio, 0+altura+1300, sin(ang_cam)*raio,0,altura,0);
        // this.camera_kf_list.push(new KeyFrame(680, [1985, -450, 1979, 23, -389, -34], 'constant'));
        
        
        // puppet initial positions
        this.puppet.addRotation('hips', new KeyFrame(680, [-40,0,0]));
        // this.puppet.addRotation('neck', new KeyFrame(680, [-40,0,0]));
        this.puppet.addRotation('shoulder_r', new KeyFrame(680, [40,0,-10]));
        this.puppet.addRotation('elbow_r', new KeyFrame(680, [0,0,10]));
        this.puppet.addRotation('shoulder_l', new KeyFrame(680, [40,0,10]));
        this.puppet.addRotation('elbow_l', new KeyFrame(680, [0,0,-10]));
        this.puppet.addRotation('ankle_r', new KeyFrame(680, [-58,0,0]));
        this.puppet.addRotation('ankle_l', new KeyFrame(680, [-58,0,0]));

        let frames_to_pull = [707+8, 720+8, 733+8]; let pull_trans = -300; let pull_back_trans = -100;
        for (let i = 0; i < frames_to_pull.length; i++){
            let test_pull_time1 = frames_to_pull[i];
            let test_pull_time2 = test_pull_time1 + 5;
            let test_top_time1 = test_pull_time2 + 3;
            let test_back_time1 = test_top_time1 + 3;
            
            let pull_trans_now = pull_trans * i;
            let pull_trans_next = pull_trans * (i+1);

            // PUPPET TRANSLATION
            this.puppet.addTranslation('full_body', new KeyFrame(test_pull_time1, [0,pull_trans_now,0], 'easeOut'))
            this.puppet.addTranslation('full_body', new KeyFrame(test_top_time1, [0,pull_trans_next+pull_back_trans,0], 'easeIn'))
            this.puppet.addTranslation('full_body', new KeyFrame(test_back_time1, [0,pull_trans_next,0], 'linear'))

            // CONTROL POINTS
            this.control_point1_kf_list.push(new KeyFrame(test_pull_time1, [0,pull_trans_now,0], 'easeOut')); // start 
            // this.control_point1_kf_list.push(new KeyFrame(test_pull_time2, [0,0,0], 'easeOut')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_top_time1, [50,pull_trans_next,0], 'easeIn')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_back_time1, [0,pull_trans_next,0], 'linear')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_back_time1+1, [-20,pull_trans_next,0], 'linear')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_back_time1+2, [0,pull_trans_next,0], 'linear')); // start 
            
            this.control_point2_kf_list.push(new KeyFrame(test_pull_time1, [0,pull_trans_now,0], 'easeOut')); // start 
            // this.control_point2_kf_list.push(new KeyFrame(test_pull_time2, [0,0,0], 'easeOut')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_top_time1, [-50,pull_trans_next,0], 'easeIn')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_back_time1, [0,pull_trans_next,0], 'linear')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_back_time1+1, [20,pull_trans_next,0], 'linear')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_back_time1+2, [0,pull_trans_next,0], 'linear')); // start 

            // PUPPET ROTATIONS

            // neck swing
            this.puppet.addRotation('neck', new KeyFrame(test_pull_time1, [-40,0,0], 'easeIn'));
            this.puppet.addRotation('neck', new KeyFrame(test_pull_time1+3, [-60,0,0], 'linear'));
            this.puppet.addRotation('neck', new KeyFrame(test_top_time1, [-60,0,0], 'easeInOut'));
            this.puppet.addRotation('neck', new KeyFrame(test_back_time1, [-30,0,0], 'easeInOut'));
            this.puppet.addRotation('neck', new KeyFrame(test_back_time1+5, [-40,0,0], 'easeInOut'));
            
            // arms swing
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_pull_time1, [40,0,-10]));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_pull_time1+3, [40,0,-10], 'linear'));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_top_time1, [40,0,-15], 'easeOut'));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_back_time1, [40,0,-15], 'easeInOut'));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_back_time1+7, [40,0,-10], 'easeInOut'));

            this.puppet.addRotation('elbow_r', new KeyFrame(test_pull_time1, [0,0,10]));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_pull_time1+3, [0,0,10], 'linear'));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_top_time1, [0,0,10], 'easeInOut'));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_back_time1, [0,0,10], 'easeInOut'));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_back_time1+5, [0,0,10], 'easeInOut'));
            
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_pull_time1, [40,0,10]));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_pull_time1+3, [40,0,10], 'linear'));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_top_time1, [40,0,15], 'easeOut'));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_back_time1, [40,0,15], 'easeInOut'));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_back_time1+7, [40,0,10], 'easeInOut'));

            this.puppet.addRotation('elbow_l', new KeyFrame(test_pull_time1, [0,0,-10]));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_pull_time1+3, [0,0,-10], 'linear'));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_top_time1, [0,0,-10], 'easeInOut'));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_back_time1, [0,0,-10], 'easeInOut'));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_back_time1+5, [0,0,-10], 'easeInOut'));


            // legs swing
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_top_time1, [5,0,-5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_back_time1-2, [5,0,-5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
            
            this.puppet.addRotation('knee_r', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('knee_r', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('knee_r', new KeyFrame(test_top_time1, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_r', new KeyFrame(test_back_time1-2, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_r', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
            
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_top_time1, [5,0,5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_back_time1-2, [5,0,5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
            
            this.puppet.addRotation('knee_l', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('knee_l', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('knee_l', new KeyFrame(test_top_time1, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_l', new KeyFrame(test_back_time1-2, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_l', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
        }


        // this.puppet.addRotation('neck', new KeyFrame(test_pull_time1, [-40,0,0], 'easeIn'));
        // this.puppet.addRotation('neck', new KeyFrame(test_pull_time1+3, [-60,0,0], 'linear'));
        // this.puppet.addRotation('neck', new KeyFrame(test_top_time1, [-60,0,0], 'easeInOut'));
        // this.puppet.addRotation('neck', new KeyFrame(test_back_time1, [-30,0,0], 'easeInOut'));
        // this.puppet.addRotation('neck', new KeyFrame(test_back_time1+5, [-40,0,0], 'easeInOut'));




        // 'full_body', [0.0, 0.0, 0.0]
        // 'hips', [-40.0, 0.0, 0.0]
        // 'neck', [-38.5, 0.0, 0.0]
        // 'shoulder_r', [40.0, 0.0, -10.0]
        // 'elbow_r', [0.0, 0.0, 10.0]
        // 'shoulder_l', [40.0, 0.0, 10.0]
        // 'elbow_l', [0.0, 0.0, -10.0]
        // 'hip_leg_r', [0.0, 0.0, 0.0]
        // 'knee_r', [0.0, 0.0, 0.0]
        // 'ankle_r', [-58, 0.0, 0.0]
        // 'hip_leg_l', [0.0, 0.0, 0.0]
        // 'knee_l', [0.0, 0.0, 0.0]
        // 'ankle_l', [-58, 0.0, 0.0]

        
    }

    display(time_current) {
        
        // Camera ----------------------
        // camera(...animate_kfs(time_current, this.camera_kf_list));
        let ang_cam = animate_kfs(time_current, this.ang_cam_kf_list);
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(cos(ang_cam)*this.raio, 0+this.altura+this.under_altura, sin(ang_cam)*this.raio,0,this.altura,0);
        }
        
        // Display objects ----------------------
        push();
            // let neck_offset = this.puppet.getNeckOffset(time_current); // used to make the neck be at 0,0,0
            // console.log("neck_offset: ", neck_offset);
            // translate(-neck_offset.x, -neck_offset.y, -neck_offset.z);
            let neck_offset = [0,51.47022247314453,141.4132843017578];
            translate(-neck_offset[0], -neck_offset[1], -neck_offset[2]); // what I got from getNeckOffset * (-1)
            
            this.puppet.display(time_current);

            
            push();
                this.string_points[0] = this.puppet.global_string_pos_neck; // start point (neck)
                this.string_points[1] = createVector(0,-500,0); // initial control point 1 position (closer to neck)
                let string_point1_offset = animate_kfs(time_current, this.control_point1_kf_list); // offset of control point 1
                this.string_points[1] = p5.Vector.add(this.string_points[1],string_point1_offset); // add the 2 vectors together
                this.string_points[2] = createVector(0,-1200,0); // initial control point 2 position (closer to above)
                let string_point2_offset = animate_kfs(time_current, this.control_point2_kf_list); // offset of control point 2
                this.string_points[2] = p5.Vector.add(this.string_points[2],string_point2_offset); // add the 2 vectors together
                this.string_points[3] = createVector(0,-2000,0); // end point (above)
                
                translate(...neck_offset);
                stroke(191);
                strokeWeight(7);
                noFill();
                curveTightness(5);
                
                beginShape(); // string with catmull-rom
                    curveVertex(this.string_points[0].x,this.string_points[0].y+100,this.string_points[0].z); // Extrapolated start control
                    curveVertex(this.string_points[0].x,this.string_points[0].y,this.string_points[0].z); // Actual start anchor
                    curveVertex(this.string_points[1].x,this.string_points[1].y,this.string_points[1].z); // Control point 1
                    curveVertex(this.string_points[2].x,this.string_points[2].y,this.string_points[2].z); // Control point 2
                    curveVertex(this.string_points[3].x,this.string_points[3].y,this.string_points[3].z); // Actual end anchor
                    curveVertex(this.string_points[3].x,this.string_points[3].y-100,this.string_points[3].z); // Extrapolated end control
                endShape();
            pop();
            
        pop();
    }

}

// --- End of scenes/Scene_07_Pulled.js ---


// --- Start of scenes/Scene_08_Clear.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_08_Clear extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 762, end 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        this.camera_kf_list = [];
        this.string_neck_offset_x_kf_list = [];
        this.camera_kf_list1 = [];
        this.camera_kf_list2 = [];

        // 62,71,81,89,02,11,20,end(end)
        // setting puppet initial positions
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -90));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(0, 90));
        
        // string on the neck change of position
        this.string_neck_offset_x_kf_list.push(new KeyFrame(762, 0, 'constant'));
        this.string_neck_offset_x_kf_list.push(new KeyFrame(820, -20, 'constant'));
        

        // puppet animations
        

        // neck
        this.puppet.addRotation('neck', new KeyFrame(762, [-40,0,0], 'easeOut'));
        this.puppet.addRotation('neck', new KeyFrame(773-3, [-40,-45,0], 'linear'));
        this.puppet.addRotation('neck', new KeyFrame(777, [-40,-45,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(792-6, [-40,45,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(797, [-40,45,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(807, [-40,0,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(811, [-40,0,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(825, [60,0,0], 'easeInOut'));

        this.puppet.addProcedural('hips_leg_r', (time_current, [x,y,z]) => {
            let amplitudes = [10,5,2];
            let frequencies = [0.7,0.5,0.5];
            let times = [time_current+500, time_current+1500, time_current+2500];
            let noise_values = noise_func_to_value([x,y,z], times, amplitudes, frequencies);
            return [noise_values.x, noise_values.y, noise_values.z];
        })
        this.puppet.addProcedural('hips_leg_l', (time_current, [x,y,z]) => {
            let amplitudes = [10,5,2];
            let frequencies = [0.7,0.5,0.5];
            let times = [time_current, time_current+1000, time_current+2000];
            let noise_values = noise_func_to_value([x,y,z], times, amplitudes, frequencies);
            return [noise_values.x, noise_values.y, noise_values.z];
        })
        // 


        // camera
        this.camera_kf_list1.push(new KeyFrame(762, [0, 437+100, 2649, 0, 0+100, -58], 'easeIn', [0,5]));
        this.camera_kf_list1.push(new KeyFrame(820, [0, 437-100, 2649, 0, 0-100, -58], 'constant'));

        this.camera_kf_list2.push(new KeyFrame(820, [100, -2242, 341, -51, 32, -328], 'easeOut'));
        this.camera_kf_list2.push(new KeyFrame(840, [146, -3014, 432, -54, -5, -454], 'constant'));

        this.camera_shot_list = [
            new Shot(0, this.camera_kf_list1),
            new Shot(820, this.camera_kf_list2)
        ];
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_shots(time_current, this.camera_shot_list));
        }
        
        // Display objects ----------------------
        push();
            stroke(191);
            strokeWeight(10);
            this.puppet.display(time_current);
            
            let height_strings = createVector(0,-4000,0);
            let start_string_l = this.puppet.global_string_pos_lower_arm_l;
            let end_string_l = p5.Vector.add(start_string_l,height_strings);
            let start_string_r = this.puppet.global_string_pos_lower_arm_r;
            let end_string_r = p5.Vector.add(start_string_r,height_strings);
            
            let start_string_neck = this.puppet.global_string_pos_neck;
            let end_string_neck = p5.Vector.add(start_string_neck,height_strings);
            let offset_string_neck = [
                animate_kfs(time_current, this.string_neck_offset_x_kf_list),
                0,
                -250
            ];
            

            line(start_string_l.x, start_string_l.y, start_string_l.z, end_string_l.x, end_string_l.y, end_string_l.z);
            line(start_string_r.x, start_string_r.y, start_string_r.z, end_string_r.x, end_string_r.y, end_string_r.z);
            line(
                start_string_neck.x+offset_string_neck[0],
                start_string_neck.y+200,
                start_string_neck.z+offset_string_neck[2], 
                end_string_neck.x-offset_string_neck[0]*5, 
                end_string_neck.y, 
                end_string_neck.z+offset_string_neck[2]
            );

        pop();

        push();
        // this.hand.display(time_current);
        pop();
    }

}

// --- End of scenes/Scene_08_Clear.js ---


// --- Start of scenes/Scene_09_Puppet_to_You.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_09_Puppet_to_You extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 850, 929

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        this.hand = new Hand();
        this.camera_kf_list = [];
        this.camera_kf_list2 = [];

        // start,,,,,end(end)

        this.puppet.addRotationZ('shoulder_l', new KeyFrame(0, 90));
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -90));

        // puppet.addRotationX('neck', new KeyFrame(0, 0, 'linear'));

        // example uses
        this.hand.changeRotationMode('arm', 'ZYX'); // change rotation mode of arm to ZYX (default is XYZ)


        this.hand.addRotationX('palm',  new KeyFrame(0, -10));
        this.hand.addRotationX('arm', new KeyFrame(0, -90-(-10)));

        this.hand.addRotationX('pinky0', new KeyFrame(48, 10, 'linear'));
        this.hand.addRotationX('pinky1', new KeyFrame(48, -20, 'linear'));
        this.hand.addRotationX('pinky2', new KeyFrame(48, -10, 'linear'));
        
        this.hand.addRotationX('ring0', new KeyFrame(48, 5, 'linear'));
        this.hand.addRotationX('ring1', new KeyFrame(48, -20, 'linear'));
        this.hand.addRotationX('ring2', new KeyFrame(48, 0, 'linear'));
        
        this.hand.addRotationX('middle0', new KeyFrame(48, 0, 'linear'));
        this.hand.addRotationX('middle1', new KeyFrame(48, -10, 'linear'));
        this.hand.addRotationX('middle2', new KeyFrame(48, 0, 'linear'));
        
        // hand.addRotationX('index0', new KeyFrame(0, 0, 'easeIn'));
        this.hand.addRotationX('index0', new KeyFrame(48, 0, 'linear'));
        // hand.addRotationX('index1', new KeyFrame(0, 0, 'easeIn'));
        this.hand.addRotationX('index1', new KeyFrame(48, -10, 'linear'));
        // hand.addRotationX('index2', new KeyFrame(0, 0, 'easeIn'));
        this.hand.addRotationX('index2', new KeyFrame(48, 0, 'linear'));

        this.hand.addRotationX('thumb0', new KeyFrame(48, -20, 'linear'));
        this.hand.addRotationX('thumb1', new KeyFrame(48, 0, 'linear'));
        this.hand.addRotationX('thumb2', new KeyFrame(48, -15, 'linear'));

        
        // this.camera_kf_list.push(new KeyFrame(850, [386, -110, 1876, 134, -1440, 386], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(929, [1001, 1097, 3477, 21, -963, 108], 'constant'));
        
        
        this.camera_kf_list.push(new KeyFrame(850, [1968, -4661, -2000+500, 116, -1610, -48], 'linear'));
        this.camera_kf_list.push(new KeyFrame(897, [3693, -3292, -1078, 211, -1443, -68], 'constant'));
        
        this.camera_kf_list2.push(new KeyFrame(888, [3932, -774, 1448-200, 177, -1252, -43], 'linear'));
        this.camera_kf_list2.push(new KeyFrame(907, [3685, -371-100, 1857+200, 130, -1085-100, 12], 'constant'));
        
        this.camera_kf_list.push(new KeyFrame(898, [2300, 986, 2623, 51, -1023, -108], 'linear'));
        this.camera_kf_list.push(new KeyFrame(908, [1943, 1076, 2819, 14, -1022, -84], 'constant'));
        
        this.camera_kf_list2.push(new KeyFrame(908, [1001, 1097, 3477, 21, -963, 108], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(1200, [1318, 1763, 4566, 21, -963, 108], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(1200, [590, 1762, 4734, -166, -935, 136], 'linear'));
        this.camera_kf_list2.push(new KeyFrame(950, [399, 1194, 3538, -27, -956, 110], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(908, [1001, 1097, 3477, 21, -963, 108], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(929, [lerp(1001,1318,3/30), lerp(1097,1763,3/30), lerp(3477,4566,3/30), 21, -963, 108], 'linear'));
        
        this.camera_shots_kf_list = [
            new Shot(0, this.camera_kf_list),
            new Shot(888, this.camera_kf_list2),
            new Shot(898, this.camera_kf_list),
            new Shot(908, this.camera_kf_list2),
        ]
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_shots(time_current, this.camera_shots_kf_list));
        }
        
        // Display objects ----------------------
        push();
            translate(0, 0, 0);
            scale(0.5);
            this.puppet.display(time_current);
	    pop();

        push();
            let scale_factor = 2.5;
            translate(0, -800*scale_factor, (-600-100)*scale_factor);
            scale(scale_factor);
            this.hand.display(time_current);
            // ellipse(0, 0, 200, 200, 90);
	    pop();

        push(); // draw each string
            stroke(191);
            strokeWeight(10);
            // get the global position of each part of the puppet
            let lower_arm_string_l = this.puppet.global_string_pos_lower_arm_l;
            let lower_arm_string_r = this.puppet.global_string_pos_lower_arm_r;
            let upper_arm_string_l = this.puppet.global_string_pos_upper_arm_l;
            let upper_arm_string_r = this.puppet.global_string_pos_upper_arm_r;
            let neck_string = this.puppet.global_string_pos_neck;

            // get the global position of each part of the hand
            let pinky_string = this.hand.global_string_pos_pinky;
            let ring_string = this.hand.global_string_pos_ring;
            let middle_string = this.hand.global_string_pos_middle;
            let index_string = this.hand.global_string_pos_index;
            let thumb_string = this.hand.global_string_pos_thumb;

            // draw the strings
            line(lower_arm_string_l.x, lower_arm_string_l.y, lower_arm_string_l.z, pinky_string.x, pinky_string.y, pinky_string.z);
            line(upper_arm_string_l.x, upper_arm_string_l.y, upper_arm_string_l.z, ring_string.x, ring_string.y, ring_string.z);
            line(neck_string.x, neck_string.y, neck_string.z, middle_string.x, middle_string.y, middle_string.z);
            line(lower_arm_string_r.x, lower_arm_string_r.y, lower_arm_string_r.z, thumb_string.x, thumb_string.y, thumb_string.z);
            line(upper_arm_string_r.x, upper_arm_string_r.y, upper_arm_string_r.z, index_string.x, index_string.y, index_string.z);
        pop();
    }

}

// --- End of scenes/Scene_09_Puppet_to_You.js ---


// --- Start of scenes/Scene_10_Done.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_10_Done extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 929, 1010

        // Initialize necessary objects and lists
        this.puppet1 = new Puppet();
        this.puppet2 = new Puppet();
        this.hand = new Hand();
        // this.camera_kf_list = [];
        this.ang_cam_kf_list = [];
        

        // 929,996,1034(end)
        

        // hand initial position
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        
        // puppet 1 position
        this.puppet1.addRotation('neck', new KeyFrame(929,[-23.6, 0.0, 0.0]));
        this.puppet1.addRotation('shoulder_r', new KeyFrame(929,[71.5, -15, 0.0]));
        this.puppet1.addRotation('elbow_r', new KeyFrame(929,[95.6, 0.0, 0.0]));
        this.puppet1.addRotation('shoulder_l', new KeyFrame(929,[71.5, 15.0, 0.0]));
        this.puppet1.addRotation('elbow_l', new KeyFrame(929,[95.6, 0.0, 0.0]));
        
        
        
        // puppet 2 position
        this.puppet2.addRotation('hips', new KeyFrame(929,[3.9, 0.0, 0.0]));
        this.puppet2.addRotation('neck', new KeyFrame(929,[6.2, 0.0, 0.0]));
        this.puppet2.changeRotationMode('shoulder_r', 'ZXY');
        this.puppet2.addRotation('shoulder_r', new KeyFrame(929,[159.8, -73.4, 48.6]));
        this.puppet2.addRotation('elbow_r', new KeyFrame(929,[77.8, 0.0, 0.0]));
        this.puppet2.changeRotationMode('shoulder_l', 'ZXY');
        this.puppet2.addRotation('shoulder_l', new KeyFrame(929,[159.8, 73.4, -48.6]));
        this.puppet2.addRotation('elbow_l', new KeyFrame(929,[77.8, 0.0, 0.0]));


        // camera animation (through changing the angle)
        this.raio = 2000+500; this.altura = -540; this.under_altura = 1000;
        let base_angle = 20;
        let start_angle = radians(-base_angle); let end_angle = radians(base_angle); 
        let start_rot_frame = 929-0; let end_rot_frame = 976-6;
        // let speed = (end_angle - start_angle) / (end_rot_frame - start_rot_frame);
        let duration = (end_rot_frame - start_rot_frame);
        this.ang_cam_kf_list.push(new KeyFrame(start_rot_frame, start_angle, 'linear')); // start seeing puppet1
        this.ang_cam_kf_list.push(new KeyFrame(end_rot_frame, end_angle, 'linear')); // end seeing puppet1
        this.ang_cam_kf_list.push(new KeyFrame(989-6-4, radians(180-base_angle), 'linear')); // start seeing puppet2
        this.ang_cam_kf_list.push(new KeyFrame(989-6-4 + duration, radians(180+base_angle), 'linear')); // end seeing puppet2
        console.log(start_rot_frame, end_rot_frame, duration);

    }

    display(time_current) {
        
        // Camera ----------------------
        let ang_cam = animate_kfs(time_current, this.ang_cam_kf_list);
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(cos(ang_cam)*this.raio, this.altura, sin(ang_cam)*this.raio,0,this.altura,0);
        }
        
        // Display objects ----------------------
        let scale_hand = 5;
        push();
        rotateY(PI/2);

        push(); // puppet 1
            translate(0,-540,(hand_palm_depth/2+(30))*scale_hand);
            this.puppet1.display(time_current);
        pop();
        
        
        push(); // puppet 2
            translate(0,-540,(-hand_palm_depth/2-(40))*scale_hand);
            rotateY(PI);
            this.puppet2.display(time_current);
        pop();

        push(); // hand
            scale(scale_hand);
            translate(0,hand_arm_height,0); //  place the palm joint at 0,0,0
            this.hand.display(time_current);
        pop();

        pop();
    }

}

// --- End of scenes/Scene_10_Done.js ---


// --- Start of scenes/Scene_11_Cut.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_11_Cut extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 1010, 1092 

        // Initialize necessary objects and lists
        this.camera_kf_list = [];
        this.upper_string_bottom_kf_list = []; // the upper string's end (part at the bottom of the upper string)
        this.upper_string_cp_bottom_kf_list = []; // the upper string's bottom control point
        this.upper_string_cp_top_kf_list = []; // the upper string's top control point
        this.lower_string_top_kf_list = []; // lower string's start (part at the top of the lower string)

        this.stroke_weight_kf_list = [];
        this.amplitudes_kf_list = [];
        this.rotation_z_kf_list = [];

        // 1010,42,52,59,1092(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        // this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -20));
        this.camera_kf_list.push(new KeyFrame(0, [0,0,1029,0,0,0], 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        





        // upper string control point top
        let angle_z = 40; 
        // let bezier_list = [.01,.92,0,.99];
        // let bezier_list = [0,1.38,0,.99];
        let bezier_list = [0,.75,.05,.95];
        let cp_top_y = -400*(2/3)-0;
        // this.upper_string_cp_top_kf_list.push(new KeyFrame(1053, [0, cp_top_y, 0],'easeOut'));
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1053, [0, cp_top_y, 0], 'bezierSimple', bezier_list));
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1092, [150+50, cp_top_y, 0],'easeIn'));
        // upper string control point bottom
        let cp_bottom_y = -400*(1/3);
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1053, [0, cp_bottom_y, 0], 'bezierSimple', [.01,.92,0,.99]));
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1053, [0, cp_bottom_y, 0], 'bezierSimple', [0,.95,.05,.98]));
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1092, [-200-100-100+100, cp_bottom_y, 0],'easeIn'));
        
        // upper string animation
        let start_cut = 1049;
        // this.upper_string_bottom_kf_list.push(new KeyFrame(1053, [0, 0, 0], 'bezierSimple', [.01,.92,0,.99]));
        this.upper_string_bottom_kf_list.push(new KeyFrame(1053, [0, 0, 0], 'bezierSimple', bezier_list));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(1063, [0, -50, 0], 'hermite', [0,0]));
        this.upper_string_bottom_kf_list.push(new KeyFrame(1092, [-100,50, 0]));

        // lower string top tip
        this.lower_string_top_kf_list.push(new KeyFrame(1010, [0, 0, 0]));
        this.lower_string_top_kf_list.push(new KeyFrame(1052.5, [0, 0, 0],'linear'));
        this.lower_string_top_kf_list.push(new KeyFrame(1054.5, [0, 1000, 0]));

        // rotation of all
        this.rotation_z_kf_list.push(new KeyFrame(1053, 0, 'bezierSimple', bezier_list));
        this.rotation_z_kf_list.push(new KeyFrame(1092, angle_z));







        // stroke weight and trembling (amplitude of translation)
        this.stroke_weight_kf_list.push(new KeyFrame(1010, 10, 'linear'));
        this.stroke_weight_kf_list.push(new KeyFrame(1053, 3, 'bezierSimple', bezier_list));
        this.stroke_weight_kf_list.push(new KeyFrame(1092, 7));

        this.amplitudes_kf_list.push(new KeyFrame(1010,[0,0,0], 'linear'));
        this.amplitudes_kf_list.push(new KeyFrame(1040,[10,4,4], 'constant'));
        this.amplitudes_kf_list.push(new KeyFrame(1053,[10,4,4], 'easeOut'));
        this.amplitudes_kf_list.push(new KeyFrame(1060,[0,0,0], 'linear'));


    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        
        // Display objects ----------------------
        push(); 
            // trembling
            let amplitudes = animate_kfs(time_current, this.amplitudes_kf_list);
            let amplitudes_arr = amplitudes instanceof p5.Vector ? [amplitudes.x, amplitudes.y, amplitudes.z] : amplitudes;
            let frequencies = [20,20,20];
            let times = [time_current,time_current+1000,time_current+2000];
            translate(...noise_func(times,amplitudes_arr,frequencies));

            strokeWeight(animate_kfs(time_current, this.stroke_weight_kf_list));
            noFill()
            stroke(191);


            // upper string
            push(); 
                translate(0,-400,0);
                let angle_z =animate_kfs(time_current, this.rotation_z_kf_list);
                rotateZ(radians(angle_z));
                translate(0,400,0);
                let cp_top = animate_kfs(time_current, this.upper_string_cp_top_kf_list); // control point top
                let cp_bot = animate_kfs(time_current, this.upper_string_cp_bottom_kf_list); // control point bottom
                let bot = animate_kfs(time_current, this.upper_string_bottom_kf_list); // bottom



                bezier(
                    0,-400,0, // top
                    cp_top.x, cp_top.y, 0, // control point top
                    cp_bot.x, cp_bot.y, 0, // control point bottom
                    bot.x, bot.y, 0, // bottom
                );

            pop();


            // lower string
            push();
                let top = animate_kfs(time_current, this.lower_string_top_kf_list);

                line(
                    top.x,top.y,top.z,
                    0,400,0
                );

            pop();
        pop();

    }

}

// --- End of scenes/Scene_11_Cut.js ---


// --- Start of scenes/Scene_12_Falling.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

function create_full_cylinder(radius, height, res_rotations=10) {
    beginShape(QUAD_STRIP);
        for (let i = 0 ; i < res_rotations; i++) {
            let angle = map(i, 0, res_rotations-1, 0, 2*PI);
            let x = cos(angle) * radius;
            let z = sin(angle) * radius;
            vertex(x, -height/2, z); // bottom
            vertex(x, height/2, z);  // top
        }
    endShape();
} 

function create_background_object(radius, height, iterations_wall, color1 = color(255,0,0), color2 = color(0,0,255), res_rotations=10) {
    push();
        translate(0,iterations_wall*height/2,0);
        translate(0,height/2,0);
        for (let i = 0; i < iterations_wall; i++) {
            translate(0,-height,0);
            if (i % 2 == 0) { fill(color1); }
            else { fill(color2); }
            create_full_cylinder(radius, height, res_rotations);
        }
    pop();
}


function build_background(back_radius = 5000, back_height = 1000, back_iterations_wall = 200, color1 = color(190-100), color2 = color(170-100), back_res_rotations=20){
    beginGeometry();
        create_background_object(back_radius, back_height, back_iterations_wall, color1, color2, back_res_rotations);
    return endGeometry();
}

function build_fade(fade_r = 4900, fade_h = 70*800+1200, fade_start = 16000+1200, bg_color = 50) {
    beginGeometry();
        // fade_r -> slightly smaller than back_radius
        // fade_h -> enough to cover the whole background
        // fade_start -> starts fading past the puppet
        // bg_color -> sketch17.js uses background(50)
        
        beginShape(QUAD_STRIP);
        for(let i=0; i<=20; i++) {
            let angle = map(i, 0, 20, 0, TWO_PI);
            let x = cos(angle) * fade_r;
            let z = sin(angle) * fade_r;
            fill(bg_color, bg_color, bg_color, 255);
            vertex(x, -fade_h, z);
            fill(bg_color, bg_color, bg_color, 0);
            vertex(x, -fade_start, z);
        }
        endShape();

    return endGeometry();
}

let background_shape;
let fade_shape;

function createTremble(timeOffsets, amplitude, frequency) {
    return (time_current, [x, y, z]) => {
        let times = timeOffsets.map(offset => time_current + offset);
        let result = noise_func_to_value([x, y, z], times, amplitude, frequency);
        return [result.x, result.y, result.z];
    };
}

class Scene_12_Falling extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 1092, 1256 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        this.camera_kf_list1 = [];
        this.camera_kf_list2 = [];
        this.translate_background_kf_list = [];
        this.amplitudes_tremble_all_kf_list = [];
        this.frequencies_tremble_all_kf_list = [];
        this.camera_shots_list = [];

        // start,,,,,end(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        let part1_start = start_frame; // from the side
        let part2_start = 1175; // from the front
        let part3_start = 1210; // from the side going past
        // let parts_end = end_frame;
        let part4_start = 1237;
        let parts_end = 1256;
        
        // ------------------------------ FOR ALL SCENES ------------------------------
        

        // puppet position
        this.puppet.changeRotationMode('shoulder_r', 'XZY');
        this.puppet.changeRotationMode('shoulder_l', 'XZY');
        this.puppet.changeRotationMode('hips_leg_r', 'XZY');
        this.puppet.changeRotationMode('hips_leg_l', 'XZY');
        this.puppet.addRotation('full_body', new KeyFrame(part1_start, [-93.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(part1_start, [-1.0, 102.0, -100.0],'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(part1_start, [67.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(part1_start, [-1.0, -102.0, 100.0],'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(part1_start, [67.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(part1_start, [0.0, 20.0, -10.0],'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(part1_start, [-13.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('hips_leg_l', new KeyFrame(part1_start, [0.0, -20.0, 10.0],'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(part1_start, [-13.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('hips', new KeyFrame(part1_start, [3.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('neck', new KeyFrame(part1_start, [26.0, 0.0, 0.0],'constant'));

        // puppet trembling rotations
        this.puppet.addProcedural('shoulder_r', createTremble([0, 1000, 2000], [10, 20, 10], [5, 10, 5]));
        this.puppet.addProcedural('shoulder_l', createTremble([1500, 2500, 3500], [10, 20, 10], [5, 10, 5]));
        this.puppet.addProcedural('hips_leg_r', createTremble([0, 1000, 2000], [10, 20, 10], [5, 10, 5]));
        this.puppet.addProcedural('hips_leg_l', createTremble([500, 1500, 2500], [10, 20, 10], [5, 10, 5]));
        
        this.puppet.addProcedural('elbow_r', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));
        this.puppet.addProcedural('elbow_l', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));
        this.puppet.addProcedural('knee_r', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));
        this.puppet.addProcedural('knee_l', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));

        this.puppet.addProcedural('neck', createTremble([1500, 2500, 3500], [3,0,0], [5,0,0]));


        // build geometry of background
        let back_height = 1000
        background_shape = build_background();
        // build geometry for fading the ends
        fade_shape = build_fade();


        





        // ------------------------------ SCENE PART 1 (from the side) ------------------------------
        
        // animate background movement
        let back_speed = -20; // must be an integer
        let segments_up = 0;
        let height_segments_up = back_height * segments_up;
        this.translate_background_kf_list.push(new KeyFrame(part1_start, [0, -height_segments_up+0, 0],'linear'));
        this.translate_background_kf_list.push(new KeyFrame(part2_start, [0, -height_segments_up + 2*back_speed*back_height, 0],'constant'));
 

        // puppet translation
        this.puppet.addTranslation('full_body', new KeyFrame(part1_start, [0, 0, 0], 'constant'));


        // camera 
        this.camera_kf_list1.push(new KeyFrame(part1_start, [1252, 907, 503, 79, -21, -89], 'linear'));        
        this.camera_kf_list1.push(new KeyFrame(part2_start, [91, 308, 1421, -9, -62, -164], 'constant'));        

        // tremble all 
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part1_start,[10,10,10], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(part1_start,[20,20,20], 'constant'));

        // ------------------------------ SCENE PART 2 (from the below) ------------------------------
        
        // puppet translation
        this.puppet.addTranslation('full_body', new KeyFrame(part2_start, [0, -20464, 0], 'easeIn'));
        this.puppet.addTranslation('full_body', new KeyFrame(1200, [0, 20464+500, 0], 'constant'));

        // background translation (doesnt move here)
        this.translate_background_kf_list.push(new KeyFrame(part2_start+1, [0, 0, 0],'constant'));
        
        // camera 
        this.camera_kf_list2.push(new KeyFrame(part2_start, [87, 20562, 33, 27, -21, -26], 'constant'));
        
        // tremble all 
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part2_start,[0,0,0], 'constant'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1200,[800,0,800], 'linear'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1205,[0,0,0], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(part2_start,[40,0,40], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1205,[40,0,40], 'constant'));


        // ------------------------------ SCENE PART 3 (from the side again) ------------------------------
        
        
        // puppet rotations
        this.puppet.addRotation('full_body', new KeyFrame(part3_start, [-93.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(part3_start, [67.0, 10.0, -107.0],'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(part3_start, [25.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(part3_start, [67.0, -10.0, 107.0],'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(part3_start, [25.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(part3_start, [-20.0, 20.0, -30.0],'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(part3_start, [-40.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('hips_leg_l', new KeyFrame(part3_start, [-20.0, -20.0, 30.0],'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(part3_start, [-40.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('hips', new KeyFrame(part3_start, [3.0, 0.0, 0.0],'constant'));
        this.puppet.addRotation('neck', new KeyFrame(part3_start, [26.0, 0.0, 0.0],'constant'));

        // puppet translation
        this.puppet.addTranslation('full_body', new KeyFrame(1222-1.5, [0, -4000, 0], 'linear'));
        this.puppet.addTranslation('full_body', new KeyFrame(1222+1.5, [0, 4000, 0], 'constant'));
        
        // background translation (moves but less then part 1)
        this.translate_background_kf_list.push(new KeyFrame(part3_start, [0, 2000+500, 0],'linear'));
        this.translate_background_kf_list.push(new KeyFrame(part4_start, [0, 2000-500, 0],'constant'));
        
        // camera
        this.camera_kf_list1.push(new KeyFrame(part3_start, [3868, -2312, 1110, 6, -62, -147], 'constant'));

        // tremble all 
        // this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part3_start,[0,0,0], 'constant'));
        // this.frequencies_tremble_all_kf_list.push(new KeyFrame(part3_start,[20,20,20], 'constant'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part3_start,[0,0,0], 'constant'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1222+1,[100,500,100], 'easeOut'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1222+12,[0,0,0], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1222+1,[5,2,5], 'linear'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1222+12,[5,0,5], 'constant'));
        





        // ------------------------------ SCENE PART 4 (from the side again) ------------------------------
        
        // puppet translation (1237)
        let a = 8000/3; let b = -1242*a; 
        let puppet_pos_part4 = a*part4_start+b;
        let puppet_pos_end = a*end_frame+b;
        this.puppet.addTranslation('full_body', new KeyFrame(part4_start, [0, puppet_pos_part4, 0], 'linear'));
        // this.puppet.addTranslation('full_body', new KeyFrame(1242-1.5, [0, -4000, 0], 'linear'));
        // this.puppet.addTranslation('full_body', new KeyFrame(1242+1.5, [0, 4000, 0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(parts_end, [0, puppet_pos_end, 0], 'constant'));
        
        // background translation (moves but less then part 1)
        this.translate_background_kf_list.push(new KeyFrame(part4_start, [0, 2000+500, 0],'linear'));
        this.translate_background_kf_list.push(new KeyFrame(parts_end, [0, 2000-500, 0],'constant'));
        
        // camera 
        // this.camera_kf_list2.push(new KeyFrame(part4_start, [-3604, 3023, 366, 0, puppet_pos_part4, 0], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(end_frame, [-3604, 3023, 366, 0, puppet_pos_end, 0], 'constant'));
        this.camera_kf_list2.push(new KeyFrame(part4_start, [-4500, 0, 0, 0, puppet_pos_part4, 0], 'easeInOut'));
        this.camera_kf_list2.push(new KeyFrame(parts_end, [-4500, 0, 0, 0, puppet_pos_end, 0], 'constant'));
        
        // tremble all 
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part4_start,[0,0,0], 'constant'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1242+1,[100,500,100], 'easeOut'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1242+12,[0,0,0], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1242+1,[5,2,5], 'linear'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1242+12,[5,0,5], 'constant'));
        


        this.camera_shots_list = [
            new Shot(part1_start, this.camera_kf_list1),
            new Shot(part2_start, this.camera_kf_list2),
            new Shot(part3_start, this.camera_kf_list1),
            new Shot(part4_start, this.camera_kf_list2),
        ]
        

        
        
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_shots(time_current, this.camera_shots_list));
        }
        let fov = 2 * atan(height / 2 / 800); // Default vertical FOV
        let aspect = width / height; // Default aspect ratio
        perspective(fov, aspect, 50, 70*800); // default I had put were 0.1*800, 30 * 800

        // Display objects ----------------------
        push();
            // TREMBLING
            let amplitudes = animate_kfs(time_current, this.amplitudes_tremble_all_kf_list);
            let amplitudes_arr = amplitudes instanceof p5.Vector ? [amplitudes.x, amplitudes.y, amplitudes.z] : amplitudes;
            // let frequencies = [20,20,20];
            // let frequencies = [40,0,40];
            let frequencies = animate_kfs(time_current, this.frequencies_tremble_all_kf_list);
            let frequencies_arr = frequencies instanceof p5.Vector ? [frequencies.x, frequencies.y, frequencies.z] : frequencies;
            let times = [time_current,time_current+1000,time_current+2000];
            translate(...noise_func(times,amplitudes_arr,frequencies_arr));

            // PUPPET
            push();
            
            push();
            scale(1,2,1);
            // this.puppet.display(time_current-0.1/36);
            // this.puppet.display(time_current-0.4/36);
            pop();
            
            this.puppet.display(time_current);
            pop();

            // BACKGROUND
            push();
                noStroke();
                // translate(0,0,0);
                translate(animate_kfs(time_current, this.translate_background_kf_list));
                model(background_shape);
            pop();

            // BACKGROUND FADE (moves with camera Y)
            push();
                noStroke();
                let cam = _renderer._curCamera; 
                translate(0, cam.eyeY, 0); // makes the fade move with the camera
                model(fade_shape);
                // scale(1,-1,1);
                // model(fade_shape);
            pop();

            push();
                noStroke();
                fill(50);
                translate(0,48000,0);
                // translate(0,0,0);
                rotateX(PI/2);
                plane(10000);
            pop();

        pop();
    }

}

// --- End of scenes/Scene_12_Falling.js ---


// --- Start of scenes/Scene_13_Hit.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />




function create_half_background_object(radius, height, iterations_wall, color1 = color(255,0,0), color2 = color(0,0,255), res_rotations=10) {
    push();
        translate(0,iterations_wall*height/2,0);
        translate(0,height/2,0);
        rotateY(PI/2); 
        for (let i = 0; i < iterations_wall; i++) {
            translate(0,-height,0);
            if (i % 2 == 0) { fill(color1); }
            else { fill(color2); }
            create_half_cylinder(radius, height, res_rotations); 
        }
    pop();
}



function build_half_background(back_radius = 5000, back_height = 1000, back_iterations_wall = 200, color1 = color(190-100), color2 = color(170-100), back_res_rotations=20){
    beginGeometry();
        create_half_background_object(back_radius, back_height, back_iterations_wall, color1, color2, back_res_rotations);
    return endGeometry();
}

let half_background_shape;


class Scene_13_Hit extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 1256, 1267 

        // Initialize necessary objects and lists
        this.puppet_body = new Puppet(); this.puppet_body.hideExcept('body');
        this.puppet_head = new Puppet(); this.puppet_head.hideExcept('head');
        this.puppet_arm_r = new Puppet(); this.puppet_arm_r.hideExcept('arm_r');
        this.puppet_arm_l = new Puppet(); this.puppet_arm_l.hideExcept('arm_l');
        this.puppet_leg_r = new Puppet(); this.puppet_leg_r.hideExcept('leg_r');
        this.puppet_leg_l = new Puppet(); this.puppet_leg_l.hideExcept('leg_l');
        this.camera_kf_list = [];
        this.amplitudes_tremble_all_kf_list = [];
        this.frequencies_tremble_all_kf_list = [];

        // 1256,1267(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        let part5_start = 1256;
        let part6_start = end_frame-2; // 1267-x


        // ------------------------------ SCENE PART 5 (falling, big camera) ------------------------------
        
        let hit_y = 0;
        let a = 8000/3; let b = hit_y-a*part6_start; // ax+b
        this.puppets = [this.puppet_body, this.puppet_head, this.puppet_arm_r, this.puppet_arm_l, this.puppet_leg_r, this.puppet_leg_l];

        for (let i = 0; i < this.puppets.length; i++) {

            let puppet = this.puppets[i];
            

            // puppet position
            puppet.addRotation('full_body', new KeyFrame(part6_start, [-93.0, 0.0, 0.0],'linear'));
            puppet.addRotation('shoulder_r', new KeyFrame(part6_start, [67.0, 10.0, -107.0],'linear'));
            puppet.addRotation('elbow_r', new KeyFrame(part6_start, [25.0, 0.0, 0.0],'linear'));
            puppet.addRotation('shoulder_l', new KeyFrame(part6_start, [67.0, -10.0, 107.0],'linear'));
            puppet.addRotation('elbow_l', new KeyFrame(part6_start, [25.0, 0.0, 0.0],'linear'));
            puppet.addRotation('hips_leg_r', new KeyFrame(part6_start, [-20.0, 20.0, -30.0],'linear'));
            puppet.addRotation('knee_r', new KeyFrame(part6_start, [-40.0, 0.0, 0.0],'linear'));
            puppet.addRotation('hips_leg_l', new KeyFrame(part6_start, [-20.0, -20.0, 30.0],'linear'));
            puppet.addRotation('knee_l', new KeyFrame(part6_start, [-40.0, 0.0, 0.0],'linear'));
            puppet.addRotation('hips', new KeyFrame(part6_start, [3.0, 0.0, 0.0],'linear'));
            puppet.addRotation('neck', new KeyFrame(part6_start, [26.0, 0.0, 0.0],'linear'));

            // puppet trembling rotations
            puppet.addProcedural('shoulder_r', createTremble([0, 1000, 2000], [10, 20, 10], [5, 10, 5]));
            puppet.addProcedural('shoulder_l', createTremble([1500, 2500, 3500], [10, 20, 10], [5, 10, 5]));
            puppet.addProcedural('hips_leg_r', createTremble([0, 1000, 2000], [10, 20, 10], [5, 10, 5]));
            puppet.addProcedural('hips_leg_l', createTremble([500, 1500, 2500], [10, 20, 10], [5, 10, 5]));
            
            puppet.addProcedural('elbow_r', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));
            puppet.addProcedural('elbow_l', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));
            puppet.addProcedural('knee_r', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));
            puppet.addProcedural('knee_l', createTremble([1500, 2500, 3500], [10,0,0], [5,0,0]));

            puppet.addProcedural('neck', createTremble([1500, 2500, 3500], [3,0,0], [5,0,0]));


            
            
            
            
            // puppet translation
            puppet.addTranslation('full_body', new KeyFrame(part5_start, [0, a*part5_start+b, 0],'linear'));
            puppet.addTranslation('full_body', new KeyFrame(part6_start, [0, hit_y, 0],'easeOut'));
            
        }
        

        // ------------------------------ HEAD ------------------------------
        this.puppet_head.addTranslation('full_body', new KeyFrame(end_frame, [0, hit_y-1000, 300],'linear'));
        this.puppet_head.addRotation('neck', new KeyFrame(end_frame, [-0.0, 0.0, 0.0],'constant'));
        
        // ------------------------------ BODY ------------------------------
        this.puppet_body.addTranslation('full_body', new KeyFrame(end_frame, [0, hit_y-500, -0],'linear'));
        this.puppet_body.addRotation('full_body', new KeyFrame(end_frame, [-70.0, 0.0, 0.0],'constant'));
        
        
        // ------------------------------ ARMS ------------------------------
        this.puppet_arm_r.addTranslation('full_body', new KeyFrame(end_frame, [300, hit_y-700, 100],'linear'));
        this.puppet_arm_r.addRotation('shoulder_r', new KeyFrame(end_frame, [0.0, 10.0, -107.0],'linear'));
        this.puppet_arm_l.addTranslation('full_body', new KeyFrame(end_frame, [-300, hit_y-700, -100],'linear'));
        this.puppet_arm_l.addRotation('shoulder_l', new KeyFrame(end_frame, [67.0+180, -10.0, 107.0],'linear'));
        
        // ------------------------------ LEGS ------------------------------
        this.puppet_leg_r.addTranslation('full_body', new KeyFrame(end_frame, [200, hit_y-700, -700],'linear'));
        this.puppet_leg_r.addRotation('hips_leg_r', new KeyFrame(end_frame, [20.0, 100.0, -70.0],'linear'));
        this.puppet_leg_l.addTranslation('full_body', new KeyFrame(end_frame, [-200, hit_y-700, -300],'linear'));
        this.puppet_leg_l.addRotation('hips_leg_l', new KeyFrame(end_frame, [-20.0, 120.0, 70.0],'linear'));
            







        // build geometry of half background
        half_background_shape = build_half_background();
        
        // tremble all (nothing here I think)
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part5_start,[0,0,0], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(part5_start,[0,0,0], 'constant'));
        
        // camera (big)
        this.camera_kf_list.push(new KeyFrame(part5_start, [-9533+600, -751, 0, 0, -2752, 0], 'easeIn'));
        // this.camera_kf_list2.push(new KeyFrame(part5_start, [-4500, 0, 0, 0, puppet_pos_end, 0], 'constant'));
        
        
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }

        // Display objects ----------------------
        push();
            // TREMBLING
            let amplitudes = animate_kfs(time_current, this.amplitudes_tremble_all_kf_list);
            let amplitudes_arr = amplitudes instanceof p5.Vector ? [amplitudes.x, amplitudes.y, amplitudes.z] : amplitudes;
            // let frequencies = [20,20,20];
            // let frequencies = [40,0,40];
            let frequencies = animate_kfs(time_current, this.frequencies_tremble_all_kf_list);
            let frequencies_arr = frequencies instanceof p5.Vector ? [frequencies.x, frequencies.y, frequencies.z] : frequencies;
            let times = [time_current,time_current+1000,time_current+2000];
            translate(...noise_func(times,amplitudes_arr,frequencies_arr));

            // PUPPETS
            for (let i = 0; i < this.puppets.length; i++) {
                push();
                    this.puppets[i].display(time_current);
                pop();
            }

            // BACKGROUND
            push();
                noStroke();
                model(half_background_shape);
            pop();

            push();
                noStroke();
                fill(50);
                translate(0,0,0);
                rotateX(PI/2);
                plane(10000);
            pop();

        pop();
    }

}

// --- End of scenes/Scene_13_Hit.js ---


// --- Start of scenes/Scene_14_Dismantled.js ---

/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

class Scene_14_Dismantled extends Scene {
    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 1267
        
        // Setup puppets
        this.puppet_head = new Puppet(); this.puppet_head.hideExcept('head'); 
        this.puppet_head2 = new Puppet(); this.puppet_head2.hideExcept('head'); 
        this.puppet_body = new Puppet(); this.puppet_body.hideExcept('body');
        this.puppet_arm_r = new Puppet(); this.puppet_arm_r.hideExcept('arm_r');
        this.puppet_arm_l = new Puppet(); this.puppet_arm_l.hideExcept('arm_l');
        this.puppet_leg_r = new Puppet(); this.puppet_leg_r.hideExcept('leg_r');
        this.puppet_leg_l = new Puppet(); this.puppet_leg_l.hideExcept('leg_l');

        let start = start_frame+18; // 1287
        let head_roll_end = 1290+10; // 1300
        let full_body_show_time = head_roll_end+8;
        
        // KeyFrames for the puppet's dismantled body parts
        this.puppet_head2.addTranslation('full_body', new KeyFrame(start_frame, [-700,0,0],'constant'));
        // this.puppet_head2.addRotation('neck', new KeyFrame(start, [90,-180*0.3,0],'bezierSimple',[0,.92,0,1.11]));
        this.puppet_head2.addRotation('neck', new KeyFrame(start, [90,-180*0.05,0],'easeOut'));
        // this.puppet_head2.addRotation('neck', new KeyFrame(start, [90,-180*0.02,0],'easeOut'));
        this.puppet_head2.addRotation('neck', new KeyFrame(head_roll_end, [90,0,0]));
        // this.puppet_head2.addTranslation('full_body', new KeyFrame(start, [-400*0.3,0,0],'bezierSimple',[0,.92,0,1.11]));
        // this.puppet_head2.addTranslation('full_body', new KeyFrame(start, [-400*0.1,0,0],'easeOut'));
        this.puppet_head2.addTranslation('full_body', new KeyFrame(start, [0,0,0]));



        
        
        this.puppet_body.addRotationX('full_body', new KeyFrame(0, -90));
        this.puppet_arm_r.addRotation('shoulder_r', new KeyFrame(0, [-90,-100,0]));
        this.puppet_arm_r.addRotation('elbow_r', new KeyFrame(0, [60,0,0]));
        this.puppet_arm_l.addRotation('shoulder_l', new KeyFrame(0, [-90,-90,0]));
        this.puppet_arm_l.addRotation('elbow_l', new KeyFrame(0, [60,0,0]));
        this.puppet_leg_r.addRotation('hips_leg_r', new KeyFrame(0, [90,-90,0]));
        this.puppet_leg_r.addRotation('knee_r', new KeyFrame(0, [-70,0,0]));
        this.puppet_leg_l.addRotation('hips_leg_l', new KeyFrame(0, [90,-90,0]));
        this.puppet_leg_l.addRotation('knee_l', new KeyFrame(0, [-70,0,0]));

        // Keyframes for the camera
        this.camera_kf_list = [];
        // this.camera_kf_list.push(new KeyFrame(0, [0,0,0,0,0,0], 'constant'));
        this.camera_kf_list.push(new KeyFrame(51, [124, -556, 391, 153, -513, 453], 'constant'));
        // this.camera_kf_list.push(new KeyFrame(61, [426, -501, -482, 676, -256, -119], 'constant'));
        // this.camera_kf_list.push(new KeyFrame(71, [-1108, -1862, -2118, 80, 10, 45], 'constant'));
        this.camera_kf_list.push(new KeyFrame(full_body_show_time, [-1751, -2875, -3289, 80, 10, 45], 'linear'));
        this.camera_kf_list.push(new KeyFrame(full_body_show_time+90, [-2026, -3309, -3790, 80, 10, 45], 'constant'));
        // this.camera_kf_list.push(new KeyFrame(94, [0,0,0,0,0,0], 'constant'));
    }

    display(time_current) {
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }

        // Puppet --------------------
        push(); // head
            translate(300, -40, 1000);
            rotateY(PI+PI/2);
            rotateX(-PI/8);    
            this.puppet_head2.display(time_current);

        pop();

        push(); // body
            translate(0, -40, 0);
            this.puppet_body.display(time_current);
        pop();

        // Arms
        push(); 
            translate(800, -65, 200);
            rotateY(-PI/2+PI/8);
            this.puppet_arm_r.display(time_current);
        pop();
        push();
            translate(-500, -65, 600);
            rotateY(PI/2);
            this.puppet_arm_l.display(time_current);
        pop();

        // Legs
        push();
            translate(400, -280, -700);
            rotateY(PI-PI/4);
            this.puppet_leg_r.display(time_current);
        pop();
        push();
            translate(-600, 230, -700);
            rotateX(PI);
            rotateY(-PI+PI/4);
            this.puppet_leg_l.display(time_current);
        pop();


        push();
            noStroke();
            fill(50);
            translate(0,200,0);
            model(background_shape);
            rotateX(PI/2);
            // circle(0,0,10000);
            plane(10000);
        pop();
    }
}


// --- End of scenes/Scene_14_Dismantled.js ---


// --- Start of media/Subtitles.js ---

class SubtitleLine {
    constructor(text, frame_start, frame_end = null, size = 35, x = 0, y = -250, color = [255, 255, 255]) {
        this.text = text;
        this.frame_start = frame_start;
        this.frame_end = frame_end;
        this.size = size;
        this.x = x;
        this.y = y;
        this.color = color;
    }
}



const SUBTITLES_DATA = [
    // Add your subtitles here! 
    // You can customize the start_frame, end_frame, text, size, x, y, and color.
    // x and y are relative to the center of the screen. 
    // y = 0 is the center, positive y goes down, negative y goes up.
    // x = 0 is the center, positive x goes right, negative x goes left.
    
    // Example for the final scene (starts around frame 1267):
    // new SubtitleLine("What... happened?", 0),
    // new SubtitleLine("What... happenedasas?", 10),
    // new SubtitleLine("I am finally free.", 1290, 1335),


    new SubtitleLine("aperte 'ESPAÇO' para iniciar", 0,1,15,0,-250, [191,191,191]),
    new SubtitleLine("Gabriel Schmitz\nComputação Gráfica 26.1", 0,1,20,0,200),
    new SubtitleLine("John Michael Howell", 0,1,25,0,50, [191,191,191]),
    new SubtitleLine("PUPPET", 0,47-3,100,10,-20),
    new SubtitleLine("PUPPET", 48-3,49-3,100,10,-20),
    new SubtitleLine("PUPPET", 48+2-3,49+2-3,100,10,-20),
    new SubtitleLine("baby", 94,127),
    new SubtitleLine("did you pull my strings", 132),
    new SubtitleLine("so you could play me?", 159),
    new SubtitleLine("strummin' on my heart just to betray me", 215),
    // new SubtitleLine("just to betray me", 240),
    new SubtitleLine("had me crazy over you", 290),
    // new SubtitleLine("over you", 320),

    
    new SubtitleLine("feels like i'm stuck inside your show, ", 410),
    new SubtitleLine("it's true", 490),


    new SubtitleLine("you got me wrapped a-", 540),
    new SubtitleLine("around your finger, ", 596),
    new SubtitleLine("acting like a fool", 636),
    new SubtitleLine("must've been the strings you pulled", 676+2),
    new SubtitleLine("now it's clear, ", 762),
    new SubtitleLine("i can see the truth", 802),
    new SubtitleLine("i was just a puppet to you", 842,932),
    new SubtitleLine("darlin', i'm done ", 945,972),
    new SubtitleLine("playin' along", 984,1013),
    new SubtitleLine("it's time to cut me loose", 1025),
    new SubtitleLine("got me wrapped around your finger, ", 1074),
    new SubtitleLine("acting like a fool", 1137),
    new SubtitleLine("but girl, i ain't no puppet, ", 1173),
    new SubtitleLine("no puppet, ", 1214),
    new SubtitleLine("no puppet ", 1236),
    new SubtitleLine("for you", 1254,1267+8),




    // {
    //     start_frame: 0, 
    //     // end_frame: 1290, 
    //     text: "What... happened?", 
    //     // size: 32, 
    //     // x: 0, 
    //     // y: 200, 
    //     // color: [255, 255, 255] // RGB color
    // },
    // {
    //     start_frame: 1290, 
    //     end_frame: 1333, 
    //     text: "I am finally free.", 
    //     // size: 32, 
    //     // x: 0, 
    //         // y: 200, 
    //     // color: [255, 255, 255]
    // }
];

class SubtitleManager {
    constructor(font) {
        this.font = font;
        // Create a dedicated layer for subtitles, just like in Scene_06_Around.js
        this.layer = createFramebuffer(); 
    }

    display(current_time_seconds, current_frame) {
        // Find which subtitles should be displayed right now
        let active_subtitles = [];
        for (let i = 0; i < SUBTITLES_DATA.length; i++) {
            let sub = SUBTITLES_DATA[i];
            // if there is no end_frame then use the start of the next
            if (sub.frame_end === null) {
                if (i + 1 < SUBTITLES_DATA.length) {
                    sub.frame_end = SUBTITLES_DATA[i + 1].frame_start;
                } else {
                    sub.frame_end = Infinity;
                }
            }

            if (current_frame >= sub.frame_start && current_frame < sub.frame_end) {
                active_subtitles.push(sub);
            }
        }

        // If we found any active subtitles, draw them on the screen
        if (active_subtitles.length > 0) {
            push();
            
            // 1. Draw the text into our dedicated layer
            this.layer.begin();
                clear(); // Erase previous frame's text
                
                // Set 2D view for drawing text perfectly flat inside the buffer
                camera(); 
                ortho(-width/2, width/2, -height/2, height/2, -1000, 1000);
                resetMatrix();

                for (let i = 0; i < active_subtitles.length; i++) {
                    let active_subtitle = active_subtitles[i];
                    
                    // Set up text appearance FIRST so textWidth() calculates correctly!
                    textFont(this.font);
                    textSize(active_subtitle.size);
                    textAlign(CENTER, CENTER);

                    // Use the x and y from the subtitle, with defaults just in case
                    let sub_x = active_subtitle.x !== undefined ? active_subtitle.x : 0;
                    let sub_y = active_subtitle.y !== undefined ? active_subtitle.y : -250;

                    // Add a nice text shadow for readability
                    fill(0); 
                    text(active_subtitle.text, sub_x + 2, sub_y + 2);
                    
                    // Draw the actual text
                    let col = active_subtitle.color || [255, 255, 255];
                    fill(col[0], col[1], col[2]); 
                    text(active_subtitle.text, sub_x, sub_y);
                }
            this.layer.end();
            
            // 2. Now place the layer perfectly on top of the 3D scene
            resetMatrix();
            camera(0, 0, 800, 0, 0, 0, 0, 1, 0); // Default camera
            
            // CRITICAL: Clear the depth buffer! 
            // This forces p5.js to forget about all 3D objects drawn so far,
            // guaranteeing that our image() is placed 100% on top of everything.
            clearDepth(); 

            tint(255, 255); // Reset tint
            imageMode(CENTER);
            image(this.layer, 0, 0);
            
            pop();
        }
    }
}


// --- End of media/Subtitles.js ---


// --- Start of sketch17.js ---

/// <reference path="./models/Puppet_03_Class.js" />
/// <reference path="./models/Hand_03_Class.js" />
/// <reference path="./scenes/Scene_Class.js" />
/// <reference path="./scenes/Scene_01_Dismantled.js" />





// ------------------------------ AI GENERATED START: Editor Variables/Functions ------------------------------
let editor_frame; // current frame (only for editor mode)
let editor_slider; // true if there is the frame slider in UI
let editor_input; // true if there is the frame input in UI to choose the frame precisely
let is_playing = false;
let btn_play;
let editor_step = 1;
let cam_info_input;
function updateEditorUI() {
	if (editor_slider && editor_input) { // if there is the slider and the box for frame input
		editor_slider.value(editor_frame); // changes slider value to current editor frame
		editor_input.value(Math.round(editor_frame * 100) / 100); // changes frame input value to current editor frame (rounded to 2 decimals)
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
			
			if (editor_frame > frame_end) { // restart everything when we're past the end WHILE PLAYING
				editor_frame = frame_start;
				song.jump(time_start);
			}
			updateEditorUI();
		} else { // if not playing (with either the animation or the song)
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
	head_tex = loadImage('head_texture.jpg');
	song = loadSound('Puppet_John_Michael_Howell.mp3');
  	font_loaded = loadFont('Roboto-VariableFont_wdth,wght.ttf');
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
}
// -------------------- AI GENERATED END: Press Space to Play/Pause song --------------------

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




// --- End of sketch17.js ---
