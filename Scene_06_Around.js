/// <reference path="./Puppet_03_Class.js" />
/// <reference path="./Hand_03_Class.js" />
/// <reference path="./Animation_KFs_01.js" />
/// <reference path="./Scene_Class.js" />

// Things to do when creating a new scene (before the class):
// 1. Include the file in the index.html
// 2. Change the name of the class in this file to match the file name
// 3. Add it to sketch17.js in the scenes_list with the correct start and end frames (take notes of the start and end to put as comments here as well)

class Scene_06_Around extends Scene {

    constructor(start_frame, end_frame) {
        super(start_frame, end_frame); // 96, 80 

        // Initialize necessary objects and lists
        this.puppet = new Puppet(); this.puppet_opacity_kf_list = [];
        this.hand = new Hand(); this.hand_opacity_kf_list = [];
        this.camera_kf_list = [];
        this.puppet_layer = createFramebuffer(); // buffer for puppet fading
        this.hand_layer = createFramebuffer(); // buffer to display hand on top of everything and to fade out

        this.circle_radius = 350;
        this.spin_speed = 2.5;
        // this.circle_radius = 150;

        // 96,35,80(end)
        // Add Keyframes for each class property and manipulate them (like changeMode or hidePart)
        
        
        // setting the hand positions
        this.hand.addRotation('pinky0', new KeyFrame(215, [-60, 0, 30]));
        this.hand.addRotation('pinky1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('pinky2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('ring0', new KeyFrame(215, [-50, 0, 0]));
        this.hand.addRotation('ring1', new KeyFrame(215, [-90, 0, 0]));
        this.hand.addRotation('ring2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('middle0', new KeyFrame(215, [-60, 0, 0]));
        this.hand.addRotation('middle1', new KeyFrame(215, [-100, 0, 0]));
        this.hand.addRotation('middle2', new KeyFrame(215, [-70, 0, 0]));

        this.hand.addRotation('index0', new KeyFrame(215, [-0,0,-5]));
        this.hand.addRotation('index1', new KeyFrame(215, [-0,0,0]));
        this.hand.addRotation('index2', new KeyFrame(215, [0,0,0]));

        this.hand.addRotationX('thumb0', new KeyFrame(48, -20));
        this.hand.addRotationX('thumb1', new KeyFrame(48, -70));
        this.hand.addRotationX('thumb2', new KeyFrame(48, -90));
        
        this.hand.addRotation('arm', new KeyFrame(48, [-160,0,0]));

        // setting puppet rotations
        this.puppet.addRotationZ('shoulder_r', new KeyFrame(0, -20));
        this.puppet.addRotationZ('shoulder_l', new KeyFrame(0, 20));
        this.puppet.addRotationY('full_body', new KeyFrame(0, 90));
        this.puppet_opacity_kf_list.push(new KeyFrame(596, 0));
        this.puppet_opacity_kf_list.push(new KeyFrame(670, 255));

        // hand rotations
        this.hand.addProcedural( // palm rotation
            'palm', 
            (time_current, [x, y, z]) => { 
                let speed = this.spin_speed; let strength = 40; let phase = PI/2;
                let new_x = cos(time_current*speed+phase)*strength;
                let new_z = sin(time_current*speed+phase)*strength/1.1;

                // let amplitudes = [0,0,0];
                // let frequencies = [0.5, 0.5, 0.5];
                // let times = [time_current, time_current+1500, time_current+2000];
                // let xyz_list = noise_func(times, amplitudes, frequencies);
                // return [new_x+xyz_list[0], y, new_z+xyz_list[2]];


                return [new_x, y, new_z];
            }
        );
        this.hand.addProcedural( // arm noise rotations
            'arm', 
            (time_current, [x, y, z]) => { 
                let amplitudes = [3,0,3];
                let frequencies = [0.7, 0, 0.7];
                let times = [time_current, 0, time_current+1500];
                let xyz_list = noise_func(times, amplitudes, frequencies);
                return [x+xyz_list[0], y, z+xyz_list[2]];
            }
        );
        this.hand_opacity_kf_list.push(new KeyFrame(596, 255));
        this.hand_opacity_kf_list.push(new KeyFrame(680, 0));

        // puppet rotations around the circle
        

        // camera movement
        this.camera_kf_list.push(new KeyFrame(596, [121, -647, 312, 73, 732, 335], 'easeInOut'));
        this.camera_kf_list.push(new KeyFrame(680-0, [1321, 2054+0, 464, 13, 792+0, 325], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(680, [1688, 996, -32, 369, 980, 225], 'linear'));
        // this.camera_kf_list.push(new KeyFrame(680, [96, 84, 324, 73, 732, 335], 'linear'));

    }

    display(time_current) {
        
        // Camera ----------------------
        if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
        camera(...animate_kfs(time_current, this.camera_kf_list));
        }
        
        // Display objects ----------------------
        

        push();
            // translate(100,1500,300)
            // let eye_point = createVector(121, -647, 312);
            // let looked_at_point = createVector(73, 732, 335);
            let eye_point = createVector(60, -627, 330);
            let looked_at_point = createVector(77, 732, 322);
            let eye_vector = p5.Vector.sub(looked_at_point, eye_point);
            eye_vector.normalize(); eye_vector.mult(1900);
            let translate_point = p5.Vector.add(eye_point, eye_vector);
            translate(translate_point)
            rotateX(PI/2);
            push()
                noFill();
                stroke(191);
                strokeWeight(10);
                circle(0,0,this.circle_radius*2);
            pop();
            noStroke();
            // plane(1000);
        pop();

        push();
        // this.hand.display(time_current);
        pop();

        push();
            this.puppet_layer.begin();
                clear(); // erase the puppet from last frame
                if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
                camera(...animate_kfs(time_current, this.camera_kf_list));
                }
                
                translate(translate_point);
                let translate_rotation = (time,radius) => {
                    let speed = -this.spin_speed; let phase = 0;
                    let new_x = cos(time*speed+phase)*radius;
                    let new_z = sin(time*speed+phase)*radius;
                    return [new_x, 0, new_z];
                };
                
                translate(...translate_rotation(time_current, this.circle_radius));
                scale(0.2);
                translate(0,-540,0);
                this.puppet.display(time_current);
            this.puppet_layer.end();
            
            // let current_puppet_alpha = 255;
            let current_puppet_alpha = animate_kfs(time_current, this.puppet_opacity_kf_list);
            // if (this.puppet_opacity_kf_list.length > 0) {
            //     current_puppet_alpha = animate_kfs(time_current, this.puppet_opacity_kf_list);
            // }

            // reset model matrix to use the default camera (z=800) to display the puppet
            resetMatrix();
            if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
            camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
            }

            // applying opacity and draw the image of the puppet
            tint(255, current_puppet_alpha); 
            imageMode(CENTER);
            image(this.puppet_layer, 0, 0);
        pop();

        push();
             
            this.hand_layer.begin();
                clear(); // erase the hand from last frame
                // apply the exact same camera to the layer so it captures the 3D perspective
                if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
                camera(...animate_kfs(time_current, this.camera_kf_list));
                }
                this.hand.display(time_current);
            this.hand_layer.end();

            // Calculate your alpha using your keyframes (0 to 255)
            // let current_hand_alpha = animate_kfs(time_current, this.hand_opacity_kf_list); 
            let current_hand_alpha = 255; 
            
            // reset model matrix to use the default camera (z=800) to display the hand
            resetMatrix();
            if (typeof debug_camera_control === 'undefined' || !debug_camera_control) {
            camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
            }

            // applying opacity and draw the image of the hand
            tint(255, current_hand_alpha); 
            imageMode(CENTER);
            image(this.hand_layer, 0, 0);
        pop();

        
    }

}