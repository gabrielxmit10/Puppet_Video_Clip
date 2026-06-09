/**
     * @typedef {"right_curtains"|"left_curtains"} StageParts
     * @typedef {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} RotationMode
     */

class Stage {
    // Guide of use (methods):
    //      - 

    constructor() {

        // Each rotation property will have a list of Keyframes that will have a mode
        this.right_curtains_trans_kfs = new TranslationKeyFrameList();
        this.left_curtains_trans_kfs = new TranslationKeyFrameList();


        // Map names to rotation kf lists
        this.trans_kfs_map = {
            'right_curtains': this.right_curtains_trans_kfs,
            'left_curtains': this.left_curtains_trans_kfs,
        };

        // Procedural animations map
        this.procedural_functions = {};

        // Visibility map for body parts
        this.show_map = {
            'right_curtains': true,
            'left_curtains': true,
        };
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
     * @param {StageParts} s
     */
    addTranslationX(s, kf) { // method to add kf to axis from outside
        if (this.trans_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.trans_kfs_map[s].x);
        }
    }
    /**
     * @param {StageParts} s
     */
    addTranslationY(s, kf) { // method to add kf to axis from outside
        if (this.trans_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.trans_kfs_map[s].y);
        }
    }
    /**
     * @param {StageParts} s
     */
    addTranslationZ(s, kf) { // method to add kf to axis from outside
        if (this.trans_kfs_map[s]) {
            this.#pushKeyFrame(kf, this.trans_kfs_map[s].z);
        }
    }
    /**
     * @param {StageParts} s
     */
    addTranslation(s, kf) { // function to add kf to multiple axes from outside at once
        if (this.trans_kfs_map[s]) {
            // create keyframe of each
            let kf_x = new KeyFrame(kf.time, kf.value[0], kf.type_of_lerp, kf.velocity);
            let kf_y = new KeyFrame(kf.time, kf.value[1], kf.type_of_lerp, kf.velocity);
            let kf_z = new KeyFrame(kf.time, kf.value[2], kf.type_of_lerp, kf.velocity);
            this.#pushKeyFrame(kf_x, this.trans_kfs_map[s].x);
            this.#pushKeyFrame(kf_y, this.trans_kfs_map[s].y);
            this.#pushKeyFrame(kf_z, this.trans_kfs_map[s].z);
        }
    }

    /**
     * @param {StageParts} s
     * @param {Function} func - function(time_current, [kf_x, kf_y, kf_z]) => [new_x, new_y, new_z]
     */
    addProcedural(s, func) { // adds a procedural transformation to the ending values of the kfs interpolation
        if (this.trans_kfs_map[s]) { // tests if s is one of the parts before adding the procedural function
            this.procedural_functions[s] = func;
        } else { // else it throws an error
            throw new Error('Part ' + s + ' not found for addProcedural()');
        }
    }

    #applyTranslation(time_current, tkf_list, part_name = null){ // takes a list of translation keyframes and applies the correct translation for the current time, interpolating (animate_kfs) and applying procedural functions (if they exist)
        
        // 1. Calculate base keyframe values (interpolate to the current time)
        let trans_x = tkf_list.x.length > 0 ? animate_kfs(time_current, tkf_list.x) : 0;
        let trans_y = tkf_list.y.length > 0 ? animate_kfs(time_current, tkf_list.y) : 0;
        let trans_z = tkf_list.z.length > 0 ? animate_kfs(time_current, tkf_list.z) : 0;

        // 2. If a procedural function exists, pass the time and the base keyframe values, and let the user return the final values!
        if (part_name && this.procedural_functions[part_name]) {
            let result = this.procedural_functions[part_name](time_current, [trans_x, trans_y, trans_z]);
            trans_x = result[0];
            trans_y = result[1];
            trans_z = result[2];
        }

        // 3. Apply the translations
        if (trans_x !== 0 || tkf_list.x.length > 0) translateX(radians(trans_x));
        if (trans_y !== 0 || tkf_list.y.length > 0) translateY(radians(trans_y));
        if (trans_z !== 0 || tkf_list.z.length > 0) translateZ(radians(trans_z));
    }

    #drawPart(shape, s) { // tests if the shape should be shown
        if (this.show_map[s]) { 
            model(shape);
        }
    }

    /**
     * @param {StageParts} b
     */
    hidePart(b) { // hides the part
        if (Object.hasOwn(this.show_map, b)) {
            this.show_map[b] = false;
        }
        else {
            throw new Error('Part ' + b + ' not found for hidePart()');
        }
    }
    /**
     * @param {StageParts} b
     */
    showPart(b) { // shows the part 
        if (Object.hasOwn(this.show_map, b)) {
            this.show_map[b] = true;
        }
        else {
            throw new Error('Part ' + b + ' not found for showPart()');
        }
    }
    hideAll() { // hides all of the stage parts
        for (let b in this.show_map) {
            this.hidePart(b);
        }
    }
    showAll() { // shows all of the stage parts
        for (let b in this.show_map) {
            this.showPart(b);
        }
    }
    /**
     * @param {StageParts} b
     */
    hideExcept(b) { // hides all parts except the one given
        this.hideAll();
        this.showPart(b);
    }

    

    display( time_current = 0 ) { 
        push();

        

        
        // Parts: floor (box, top middle on 0,0,0), back_wall (plane, geometry middle is on 0,0,0) 
        //      curtain (curtains_right has the left side, middle vertically at the 0,0,0. curtains_left has right side middle vertically at 0,0,0)
        //      curtains_top (top middle of the geometry is at 0,0,0)

        // CHANGE LATER (MAKE THE GEOMETRIES LATER, JUST DO THEM HERE NOW)
        push(); // floor
            strokeWeight(4);
            stroke(0);
            fill(150);

            let floor_width = 1660*2;
            let floor_height = 300;
            let floor_depth = 1660*1.5;
            translate(0, floor_height/2, 0);
            box(floor_width, floor_height, floor_depth);
        pop();

        push(); // back wall
            let wall_width = 1660*2;
            let wall_height = 1660;
            translate(0, -wall_height/2, -floor_depth/2);
            plane(wall_width, wall_height);
        pop();

        push(); // ceiling
            let ceiling_width = floor_width;
            let ceiling_depth = floor_depth;
            translate(0, -wall_height, 0);
            rotateX(HALF_PI);
            plane(ceiling_width, ceiling_depth);
        pop();

        push(); // top curtains
            let top_curtain_width = floor_width;
            let circle_radius = 100; // is the height of the curtain, but the curtain is made of multiple circles
        pop();

        


        pop();
    }
}
