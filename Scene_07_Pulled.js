/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_07_Pulled extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 680, 762 

        // Initialize necessary objects and lists
        this.puppet = new Puppet();
        // this.camera_kf_list = [];
        this.ang_cam_kf_list = [];
        this.string_points = [[],[],[]]; // here i have the start (neck), control point(s) and end (above)
        this.control_point1_kf_list = [];
        this.control_point2_kf_list = [];
        

        // 680,,,,,762(end)

        // this.camera_kf_list.push(new KeyFrame(680, [1985, -450, 1979, 23, -389, -34], 'constant'));
        // let ang_cam = radians(45); 
        this.ang_cam_kf_list.push(new KeyFrame(680, radians(45-15), 'linear'));
        this.ang_cam_kf_list.push(new KeyFrame(762, radians(90+45-15), 'linear'));
        this.raio = 2000; this.altura = -600; this.under_altura = 1000;
        // camera(cos(ang_cam)*raio, 0+altura+1300, sin(ang_cam)*raio,0,altura,0);
        // this.camera_kf_list.push(new KeyFrame(680, [1985, -450, 1979, 23, -389, -34], 'constant'));
        
        
        // puppet initial positions
        this.puppet.addRotation('hips', new KeyFrame(680, [-40,0,0]));
        // this.puppet.addRotation('neck', new KeyFrame(680, [-40,0,0]));
        this.puppet.addRotation('shoulder_r', new KeyFrame(680, [40,0,-10]));
        this.puppet.addRotation('elbow_r', new KeyFrame(680, [0,0,10]));
        this.puppet.addRotation('shoulder_l', new KeyFrame(680, [40,0,10]));
        this.puppet.addRotation('elbow_l', new KeyFrame(680, [0,0,-10]));
        this.puppet.addRotation('ankle_r', new KeyFrame(680, [-58,0,0]));
        this.puppet.addRotation('ankle_l', new KeyFrame(680, [-58,0,0]));

        let frames_to_pull = [707+8, 720+8, 733+8]; let pull_trans = -300; let pull_back_trans = -100;
        for (let i = 0; i < frames_to_pull.length; i++){
            let test_pull_time1 = frames_to_pull[i];
            let test_pull_time2 = test_pull_time1 + 5;
            let test_top_time1 = test_pull_time2 + 3;
            let test_back_time1 = test_top_time1 + 3;
            
            let pull_trans_now = pull_trans * i;
            let pull_trans_next = pull_trans * (i+1);

            // PUPPET TRANSLATION
            this.puppet.addTranslation('full_body', new KeyFrame(test_pull_time1, [0,pull_trans_now,0], 'easeOut'))
            this.puppet.addTranslation('full_body', new KeyFrame(test_top_time1, [0,pull_trans_next+pull_back_trans,0], 'easeIn'))
            this.puppet.addTranslation('full_body', new KeyFrame(test_back_time1, [0,pull_trans_next,0], 'linear'))

            // CONTROL POINTS
            this.control_point1_kf_list.push(new KeyFrame(test_pull_time1, [0,pull_trans_now,0], 'easeOut')); // start 
            // this.control_point1_kf_list.push(new KeyFrame(test_pull_time2, [0,0,0], 'easeOut')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_top_time1, [50,pull_trans_next,0], 'easeIn')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_back_time1, [0,pull_trans_next,0], 'linear')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_back_time1+1, [-20,pull_trans_next,0], 'linear')); // start 
            this.control_point1_kf_list.push(new KeyFrame(test_back_time1+2, [0,pull_trans_next,0], 'linear')); // start 
            
            this.control_point2_kf_list.push(new KeyFrame(test_pull_time1, [0,pull_trans_now,0], 'easeOut')); // start 
            // this.control_point2_kf_list.push(new KeyFrame(test_pull_time2, [0,0,0], 'easeOut')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_top_time1, [-50,pull_trans_next,0], 'easeIn')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_back_time1, [0,pull_trans_next,0], 'linear')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_back_time1+1, [20,pull_trans_next,0], 'linear')); // start 
            this.control_point2_kf_list.push(new KeyFrame(test_back_time1+2, [0,pull_trans_next,0], 'linear')); // start 

            // PUPPET ROTATIONS

            // neck swing
            this.puppet.addRotation('neck', new KeyFrame(test_pull_time1, [-40,0,0], 'easeIn'));
            this.puppet.addRotation('neck', new KeyFrame(test_pull_time1+3, [-60,0,0], 'linear'));
            this.puppet.addRotation('neck', new KeyFrame(test_top_time1, [-60,0,0], 'easeInOut'));
            this.puppet.addRotation('neck', new KeyFrame(test_back_time1, [-30,0,0], 'easeInOut'));
            this.puppet.addRotation('neck', new KeyFrame(test_back_time1+5, [-40,0,0], 'easeInOut'));
            
            // arms swing
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_pull_time1, [40,0,-10]));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_pull_time1+3, [40,0,-10], 'linear'));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_top_time1, [40,0,-15], 'easeOut'));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_back_time1, [40,0,-15], 'easeInOut'));
            this.puppet.addRotation('shoulder_r', new KeyFrame(test_back_time1+7, [40,0,-10], 'easeInOut'));

            this.puppet.addRotation('elbow_r', new KeyFrame(test_pull_time1, [0,0,10]));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_pull_time1+3, [0,0,10], 'linear'));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_top_time1, [0,0,10], 'easeInOut'));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_back_time1, [0,0,10], 'easeInOut'));
            // this.puppet.addRotation('elbow_r', new KeyFrame(test_back_time1+5, [0,0,10], 'easeInOut'));
            
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_pull_time1, [40,0,10]));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_pull_time1+3, [40,0,10], 'linear'));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_top_time1, [40,0,15], 'easeOut'));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_back_time1, [40,0,15], 'easeInOut'));
            this.puppet.addRotation('shoulder_l', new KeyFrame(test_back_time1+7, [40,0,10], 'easeInOut'));

            this.puppet.addRotation('elbow_l', new KeyFrame(test_pull_time1, [0,0,-10]));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_pull_time1+3, [0,0,-10], 'linear'));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_top_time1, [0,0,-10], 'easeInOut'));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_back_time1, [0,0,-10], 'easeInOut'));
            // this.puppet.addRotation('elbow_l', new KeyFrame(test_back_time1+5, [0,0,-10], 'easeInOut'));


            // legs swing
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_top_time1, [5,0,-5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_back_time1-2, [5,0,-5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_r', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
            
            this.puppet.addRotation('knee_r', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('knee_r', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('knee_r', new KeyFrame(test_top_time1, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_r', new KeyFrame(test_back_time1-2, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_r', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
            
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_top_time1, [5,0,5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_back_time1-2, [5,0,5], 'easeInOut'));
            this.puppet.addRotation('hips_leg_l', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
            
            this.puppet.addRotation('knee_l', new KeyFrame(test_pull_time1, [0,0,0]));
            this.puppet.addRotation('knee_l', new KeyFrame(test_pull_time1+3, [0,0,0], 'linear'));
            this.puppet.addRotation('knee_l', new KeyFrame(test_top_time1, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_l', new KeyFrame(test_back_time1-2, [-5,0,0], 'easeInOut'));
            this.puppet.addRotation('knee_l', new KeyFrame(test_back_time1+7, [0,0,0], 'easeInOut'));
        }


        // this.puppet.addRotation('neck', new KeyFrame(test_pull_time1, [-40,0,0], 'easeIn'));
        // this.puppet.addRotation('neck', new KeyFrame(test_pull_time1+3, [-60,0,0], 'linear'));
        // this.puppet.addRotation('neck', new KeyFrame(test_top_time1, [-60,0,0], 'easeInOut'));
        // this.puppet.addRotation('neck', new KeyFrame(test_back_time1, [-30,0,0], 'easeInOut'));
        // this.puppet.addRotation('neck', new KeyFrame(test_back_time1+5, [-40,0,0], 'easeInOut'));




        // 'full_body', [0.0, 0.0, 0.0]
        // 'hips', [-40.0, 0.0, 0.0]
        // 'neck', [-38.5, 0.0, 0.0]
        // 'shoulder_r', [40.0, 0.0, -10.0]
        // 'elbow_r', [0.0, 0.0, 10.0]
        // 'shoulder_l', [40.0, 0.0, 10.0]
        // 'elbow_l', [0.0, 0.0, -10.0]
        // 'hip_leg_r', [0.0, 0.0, 0.0]
        // 'knee_r', [0.0, 0.0, 0.0]
        // 'ankle_r', [-58, 0.0, 0.0]
        // 'hip_leg_l', [0.0, 0.0, 0.0]
        // 'knee_l', [0.0, 0.0, 0.0]
        // 'ankle_l', [-58, 0.0, 0.0]

        
    }

    display(time_current) {
        
        // Camera ----------------------
        // camera(...animate_kfs(time_current, this.camera_kf_list));
        let ang_cam = animate_kfs(time_current, this.ang_cam_kf_list);
        camera(cos(ang_cam)*this.raio, 0+this.altura+this.under_altura, sin(ang_cam)*this.raio,0,this.altura,0);
        
        // Display objects ----------------------
        push();
            // let neck_offset = this.puppet.getNeckOffset(time_current); // used to make the neck be at 0,0,0
            // console.log("neck_offset: ", neck_offset);
            // translate(-neck_offset.x, -neck_offset.y, -neck_offset.z);
            let neck_offset = [0,51.47022247314453,141.4132843017578];
            translate(-neck_offset[0], -neck_offset[1], -neck_offset[2]); // what I got from getNeckOffset * (-1)
            
            this.puppet.display(time_current);

            
            push();
                this.string_points[0] = this.puppet.global_string_pos_neck; // start point (neck)
                this.string_points[1] = createVector(0,-500,0); // initial control point 1 position (closer to neck)
                let string_point1_offset = animate_kfs(time_current, this.control_point1_kf_list); // offset of control point 1
                this.string_points[1] = p5.Vector.add(this.string_points[1],string_point1_offset); // add the 2 vectors together
                this.string_points[2] = createVector(0,-1200,0); // initial control point 2 position (closer to above)
                let string_point2_offset = animate_kfs(time_current, this.control_point2_kf_list); // offset of control point 2
                this.string_points[2] = p5.Vector.add(this.string_points[2],string_point2_offset); // add the 2 vectors together
                this.string_points[3] = createVector(0,-2000,0); // end point (above)
                
                translate(...neck_offset);
                stroke(191);
                strokeWeight(7);
                noFill();
                curveTightness(5);
                
                beginShape(); // string with catmull-rom
                    curveVertex(this.string_points[0].x,this.string_points[0].y+100,this.string_points[0].z); // Extrapolated start control
                    curveVertex(this.string_points[0].x,this.string_points[0].y,this.string_points[0].z); // Actual start anchor
                    curveVertex(this.string_points[1].x,this.string_points[1].y,this.string_points[1].z); // Control point 1
                    curveVertex(this.string_points[2].x,this.string_points[2].y,this.string_points[2].z); // Control point 2
                    curveVertex(this.string_points[3].x,this.string_points[3].y,this.string_points[3].z); // Actual end anchor
                    curveVertex(this.string_points[3].x,this.string_points[3].y-100,this.string_points[3].z); // Extrapolated end control
                endShape();
            pop();
            
        pop();
    }

}