# GravitationSimulator
Simulates planet gravitation with graphics and user interface

Usage:
* Move to mass selector on the top-left corner to choose the planet mass
* Drag the mouse on the canvas (the black background) to add a planet
* The dragging direction and length determines the initial speed and direction of the new planet
* Check "apply walls" to lock the planets inside a box-like room and see what happens!

Comments:
* This simulator does not model collisions, and behaviour may seem odd in cases of perceived collision
* The planets are modelled as gravitational objects with a zero radius
* Force calculation does not occur at zero distance to avoid division by zero and/or extremely large forces

Use this link to directly render the HTML file on your browser:
http://htmlpreview.github.io/?https://github.com/yonatanbashan/GravitationSimulator/blob/gh-pages/index.html
