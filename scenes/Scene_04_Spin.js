/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../models/Hand_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_04_Spin extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 290, 425 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        // this.hand = new Hand();
        this.camera_kf_list = [];
        this.camera_spin_kf_list = [];

        // start,,,,,end(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)

        // set the puppet to a more natural pose
        this.puppet.changeRotationMode('shoulder_r', 'ZYX');
        this.puppet.changeRotationMode('shoulder_l', 'ZYX');
        this.puppet.addRotation('shoulder_r', new KeyFrame(0, [-10,0,-20]));
        this.puppet.addRotation('shoulder_l', new KeyFrame(0, [-10,0,20]));
        this.puppet.addRotation('elbow_r', new KeyFrame(0, [20,0,0]));
        this.puppet.addRotation('elbow_l', new KeyFrame(0, [20,0,0]));

        // making the procedural animations for the head spin in a circle
        this.puppet.addProcedural(
            'neck', 
            (time_current, [x, y, z]) => { 
                let speed = 2.5; let strength = 40; 
                let t_start = 290 / 24; let t_end = 420 / 24;
                let a = 1/(t_start-t_end); let b = -a*t_end;
                let decreasing_factor = max(a*time_current+b,0);
                let new_x = cos(time_current*speed)*strength*decreasing_factor;
                let new_z = sin(time_current*speed)*strength*decreasing_factor;
                return [new_x, y, new_z];
            }
        );
        this.puppet.addProcedural(
            'hips', 
            (time_current, [x, y, z]) => { 
                let speed = 2.5; let strength = 5; 
                let t_start = 290 / 24; let t_end = 427 / 24;
                let a = 1/(t_start-t_end); let b = -a*t_end;
                let decreasing_factor = max(a*time_current+b,0);
                let new_x = cos(time_current*speed)*strength*decreasing_factor;
                let new_z = sin(time_current*speed)*strength*decreasing_factor;
                return [new_x, y, new_z];
            }
        );


        // animating the camera
        this.camera_kf_list.push(new KeyFrame(290, [0, 0, 1300, 0, 0, 0], '0, 44, 2351, 0, 0, 0'));
        this.camera_kf_list.push(new KeyFrame(425, [0, 0, 1000, 0, 0, 0], '0, 44, 2351, 0, 0, 0'));

        this.camera_spin_kf_list.push(new KeyFrame(290, 20, 'easeOut'));
        this.camera_spin_kf_list.push(new KeyFrame(420, 0));
        // this.camera_spin_kf_list.push(new KeyFrame(290, 20, 'easeInOut'));
        // this.camera_spin_kf_list.push(new KeyFrame(420, -5));



        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        
    }

    display(time_current) {
        
        
        // Camera ----------------------

        push();
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list),0,1,0);
        }
        _renderer._curCamera.roll(radians(animate_kfs(time_current, this.camera_spin_kf_list)));
        // Display objects ----------------------
        
        translate(0, 0, 0);
        this.puppet.display(time_current);
        pop();
    }

}