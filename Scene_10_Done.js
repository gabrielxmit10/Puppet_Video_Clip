/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_10_Done extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 929, 1010

        // Initialize necessary objects and lists
        this.puppet1 = new Puppet();
        this.puppet2 = new Puppet();
        this.hand = new Hand();
        // this.camera_kf_list = [];
        this.ang_cam_kf_list = [];
        

        // 929,996,1034(end)
        

        // hand initial position
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        
        // puppet 1 position
        this.puppet1.addRotation('neck', new KeyFrame(929,[-23.6, 0.0, 0.0]));
        this.puppet1.addRotation('shoulder_r', new KeyFrame(929,[71.5, -15, 0.0]));
        this.puppet1.addRotation('elbow_r', new KeyFrame(929,[95.6, 0.0, 0.0]));
        this.puppet1.addRotation('shoulder_l', new KeyFrame(929,[71.5, 15.0, 0.0]));
        this.puppet1.addRotation('elbow_l', new KeyFrame(929,[95.6, 0.0, 0.0]));
        
        
        
        // puppet 2 position
        this.puppet2.addRotation('hips', new KeyFrame(929,[3.9, 0.0, 0.0]));
        this.puppet2.addRotation('neck', new KeyFrame(929,[6.2, 0.0, 0.0]));
        this.puppet2.changeRotationMode('shoulder_r', 'ZXY');
        this.puppet2.addRotation('shoulder_r', new KeyFrame(929,[159.8, -73.4, 48.6]));
        this.puppet2.addRotation('elbow_r', new KeyFrame(929,[77.8, 0.0, 0.0]));
        this.puppet2.changeRotationMode('shoulder_l', 'ZXY');
        this.puppet2.addRotation('shoulder_l', new KeyFrame(929,[159.8, 73.4, -48.6]));
        this.puppet2.addRotation('elbow_l', new KeyFrame(929,[77.8, 0.0, 0.0]));


        // camera animation (through changing the angle)
        this.raio = 2000+500; this.altura = -540; this.under_altura = 1000;
        let base_angle = 20;
        let start_angle = radians(-base_angle); let end_angle = radians(base_angle); 
        let start_rot_frame = 929-0; let end_rot_frame = 976-6;
        // let speed = (end_angle - start_angle) / (end_rot_frame - start_rot_frame);
        let duration = (end_rot_frame - start_rot_frame);
        this.ang_cam_kf_list.push(new KeyFrame(start_rot_frame, start_angle, 'linear')); // start seeing puppet1
        this.ang_cam_kf_list.push(new KeyFrame(end_rot_frame, end_angle, 'linear')); // end seeing puppet1
        this.ang_cam_kf_list.push(new KeyFrame(989-6-4, radians(180-base_angle), 'linear')); // start seeing puppet2
        this.ang_cam_kf_list.push(new KeyFrame(989-6-4 + duration, radians(180+base_angle), 'linear')); // end seeing puppet2
        console.log(start_rot_frame, end_rot_frame, duration);

    }

    display(time_current) {
        
        // Camera ----------------------
        let ang_cam = animate_kfs(time_current, this.ang_cam_kf_list);
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(cos(ang_cam)*this.raio, this.altura, sin(ang_cam)*this.raio,0,this.altura,0);
        }
        
        // Display objects ----------------------
        let scale_hand = 5;
        push();
        rotateY(PI/2);

        push(); // puppet 1
            translate(0,-540,(hand_palm_depth/2+(30))*scale_hand);
            this.puppet1.display(time_current);
        pop();
        
        
        push(); // puppet 2
            translate(0,-540,(-hand_palm_depth/2-(40))*scale_hand);
            rotateY(PI);
            this.puppet2.display(time_current);
        pop();

        push(); // hand
            scale(scale_hand);
            translate(0,hand_arm_height,0); //  place the palm joint at 0,0,0
            this.hand.display(time_current);
        pop();

        pop();
    }

}