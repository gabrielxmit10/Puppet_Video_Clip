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
        this.global_string_pos_lower_arm_r; // position to allow a string to be tied to the arm
        this.global_string_pos_lower_arm_l; // position to allow a string to be tied to the arm
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
            this.#pushKeyFrame(kf, this.rot_kfs_map[s].mode_kfs);
        } else {
            throw new Error('Joint ' + s + ' not found in addRotationMode()');
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
            this.#pushKeyFrame(kf, this.rot_kfs_map[s].x);
        }
    }
    /**
     * @param {JointsNamesPuppet} s
     */
    addRotationY(s, kf) { // method to add kf to axis from outside
        if (this.rot_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.rot_kfs_map[s].y);
        }
    }
    /**
     * @param {JointsNamesPuppet} s
     */
    addRotationZ(s, kf) { // method to add kf to axis from outside
        if (this.rot_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.rot_kfs_map[s].z);
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
            this.#pushKeyFrame(kf_x, this.rot_kfs_map[s].x);
            this.#pushKeyFrame(kf_y, this.rot_kfs_map[s].y);
            this.#pushKeyFrame(kf_z, this.rot_kfs_map[s].z);
        }
    }

    addTranslationX(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.trans_kfs_map[s].x);
        }
    }
    addTranslationY(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.trans_kfs_map[s].y);
        }
    }
    addTranslationZ(s, kf) { 
        if (this.trans_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.trans_kfs_map[s].z);
        }
    }
    addTranslation(s, kf) { 
        if (this.trans_kfs_map[s]) {
            let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
            let kf_y = new KeyFrame(kf.time, kf.value[1], kf.type_of_lerp, kf.velocity);
            let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
            this.#pushKeyFrame(kf_x, this.trans_kfs_map[s].x);
            this.#pushKeyFrame(kf_y, this.trans_kfs_map[s].y);
            this.#pushKeyFrame(kf_z, this.trans_kfs_map[s].z);
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
        this.#pushKeyFrame(kf, this.visibility_kfs_map[b]);
    }

    #applyVisibility(time_current) {
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

    #applyTranslation(time_current, tkf_list, joint_name = null) { 
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

    #applyRotation(time_current, rkf_list, joint_name = null){ // takes a list of rotation keyframes and applies the correct rotation for the current time, interpolating (animate_kfs) and applying procedural functions (if they exist)
        
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

    #drawPart(shape, s) { // tests if the shape is not null and if the part should be shown
        if (this.show_map[s]) { 
            model(shape);
        } else {
            // -------------------- AI GENERATED START --------------------
            // "Warm up" the GPU: draw the part microscopically small so WebGL 
            // caches the textures and geometries, preventing lag spikes later!
            // (the lag I had here was in scene_05_theater when the camera changed and the head had to be loaded again)
            
            push();
            scale(0.0001);
            model(shape);
            pop();
            // -------------------- AI GENERATED END --------------------
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

    

    display( time_current = 0 ) { 
        push();

        // Apply visibility keyframes
        this.#applyVisibility(time_current);

        // TRANSLATIONS OF FULL_BODY WILL BE PLACED HERE
        this.#applyTranslation(time_current, this.full_body_trans_kfs, 'full_body');

        // ROTATIONS OF FULL_BODY WILL BE PLACED HERE
        this.#applyRotation(time_current,this.full_body_rot_kfs, 'full_body');

        
        // -------------------- Legs Start --------------------
        // ---------- Right Leg ----------
        
        push();

        // Upper Leg
        translate(50, 250, 0);
        // ROTATIONS OF hips_leg_R WILL BE PLACED HERE
        this.#applyRotation(time_current,this.hips_leg_r_rot_kfs, 'hips_leg_r');
        this.#drawPart(upper_leg_shape, 'upper_leg_r');

        // Lower Leg
        translate(0, height_upper_leg, 0);
        // ROTATIONS OF KNEE_R WILL BE PLACED HERE
        this.#applyRotation(time_current,this.knee_r_rot_kfs, 'knee_r');
        this.#drawPart(lower_leg_shape, 'lower_leg_r');

        // Foot
        translate(0, height_lower_leg + radius_lower_leg, 0);
        // ROTATIONS OF ANKLE_R WILL BE PLACED HERE
        translate(0, -30, 10)
        this.#applyRotation(time_current,this.ankle_r_rot_kfs, 'ankle_r');
        translate(0, 30, -10)
        this.#drawPart(foot_shape, 'foot_r');

        pop();

        // ---------- Left Leg ----------
        push();

        
        // Upper Leg
        translate(-50, 250, 0);
        // ROTATIONS OF hips_leg_L WILL BE PLACED HERE
        this.#applyRotation(time_current,this.hips_leg_l_rot_kfs, 'hips_leg_l');
        this.#drawPart(upper_leg_shape, 'upper_leg_l');

        // Lower Leg
        translate(0, height_upper_leg, 0);
        // ROTATIONS OF KNEE_L WILL BE PLACED HERE
        this.#applyRotation(time_current,this.knee_l_rot_kfs, 'knee_l');
        this.#drawPart(lower_leg_shape, 'lower_leg_l');

        // Foot
        translate(0, height_lower_leg + radius_lower_leg, 0);
        // ROTATIONS OF ANKLE_L WILL BE PLACED HERE
        translate(0, -30, 10)
        this.#applyRotation(time_current,this.ankle_l_rot_kfs, 'ankle_l');
        translate(0, 30, -10)
        this.#drawPart(foot_shape, 'foot_l');

        pop();

        // -------------------- Legs End --------------------


        translate(0, 220, 0);
        // ROTATIONS OF HIPS WILL BE PLACED HERE
        this.#applyRotation(time_current,this.hips_rot_kfs, 'hips');
        translate(0, -220, 0);

        // -------------------- Head Start --------------------
        push();
        // ROTATIONS OF NECK WILL BE PLACED HERE
        this.#applyRotation(time_current,this.neck_rot_kfs, 'neck');
        // -------------------- AI GENERATED NOW START --------------------
        // Use our new function to grab the absolute position!
        global_head_pos = getGlobalPosition();
        // -------------------- AI GENERATED NOW END --------------------
        texture(head_tex);
        this.#drawPart(head_shape, 'head');
        pop();
        // -------------------- Head End --------------------




        // -------------------- Body Start --------------------
        push();
        
        this.#drawPart(body_shape, 'body');
        pop();
        // -------------------- Body End --------------------


        



        // -------------------- Arms Start --------------------
        // ---------- Right Arm ----------
        push();
        
        // Upper Arm ------------------------------
        translate(shoulder_r_pos);
        // rotateZ(radians(-30)); // REMOVE LATER
        // ROTATIONS OF SHOULDER_R WILL BE PLACED HERE
        this.#applyRotation(time_current,this.shoulder_r_rot_kfs, 'shoulder_r');
        this.#drawPart(upper_arm_shape, 'upper_arm_r');
        

        // Lower Arm ------------------------------
        translate(0, height_upper_arm, 0); // place at the end of upper arm
        // ROTATIONS OF ELBOW_R WILL BE PLACED HERE
        this.#applyRotation(time_current,this.elbow_r_rot_kfs, 'elbow_r');

        // Get the global position of a part of the lower arm to allow a string to be tied to it (in scene 02)
        push();
            translate(0, height_lower_arm-radius_hand-20, 0); // translate to right above the hand
            this.global_string_pos_lower_arm_r = getGlobalPosition(); // Get the global position
            // console.log("Global position of lower arm for string: ", this.global_lower_arm_r_string_pos); // REMOVE LATER - just for checking the position is correct in the console
        pop();

        this.#drawPart(lower_arm_shape, 'lower_arm_r');
        

        // Hand ------------------------------
        translate(0, height_lower_arm, 0); // place at the end of lower arm
        this.#drawPart(hand_shape, 'hand_r');
        

        pop();

        // ---------- Left Arm ----------
        push();
        // Upper Arm ------------------------------
        translate(shoulder_l_pos);
        // rotateZ(radians(30)); // REMOVE LATER
        // ROTATIONS OF SHOULDER_L WILL BE PLACED HERE
        this.#applyRotation(time_current,this.shoulder_l_rot_kfs, 'shoulder_l');
        this.#drawPart(upper_arm_shape, 'upper_arm_l');
        
        
        // Lower Arm ------------------------------
        translate(0, height_upper_arm, 0); // place at the end of upper arm
        // ROTATIONS OF ELBOW_L WILL BE PLACED HERE
        this.#applyRotation(time_current,this.elbow_l_rot_kfs, 'elbow_l');   
        
        // Get the global position of a part of the lower arm to allow a string to be tied to it (in scene 02)
        push();
            translate(0, height_lower_arm-radius_hand-20, 0); // translate to right above the hand
            this.global_string_pos_lower_arm_l = getGlobalPosition(); // Get the global position
            // console.log("Global position of lower arm for string: ", this.global_lower_arm_r_string_pos); // REMOVE LATER - just for checking the position is correct in the console
        pop();
        
        this.#drawPart(lower_arm_shape, 'lower_arm_l');
        

        // Hand ------------------------------
        translate(0, height_lower_arm, 0); // place at the end of lower arm
        this.#drawPart(hand_shape, 'hand_l');
        pop();

        // -------------------- Arms End --------------------






        


        pop();
    }
}
