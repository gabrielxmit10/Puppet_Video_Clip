/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames 
//      (take notes of the start and end to put as comments here as well)

class Scene_03_Strumming extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 215, 290 

        // Initialize necessary objects and lists
        this.hand = new Hand();
        this.camera_kf_list = [];
        this.hand_translate_kf_list = [];
        this.string_control_points_kf_list = [ // has each control point's kf_list 
            // (the 2 control points of a same string will have the same position for this animation, so I just create one per string)
            [], [], [],
        ]

        this.string_height = 1000; // is actually half the height (is the distance of the end points to y=0)
        this.string_offset = 600;



        // 215,238,260,290(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        // this.hand.addRotationZ('pinky2', new KeyFrame(0, 30));

        // putting the hand in the strumming position
        // this.hand.addRotation('arm', new KeyFrame(215, [-90 + 10, -90 + 10, 0]));

        // close all fingers except thumb and index
        this.hand.addRotation('pinky0', new KeyFrame(215, [-60, 0, 30]));
        this.hand.addRotation('pinky1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('pinky2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('ring0', new KeyFrame(215, [-50, 0, 0]));
        this.hand.addRotation('ring1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('ring2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('middle0', new KeyFrame(215, [-60, 0, 0]));
        this.hand.addRotation('middle1', new KeyFrame(215, [-100, 0, 0]));
        this.hand.addRotation('middle2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotationZ('index0', new KeyFrame(215, -5));
        // this.hand.addRotation('index0', new KeyFrame(215, [0,0,-5]));
        // this.hand.addRotation('index1', new KeyFrame(215, [-10,0,0]));
        // this.hand.addRotation('index2', new KeyFrame(215, [0,0,0]));

        this.hand.addRotationX('thumb0', new KeyFrame(48, -20));
        this.hand.addRotationX('thumb1', new KeyFrame(48, 0));
        this.hand.addRotationX('thumb2', new KeyFrame(48, -15));


        // animating the strumming movement (palm and index)

        let pulling_time = 7;
        let release_time = 3;
        let string_to_string_time = 15;
        let pull_animation_type = 'easeOut';
        let release_animation_type = 'easeOut';

        let touch_t = [];
        let pulled_t = [];
        let released_t = [];

        touch_t[0] = 215;
        pulled_t[0] = touch_t[0] + pulling_time; // 222
        released_t[0] = pulled_t[0] + release_time; // 225
        
        touch_t[1] = released_t[0] + string_to_string_time; // 240
        pulled_t[1] = touch_t[1] + pulling_time; // 247
        released_t[1] = pulled_t[1] + release_time; // 250
        
        touch_t[2] = released_t[1] + string_to_string_time; // 265
        pulled_t[2] = touch_t[2] + pulling_time; // 272
        released_t[2] = pulled_t[2] + release_time; // 275


        let palm_touch_x = 10;
        let palm_pulled_x = 5;
        let palm_released_x = 30;

        this.hand.addRotationX('palm', new KeyFrame(touch_t[0], palm_touch_x, pull_animation_type));
        // contract hand to pull string 0
        this.hand.addRotationX('palm', new KeyFrame(pulled_t[0], palm_pulled_x, release_animation_type));
        // relax hand to release string 0 (move the palm back)
        this.hand.addRotationX('palm', new KeyFrame(released_t[0], palm_released_x));
        // contract hand (move palm forward to be ready for the next strum)
        
        this.hand.addRotationX('palm', new KeyFrame(touch_t[1], palm_touch_x, pull_animation_type));
        // contract hand to pull string 1
        this.hand.addRotationX('palm', new KeyFrame(pulled_t[1], palm_pulled_x, release_animation_type));
        // relax hand to release string 1 (move the palm back)
        this.hand.addRotationX('palm', new KeyFrame(released_t[1], palm_released_x));
        // contract hand (move palm forward to be ready for the next strum)
        
        this.hand.addRotationX('palm', new KeyFrame(touch_t[2], palm_touch_x, pull_animation_type));
        // contract hand to pull string 2
        this.hand.addRotationX('palm', new KeyFrame(pulled_t[2], palm_pulled_x, release_animation_type));
        // relax hand to release string 2 (move the palm back)
        this.hand.addRotationX('palm', new KeyFrame(released_t[2], palm_released_x));


        let index_touch_x = [-30, -20, -40];
        // let index_pulled_x = [-30, -80, 10];
        let index_pulled_x = [-30, -80, -10];
        let index_released_x = [-20, -50, -10];
        
        
        this.hand.addRotationX('index', new KeyFrame(touch_t[0], index_touch_x, pull_animation_type));
        // contract finger, move to pull string 0 (this one joint might not contract though, but here is the moment of pulling the string)
        this.hand.addRotationX('index', new KeyFrame(pulled_t[0], index_pulled_x, release_animation_type));
        // relax finger, move to release string 0 (should be a faster movement I think)
        this.hand.addRotationX('index', new KeyFrame(touch_t[1], index_touch_x, pull_animation_type));
        // contract finger, move to pull string 1
        this.hand.addRotationX('index', new KeyFrame(pulled_t[1], index_pulled_x, release_animation_type));
        // relax finger, move to release string 1
        this.hand.addRotationX('index', new KeyFrame(touch_t[2], index_touch_x, pull_animation_type));
        // contract finger, move to pull string 2
        this.hand.addRotationX('index', new KeyFrame(pulled_t[2], index_pulled_x, release_animation_type));
        // relax finger, move to release string 2
        this.hand.addRotationX('index', new KeyFrame(released_t[2], index_released_x));

        // animating arm rotation

        this.hand.changeRotationMode('arm', 'XZY');
        this.hand.addRotation('arm', new KeyFrame(touch_t[0], [-80, -80, 0]));
        this.hand.addRotation('arm', new KeyFrame(pulled_t[0], [-80, -80, 0], 'easeOut'));
        this.hand.addRotation('arm', new KeyFrame(released_t[0]+3, [-80, -80, 10]));

        this.hand.addRotation('arm', new KeyFrame(touch_t[1], [-80, -80, 0]));
        this.hand.addRotation('arm', new KeyFrame(pulled_t[1], [-80, -80, 0], 'easeOut'));
        this.hand.addRotation('arm', new KeyFrame(released_t[1]+3, [-80, -80, 10]));

        this.hand.addRotation('arm', new KeyFrame(touch_t[2], [-80, -80, 0]));
        this.hand.addRotation('arm', new KeyFrame(pulled_t[2], [-80, -80, 0], 'easeOut'));
        this.hand.addRotation('arm', new KeyFrame(released_t[2]+3, [-80, -80, 10]));




        // animating Hand Translation
        let hand_translate_x = 130; let hand_translate_y = -50;
        let hand_translate_z_center = -850+15; // z we need to translate for the hand to be able to touch the middle string
        this.hand_translate_kf_list.push(new KeyFrame(touch_t[0], [hand_translate_x, hand_translate_y, hand_translate_z_center + this.string_offset], 'easeInOut'));
        this.hand_translate_kf_list.push(new KeyFrame(pulled_t[0], [hand_translate_x, hand_translate_y, hand_translate_z_center + this.string_offset], 'easeInOut'));
        // move from string 0 to string 1 (z-=this.string_offset)
        this.hand_translate_kf_list.push(new KeyFrame(touch_t[1], [hand_translate_x, hand_translate_y, hand_translate_z_center]));
        // wait in string 1
        this.hand_translate_kf_list.push(new KeyFrame(pulled_t[1], [hand_translate_x, hand_translate_y, hand_translate_z_center]));
        // move from string 1 to string 2 (z-=this.string_offset)
        this.hand_translate_kf_list.push(new KeyFrame(touch_t[2], [hand_translate_x, hand_translate_y, hand_translate_z_center - this.string_offset ]));
        this.hand_translate_kf_list.push(new KeyFrame(pulled_t[2], [hand_translate_x, hand_translate_y, hand_translate_z_center - this.string_offset ], 'easeOut'));
        // this.hand_translate_kf_list.push(new KeyFrame(290, [hand_translate_x, hand_translate_y, hand_translate_z_center - this.string_offset ]));
        this.hand_translate_kf_list.push(new KeyFrame(released_t[2]+string_to_string_time, [hand_translate_x, hand_translate_y, hand_translate_z_center - 2*this.string_offset + 20 ]));



        
        // Animating Control Points
        let control_point_move = 100; // how much the control point moves to the right when strummed (to simulate the touch)

        this.string_control_points_kf_list[0].push(new KeyFrame(touch_t[0], [0, 0, this.string_offset], pull_animation_type));
        // move control point to the right (to simulate the touch)
        this.string_control_points_kf_list[0].push(new KeyFrame(pulled_t[0], [0, 0, this.string_offset - control_point_move]));

        this.string_control_points_kf_list[1].push(new KeyFrame(touch_t[1], [0, 0, 0], pull_animation_type));
        // move control point to the right (to simulate the touch)
        this.string_control_points_kf_list[1].push(new KeyFrame(pulled_t[1], [0, 0, -control_point_move]));

        this.string_control_points_kf_list[2].push(new KeyFrame(touch_t[2], [0, 0, -this.string_offset], pull_animation_type));
        // move control point to the right (to simulate the touch)
        this.string_control_points_kf_list[2].push(new KeyFrame(pulled_t[2], [0, 0, -this.string_offset - control_point_move]));

        // this part of the control points is super confusing, but I basically made a decaying oscillation movement for each string 
        //      at their right moment in time, alternating manually between the sides with keyframes
        let control_point_interval = 2; let string_offsets_list = [this.string_offset, 0, -this.string_offset];
        let delay_after_pulled_t = 2; // how many frames after the pulled_t the string starts going back (as the hand releases the string)
        let elastic_factor = 1; let decay_factor = 0.7;
        let string_iterations = 5; // how many times the string will go back and forth before stabilizing
        
        for (let s = 0; s < 3; s++) { // one for each string
            for (let i = 0; i <= string_iterations; i++) { // decreases the control point distance from the middle every 'control_point_interval' frames and alternates the side
                if (i == 0) { // the start of the string going back (I did manually so it looks good with how the index finger releases)
                    this.string_control_points_kf_list[s].push(new KeyFrame(pulled_t[s]+delay_after_pulled_t, [0, 0, string_offsets_list[s]-control_point_move+10]));
                } 
                else if (i == string_iterations) { // the end of the string going back (stabilized in the original position)
                    this.string_control_points_kf_list[s].push(new KeyFrame(pulled_t[s]+delay_after_pulled_t+control_point_interval*(i+1), [0, 0, string_offsets_list[s]]));
                } else {
                    this.string_control_points_kf_list[s].push(
                        new KeyFrame(
                            pulled_t[s]+delay_after_pulled_t+control_point_interval*i, 
                            [
                                0, 
                                0, 
                                string_offsets_list[s] + Math.pow(-1, i+1)*control_point_move*Math.pow(decay_factor, i)*elastic_factor
                            ]
                        )
                    );
                }
            }
        }


        // animating the camera
        // this.camera_kf_list.push(new KeyFrame(215, [1800, -344, 0, 0, 0, 0], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(290, [1800, 344, 0, 0, 0, 0], 'easeInOut'));
        // this.camera_kf_list.push(new KeyFrame(215, [1800, -344, 300, 0, 0, 300], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(290, [1800, -344, -300, 0, 0, -300], 'easeInOut'));
        
        // this.camera_kf_list.push(new KeyFrame(215, [1988, 0, 0, 0, 0, 0], 'linear'));
        this.camera_kf_list.push(new KeyFrame(215, [1800, -200, 300, 0, 0, 300], 'linear'));
        this.camera_kf_list.push(new KeyFrame(290, [1800, 200, -100, 0, 0, -100], 'easeInOut'));
    }

    display(time_current) {

        // Camera ----------------------
        camera(...animate_kfs(time_current, this.camera_kf_list));
        // camera(1292, 0, 0, 0, 0, 0);
        // camera(2018, 0, 0, 0, 0, 0);

        // Display objects ----------------------

        push();
            translate(animate_kfs(time_current, this.hand_translate_kf_list));
            scale(1, -1, 1);
            this.hand.display(time_current);
        pop();

        // strings

        
        push();
            stroke(191);
            strokeWeight(7);
            noFill();
            curveTightness(10);

            // string 0
            let control_point_0 = animate_kfs(time_current, this.string_control_points_kf_list[0]);
            beginShape(); 
                curveVertex(0, -this.string_height - 100, this.string_offset); // Extrapolated start control
                curveVertex(0, -this.string_height, this.string_offset);       // Actual start anchor
                curveVertex(control_point_0.x, control_point_0.y, control_point_0.z); // Finger touch
                curveVertex(0, this.string_height, this.string_offset);        // Actual end anchor
                curveVertex(0, this.string_height + 100, this.string_offset);  // Extrapolated end control
            endShape();

            // string 1
            let control_point_1 = animate_kfs(time_current, this.string_control_points_kf_list[1]);
            beginShape();
                curveVertex(0, -this.string_height - 100, 0); 
                curveVertex(0, -this.string_height, 0); 
                curveVertex(control_point_1.x, control_point_1.y, control_point_1.z);
                curveVertex(0, this.string_height, 0); 
                curveVertex(0, this.string_height + 100, 0); 
            endShape();

            // string 2
            let control_point_2 = animate_kfs(time_current, this.string_control_points_kf_list[2]);
            beginShape();
                curveVertex(0, -this.string_height - 100, -this.string_offset); 
                curveVertex(0, -this.string_height, -this.string_offset); 
                curveVertex(control_point_2.x, control_point_2.y, control_point_2.z);
                curveVertex(0, this.string_height, -this.string_offset); 
                curveVertex(0, this.string_height + 100, -this.string_offset); 
            endShape();
        pop();

    }

}