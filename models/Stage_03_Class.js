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

    #pushKeyFrame(kf, ordered_kf_list) { 
        if (ordered_kf_list.length == 0) { 
            if (kf.type_of_lerp == KeyFrame.NO_TYPE_OF_LERP) kf.type_of_lerp = KeyFrame.DEFAULT_TYPE_OF_LERP;
            ordered_kf_list.push(kf);
            return;
        }

        let low = 0;
        let high = ordered_kf_list.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (ordered_kf_list[mid].time === kf.time) { 
                if (kf.type_of_lerp == KeyFrame.NO_TYPE_OF_LERP) {
                    kf.type_of_lerp = (mid > 0) ? ordered_kf_list[mid - 1].type_of_lerp : KeyFrame.DEFAULT_TYPE_OF_LERP;
                }
                ordered_kf_list[mid] = kf;
                return;
            } else if (kf.time > ordered_kf_list[mid].time) { 
                low = mid + 1; 
            } else { 
                high = mid - 1; 
            }
        }
        
        if (kf.type_of_lerp == KeyFrame.NO_TYPE_OF_LERP) {
            kf.type_of_lerp = (low > 0) ? ordered_kf_list[low - 1].type_of_lerp : KeyFrame.DEFAULT_TYPE_OF_LERP;
        }
        ordered_kf_list.splice(low, 0, kf); 
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

    addProcedural(s, func) { 
        if (this.trans_kfs_map[s]) { 
            this.procedural_functions[s] = func;
        } else { 
            throw new Error('Part ' + s + ' not found for addProcedural()');
        }
    }

    #applyTranslation(time_current, tkf_list, part_name = null) { 
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
                this.#applyTranslation(time_current, this.right_curtains_trans_kfs, 'right_curtains');
                model(stage_side_curtains_shape);
            pop();
            
            // Left curtains
            push(); 
                scale(0.5, 1, 1);
                scale(-1, 1, 1);
                this.#applyTranslation(time_current, this.left_curtains_trans_kfs, 'left_curtains');
                model(stage_side_curtains_shape);
            pop();
        pop();

        pop();
    }
}
