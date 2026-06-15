/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_XX_Name extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // start, end 

        // Initialize necessary objects and lists
        // this.puppet = new Puppet();
        // this.hand = new Hand();
        this.camera_kf_list = [];

        // start,,,,,end(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        // this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -20));
        this.camera_kf_list.push(new KeyFrame(94, [312, -61, 1244, 255, 7, -5], 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        
        // Display objects ----------------------
        push();
        // this.puppet.display(time_current);
        pop();

        push();
        // this.hand.display(time_current);
        pop();
    }

}