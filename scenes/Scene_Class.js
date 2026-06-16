class Scene {
    /**
     * @param {number} start_frame The frame unit when this scene begins.
     * @param {number} end_frame The frame unit when this scene ends.
     */
    constructor(start_frame, end_frame) {
        this.start_frame = start_frame;
        this.end_frame = end_frame;
    }

    /**
     * Checks if the scene should be active based on the global current frame
     * @param {number} frame_current 
     * @returns {boolean}
     */
    isActive(frame_current) {
        return frame_current >= this.start_frame && frame_current <= this.end_frame;
    }

    /**
     * Sets up the geometries, keyframes, and variables for the scene.
     * Should be called once during setup.
     */
    setup() {
        // To be implemented by child classes
    }

    /**
     * Displays the scene on the canvas. 
     * Applies the camera and renders the objects.
     * @param {number} time_current The current global time in seconds
     */
    display(time_current) {
        // To be implemented by child classes
    }
}
