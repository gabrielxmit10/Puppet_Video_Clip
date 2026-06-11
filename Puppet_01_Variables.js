// ALL VARIABLES WE WILL NEED

// BODY part related variables
// Geometry: --------------------

// Head geometry and texture
let head_shape;
// Body geometry
let body_shape;
// Arm geometries
let upper_arm_shape;
let lower_arm_shape;
let hand_shape;
// Leg geometries
let upper_leg_shape;
let lower_leg_shape;
let foot_shape;

// Colors: --------------------
// Head colors (texture)
let head_tex;
// Body colors (128)
let color_body;
// Arm colors (110)
let color_upper_arm;
let color_lower_arm;
let color_hand;
// Leg colors (110)
let color_upper_leg;
let color_lower_leg;
let color_foot;



// Sizes of Shapes: --------------------
// Head Sizes
let radius_head = 100;
// Body Sizes
let radius_body = 90;
// Arm Sizes
let radius_upper_arm = 25;
let height_upper_arm = 130; // this is the height of the cylinder, not from the top and bottom of the capsule that forms the upper arm
let radius_lower_arm = 25;
let height_lower_arm = 130; // this is the height of the cylinder, not from the top and bottom of the capsule that forms the lower arm
let radius_hand = 40;
// Leg Sizes
let radius_upper_leg = 30;
let height_upper_leg = 160;
let radius_lower_leg = 30;
let height_lower_leg = 130;
let radius_foot = 40;
let height_factor_foot = 1.2; // this is the factor that scales the foot in the y direction, making it taller
let depth_factor_foot = 1.6; // this is the factor that scales the foot in the z direction, making it deeper and more like a shoe



// JOINT related variables
// Base Joints Positions: --------------------

let full_body_pos;
let hips_pos;
let neck_pos;
let shoulder_r_pos;
let shoulder_l_pos;
let hip_leg_r_pos;
let hip_leg_l_pos;

// Joints Derived (from base + body parts): --------------------
// REMOVE LATER (i dont think I ever used these joint positions)

let elbow_r_pos;
let elbow_l_pos;
let hand_r_pos; // not joint but used for placing hands
let hand_l_pos; // not joint but used for placing hands
let knee_r_pos;
let knee_l_pos;
let ankle_r_pos;
let ankle_l_pos;

// ------------------------------ Variables Initialization Function ------------------------------
function initPuppetVariables(){
    // Initialize colors
    color_body = color("rgba(128, 128, 128, 1)");
    color_upper_arm = color("rgba(110, 110, 110, 1)");
    color_lower_arm = color_upper_arm;
    color_hand = color_upper_arm;
    color_upper_leg = color_upper_arm;
    color_lower_leg = color_upper_arm;
    color_foot = color_upper_arm;

    // Initialize base joint positions
    full_body_pos = createVector(0, 155, 0); // in the middle of the torso, to rotate the whole body around this point
    hips_pos = createVector(0, 160, 0); // in the middle of the hemisphere of the lower part of the torso, to rotate the torso around this point
    neck_pos = createVector(0, 0, 0);
    shoulder_r_pos = createVector(60, 40, 0);
    shoulder_l_pos = createVector(-60, 40, 0);
    hip_leg_r_pos = createVector(50, 250, 0);
    hip_leg_l_pos = createVector(-50, 250, 0);

    // Initialize derived joint positions
    elbow_r_pos = shoulder_r_pos.copy().add(createVector(0, height_upper_arm, 0));
    elbow_l_pos = shoulder_l_pos.copy().add(createVector(0, height_upper_arm, 0));
    hand_r_pos = elbow_r_pos.copy().add(createVector(0, height_lower_arm, 0));
    hand_l_pos = elbow_l_pos.copy().add(createVector(0, height_lower_arm, 0));
    knee_r_pos = hip_leg_r_pos.copy().add(createVector(0, height_upper_leg, 0));
    knee_l_pos = hip_leg_l_pos.copy().add(createVector(0, height_upper_leg, 0));
    ankle_r_pos = knee_r_pos.copy().add(createVector(0, height_lower_leg, 0));
    ankle_l_pos = knee_l_pos.copy().add(createVector(0, height_lower_leg, 0));
}

// ------------------------------ Geometry Initialization Function ------------------------------
function initPuppetGeometries() { // this has to be called in setup (REMOVE LATER - Idk what setup yet, since I will have multiple scenes, and Idk how that would work, but in some setup this will have to be called)
  // -------------------- Head Geometry Start --------------------
  beginGeometry();
  create_puppet_head(radius_head);
  head_shape = endGeometry();
  // -------------------- Head Geometry End --------------------

  // -------------------- Body Geometry Start --------------------
  beginGeometry();
  create_puppet_body(radius_body, color_body);
  body_shape = endGeometry();
  // -------------------- Body Geometry End --------------------

  // -------------------- Arm Geometries Start --------------------
  beginGeometry();
  create_puppet_upper_arm(radius_lower_arm, height_upper_arm, color_upper_arm);
  upper_arm_shape = endGeometry();

  beginGeometry();
  create_puppet_lower_arm(radius_lower_arm, height_lower_arm, color_lower_arm);
  lower_arm_shape = endGeometry();

  beginGeometry();
  create_puppet_hand(radius_hand, color_hand);
  hand_shape = endGeometry();
  // -------------------- Arm Geometries End --------------------

  // -------------------- Leg Geometries Start --------------------
  beginGeometry();
  create_puppet_upper_leg(radius_upper_leg, height_upper_leg, color_upper_leg);
  upper_leg_shape = endGeometry();

  beginGeometry();
  create_puppet_lower_leg(radius_lower_leg, height_lower_leg, color_lower_leg);
  lower_leg_shape = endGeometry();

  beginGeometry();
  create_puppet_foot(radius_foot, height_factor_foot, depth_factor_foot, color_foot);
  foot_shape = endGeometry();
  // -------------------- Leg Geometries End --------------------
}