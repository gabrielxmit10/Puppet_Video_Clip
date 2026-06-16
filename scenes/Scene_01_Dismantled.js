/// <reference path="../models/Puppet_03_Class.js" />
/// <reference path="../animation/Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

class Scene_01_Dismantled extends Scene {
    constructor(start_frame, end_frame) {
        super(start_frame, end_frame);
        
        // Setup puppets
        this.puppet_head = new Puppet(); this.puppet_head.hideExcept('head'); 
        this.puppet_body = new Puppet(); this.puppet_body.hideExcept('body');
        this.puppet_arm_r = new Puppet(); this.puppet_arm_r.hideExcept('arm_r');
        this.puppet_arm_l = new Puppet(); this.puppet_arm_l.hideExcept('arm_l');
        this.puppet_leg_r = new Puppet(); this.puppet_leg_r.hideExcept('leg_r');
        this.puppet_leg_l = new Puppet(); this.puppet_leg_l.hideExcept('leg_l');
        
        // KeyFrames for the puppet's dismantled body parts
        this.puppet_head.addRotationX('neck', new KeyFrame(0, 90));
        this.puppet_body.addRotationX('full_body', new KeyFrame(0, -90));
        this.puppet_arm_r.addRotation('shoulder_r', new KeyFrame(0, [-90,-100,0]));
        this.puppet_arm_r.addRotation('elbow_r', new KeyFrame(0, [60,0,0]));
        this.puppet_arm_l.addRotation('shoulder_l', new KeyFrame(0, [-90,-90,0]));
        this.puppet_arm_l.addRotation('elbow_l', new KeyFrame(0, [60,0,0]));
        this.puppet_leg_r.addRotation('hips_leg_r', new KeyFrame(0, [90,-90,0]));
        this.puppet_leg_r.addRotation('knee_r', new KeyFrame(0, [-70,0,0]));
        this.puppet_leg_l.addRotation('hips_leg_l', new KeyFrame(0, [90,-90,0]));
        this.puppet_leg_l.addRotation('knee_l', new KeyFrame(0, [-70,0,0]));

        // Keyframes for the camera
        this.camera_kf_list = [];
        // this.camera_kf_list.push(new KeyFrame(0, [0,0,0,0,0,0], 'constant'));
        this.camera_kf_list.push(new KeyFrame(51, [124, -556, 391, 153, -513, 453], 'constant'));
        this.camera_kf_list.push(new KeyFrame(61, [426, -501, -482, 676, -256, -119], 'constant'));
        this.camera_kf_list.push(new KeyFrame(71, [-1108, -1862, -2118, 80, 10, 45], 'constant'));
        this.camera_kf_list.push(new KeyFrame(83, [-1751, -2875, -3289, 80, 10, 45], 'constant'));
        // this.camera_kf_list.push(new KeyFrame(94, [0,0,0,0,0,0], 'constant'));
    }

    display(time_current) {
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }

        // Puppet --------------------
        push(); // head
            translate(300, -40, 1000);
            rotateY(PI+PI/2);
            rotateX(-PI/8);
            this.puppet_head.display();
        pop();

        push(); // body
            translate(0, -40, 0);
            this.puppet_body.display();
        pop();

        // Arms
        push(); 
            translate(800, -65, 200);
            rotateY(-PI/2+PI/8);
            this.puppet_arm_r.display();
        pop();
        push();
            translate(-500, -65, 600);
            rotateY(PI/2);
            this.puppet_arm_l.display();
        pop();

        // Legs
        push();
            translate(400, -280, -700);
            rotateY(PI-PI/4);
            this.puppet_leg_r.display();
        pop();
        push();
            translate(-600, 230, -700);
            rotateX(PI);
            rotateY(-PI+PI/4);
            this.puppet_leg_l.display();
        pop();


        push();
            noStroke();
            fill(50);
            translate(0,200,0);
            model(background_shape);
            rotateX(PI/2);
            // circle(0,0,10000);
            plane(10000);
        pop();
    }
}
