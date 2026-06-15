/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
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

// CHANGE LATER - see if you should remove this or if you will use this
// function sequenceProcedurals(sequence) { // this will be called in puppet.addProcedural where 
//     // sequence is an array of arrays: [ [start_time, end_time, function_to_apply], ... ]
//     return (time_current, base_value) => {
//         let frame_current = time_current * keyframe_version;
//         for (let i = 0; i < sequence.length; i++) {
//             let [start, end, func] = sequence[i];
            
//             // If the current time falls within this interval, use its procedural function!
//             if (frame_current >= start && frame_current < end) {
//                 return func(time_current, base_value);
//             }
//         }
//         // If we aren't inside any defined interval, just return the value unmodified
//         return base_value;
//     };
// }

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
        // this.sequence_procedurals_puppet = []; // CHANGE LATER - see if you should remove this or if you will use this

        // start,,,,,end(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        let part1_start = start_frame; // from the side
        let part2_start = 1175; // from the front
        let part3_start = 1210; // from the side going past
        // let parts_end = end_frame;
        let part4_start = 1237;
        let part5_start = 1256; // CHANGE LATER - REMOVE ALL THATS PART 5
        
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
        this.puppet.addTranslation('full_body', new KeyFrame(part5_start, [0, puppet_pos_end, 0], 'constant'));
        
        // background translation (moves but less then part 1)
        this.translate_background_kf_list.push(new KeyFrame(part4_start, [0, 2000+500, 0],'linear'));
        this.translate_background_kf_list.push(new KeyFrame(part5_start, [0, 2000-500, 0],'constant'));
        
        // camera 
        // this.camera_kf_list2.push(new KeyFrame(part4_start, [-3604, 3023, 366, 0, puppet_pos_part4, 0], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(end_frame, [-3604, 3023, 366, 0, puppet_pos_end, 0], 'constant'));
        this.camera_kf_list2.push(new KeyFrame(part4_start, [-4500, 0, 0, 0, puppet_pos_part4, 0], 'easeInOut'));
        this.camera_kf_list2.push(new KeyFrame(part5_start, [-4500, 0, 0, 0, puppet_pos_end, 0], 'constant'));
        
        // tremble all 
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(part4_start,[0,0,0], 'constant'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1242+1,[100,500,100], 'easeOut'));
        this.amplitudes_tremble_all_kf_list.push(new KeyFrame(1242+12,[0,0,0], 'constant'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1242+1,[5,2,5], 'linear'));
        this.frequencies_tremble_all_kf_list.push(new KeyFrame(1242+12,[5,0,5], 'constant'));
        
        
        
        
        // ------------------------------ SCENE PART 5 (falling, big camera) ------------------------------
        
        // camera (big)
        this.camera_kf_list1.push(new KeyFrame(part5_start, [-9533+600, -751, 0, 0, -2752, 0], 'easeIn'));
        // this.camera_kf_list2.push(new KeyFrame(part5_start, [-4500, 0, 0, 0, puppet_pos_end, 0], 'constant'));



        this.camera_shots_list = [
            new Shot(part1_start, this.camera_kf_list1),
            new Shot(part2_start, this.camera_kf_list2),
            new Shot(part3_start, this.camera_kf_list1),
            new Shot(part4_start, this.camera_kf_list2),
            new Shot(part5_start, this.camera_kf_list1),
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