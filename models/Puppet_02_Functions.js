


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


			// (AI GENERATED)
			// Store U, V coordinates alongside the 3D position
			// U goes from 0 to 1 around the cylinder (j)
			// V goes from 0 to 0.5 for the bottom part of the head (i)
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


	// -------------------- Top of the Head (upper hemisphere only) -------------------- (AI GENERATED)
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


			// (AI GENERATED)
			// Calculate Texture UV mappings for the hemisphere
			// U is horizontal rotation (0 to 1) -> corresponds to j
			// V is vertical height (0 to 0.5) -> corresponds to i. (top half of image goes on hemisphere)
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

