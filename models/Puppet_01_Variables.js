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


// Necessary Joints Positions: --------------------
let shoulder_r_pos;
let shoulder_l_pos;

// ------------------------------ Variables Initialization Function ------------------------------
function initPuppetVariables(){ // colors and joint position
    // Initialize colors
    color_body = color("rgba(128, 128, 128, 1)");
    color_upper_arm = color("rgba(110, 110, 110, 1)");
    color_lower_arm = color_upper_arm;
    color_hand = color_upper_arm;
    color_upper_leg = color_upper_arm;
    color_lower_leg = color_upper_arm;
    color_foot = color_upper_arm;

    // Initialize joint positions
    shoulder_r_pos = createVector(60, 40, 0);
    shoulder_l_pos = createVector(-60, 40, 0);
}

// ------------------------------ Geometry Initialization Function ------------------------------
function initPuppetGeometries() { // this has to be called in setup
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