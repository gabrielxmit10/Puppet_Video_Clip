/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_09_Puppet_to_You extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 850, 929

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        this.hand = new Hand();
        this.camera_kf_list = [];
        this.camera_kf_list2 = [];

        // start,,,,,end(end)

        this.puppet.addRotationZ('shoulder_l', new KeyFrame(0, 90));
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -90));

        // puppet.addRotationX('neck', new KeyFrame(0, 0, 'linear'));

        // example uses
        this.hand.changeRotationMode('arm', 'ZYX'); // change rotation mode of arm to ZYX (default is XYZ)


        this.hand.addRotationX('palm',  new KeyFrame(0, -10));
        this.hand.addRotationX('arm', new KeyFrame(0, -90-(-10)));

        this.hand.addRotationX('pinky0', new KeyFrame(48, 10, 'linear'));
        this.hand.addRotationX('pinky1', new KeyFrame(48, -20, 'linear'));
        this.hand.addRotationX('pinky2', new KeyFrame(48, -10, 'linear'));
        
        this.hand.addRotationX('ring0', new KeyFrame(48, 5, 'linear'));
        this.hand.addRotationX('ring1', new KeyFrame(48, -20, 'linear'));
        this.hand.addRotationX('ring2', new KeyFrame(48, 0, 'linear'));
        
        this.hand.addRotationX('middle0', new KeyFrame(48, 0, 'linear'));
        this.hand.addRotationX('middle1', new KeyFrame(48, -10, 'linear'));
        this.hand.addRotationX('middle2', new KeyFrame(48, 0, 'linear'));
        
        // hand.addRotationX('index0', new KeyFrame(0, 0, 'easeIn'));
        this.hand.addRotationX('index0', new KeyFrame(48, 0, 'linear'));
        // hand.addRotationX('index1', new KeyFrame(0, 0, 'easeIn'));
        this.hand.addRotationX('index1', new KeyFrame(48, -10, 'linear'));
        // hand.addRotationX('index2', new KeyFrame(0, 0, 'easeIn'));
        this.hand.addRotationX('index2', new KeyFrame(48, 0, 'linear'));

        this.hand.addRotationX('thumb0', new KeyFrame(48, -20, 'linear'));
        this.hand.addRotationX('thumb1', new KeyFrame(48, 0, 'linear'));
        this.hand.addRotationX('thumb2', new KeyFrame(48, -15, 'linear'));

        
        // this.camera_kf_list.push(new KeyFrame(850, [386, -110, 1876, 134, -1440, 386], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(929, [1001, 1097, 3477, 21, -963, 108], 'constant'));
        
        
        this.camera_kf_list.push(new KeyFrame(850, [1968, -4661, -2000+500, 116, -1610, -48], 'linear'));
        this.camera_kf_list.push(new KeyFrame(897, [3693, -3292, -1078, 211, -1443, -68], 'constant'));
        
        this.camera_kf_list2.push(new KeyFrame(888, [3932, -774, 1448-200, 177, -1252, -43], 'linear'));
        this.camera_kf_list2.push(new KeyFrame(907, [3685, -371-100, 1857+200, 130, -1085-100, 12], 'constant'));
        
        this.camera_kf_list.push(new KeyFrame(898, [2300, 986, 2623, 51, -1023, -108], 'linear'));
        this.camera_kf_list.push(new KeyFrame(908, [1943, 1076, 2819, 14, -1022, -84], 'constant'));
        
        this.camera_kf_list2.push(new KeyFrame(908, [1001, 1097, 3477, 21, -963, 108], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(1200, [1318, 1763, 4566, 21, -963, 108], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(1200, [590, 1762, 4734, -166, -935, 136], 'linear'));
        this.camera_kf_list2.push(new KeyFrame(950, [399, 1194, 3538, -27, -956, 110], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(908, [1001, 1097, 3477, 21, -963, 108], 'linear'));
        // this.camera_kf_list2.push(new KeyFrame(929, [lerp(1001,1318,3/30), lerp(1097,1763,3/30), lerp(3477,4566,3/30), 21, -963, 108], 'linear'));
        
        this.camera_shots_kf_list = [
            new Shot(0, this.camera_kf_list),
            new Shot(888, this.camera_kf_list2),
            new Shot(898, this.camera_kf_list),
            new Shot(908, this.camera_kf_list2),
        ]
    }

    display(time_current) {
        
        // Camera ----------------------
        camera(...animate_shots(time_current, this.camera_shots_kf_list));
        
        // Display objects ----------------------
        push();
            translate(0, 0, 0);
            scale(0.5);
            this.puppet.display(time_current);
	    pop();

        push();
            let scale_factor = 2.5;
            translate(0, -800*scale_factor, (-600-100)*scale_factor);
            scale(scale_factor);
            this.hand.display(time_current);
            // ellipse(0, 0, 200, 200, 90);
	    pop();

        push(); // draw each string
            stroke(191);
            strokeWeight(10);
            // get the global position of each part of the puppet
            let lower_arm_string_l = this.puppet.global_string_pos_lower_arm_l;
            let lower_arm_string_r = this.puppet.global_string_pos_lower_arm_r;
            let upper_arm_string_l = this.puppet.global_string_pos_upper_arm_l;
            let upper_arm_string_r = this.puppet.global_string_pos_upper_arm_r;
            let neck_string = this.puppet.global_string_pos_neck;

            // get the global position of each part of the hand
            let pinky_string = this.hand.global_string_pos_pinky;
            let ring_string = this.hand.global_string_pos_ring;
            let middle_string = this.hand.global_string_pos_middle;
            let index_string = this.hand.global_string_pos_index;
            let thumb_string = this.hand.global_string_pos_thumb;

            // draw the strings
            line(lower_arm_string_l.x, lower_arm_string_l.y, lower_arm_string_l.z, pinky_string.x, pinky_string.y, pinky_string.z);
            line(upper_arm_string_l.x, upper_arm_string_l.y, upper_arm_string_l.z, ring_string.x, ring_string.y, ring_string.z);
            line(neck_string.x, neck_string.y, neck_string.z, middle_string.x, middle_string.y, middle_string.z);
            line(lower_arm_string_r.x, lower_arm_string_r.y, lower_arm_string_r.z, thumb_string.x, thumb_string.y, thumb_string.z);
            line(upper_arm_string_r.x, upper_arm_string_r.y, upper_arm_string_r.z, index_string.x, index_string.y, index_string.z);
        pop();
    }

}