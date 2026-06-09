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
        this.puppet = new Puppet(); this.puppet.hidePart('head');
        this.stage = new Stage();
        this.camera_kf_list = [];

        // 25,39,54,67,79, (head: down, left, down, right, down)
        // 93,18,25, (curtains: open, closing, closed)
        // 55,63,70,79 (opening cte kfs)
        // 96 (end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        // posing the puppets arms
        this.puppet.changeRotationMode('shoulder_r', 'ZYX');
        this.puppet.changeRotationMode('shoulder_l', 'ZYX');
        this.puppet.addRotation('shoulder_r', new KeyFrame(0, [0,0,-90]));
        this.puppet.addRotation('shoulder_l', new KeyFrame(0, [0,0,90]));

        // CHANGE LATER (Either remove the following or change, they are for the case that u might want to make the arms bend a bit, as if pulling the strings a bit when the camera looks at the respective hand and coming back fast to show the character is really tied by the strings. To keep this simpler for now I wont test yet)
        // this.puppet.addRotation('shoulder_r', new KeyFrame(0, [-40+20,0,-90]));
        // this.puppet.addRotation('shoulder_l', new KeyFrame(0, [-40+20,0,90]));
        // this.puppet.addRotation('elbow_r', new KeyFrame(0, [40*2,0,0]));
        // this.puppet.addRotation('elbow_l', new KeyFrame(0, [40*2,0,0]));
        
        this.camera_kf_list.push(new KeyFrame(420, [-1, -796, -134, -1, -711, -29], 'constant'));
        this.camera_kf_list.push(new KeyFrame(0+425, [-1, -796, -134, -1, -711, -29], 'easeInOut'));
        this.camera_kf_list.push(new KeyFrame(0+440+10, [-112, -767, -82, -1, -711, -29], 'constant'));
        this.camera_kf_list.push(new KeyFrame(0+440+10+3, [-112, -767, -82, -1, -711, -29], 'easeInOut'));
        this.camera_kf_list.push(new KeyFrame(0+440+10+3+25+10, [112, -767, -82, 1, -711, -29], 'constant'));
        this.camera_kf_list.push(new KeyFrame(0+440+10+3+25+10+5, [112, -767, -82, 1, -711, -29], 'easeInOut'));
        this.camera_kf_list.push(new KeyFrame(0+440+10+3+25+10+5+25, [-1, -796, -134, -1, -711, -29], 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        
    }

    display(time_current) {
        
        // Camera ----------------------

        push();
        // camera(-1, -796, -134, -1, -711, -29);
        camera(...animate_kfs(time_current, this.camera_kf_list));

        let amplitudes = [0.1*2, 0.02*2, 0.05*2];
        let frequencies = [0.5, 0.5, 0.35];
        let times = [time_current+0, time_current+1500+0, time_current+2000+0];
        let noise_for_cam = noise_func(times, amplitudes, frequencies);
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
            line(string_start_r.x, string_start_r.y, string_start_r.z, 1660*4, -500, 0);
            line(string_start_l.x, string_start_l.y, string_start_l.z, -1660*4, -500, 0);
        pop();

        pop();
    }

}