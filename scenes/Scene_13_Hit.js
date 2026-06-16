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