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

        // 1010,42,52,59,1092(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        // this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -20));
        this.camera_kf_list.push(new KeyFrame(0, [0,0,800,0,0,0], 'constant'));
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));
        

        // upper string animation
        let start_cut = 1049;

        // this.upper_string_cp_top_kf_list.push(new KeyFrame(1010, [0,-100,0]));
        // this.upper_string_cp_top_kf_list.push(new KeyFrame(start_cut, [0,-200,0], 'easeInOut'));
        // this.upper_string_cp_top_kf_list.push(new KeyFrame(start_cut+4, [-200+50,-200,0], 'easeOut'));
        // // this.upper_string_cp_top_kf_list.push(new KeyFrame(start_cut+17, [-250,-200,0]));
        
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1010, [0,-200,0]));
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(start_cut, [0,-200,0], 'easeInOut'));
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(start_cut+4, [-200-50,-200,0], 'easeOut'));
        // // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(start_cut+17, [-250,-200,0]));

        // this.upper_string_bottom_kf_list.push(new KeyFrame(1010, [0,0,0]));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(start_cut, [0,0,0], 'easeIn'));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(start_cut+7, [-250,-100,0], 'easeOut'));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(start_cut+7+17, [-250-50-50,-100-50+50,0]));
        
        
        // // lower string animation
        // this.lower_string_top_kf_list.push(new KeyFrame(1010, [0,0,0]));


        // === COPY THIS INTO YOUR CONSTRUCTOR ===

        // upper string control point top
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1010+43, [-2, -176, 0],'easeIn'));
        // this.upper_string_cp_top_kf_list.push(new KeyFrame(1020+43, [-5, -202, 0],'easeOut'));
        // this.upper_string_cp_top_kf_list.push(new KeyFrame(1030+43, [-3, -215, 0]));
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1040+43, [-8, -227, 0],'easeOut'));
        this.upper_string_cp_top_kf_list.push(new KeyFrame(1050+43, [-6, -232, 0]));

        // upper string control point bottom
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1010+43, [-1, -197, 0],'easeIn'));
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1020+43, [-258, -239, 0],'easeOut'));
        // this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1030+43, [-238, -311, 0]));
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1040+43, [-227, -330, 0],'easeOut'));
        this.upper_string_cp_bottom_kf_list.push(new KeyFrame(1050+43, [-222, -341, 0],'easeOut'));

        // upper string bottom tip
        this.upper_string_bottom_kf_list.push(new KeyFrame(1010+43, [0, 0, 0],'easeIn'));
        this.upper_string_bottom_kf_list.push(new KeyFrame(1020+43, [-170, -66, 0],'easeOut'));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(1030+43, [-243, -143, 0]));
        // this.upper_string_bottom_kf_list.push(new KeyFrame(1040+43, [-296, -202, 0],'easeOut'));
        this.upper_string_bottom_kf_list.push(new KeyFrame(1050+43, [-301, -216, 0]));

        // lower string top tip
        this.lower_string_top_kf_list.push(new KeyFrame(1010, [0, 0, 0]));
        // this.lower_string_top_kf_list.push(new KeyFrame(1020, [-10, 720, 0]));
        // this.lower_string_top_kf_list.push(new KeyFrame(1030, [-4, 417, 0]));
        // this.lower_string_top_kf_list.push(new KeyFrame(1040, [0, 446, 0]));
        // this.lower_string_top_kf_list.push(new KeyFrame(1050, [13, 488, 0]));

        // =======================================







        // stroke weight and trembling (amplitude of translation)
        // this.stroke_weight_kf_list.push(new KeyFrame(1010, 10));
        this.stroke_weight_kf_list.push(new KeyFrame(1030, 5));

        // this.amplitudes_kf_list.push(new KeyFrame(1010,[4,4,4]));
        this.amplitudes_kf_list.push(new KeyFrame(1010,[0,0,0]));


    }

    display(time_current) {
        
        // Camera ----------------------
        // camera(...animate_kfs(time_current, this.camera_kf_list));
        
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
                let cp_top = animate_kfs(time_current, this.upper_string_cp_top_kf_list); // control point top
                let cp_bot = animate_kfs(time_current, this.upper_string_cp_bottom_kf_list); // control point bottom
                let bot = animate_kfs(time_current, this.upper_string_bottom_kf_list); // bottom

                // --- DEBUG VISUALIZER & INTERACTIVE MODE ---
                let debug_mode = false; // SET THIS TO FALSE WHEN YOU ARE DONE DEBUGGING!
                
                if (debug_mode) {
                    // Hold 1, 2, or 3 to move the points with your mouse
                    let mx = mouseX - width / 2;
                    let my = mouseY - height / 2;
                    if (keyIsPressed) {
                        if (key === '1') { 
                            cp_top.x = mx; cp_top.y = my; 
                            if (frameCount % 10 === 0) console.log(`cp_top: [${mx.toFixed(0)}, ${my.toFixed(0)}, 0]`); 
                        }
                        if (key === '2') { 
                            cp_bot.x = mx; cp_bot.y = my; 
                            if (frameCount % 10 === 0) console.log(`cp_bot: [${mx.toFixed(0)}, ${my.toFixed(0)}, 0]`); 
                        }
                        if (key === '3') { 
                            bot.x = mx; bot.y = my; 
                            if (frameCount % 10 === 0) console.log(`bot: [${mx.toFixed(0)}, ${my.toFixed(0)}, 0]`); 
                        }
                    }
                }
                // -------------------------------------------

                bezier(
                    0,-400,0, // top
                    cp_top.x, cp_top.y, 0, // control point top
                    cp_bot.x, cp_bot.y, 0, // control point bottom
                    bot.x, bot.y, 0, // bottom
                );

                // --- DEBUG DRAWING ---
                if (debug_mode) {
                    push();
                    strokeWeight(2);
                    noFill();
                    // Red line: Top anchor to cp_top
                    stroke(255, 0, 0); 
                    line(0, -400, 0, cp_top.x, cp_top.y, 0);
                    ellipse(cp_top.x, cp_top.y, 10, 10);
                    
                    // Blue line: Bottom tip to cp_bot
                    stroke(0, 0, 255);
                    line(bot.x, bot.y, 0, cp_bot.x, cp_bot.y, 0);
                    ellipse(cp_bot.x, cp_bot.y, 10, 10);
                    
                    // Green point: the bottom tip itself
                    stroke(0, 255, 0);
                    fill(0, 255, 0);
                    ellipse(bot.x, bot.y, 10, 10);
                    pop();
                }
                // ---------------------
            pop();


            // lower string
            push();
                let top = animate_kfs(time_current, this.lower_string_top_kf_list);

                // --- DEBUG INTERACTIVE MODE (LOWER STRING) ---
                if (debug_mode && keyIsPressed && key === '4') {
                    let mx = mouseX - width / 2;
                    let my = mouseY - height / 2;
                    top.x = mx; top.y = my;
                    if (frameCount % 10 === 0) console.log(`lower_string_top: [${mx.toFixed(0)}, ${my.toFixed(0)}, 0]`);
                }
                // ---------------------------------------------

                line(
                    top.x,top.y,top.z,
                    0,400,0
                );

                // --- DEBUG DRAWING ---
                if (debug_mode) {
                    push();
                    stroke(0, 255, 0);
                    fill(0, 255, 0);
                    ellipse(top.x, top.y, 10, 10);
                    pop();
                }
                // ---------------------
            pop();
        pop();

    }

}