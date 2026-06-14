/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_11_Cut extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 1010, 1092 

        // Initialize necessary objects and lists
        this.camera_kf_list = [];
        this.upper_string_bottom_kf_list = []; // the upper string's end (part at the bottom of the upper string)
        this.upper_string_cp_bottom_kf_list = []; // the upper string's bottom control point
        this.upper_string_cp_top_kf_list = []; // the upper string's top control point
        this.lower_string_top_kf_list = []; // lower string's start (part at the top of the lower string)

        this.stroke_weight_kf_list = [];
        this.amplitudes_kf_list = [];
        this.rotation_z_kf_list = [];

        // 1010,42,52,59,1092(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        // this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -20));
        this.camera_kf_list.push(new KeyFrame(0, [0,0,1029,0,0,0], 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        





        // upper string control point top
        let angle_z = 40; 
        // let bezier_list = [.01,.92,0,.99];
        // let bezier_list = [0,1.38,0,.99];
        let bezier_list = [0,.75,.05,.95];
        let cp_top_y = -400*(2/3)-0;
        // this.upper_string_cp_top_kf_list.push(new KeyFrame(1053, [0, cp_top_y, 0],'easeOut'));
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1053, [0, cp_top_y, 0], 'bezierSimple', bezier_list));
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1092, [150+50, cp_top_y, 0],'easeIn'));
        // upper string control point bottom
        let cp_bottom_y = -400*(1/3);
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1053, [0, cp_bottom_y, 0], 'bezierSimple', [.01,.92,0,.99]));
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1053, [0, cp_bottom_y, 0], 'bezierSimple', [0,.95,.05,.98]));
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1092, [-200-100-100+100, cp_bottom_y, 0],'easeIn'));
        
        // upper string animation
        let start_cut = 1049;
        // this.upper_string_bottom_kf_list.push(new KeyFrame(1053, [0, 0, 0], 'bezierSimple', [.01,.92,0,.99]));
        this.upper_string_bottom_kf_list.push(new KeyFrame(1053, [0, 0, 0], 'bezierSimple', bezier_list));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(1063, [0, -50, 0], 'hermite', [0,0]));
        this.upper_string_bottom_kf_list.push(new KeyFrame(1092, [-100,50, 0]));

        // lower string top tip
        this.lower_string_top_kf_list.push(new KeyFrame(1010, [0, 0, 0]));
        this.lower_string_top_kf_list.push(new KeyFrame(1052.5, [0, 0, 0],'linear'));
        this.lower_string_top_kf_list.push(new KeyFrame(1054.5, [0, 1000, 0]));

        // rotation of all
        this.rotation_z_kf_list.push(new KeyFrame(1053, 0, 'bezierSimple', bezier_list));
        this.rotation_z_kf_list.push(new KeyFrame(1092, angle_z));







        // stroke weight and trembling (amplitude of translation)
        this.stroke_weight_kf_list.push(new KeyFrame(1010, 10, 'linear'));
        this.stroke_weight_kf_list.push(new KeyFrame(1053, 3, 'bezierSimple', bezier_list));
        this.stroke_weight_kf_list.push(new KeyFrame(1092, 7));

        this.amplitudes_kf_list.push(new KeyFrame(1010,[0,0,0], 'linear'));
        this.amplitudes_kf_list.push(new KeyFrame(1040,[10,4,4], 'constant'));
        this.amplitudes_kf_list.push(new KeyFrame(1053,[10,4,4], 'easeOut'));
        this.amplitudes_kf_list.push(new KeyFrame(1060,[0,0,0], 'linear'));


    }

    display(time_current) {
        
        // Camera ----------------------
        camera(...animate_kfs(time_current, this.camera_kf_list));
        
        // Display objects ----------------------
        push(); 
            // trembling
            let amplitudes = animate_kfs(time_current, this.amplitudes_kf_list);
            let amplitudes_arr = amplitudes instanceof p5.Vector ? [amplitudes.x, amplitudes.y, amplitudes.z] : amplitudes;
            let frequencies = [20,20,20];
            let times = [time_current,time_current+1000,time_current+2000];
            translate(...noise_func(times,amplitudes_arr,frequencies));

            strokeWeight(animate_kfs(time_current, this.stroke_weight_kf_list));
            noFill()
            stroke(191);


            // upper string
            push(); 
                translate(0,-400,0);
                let angle_z =animate_kfs(time_current, this.rotation_z_kf_list);
                rotateZ(radians(angle_z));
                translate(0,400,0);
                let cp_top = animate_kfs(time_current, this.upper_string_cp_top_kf_list); // control point top
                let cp_bot = animate_kfs(time_current, this.upper_string_cp_bottom_kf_list); // control point bottom
                let bot = animate_kfs(time_current, this.upper_string_bottom_kf_list); // bottom



                bezier(
                    0,-400,0, // top
                    cp_top.x, cp_top.y, 0, // control point top
                    cp_bot.x, cp_bot.y, 0, // control point bottom
                    bot.x, bot.y, 0, // bottom
                );

            pop();


            // lower string
            push();
                let top = animate_kfs(time_current, this.lower_string_top_kf_list);

                line(
                    top.x,top.y,top.z,
                    0,400,0
                );

            pop();
        pop();

    }

}