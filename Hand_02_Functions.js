


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




