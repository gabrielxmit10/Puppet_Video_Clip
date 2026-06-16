
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
