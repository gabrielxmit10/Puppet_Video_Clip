class SubtitleLine {
    constructor(text, frame_start, frame_end = null, size = 35, x = 0, y = -250, color = [255, 255, 255]) {
        this.text = text;
        this.frame_start = frame_start;
        this.frame_end = frame_end;
        this.size = size;
        this.x = x;
        this.y = y;
        this.color = color;
    }
}



const SUBTITLES_DATA = [
    // Add your subtitles here! 
    // You can customize the start_frame, end_frame, text, size, x, y, and color.
    // x and y are relative to the center of the screen. 
    // y = 0 is the center, positive y goes down, negative y goes up.
    // x = 0 is the center, positive x goes right, negative x goes left.
    
    // Example for the final scene (starts around frame 1267):
    // new SubtitleLine("What... happened?", 0),
    // new SubtitleLine("What... happenedasas?", 10),
    // new SubtitleLine("I am finally free.", 1290, 1335),


    new SubtitleLine("aperte 'ESPAÇO' para iniciar", 0,1,15,0,-250, [191,191,191]),
    new SubtitleLine("Gabriel Schmitz\nComputação Gráfica 26.1", 0,1,20,0,200),
    new SubtitleLine("John Michael Howell", 0,1,25,0,50, [191,191,191]),
    new SubtitleLine("PUPPET", 0,47-3,100,10,-20),
    new SubtitleLine("PUPPET", 48-3,49-3,100,10,-20),
    new SubtitleLine("PUPPET", 48+2-3,49+2-3,100,10,-20),
    new SubtitleLine("baby", 94,127),
    new SubtitleLine("did you pull my strings", 132),
    new SubtitleLine("so you could play me?", 159),
    new SubtitleLine("strummin' on my heart just to betray me", 215),
    // new SubtitleLine("just to betray me", 240),
    new SubtitleLine("had me crazy over you", 290),
    // new SubtitleLine("over you", 320),

    
    new SubtitleLine("feels like i'm stuck inside your show, ", 410),
    new SubtitleLine("it's true", 490),


    new SubtitleLine("you got me wrapped a-", 540),
    new SubtitleLine("around your finger, ", 596),
    new SubtitleLine("acting like a fool", 636),
    new SubtitleLine("must've been the strings you pulled", 676+2),
    new SubtitleLine("now it's clear, ", 762),
    new SubtitleLine("i can see the truth", 802),
    new SubtitleLine("i was just a puppet to you", 842,932),
    new SubtitleLine("darlin', i'm done ", 945,972),
    new SubtitleLine("playin' along", 984,1013),
    new SubtitleLine("it's time to cut me loose", 1025),
    new SubtitleLine("got me wrapped around your finger, ", 1074),
    new SubtitleLine("acting like a fool", 1137),
    new SubtitleLine("but girl, i ain't no puppet, ", 1173),
    new SubtitleLine("no puppet, ", 1214),
    new SubtitleLine("no puppet ", 1236),
    new SubtitleLine("for you", 1254,1267+8),




    // {
    //     start_frame: 0, 
    //     // end_frame: 1290, 
    //     text: "What... happened?", 
    //     // size: 32, 
    //     // x: 0, 
    //     // y: 200, 
    //     // color: [255, 255, 255] // RGB color
    // },
    // {
    //     start_frame: 1290, 
    //     end_frame: 1333, 
    //     text: "I am finally free.", 
    //     // size: 32, 
    //     // x: 0, 
    //         // y: 200, 
    //     // color: [255, 255, 255]
    // }
];

class SubtitleManager {
    constructor(font) {
        this.font = font;
        // Create a dedicated layer for subtitles, just like in Scene_06_Around.js
        this.layer = createFramebuffer(); 
    }

    display(current_time_seconds, current_frame) {
        // Find which subtitles should be displayed right now
        let active_subtitles = [];
        for (let i = 0; i < SUBTITLES_DATA.length; i++) {
            let sub = SUBTITLES_DATA[i];
            // if there is no end_frame then use the start of the next
            if (sub.frame_end === null) {
                if (i + 1 < SUBTITLES_DATA.length) {
                    sub.frame_end = SUBTITLES_DATA[i + 1].frame_start;
                } else {
                    sub.frame_end = Infinity;
                }
            }

            if (current_frame >= sub.frame_start && current_frame < sub.frame_end) {
                active_subtitles.push(sub);
            }
        }

        // If we found any active subtitles, draw them on the screen
        if (active_subtitles.length > 0) {
            push();
            
            // 1. Draw the text into our dedicated layer
            this.layer.begin();
                clear(); // Erase previous frame's text
                
                // Set 2D view for drawing text perfectly flat inside the buffer
                camera(); 
                ortho(-width/2, width/2, -height/2, height/2, -1000, 1000);
                resetMatrix();

                for (let i = 0; i < active_subtitles.length; i++) {
                    let active_subtitle = active_subtitles[i];
                    
                    // Set up text appearance FIRST so textWidth() calculates correctly!
                    textFont(this.font);
                    textSize(active_subtitle.size);
                    textAlign(CENTER, CENTER);

                    // Use the x and y from the subtitle, with defaults just in case
                    let sub_x = active_subtitle.x !== undefined ? active_subtitle.x : 0;
                    let sub_y = active_subtitle.y !== undefined ? active_subtitle.y : -250;

                    // Add a nice text shadow for readability
                    fill(0); 
                    text(active_subtitle.text, sub_x + 2, sub_y + 2);
                    
                    // Draw the actual text
                    let col = active_subtitle.color || [255, 255, 255];
                    fill(col[0], col[1], col[2]); 
                    text(active_subtitle.text, sub_x, sub_y);
                }
            this.layer.end();
            
            // 2. Now place the layer perfectly on top of the 3D scene
            resetMatrix();
            camera(0, 0, 800, 0, 0, 0, 0, 1, 0); // Default camera
            
            // CRITICAL: Clear the depth buffer! 
            // This forces p5.js to forget about all 3D objects drawn so far,
            // guaranteeing that our image() is placed 100% on top of everything.
            clearDepth(); 

            tint(255, 255); // Reset tint
            imageMode(CENTER);
            image(this.layer, 0, 0);
            
            pop();
        }
    }
}
