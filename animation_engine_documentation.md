# Project Documentation: Animation & Scene Engine

This documentation is a comprehensive guide to all systems, classes, functions, and tweakable variables inside the codebase. 

---

## 1. Keyframe Animation System (`Animation_KFs_01.js`)

The animation system handles interpolating values over time across the 3D space.

### Core Classes & Interpolation Types

- **`KeyFrame(time, value, type_of_lerp, velocity)`**: Defines a target value at a specific point in time.
  - `time`: Time (measured in frames, based on `keyframe_version = 24`).
  - `value`: Target value (can be a `Number`, `Array`, or `p5.Vector`).
  - `type_of_lerp`: String defining the interpolation. Default is `'easeInOut'`. 

  **View all interpolation options (type_of_lerp)**
  - `'constant'`: No interpolation, snaps to value exactly on the keyframe.
  - `'linear'`: Simple linear interpolation.
  - `'easeIn'`: Quadratic ease-in ($t^2$). Start slow, speed up.
  - `'easeOut'`: Quadratic ease-out ($1-(1-t)^2$). Start fast, slow down.
  - `'easeInOut'` or `'easeInOutBezier'`: Smooth cubic bezier interpolation (control points `[0.333, 0, 0.667, 1]`). Natural ease.
  - `'easeInOutHermite'`: Smoothstep hermite interpolation (uses $v0=0, v1=0$).
  - `'hermite'`: Custom hermite curve. Requires passing `velocity`.
  - `'bezierSimple'`: Custom bezier curve. Requires passing `velocity`.

  **Velocity Parameter Format**
  - `velocity`: Used specifically for `'hermite'` and `'bezierSimple'` interpolation types.
    - For `'hermite'`: Pass an array `[v0, v1]` for the start and end velocity. You can also pass a single number if the start and end velocity are the same.
    - For `'bezierSimple'`: Pass an array of 4 control points `[x0, y0, x1, y1]`. If this is incorrectly formatted, the engine safely falls back to a standard `'easeInOut'`.

- **`Shot(start_frame, kf_list)`**: Groups a set of keyframes into a continuous sequence that activates at `start_frame`. This is useful to isolate animations without disrupting the global timeline.
- **`RotationKeyFrameList(mode)`**: Stores X, Y, and Z Keyframe lists, as well as an animatable `mode_kfs` list to track rotation order changes (Euler angles).
- **`TranslationKeyFrameList()`**: Stores X, Y, and Z Keyframe lists for movement.

### Applying Animations & Internal Engine Logic

- **`animate_kfs(time_current, kf_list)`**: Calculates and returns the interpolated value for the current time. Can output a `Number`, `Array`, or `p5.Vector` depending on the values you supplied in the KeyFrames. It automatically handles out-of-bounds queries by capping to the first or last keyframe in the list.
- **`animate_shots(time_current, shots_list)`**: Handles a sequence of `Shot` objects, rendering the correct `kf_list` based on the largest `start_frame` less than the current time.
- **`kf_lerp(kf1, kf2, t, type_of_lerp)`**: Used internally to interpolate between two keyframes based on warped time `t_new`.
- **`find_kf_and_type(frame_current, kf_list)`**: Internal logic to find the active keyframe interval via binary search. It also crawls backwards to find the last declared `type_of_lerp` so you don't have to declare it on every single frame.

### Noise & Math Utilities

- **`noise_func(time_current, amplitude, frequency)`**: Generates fixed-seed noise based on time. 
  - **Parameters**: 
    - `time_current`: Can be a single `Number` or an `Array` of numbers.
    - `amplitude` / `frequency`: If `time_current` is an array, these must be arrays of the exact same length. If `time_current` is a number, these must be single numbers.
  - **Returns**: A single noise value, or an array of noise values corresponding to each input.

- **`noise_func_to_value(value, time_current, amplitude, frequency)`**: Adds procedural noise offsets to an existing base `value`. 
  - **Parameters**:
    - `value`: The base value. Can be a `p5.Vector`, an `Array`, or a single `Number`.
    - `time_current`: Must match the exact type and structure of `value` (e.g., if `value` is a `p5.Vector`, `time_current` must be a `p5.Vector` containing `.x, .y, .z` times).
    - `amplitude` / `frequency`: Must be arrays matching the length/dimensions of `value` (e.g., length 3 for a `p5.Vector`), or single numbers if `value` is a number.
  - **Returns**: A new `p5.Vector`, `Array`, or `Number` with the noise applied.

- **`stepDouble(t, start, end)`**: Returns `1` if `t` is inside the range `[start, end)`, otherwise returns `0`.
- **`clamp(num, min, max)`**: Simple math clamping bounding `num` between `min` and `max`.

---

## 2. Puppet System (`Puppet_03_Class.js`)

The `Puppet` class handles rendering, animating, and querying the human-like character model.

### Joints and Body Parts Reference

- **Joints (`s`)** (Animatable pivots): 
  - `full_body`, `hips`, `neck`
  - `shoulder_r`, `elbow_r`, `shoulder_l`, `elbow_l`
  - `hips_leg_r`, `knee_r`, `ankle_r`, `hips_leg_l`, `knee_l`, `ankle_l`
- **Body Parts (`b`)** (Visibility nodes): 
  - `arm_r`, `arm_l`, `leg_r`, `leg_l`, `head`, `body`
  - `upper_arm_r`, `lower_arm_r`, `hand_r` (same for `_l`)
  - `upper_leg_r`, `lower_leg_r`, `foot_r` (same for `_l`)

### Animation Methods

- **Rotation**:
  - `addRotationX(s, kf)` / `addRotationY(s, kf)` / `addRotationZ(s, kf)`: Add a `KeyFrame` to a specific axis.
  - `addRotation(s, kf)`: Add a keyframe to all axes at once. `kf.value` must be an array `[x, y, z]`.
  - `resetAllRotations(frame_number, type_of_lerp = 'constant')`: Zeroes out all joint rotations at a specific frame.
  - `changeRotationMode(s, mode)`: Change Euler order (e.g., `'YZX'`, `'XYZ'`, `'ZYX'`).
  - `addRotationMode(s, kf)`: Animate the rotation mode change using a `KeyFrame`.

- **Translation**:
  - `addTranslation(s, kf)` / `addTranslationX/Y/Z`: Adjusts translation. Only valid on the `'full_body'` joint.

- **Visibility**:
  - `hidePart(b)` / `showPart(b)`: Instantly hide/show a part or group.
  - `hideAll()` / `showAll()`: Hide/show the entire puppet.
  - `hideExcept(b)`: Hide everything except the specified part.
  - `addVisibility(b, kf)`: Keyframes the visibility. The engine uses a threshold: values `> 0.5` show the part, and `<= 0.5` hide the part. Usually, you should use the `'constant'` lerp type for instant toggles.

- **Procedural Logic**:
  - `addProcedural(s, func)`: Hook into the end of the interpolation pipeline. This allows programmatic movements overriding keyframes. `func(time_current, [val_x, val_y, val_z]) => [new_x, new_y, new_z]`. Works for rotations, and for translation on `full_body`.

### Tweakable Variables & Initialization

These variables determine the sizing and color of the puppet and are initialized via `initPuppetVariables()`.
- **Sizes**: `radius_head`, `radius_body`, `radius_upper_arm`, `height_upper_arm`, `radius_lower_arm`, `height_lower_arm`, `radius_hand`, `radius_upper_leg`, `height_upper_leg`, `radius_lower_leg`, `height_lower_leg`, `radius_foot`, `height_factor_foot`, `depth_factor_foot`.
- **Colors**: `color_body`, `color_upper_arm`, `color_lower_arm`, `color_hand`, `color_upper_leg`, `color_lower_leg`, `color_foot`.
- **Textures**: `head_tex` (Requires `loadImage` in `preload()`).

### Tracking & Utilities

- `display(time_current)`: Renders the puppet and resolves all local transforms.
- `getNeckOffset(time_current)`: Internally isolates the Full Body, Hips, and Neck translations/rotations to calculate and return the absolute global `p5.Vector` `[X, Y, Z]` coordinate of the neck.
- **Global Trackers** (Auto-updated after `display()`):
  - `this.global_string_pos_upper_arm_r`, `this.global_string_pos_upper_arm_l`
  - `this.global_string_pos_lower_arm_r`, `this.global_string_pos_lower_arm_l`
  - `this.global_string_pos_neck`


---

## 3. Hand System (`Hand_03_Class.js`)

Manages the giant floating hand. Default rotation order for fingers is `'ZYX'`.

### Joints Reference

- **Main Joints**: `'arm'`, `'palm'`
- **Finger Joints**: `pinky0..2`, `ring0..2`, `middle0..2`, `index0..2`, `thumb0..2`
- **Grouped Fingers** (Targets all 3 joints at once): `'pinky'`, `'ring'`, `'middle'`, `'index'`, `'thumb'`

### Animation Methods

- **Rotation**:
  - `addRotationX(s, kf)` / `addRotationZ(s, kf)`: Applies to any joint.
  - `addRotationY(s, kf)`: Applies **only** to `'arm'` and `'palm'`. Finger joints physically cannot rotate on the Y-axis. If you pass a non-zero Y value to a finger joint, the engine will safely ignore it and print a warning to the console.
  - `addRotation(s, kf)`: Rotates all available axes. `kf.value` must be `[x, y, z]`.
  
  **Grouped Finger Targeting Tip**
  If you pass a grouped finger name (e.g., `'pinky'`) into `addRotationX` or `addRotationZ`, your `kf.value` should be an array of 3 values `[val0, val1, val2]` corresponding to the 3 joints (base to tip) of that finger. This makes it trivial to curl a whole finger with one command.

- **Rotation Modes**:
  - `changeRotationMode(s, mode)` / `addRotationMode(s, kf)`: Alters Euler rotation sequence.
- **Procedural Logic**:
  - `addProcedural(s, func)`: Works exactly like the Puppet's procedural method. Can target a specific finger joint or a grouped finger (applies the same function to all 3 sections).

### Tweakable Variables & Initialization

Initialized via `initHandVariablesAndGeometries()`.
- **Sizes**: `hand_stroke_weight`, `hand_palm_depth`, `hand_arm_radius`, `hand_arm_height`.
- **Finger Lengths**: `hand_finger_heights` contains specific dimensions for all 5 fingers across their 3 sections. Additional controls like `short_radius_fingers`, `long_radius_fingers`, `radius_x_factor` for thumb deformation.
- **Colors**: `color_hand_stroke`, `color_hand_palm`, `color_hand_arm`, `color_hand_finger`.

### Tracking & Utilities

- `display(time_current)`: Renders the hand model.
- **Global Trackers** (Auto-updated after `display()`):
  - Exact coordinates for the tips of the fingers: `global_string_pos_pinky`, `global_string_pos_ring`, `global_string_pos_middle`, `global_string_pos_index`, `global_string_pos_thumb`.

---

## 4. Stage System (`Stage_03_Class.js`)

Generates the 3D stage geometry including floor, backdrop, top curtains, and animated side curtains.

### Animation Methods

- **Animatable Parts**: `'right_curtains'`, `'left_curtains'`
- **Translation**:
  - `addTranslation(s, kf)` / `addTranslationX/Y/Z(s, kf)`: Opens and closes the side curtains.
- **Procedural Logic**:
  - `addProcedural(s, func)`: Procedural override for the translations of the curtains.

### Tweakable Variables & Initialization

Initialized via `initStageVariables()`.
- **Sizes**: `floor_width`, `floor_height`, `floor_depth`, `wall_width`, `wall_height`, `ceiling_width`, `ceiling_height`, `ceiling_depth`, `top_curtain_width`, `circle_radius_stage`, `n_half_cylinders`, `half_cylinder_radius`, `half_cylinder_height`, `half_cylinder_res_rotations`.
- **Colors**: `color_front_stage`, `color_back_stage`, `color_floor_stage`, `color_floor_top_stage`, `color_wall_stage`, `color_ceiling_stage`, `color_ceiling_bottom_stage`.


---

## 5. Scene Management (`Scene_Class.js` & `Scene_Template.js`)

Scenes manage time-blocks in the animation sequence, encapsulating keyframes and rendering commands.

### Base Interface

- **`Scene(start_frame, end_frame)`**: Class constructor.
- **`isActive(frame_current)`**: Returns `true` if the current time matches the bounds.
- **`setup()`**: (Optional) Lifecycle hook for setup constraints.
- **`display(time_current)`**: Primary render loop per scene.

### Building a New Scene Step-by-Step

1. **Duplicate** `Scene_Template.js` and rename the class (e.g., `Scene_10_NewName`).
2. **Setup bounds**: Define `start_frame` and `end_frame` within the `super(...)` call.
3. **Initialize Animations**: Add your `KeyFrame` calls targeting the `this.puppet`, `this.hand`, or `this.stage` instances (if instantiated/passed locally). 
   - Ensure the camera has its own keyframe list (e.g., `this.camera_kf_list`).
4. **Render**: In `display(time_current)`, call `camera(...)` with `animate_kfs`, then trigger the `.display()` routines for the respective elements (Puppet, Hand, Stage) wrapped in `push()`/`pop()`.
5. **Register**: Add the `<script>` tag in `index.html` and push the class into `scenes_list` inside `sketch17.js`.

---

## 6. Global Engine Utilities (`sketch17.js`)


### Finding Absolute Positions

- **`getGlobalPosition()`**: A critical function that parses the active WebGL matrix transformation (`_renderer.uModelMatrix.mat4`) and extracts the absolute `[X, Y, Z]` world coordinates of the current point `(0,0,0)`. Use this for attaching dynamic 3D elements, lines, and ropes between characters dynamically.

### Time & Engine State Configurations

- `framerate = 60`: Target playback frame rate.
- `keyframe_version = 24`: The frame scale used when scheduling keyframes in `KeyFrame(time, ...)`.
- `time_current`: Centralized synced global time metric updated per draw loop.
- **Editor Mode (`editor_mode`)**:
  - `'animation'` / `''`: Normal playback (relies on song time).
  - `'fixed'`: Halts perfectly on `frame_start`.
  - `'forward'`: Ensures the playback strictly follows the song.
  - `'loop'`: Wraps playback boundaries between `time_start` and `time_end`.
  - `'editor'` / `'editor_forward'`: Mounts an interactive HTML UI scrubber to play/pause, scrub by `editor_step`, and view exact camera vectors dynamically inside `cam_info_input`.
