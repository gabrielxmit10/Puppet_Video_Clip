const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


// let keyframe_version = 24; // This represents the unit of frames we use in our keyframe list
// let framerate = 24; // This represents the framerate of our animation

/**
 * * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode 
*/
class RotationKeyFrameList {
    constructor( mode = 'XYZ' ) {
        
        this.x = []; this.y = []; this.z = []; // each is a list of keyframes for a specific rotation around the specific axis
        this.mode = mode; // This will determine the order of rotations

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

    static DEFAULT_TYPE_OF_LERP = "easeInOut";
    static NO_TYPE_OF_LERP = "noType";

    /**
     * @param {number} time 
     * @param {number|Array<number>} value 
     * @param {InterpolationType} type_of_lerp 
     * @param {number|Array<number>} v 
     */
	constructor(time=0, value=0, type_of_lerp = KeyFrame.NO_TYPE_OF_LERP, v = 0) {
		this.time = time;
		this.value = value; // can be a single value or an array (mostly of 3 values)

		// if type_of_lerp is not a string, then put its value on v and type_of_lerp to "noType"
		if (typeof type_of_lerp !== "string") {
			this.velocity = type_of_lerp;
			this.type_of_lerp = KeyFrame.NO_TYPE_OF_LERP;
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

function find_kf_and_type(frame_current, kf_list) { // finds the 2 keyframes that frame_current is between and the type of lerp of the keyframe before it

    // -------------------- AI GENERATED START --------------------

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

        if (frame_current >= kf1.time && frame_current <= kf2.time) {
            found_index = mid;
            break;
        } else if (frame_current < kf1.time) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    if (low > high) {
        throw new Error(`frame_current (${frame_current}) is out of bounds in find_kf_and_type`);
    }

    let kf1 = kf_list[found_index];
    let kf2 = kf_list[found_index + 1];

    // Find the type of lerp by looking backwards for the last informed type
    let type_of_lerp = KeyFrame.DEFAULT_TYPE_OF_LERP;
    for (let i = found_index; i >= 0; i--) {
        if (kf_list[i].type_of_lerp !== KeyFrame.NO_TYPE_OF_LERP) {
            type_of_lerp = kf_list[i].type_of_lerp;
            break;
        }
    }

    return [kf1, kf2, type_of_lerp];

    // -------------------- AI GENERATED END --------------------

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

function kf_lerp(kf1, kf2, t, type_of_lerp) { // takes keyframes and the t between them and returns the interpolated value
    // if (type_of_lerp === "constant") return kf1.value;

    // Calculate new t based on the type of lerp between kfs
    let t_new = calculate_easing_t(kf1, kf2, t, type_of_lerp);

    // Apply that t_new to the values (regardless of whether they are numbers, vectors, or arrays)
    return interpolate_values(kf1.value, kf2.value, t_new);
}

function calculate_easing_t(kf1, kf2, t, type_of_lerp) {
    // This function purely handles the math of warping time (t -> t_new)
    if (type_of_lerp === "constant") return 0; // at the beggining of the interval
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

function interpolate_bezierSimple(t, x0, y0, x1, y1) { // interpolates from 0 to 1 using the given 4 values as control points
    // -------------------- AI GENERATED START --------------------
    
    if (t === 0 || t === 1) return t;

    // Binary search to find u such that bezier_x(u) == t
    let u_low = 0;
    let u_high = 1;
    let u = t; // initial guess
    
    for (let i = 0; i < 15; i++) {
        // Evaluate Bezier X
        let u_inv = 1 - u;
        let current_x = 3 * u_inv*u_inv * u * x0 + 3 * u_inv * u*u * x1 + u*u*u;
        
        if (Math.abs(current_x - t) < 0.001) break;
        
        if (current_x < t) u_low = u;
        else u_high = u;
        
        u = (u_low + u_high) / 2;
    }

    // Return Bezier Y for the found u
    let u_inv = 1 - u;
    return 3 * u_inv*u_inv * u * y0 + 3 * u_inv * u*u * y1 + u*u*u;

    // -------------------- AI GENERATED END --------------------
}

function interpolate_values(value1, value2, t_new) { // handles the structure of the data (p5.Vector, Array, or Number)
    
    // Handle p5.Vector
    if (value1 instanceof p5.Vector && value2 instanceof p5.Vector) {
        return p5.Vector.lerp(value1, value2, t_new);
    }
    
    // Handle arrays/lists
    if (Array.isArray(value1) && Array.isArray(value2)) {
        let result = [];
        for (let i = 0; i < value1.length; i++) {
            result[i] = lerp(value1[i], value2[i], t_new);
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


