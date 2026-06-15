/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

class Scene_02_Play extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 94, 215

        this.puppet = new Puppet();
        this.camera_kf_list = [];
        this.string_control_point1_kf_list = [];
        this.string_control_point2_kf_list = [];

        this.end_pos_x = 1500; // arbitrary point to the right of the puppet where the string is tied

        // 94, 129, 143, 164, 169, 175, 215(end)
        // base positions of the arms at the start
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(90, -20));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(90, 15));


        // animating the pull of the arm
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(130, -20, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(135, -45, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(150, -20, 'easeOut'));
        
        // reaction of the body to the arm pull
        this.puppet.addRotationZ("hips", new KeyFrame(132, 0, 'easeInOut'));
        this.puppet.addRotationZ('hips', new KeyFrame(140, 2, 'easeInOut'));
        this.puppet.addRotationZ('hips', new KeyFrame(150, 0, 'easeOut'));
        
        // reaction of the other arm to the arm pull
        this.puppet.addRotationZ("shoulder_l", new KeyFrame(132, 0+15, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(140, 2+15, 'easeInOut'));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(150, 0+15, 'easeOut'));

        // animating the head turn that needs to be in the middle of the camera constant change (163)
        this.puppet.addRotation('neck', new KeyFrame(155, [0,0,0], 'easeInOut'));
        this.puppet.addRotation('neck', new KeyFrame(169, [0,60,0], 'easeInOut'));

        // animating the control points of the string to make it straighter when pulled
        this.string_control_point1_kf_list.push(new KeyFrame(125, [this.end_pos_x/2-200, 300+50, 0], 'easeIn'));
        this.string_control_point1_kf_list.push(new KeyFrame(131, [this.end_pos_x/2-200, 300-100, 0], 'easeInOut'));
        this.string_control_point1_kf_list.push(new KeyFrame(135, [this.end_pos_x/2-200, 300-100, 0], 'easeInOut'));
        this.string_control_point1_kf_list.push(new KeyFrame(150-5, [this.end_pos_x/2-200, 300, 0], 'easeInOut'));

        this.string_control_point2_kf_list.push(new KeyFrame(125, [this.end_pos_x/2+200, 300+50, 0], 'easeIn'));
        this.string_control_point2_kf_list.push(new KeyFrame(131, [this.end_pos_x/2+200, 300-100, 0], 'easeInOut'));
        this.string_control_point2_kf_list.push(new KeyFrame(135, [this.end_pos_x/2+200, 300-100, 0], 'easeInOut'));
        this.string_control_point2_kf_list.push(new KeyFrame(150-5, [this.end_pos_x/2+200, 300, 0], 'easeInOut'));

        
        // animating the camera
        this.camera_kf_list.push(new KeyFrame(94, [312-50, -61, 1244, 255-50, 7, -5], 'easeInOut'));
        // this.camera_kf_list.push(new KeyFrame(134, [312, -61, 1244, 255, 7, -5], 'constant'));
        this.camera_kf_list.push(new KeyFrame(159, [312, -61, 1244, 255, 7, -5], 'easeIn'));
        this.camera_kf_list.push(new KeyFrame(162, [312+30, -61, 1244, 255+30, 7, -5], 'constant'));
        this.camera_kf_list.push(new KeyFrame(163, [1106, -39, 6, 5, 4, -1+15], 'easeOut'));
        this.camera_kf_list.push(new KeyFrame(195, [1106, -39, 6, 5, 4, -1-15], 'constant'));
    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        // camera(...[312, -61, 1244, 255, 7, -5])
        // camera(...[1106, -39, 6, 5, 4, -1])
        
        push();

        this.puppet.display(time_current);
        
        strokeWeight(10);
        noFill()
        stroke(191);

        let string_start = this.puppet.global_string_pos_lower_arm_r;
        let string_control_point1 = animate_kfs(time_current, this.string_control_point1_kf_list); // arbitrary point to the right of the puppet
        let string_control_point2 = animate_kfs(time_current, this.string_control_point2_kf_list); // arbitrary point to the right of the puppet
        // let string_control_point2 = createVector(this.end_pos_x/2+200, 300-100, 0); // arbitrary point to the right of the puppet
        let string_end = createVector(this.end_pos_x, 170, 0); // arbitrary point to the right of the puppet
        // line(string_start.x, string_start.y, string_start.z, string_end.x, string_end.y, string_end.z);
        bezier(string_start.x, string_start.y, string_start.z,
               string_control_point1.x, string_control_point1.y, string_control_point1.z,
               string_control_point2.x, string_control_point2.y, string_control_point2.z,
               string_end.x, string_end.y, string_end.z);


        pop();
    }

}