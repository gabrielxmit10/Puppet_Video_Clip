/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_08_Clear extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 762, end 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        this.camera_kf_list = [];
        this.string_neck_offset_x_kf_list = [];
        this.camera_kf_list1 = [];
        this.camera_kf_list2 = [];

        // 62,71,81,89,02,11,20,end(end)
        // setting puppet initial positions
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -90));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(0, 90));
        
        // string on the neck change of position
        this.string_neck_offset_x_kf_list.push(new KeyFrame(762, 0, 'constant'));
        this.string_neck_offset_x_kf_list.push(new KeyFrame(820, -20, 'constant'));
        

        // puppet animations
        

        // neck
        this.puppet.addRotation('neck', new KeyFrame(762, [-40,0,0], 'easeOut'));
        this.puppet.addRotation('neck', new KeyFrame(773, [-40,-45,0], 'linear'));
        this.puppet.addRotation('neck', new KeyFrame(777, [-40,-45,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(792, [-40,45,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(797, [-40,45,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(807, [-40,0,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(811, [-40,0,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(825, [60,0,0], 'easeInOut'));
        // this.puppet.addRotation('neck', new KeyFrame(762, [-90,0,0], 'linear'));

        // 


        // camera
        this.camera_kf_list1.push(new KeyFrame(762, [0, 437+100, 2649, 0, 0+100, -58], 'easeIn', [0,5]));
        this.camera_kf_list1.push(new KeyFrame(820, [0, 437-100, 2649, 0, 0-100, -58], 'constant'));

        this.camera_kf_list2.push(new KeyFrame(820, [100, -2242, 341, -51, 32, -328], 'easeOut'));
        this.camera_kf_list2.push(new KeyFrame(840, [146, -3014, 432, -54, -5, -454], 'constant'));

        this.camera_shot_list = [
            new Shot(0, this.camera_kf_list1),
            new Shot(820, this.camera_kf_list2)
        ];
    }

    display(time_current) {
        
        // Camera ----------------------
        camera(...animate_shots(time_current, this.camera_shot_list));
        
        // Display objects ----------------------
        push();
            stroke(255);
            strokeWeight(10);
            this.puppet.display(time_current);
            
            let height_strings = createVector(0,-4000,0);
            let start_string_l = this.puppet.global_string_pos_lower_arm_l;
            let end_string_l = p5.Vector.add(start_string_l,height_strings);
            let start_string_r = this.puppet.global_string_pos_lower_arm_r;
            let end_string_r = p5.Vector.add(start_string_r,height_strings);
            
            let start_string_neck = this.puppet.global_string_pos_neck;
            let end_string_neck = p5.Vector.add(start_string_neck,height_strings);
            let offset_string_neck = [
                animate_kfs(time_current, this.string_neck_offset_x_kf_list),
                0,
                -250
            ];
            

            line(start_string_l.x, start_string_l.y, start_string_l.z, end_string_l.x, end_string_l.y, end_string_l.z);
            line(start_string_r.x, start_string_r.y, start_string_r.z, end_string_r.x, end_string_r.y, end_string_r.z);
            line(
                start_string_neck.x+offset_string_neck[0],
                start_string_neck.y+200,
                start_string_neck.z+offset_string_neck[2], 
                end_string_neck.x-offset_string_neck[0]*5, 
                end_string_neck.y, 
                end_string_neck.z+offset_string_neck[2]
            );

        pop();

        push();
        // this.hand.display(time_current);
        pop();
    }

}