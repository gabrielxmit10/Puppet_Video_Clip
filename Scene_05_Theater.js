/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_05_Theater extends Scene {
    
    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 425, 596 
        
        // Initialize necessary objects and lists
        this.puppet = new Puppet(); 
        
        // Setting up visibility keyframes for the head
        this.puppet.addVisibility('head', new KeyFrame(0, 0));
        this.puppet.addVisibility('head', new KeyFrame(-0+505, 1));
        
        this.stage = new Stage();
        this.camera1_kf_list = [];
        this.camera2_kf_list = [];
        this.camera_shot_list = [];

        // 25,39,54,67,79, (head: down, left, down, right, down)
        // 93,18,25, (curtains: open, closing, closed)
        // 55,63,70,79 (opening cte kfs)
        // 96 (end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        // posing the puppets arms
        this.puppet.changeRotationMode('shoulder_r', 'ZYX');
        this.puppet.changeRotationMode('shoulder_l', 'ZYX');
        this.puppet.addRotation('shoulder_r', new KeyFrame(0, [0,0,-90], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(0, [0,0,90], 'constant'));

        // CHANGE LATER (Either remove the following or change, they are for the case that u might want to make the arms bend a bit, as if pulling the strings a bit when the camera looks at the respective hand and coming back fast to show the character is really tied by the strings. To keep this simpler for now I wont test yet)
        // this.puppet.addRotation('shoulder_r', new KeyFrame(0, [-40+20,0,-90]));
        // this.puppet.addRotation('shoulder_l', new KeyFrame(0, [-40+20,0,90]));
        // this.puppet.addRotation('elbow_r', new KeyFrame(0, [40*2,0,0]));
        // this.puppet.addRotation('elbow_l', new KeyFrame(0, [40*2,0,0]));
        
        // this.camera1_kf_list.push(new KeyFrame(420, [-1, -796, -134, -1, -711, -29], 'constant')); // wait
        this.camera1_kf_list.push(new KeyFrame(415, [-1, -796, -134, -1, -711, -29], 'easeInOut'));
        this.camera1_kf_list.push(new KeyFrame(432, [-112, -767, -82, -1, -711, -29], 'constant')); // wait
        this.camera1_kf_list.push(new KeyFrame(435, [-112, -767, -82, -1, -711, -29], 'easeInOut'));
        this.camera1_kf_list.push(new KeyFrame(470, [112, -767, -82, 1, -711, -29], 'constant')); // wait
        this.camera1_kf_list.push(new KeyFrame(475, [112, -767, -82, 1, -711, -29], 'easeInOut'));
        this.camera1_kf_list.push(new KeyFrame(500, [-1, -796, -134, -1, -711, -29])); 
        
        this.camera2_kf_list.push(new KeyFrame(475, [0, -752, 3734-1000, 0, -699, 62], 'easeOut')); // 
        this.camera2_kf_list.push(new KeyFrame(554, [0, -752, 3734+200, 0, -699, 62+200], 'constant'));


        


        this.puppet.changeRotationMode('neck', 'YXZ');
        this.puppet.addRotationX('neck', new KeyFrame(5-15+440+7+3+25+10+5+25, -30, 'easeInOut'));
        this.puppet.addRotationX('neck', new KeyFrame(5-15+440+7+3+25+10+5+25+5+20-5, -0));
        // this.puppet.addRotationY('neck', new KeyFrame(-15+440+7+3+25+10+5, -90, 'easeOut'));
        // this.puppet.addRotationY('neck', new KeyFrame(5-15+440+7+3+25+10+5+25, 0, 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));


        this.stage.addTranslation('right_curtains', new KeyFrame(505, [1000,0,0],'easeInOut'));
        this.stage.addTranslation('right_curtains', new KeyFrame(535, [0,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(505, [1000,0,0],'easeInOut'));
        this.stage.addTranslation('left_curtains', new KeyFrame(535, [0,0,0], 'constant'));
        
        // frame by frame part (4 frames -> 555,563,570,579)

        this.puppet.resetAllRotations(535);

        let camera_zoom = 0;
        // frame 555
        this.camera2_kf_list.push(new KeyFrame(555, [0, -752, 3934-camera_zoom, 0, -699, 262-camera_zoom], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(0, [0,0,0], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(555, [100,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(555, [100,0,0], 'constant'));
        // this.stage.addTranslation('right_curtains', new KeyFrame(555, [400,0,0], 'constant'));
        // this.stage.addTranslation('left_curtains', new KeyFrame(555, [400,0,0], 'constant'));
        
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(555, 'YXZ'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(555, 'YXZ'));
        this.puppet.addRotation('neck', new KeyFrame(555, [20,0,-5], 'constant'));
        this.puppet.addRotation('hips', new KeyFrame(555, [0,0,5], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(555, [90-10,0,10], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(555, [90-0,0,-5], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(555, [0,0,floor_depth/2-400], 'constant'));
        
        
        this.puppet.addRotation('hips_leg_l', new KeyFrame(555, [-20,-20,5], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(555, [20,0,-5], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(555, [-20,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(555, [-20,0,0], 'constant'));
        
        
        
        
        // frame 563
        this.camera2_kf_list.push(new KeyFrame(563, [0, -752, 3934-camera_zoom*2, 0, -699, 262-camera_zoom*2], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(563, [300,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(563, [200,0,0], 'constant'));
        // this.stage.addTranslation('right_curtains', new KeyFrame(563, [900,0,0], 'constant'));
        // this.stage.addTranslation('left_curtains', new KeyFrame(563, [900,0,0], 'constant'));
        
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(563, 'YZX'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(563, 'YZX'));
        this.puppet.addRotation('neck', new KeyFrame(563, [20,0,-5], 'constant'));
        this.puppet.addRotation('hips', new KeyFrame(563, [-20,0,0], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(563, [-30,-90,-90], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(563, [-10,90,120], 'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(563, [20,0,0], 'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(563, [20,0,0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(563, [0,0,floor_depth/2-320], 'constant'));
        
        
        this.puppet.addRotation('hips_leg_l', new KeyFrame(563, [60,-10,5], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(563, [0,0,-5], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(563, [-90,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(563, [-20,0,0], 'constant'));
        
        
        
        // frame 570
        this.camera2_kf_list.push(new KeyFrame(570, [0, -752, 3934-camera_zoom*3, 0, -699, 262-camera_zoom*3], 'constant'));
        // this.camera2_kf_list.push(new KeyFrame(570, [-218, -695, 3728, 41, -700, 65], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(570, [400,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(570, [550,0,0], 'constant'));
        // this.stage.addTranslation('right_curtains', new KeyFrame(570, [1000,0,0], 'constant'));
        // this.stage.addTranslation('left_curtains', new KeyFrame(570, [1000,0,0], 'constant'));
        
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(570, 'YZX'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(570, 'YZX'));
        this.puppet.addRotation('neck', new KeyFrame(570, [30,0,0], 'constant'));
        this.puppet.addRotationMode('hips', new KeyFrame(570, 'YZX'));
        this.puppet.addRotation('hips', new KeyFrame(570, [-30,-5,0], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(570, [-100,-120,-90], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(570, [-50+(10),90,130], 'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(570, [40,0,0], 'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(570, [40+(0*2),0,0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(570, [-70,-30,floor_depth/2-100], 'constant'));
        
        
        this.puppet.addRotation('hips_leg_l', new KeyFrame(570, [80,0,10], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(570, [-20,0,-15], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(570, [-50,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(570, [-20,0,0], 'constant'));
        
        
        
        
        
        
        
        
        // frame 582 (final pose)
        this.camera2_kf_list.push(new KeyFrame(582, [0-0, -752, 3934-camera_zoom*4, 0-0, -699, 262-camera_zoom*4], 'constant'));
        // this.camera2_kf_list.push(new KeyFrame(582, [-308, -855, 3723, 37, -552, 79], 'constant'));
        this.stage.addTranslation('right_curtains', new KeyFrame(582, [550,0,0], 'constant'));
        this.stage.addTranslation('left_curtains', new KeyFrame(582, [750,0,-80], 'constant'));
        
        this.puppet.addRotation('full_body', new KeyFrame(582, [10,5,0], 'constant'));
        this.puppet.addRotationMode('shoulder_r', new KeyFrame(582, 'YZX'));
        this.puppet.addRotationMode('shoulder_l', new KeyFrame(582, 'YZX'));
        this.puppet.addRotation('neck', new KeyFrame(582, [10,0,0], 'constant'));
        this.puppet.addRotationMode('hips', new KeyFrame(582, 'YZX'));
        this.puppet.addRotation('hips', new KeyFrame(582, [-10,-15,0], 'constant'));
        this.puppet.addRotation('shoulder_r', new KeyFrame(582, [-140,-120,-120], 'constant'));
        this.puppet.addRotation('shoulder_l', new KeyFrame(582, [-140,90,120], 'constant'));
        this.puppet.addRotation('elbow_r', new KeyFrame(582, [0,0,0], 'constant'));
        this.puppet.addRotation('elbow_l', new KeyFrame(582, [40,0,0], 'constant'));
        this.puppet.addTranslation('full_body', new KeyFrame(582, [-100,-90,floor_depth/2+200], 'constant'));
        
        // this.puppet.addRotationMode('hips_leg_l', new KeyFrame(582, 'YZX'));
        this.puppet.addRotation('hips_leg_l', new KeyFrame(582, [90,0,20], 'constant'));
        this.puppet.addRotation('hips_leg_r', new KeyFrame(582, [-50,0,-15], 'constant'));
        this.puppet.addRotation('knee_l', new KeyFrame(582, [-30,0,0], 'constant'));
        this.puppet.addRotation('knee_r', new KeyFrame(582, [-20,0,0], 'constant'));
        





        this.camera_shot_list.push( new Shot (0, this.camera1_kf_list)); // adding first camera starting from 0 (from the start)
        this.camera_shot_list.push( new Shot (-0+505, this.camera2_kf_list)); // adding second camera starting in the middle of the head turn
    }

    display(time_current) {

        let frame_current = time_current * keyframe_version;
        
        // Camera ----------------------

        push();
        // camera(-1, -796, -134, -1, -711, -29);
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_shots(time_current, this.camera_shot_list));
        }

        let noise_start = 410/keyframe_version; let noise_end = (-0+505)/keyframe_version; // only apply noise to the camera in this time window (when we are in the puppets vision)
        let amplitudes = [0.1*2, 0.02*2, 0.05*2];
        amplitudes = amplitudes.map(x => x*stepDouble(time_current, noise_start,noise_end)); // limits noise to where I want it to apply to
        let frequencies = [0.5, 0.5, 0.35];
        let times = [time_current+0, time_current+1500+0, time_current+2000+0];
        let noise_for_cam = noise_func(times, amplitudes, frequencies);
        
        // noise_for_cam = noise_for_cam.map(x => x);

        _renderer._curCamera.pan(noise_for_cam[0]); // left right
        _renderer._curCamera.tilt(noise_for_cam[1]); // up down
        _renderer._curCamera.roll(noise_for_cam[2]); // rotate

        translate(0,0,20);
        // Display objects ----------------------
        
        let string_start_r; let string_start_l;
        push();
        translate(0, -570, 0);
        this.puppet.display(time_current);
        string_start_r = this.puppet.global_string_pos_lower_arm_r;
        string_start_l = this.puppet.global_string_pos_lower_arm_l;
        pop();
        
        push();
        this.stage.display(time_current);
        pop();
        
        push();
            translate(0,0,-20);
            strokeWeight(10);
            noFill()
            stroke(191);
            // stroke(255, 0, 0);
            if (frame_current < 535) {
                line(string_start_r.x, string_start_r.y, string_start_r.z, 1660*4, -500, 0);
                line(string_start_l.x, string_start_l.y, string_start_l.z, -1660*4, -500, 0);
            } else {}
        pop();

        pop();
    }

}