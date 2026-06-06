
/**
 * @typedef {"arm"|"palm"|"pinky0"|"pinky1"|"pinky2"|"ring0"|"ring1"|"ring2"|"middle0"|"middle1"|"middle2"|"index0"|"index1"|"index2"|"thumb0"|"thumb1"|"thumb2"} JointsNamesHand
 * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode
*/


class Hand {
	// Guide of use (methods):
	// - TBD (CHANGE LATER - continue writing)


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

	// private method to push kf to a list of keyframes (so that they maintain their order and the user can add keyframes in any order they want)
    //      This function should also overwrite if the kf.time is the same as an existing kf in the list
    #pushKeyFrame(kf, ordered_kf_list) { // pushes into the ordered_list of kfs
        // make a binary search to find the right place to insert the kf

        if (ordered_kf_list.length == 0) { // since this is the first, we set its type_of_lerp to the default one if it was not set by the user (so if it is NO_TYPE_OF_LERP)
            if (kf.type_of_lerp == KeyFrame.NO_TYPE_OF_LERP) kf.type_of_lerp = KeyFrame.DEFAULT_TYPE_OF_LERP;
            ordered_kf_list.push(kf);
            return;
        }

        // -------------------- AI GENERATED START --------------------
        let low = 0;
        let high = ordered_kf_list.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (ordered_kf_list[mid].time === kf.time) { // Overwrite if same time
                if (kf.type_of_lerp == KeyFrame.NO_TYPE_OF_LERP) {
                    kf.type_of_lerp = (mid > 0) ? ordered_kf_list[mid - 1].type_of_lerp : KeyFrame.DEFAULT_TYPE_OF_LERP;
                }
                ordered_kf_list[mid] = kf;
                return;
            } else if (kf.time > ordered_kf_list[mid].time) { // kf.time in the right of the list
                low = mid + 1; // move search to the right half
            } else { // kf.time in the left of the list
                high = mid - 1; // move search to the left half
            }
        }
        
        if (kf.type_of_lerp == KeyFrame.NO_TYPE_OF_LERP) {
            kf.type_of_lerp = (low > 0) ? ordered_kf_list[low - 1].type_of_lerp : KeyFrame.DEFAULT_TYPE_OF_LERP;
        }
        ordered_kf_list.splice(low, 0, kf); // insert kf in the list
        // -------------------- AI GENERATED END --------------------
    }

	/**
     * @param {JointsNamesHand} s
     */
    addRotationX(s, kf) { // method to add kf to axis from outside
        if (this.main_rot_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.main_rot_kfs_map[s].x);
        } else if (this.finger_rot_kfs_map[s]) {
			this.#pushKeyFrame(kf, this.finger_rot_kfs_map[s].x);
		}
    }
	/**
     * @param {JointsNamesHand} s
     */
    addRotationY(s, kf) { // method to add kf to axis from outside
        if (this.main_rot_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.main_rot_kfs_map[s].y);
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
            this.#pushKeyFrame(kf, this.main_rot_kfs_map[s].z);
        } else if (this.finger_rot_kfs_map[s]) {
			this.#pushKeyFrame(kf, this.finger_rot_kfs_map[s].z);
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
            this.#pushKeyFrame(kf_x, this.rot_kfs_map[s].x);
            this.#pushKeyFrame(kf_y, this.rot_kfs_map[s].y);
            this.#pushKeyFrame(kf_z, this.rot_kfs_map[s].z);
        } else if (this.finger_rot_kfs_map[s]) {
			// create keyframe of each
			let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
			let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
			this.#pushKeyFrame(kf_x, this.finger_rot_kfs_map[s].x);
			this.#pushKeyFrame(kf_z, this.finger_rot_kfs_map[s].z);
			if (kf.value[1] != 0) {
				console.warn('Warning: trying to add rotation keyframe with non zero Y value to finger joint ' + s + ' which does not rotate in Y. The Y value will be ignored.');
			}
		}
    }

	#applyRotation(time_current, rkf_list){ // takes a list of rotation keyframes and applies the correct rotation for the current time (will be called in display)
        
        // check modes to rotate in the right order with the value from animate_kfs(time_current, kf_list)

        for (let i = 0; i < rkf_list.mode.length; i++) { 
            if (rkf_list.mode[i] == 'X') {
                if (rkf_list.x.length > 0) rotateX( radians( animate_kfs(time_current, rkf_list.x) ) );
            } 
            else if (rkf_list.mode[i] == 'Y') {
                if (rkf_list.y.length > 0) rotateY( radians( animate_kfs(time_current, rkf_list.y) ) );
            }
            else if (rkf_list.mode[i] == 'Z') {
                if (rkf_list.z.length > 0) rotateZ( radians( animate_kfs(time_current, rkf_list.z) ) );
            }
        }
    }
    #drawPart(shape) { // tests if the shape is not null before drawing (with model(shape))
        if (shape) { 
            // this if is done so the program doesn't crash if the puppet is not fully made yet
            model(shape);
        }
    }

	#apply_and_draw_finger_section(time_current, heights_list, shapes_list, rot_kfs_list) {
		// this function applies the rotations and draws a section of a finger (used for all sections of all fingers in display())
		push();
		// section 0 (no translate since it is at the origin here)
		this.#applyRotation(time_current, rot_kfs_list[0]);
		this.#drawPart(shapes_list[0]);

		// section 1 (translate to top of section 0)
		translate(0, -heights_list[0], 0);
		this.#applyRotation(time_current, rot_kfs_list[1]);
		this.#drawPart(shapes_list[1]);

		// section 2 (translate to top of section 1)
		translate(0, -heights_list[1], 0);
		this.#applyRotation(time_current, rot_kfs_list[2]);

		// -------------------- AI GENERATED NOW START --------------------
		// Translate to the very tip of the finger
		push();
		translate(0, -heights_list[2]/2, 0); 
		// Grab the position of the tip
		noStroke();
		fill(220);
		global_finger_pos = getGlobalPosition();
		// rotateY(PI/10);
		// cylinder(23,9,5,1); // REMOVE LATER (testing the lines attached to the fingers)
		// Translate back so the drawing isn't messed up
		pop();
		// -------------------- AI GENERATED NOW END --------------------

		this.#drawPart(shapes_list[2]);
		
		pop();
	} 

	#apply_and_draw_thumb_section(time_current, thumb_heights_list, shapes_list, rot_kfs_list) {
		// this function applies the rotations and draws a section of a finger (used for all sections of all fingers in display())
		push();
		// section 0 (no translate since it is at the origin here)
		this.#applyRotation(time_current, rot_kfs_list[0]);
		this.#drawPart(shapes_list[0]);

		// section 1 (translate here is a bit different, cause we want the bottom of section 1 to sit a bit inside the sphere of section 0)
		translate(0, -thumb_heights_list[1]/2, 0);
		this.#applyRotation(time_current, rot_kfs_list[1]);
		this.#drawPart(shapes_list[1]);

		// section 2 (translate to top of section 1)
		translate(0, -thumb_heights_list[1], 0);
		this.#applyRotation(time_current, rot_kfs_list[2]);
		this.#drawPart(shapes_list[2]);
		
		pop();
	}

	display( time_current ) {
		push();
		strokeWeight(hand_stroke_weight);
		stroke(color_hand_stroke);
		linePerspective(false);

		// Arm
		this.#applyRotation(time_current, this.arm_rot_kfs);
		this.#drawPart(hand_arm_shape);

		// Palm
		translate(0, -hand_arm_height, 0); // translate to the top of the arm where the palm is
		this.#applyRotation(time_current, this.palm_rot_kfs);
		this.#drawPart(hand_palm_shape);

		// -------------------- Fingers (pinky to thumb)--------------------

		// because of the palm translate, we are at the base of the palm now
		// each section of finger will then translate to their correct position on the palm and then apply their rotations and draw themselves

		// Pinky
		push();
		translate(-90, -170, 0); // translate to the base of the pinky
		rotateY(PI/24); rotateZ(-PI/4); // apply natural rotation of pinky in relation to the palm
		// function to apply the rotations and draw the sections
		this.#apply_and_draw_finger_section(time_current, hand_finger_heights.pinky, hand_finger_shapes.pinky, this.finger_rot_kfs.pinky);
		pop();

		// Ring
		push();
		translate(-55, -200, 0); // translate to the base of the ring finger
		rotateZ(-PI/20); // apply natural rotation of ring finger in relation to the palm
		this.#apply_and_draw_finger_section(time_current, hand_finger_heights.ring, hand_finger_shapes.ring, this.finger_rot_kfs.ring);
		pop();

		// Middle
		push();
		translate(0, -200, 0); // translate to the base of the middle finger
		this.#apply_and_draw_finger_section(time_current, hand_finger_heights.middle, hand_finger_shapes.middle, this.finger_rot_kfs.middle);
		pop();

		// Index
		push();
		translate(60, -200, 0); // translate to the base of the index finger
		rotateZ(PI/10); // apply natural rotation of index finger in relation to the palm
		this.#apply_and_draw_finger_section(time_current, hand_finger_heights.index, hand_finger_shapes.index, this.finger_rot_kfs.index);
		pop();

		// Thumb
		push();
		translate(75, -65, 0); // translate to where the center of the ball is related to the palm joint at the origin
		rotateZ(PI/2-PI/8); // apply natural rotation of thumb in relation to the palm
		this.#apply_and_draw_thumb_section(time_current, hand_finger_heights.thumb, hand_finger_shapes.thumb, this.finger_rot_kfs.thumb);
		pop();

		pop();
	}
}
