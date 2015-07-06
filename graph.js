/* Inspired by ROBO Design
 * https://dev.opera.com/articles/html5-canvas-painting/
 */

//Global variables
var canvas, context, canvaso, contexto, backgroundCanvas, backgroundContext
var mouse_canvas, mouse_context;
var toollist; 
var radius = 3;
var undo_length = 10;
var newheight;

// The active tool instance.
var tool;
var tool_default = 'node';
var new_id = 0;

// This object holds the implementation of each drawing tool.
var tools = {};

var nodes = []; //array of nodes
var edges = []; //array of the id's of the nodes
var undo = [];
var redo = [];

//Initialization~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  function init () {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');
    backgroundCanvas = document.getElementById('background');

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    backgroundContext = backgroundCanvas.getContext('2d');

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');

    //initialize mouse coordinates box
    mouse_canvas = document.getElementById('mouse');
    mouse_context = mouse_canvas.getContext('2d');

    //hide all tools --> MOVE TO CSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    document.getElementById("snapping").style.display = "none"; //hide snapping tool
    document.getElementById('gender').style.display = 'none'; //hide gender tool
    document.getElementById('roomNumber').style.display = 'none'; //hide room number tool
    document.getElementById('entryway').style.display = 'none';
    document.getElementById('radius').style.display = 'inline-block';
    document.getElementsByName('radius')[0].value = 3;
    document.getElementById('info').style.display = 'none';
    document.getElementById('stairset').style.display = 'none';
    document.getElementById('floorset').style.display = 'none';
    document.getElementById('stair').style.display = 'none';
    document.getElementById('stair1').style.display = 'none';
    document.getElementById('vertical').style.display = 'none';

    //add event listener for nodeType
    document.getElementById('nodeType').addEventListener('change', ev_tool_change, false);

    toollist = document.getElementsByName("dtool"); 
    for(var i = 0; i < toollist.length; i++) {  
      toollist[i].addEventListener('change', ev_tool_change, false);
    }

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      toollist.value = tool_default;
    }

    //work with the undo/redo button
    var undo_click = document.getElementById('undo');
    var redo_click = document.getElementById('redo');
    undo_click.addEventListener('click', undoIt, false);
    redo_click.addEventListener('click', redoIt, false);

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
}; // END INITIALIZATION


// CANVAS SET-UP and BASIC EVENT HANDLER~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*The general-purpose event handler. This function just determines the mouse 
position relative to the canvas element.*/

function ev_canvas (ev) {
  if (ev.layerX || ev.layerX == 0) { // Firefox
    ev._x = ev.layerX;
    ev._y = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    ev._x = ev.offsetX;
    ev._y = ev.offsetY;
  }

  // Call the event handler of the tool.
  var func = tool[ev.type];
  if (func){
    func(ev);
  }
}

//get file and change canvas background
function changeCanvas(){
  var file = document.getElementById('image').files[0];
  var fileread = new FileReader();
  var image = new Image();
  var width, height;
   
  //fileread.readAsDataURL(file);
  fileread.onload = function(_file) { //once file has uplaoded
    //make sure the image has loaded
    image.onload = function(){
      width = this.width;
      height = this.height

      //resizing the uploaded image
      height = height * 1000 / width;
      width = 1000;
      newheight = height;

      //change canvas
      canvaso.width = width; //edit sizes
      canvaso.height = height;
      canvas.width = width;
      canvas.height = height;
      backgroundCanvas.width = width;
      backgroundCanvas.height = height;
      backgroundContext.drawImage(image, 0, 0, width, height);

      //clear all nodes and edges
      edges = [];
      nodes = [];
    }
    image.src = _file.target.result;
  } 
  fileread.readAsDataURL(file);
    document.getElementById('container').height = newheight;
}; 

 // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
   }

 // The event handler for any changes made to the tool selector. 
  function ev_tool_change (ev) {
    for(var i = 0; i < toollist.length; i++) {  
      if(toollist[i].checked == true)  {
            var selectedT = toollist[i].value
            tool = new tools[selectedT];
         
             //hide all. 
            document.getElementById("nodeType").style.display = "none";
            document.getElementById('radius').style.display = 'none';
            document.getElementById("snapping").style.display = "none";
            document.getElementById('info').style.display = 'none';
            document.getElementById('gender').style.display = 'none';
            document.getElementById('roomNumber').style.display = 'none';
            document.getElementById('entryway').style.display = 'none';
            document.getElementById('stairset').style.display = 'none';
            document.getElementById('floorset').style.display = 'none';
            document.getElementById('stair').style.display = 'none';
            document.getElementById('stair1').style.display = 'none';
            document.getElementById('vertical').style.display = 'none';
            
            if(selectedT == 'node'){
                //display
                document.getElementById("nodeType").style.display = "inline-block";
                document.getElementById('radius').style.display = 'inline-block';

                if (document.getElementById("nodeType").value == "bathroom") {
                    document.getElementById('gender').style.display = 'inline-block';
                }else if(document.getElementById("nodeType").value == "room"){
                    document.getElementById('roomNumber').style.display = 'inline-block';
                }else if (document.getElementById("nodeType").value == "entry"){
                    document.getElementById('entryway').style.display = 'inline-block';
                }else if ((document.getElementById("nodeType").value == "stairs") || (document.getElementById("nodeType").value == "elevator")){
                    document.getElementById('stairset').style.display = 'inline-block';
                    document.getElementById('stair').style.display = 'inline-block';
                    if(document.getElementById("nodeType").value == "elevator"){
                      document.getElementById('floorset').style.display = 'inline-block';
                      document.getElementById('stair1').style.display = 'inline-block';
                    }
                    else{
                      document.getElementById('vertical').style.display = 'inline-block';
                    } 
                }
             }
            else if (selectedT == 'resize'){
              document.getElementById("snapping").style.display = "inline-block";
            }

            else if (selectedT == 'info') {
              document.getElementById('info').style.display = 'inline-block';
            } 
            //clear temporary canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }
 
 //random functions section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//function to find nodeID, returns the node
function nodeID(node_id) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].id == node_id)
      return nodes[i]; 
  }
}

 //find circle closest to x, y. returns coords,id
function closest(x, y){
  var close = [];
  var distance = Infinity;
  var id;
  for (var i = 0; i < nodes.length; i++) {
    var c =  nodes[i].coords; //parsing through the coords of every node
    var d = (x - c[0])*(x - c[0]) + (y - c[1])*(y - c[1]);
    if (d < distance) {
      close = c;
      distance = d;
      id = nodes[i].id;
    }
  }
  //return array of closest node center coordinates
  return [close, id];
};

 
function colorFind(node_id, new_node) {
   var nodeType;
   var gender;
   if (new_node) 
     nodeType = findNT();
   else 
     nodeType = nodeID(node_id).type;
   if (nodeType =='walk')
     return 'black';
   else if (nodeType =='room')
     return 'red';
   else if (nodeType =='bathroom') {
    if (new_id == node_id) { 
      if (document.getElementsByName("gender")[0].checked) gender = 'F';
      else gender = 'M';
    } 
    if (gender == 'M') return '#2ECCFA';
    else return '#F781BE';
   } else if (nodeType =='stairs')
     return '#5858FA';
   else if (nodeType =='elevator')
      return '#FFBF00';
   else if (nodeType =='entry')
     return '#3ADF00';
 };


function findNT() {
   var r = document.getElementById("nodeType").length;
    for(var i = 0; i<r; i++){
     var typetrial = document.getElementById("nodeType")[i];
     if(typetrial.selected)
       return typetrial.value;
   }
 };

//set radius
function setRadius() {
    //set radius size
    if (document.getElementsByName('radius')[0].value == '') {
      alert('radius is undefined!');
    }
    radius = parseFloat(document.getElementsByName('radius')[0].value);
}


// DRAWING TOOLS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//function that removes edges on canvas - - - - - - - - - -- - - - - - - - - - - - - - - -- - - 
function remove_edges(start_coords, end_coords, start_id, end_id) {
 //remove edge drawing
 contexto.globalCompositeOperation = "xor";
 contexto.beginPath();
 contexto.moveTo(start_coords[0], start_coords[1]);
 contexto.lineTo(end_coords[0], end_coords[1]);
 contexto.lineWidth = 4;
 contexto.strokeStyle = 'white';
 contexto.stroke();
 contexto.closePath();
 contexto.globalCompositeOperation = "source-over";

 //draw nodes over where line was erased
 contexto.beginPath();
 contexto.arc(start_coords[0], start_coords[1], radius, 0, 2 * Math.PI);
 contexto.fillStyle = colorFind(start_id, false);
 contexto.fill();
 contexto.lineWidth = 1;
 contexto.strokeStyle = colorFind(start_id, false);
 contexto.stroke();
 contexto.closePath();

 contexto.beginPath();
 contexto.arc(end_coords[0], end_coords[1], radius, 0, 2 * Math.PI);
 contexto.fillStyle = colorFind(end_id, false);
 contexto.fill();
 contexto.strokeStyle = colorFind(end_id, false);
 contexto.stroke();
 contexto.closePath();
};
 
 //function that removes nodes on canvas
 function remove_nodes(coords) {
   contexto.globalCompositeOperation = "xor";
   contexto.beginPath();
   contexto.arc(coords[0], coords[1], radius + 1, 0, 2 * Math.PI);
   contexto.fillStyle = 'white';
   contexto.fill();
   contexto.strokeStyle = 'white';
   contexto.stroke();
   contexto.closePath();
   contexto.globalCompositeOperation = "source-over";
 };
 
 function draw_node(x, y, radius, color, line_width) {
   context.beginPath();
   context.arc(x, y, radius, 0, 2 * Math.PI);
   context.fillStyle = color;
   context.fill();
   context.lineWidth = line_width;
   context.strokeStyle = color;
   context.stroke();
   context.closePath();
 };

 function draw_edge(start_x, start_y, end_x, end_y, color, line_width) {
   context.beginPath();
   context.moveTo(start_x, start_y);
   context.lineTo(end_x, end_y);
   context.lineWidth = line_width;
   context.strokeStyle = color;
   context.stroke();
   context.closePath();
 };


// THE SECTION FOR NODE INFO TOOLS
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 function updateText(node_id){
  document.example.popx.value = nodeID(node_id).coords[0];
  document.example.popy.value = nodeID(node_id).coords[1];
  document.example.poptype.value = nodeID(node_id).type;

  //get nodeID and draw node
  draw_node(nodeID(node_id).coords[0], nodeID(node_id).coords[1], radius, '#FFFF00', 1);
  draw_node(nodeID(node_id).coords[0], nodeID(node_id).coords[1], radius * 0.5, colorFind(node_id,false), 1);
  document.getElementById('findme').value = node_id;
  // document.example.populateme.value = JSON.stringify(nodes[5]);

  if(nodeID(node_id).type== "room"){ 
    showRoom('inline-block', node_id); 
    //hide bathroom, entry, stairs fields and clear fields
    showBathroom('none',"");
    showStairs('none',"");
    showEntry('none',"");
  }

  else if(nodeID(node_id).type== "entry"){  
    showEntry('inline-block', node_id);
    //hide bathroom, room, stairs fields and clear fields
    showBathroom('none',"");
    showStairs('none',"");
    showRoom('none',"");
  }

  else if(nodeID(node_id).type == "bathroom"){
    showBathroom("inline-block", nodeID(node_id).gender);
    // hide
    showRoom('none',"");
    showEntry('none',"");
    showStairs('none',"");
  }

  else if((nodeID(node_id).type == "stairs") || (nodeID(node_id).type == "elevator")){
     //show stair/elevator facets
    showStairs('inline-block', node_id);
    //hide everything else
    showRoom('none',"");
    showBathroom('none',"");
    showEntry('none',"");
  }


  else{
    // hide all optional elements
    showRoom('none',"");
    showBathroom('none',"");
    showEntry('none',"");
    showStairs('none',"");
    
  }
};

// Get edits from Nodeinfo and store with nodes.

function updateCoord(newc, i, c){
  var old = nodeID(i).coords[c];
  nodeID(i).coords[c] = newc;
  if(c==0){
    remove_nodes(old, nodeID(i).coords[1]);
  }
  if(c==1){
    remove_nodes(nodeID(i).coords[0], old);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  //move node
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, colorFind(i, false), 1);
  img_update();
  //redraw selection
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, '#FFFF00', 1);
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius * 0.5, colorFind(i, false), 1);
};

function updateX(newx, i){
  var old_x = nodeID(i).coords[c];
  nodeID(i).coords[0] = newx;
  remove_nodes([old_x, nodeID(i).coords[1]]);
  context.clearRect(0, 0, canvas.width, canvas.height);
  //move node
  draw_node(newx, nodeID(i).coords[1], radius, colorFind(i,false), 1);
  img_update();
  //redraw selection
  draw_node(newx, nodeID(i).coords[1], radius, '#FFFF00', 1);
  draw_node(newx, nodeID(i).coords[1], radius * 0.5, colorFind(i,false), 1);
};

function updateY(newy, i){
  var old_y = nodeID(i).coords[1];
  nodeID(i).coords[1] = newy;
  remove_nodes([nodeID(i).coords[0], old_y]);
  context.clearRect(0, 0, canvas.width, canvas.height);
  //move node
  draw_node(nodeID(i).coords[0], newy, radius, colorFind(i,false), 1);
  img_update();
  //redraw selection
  draw_node(nodeID(i).coords[0], newy, radius, '#FFFF00', 1);
  draw_node(nodeID(i).coords[0], newy, radius * 0.5, colorFind(i,false), 1);
  alert("Have I been redrawn?");
};

function updateType(newt, i){
  // do not needlessly erase important info if user changes to same type
  if((document.getElementById("popentry").style.display != "none") && (newt !="entry")){
    showEntry("none", "");
  }
  if((document.getElementById("poproom").style.display != "none") && (newt != "room")){
    showRoom("none","");
  }
  if((document.getElementById("popfemale").style.display != "none") &&(newt != "bathroom")){
   showBathroom("none", "");
  }
  if((document.getElementById("popset").style.display != "none") &&(newt != "stairs") &&(newt != "elevator")) {
    showStairs("none", "");
  }

  nodeID(i).type = newt;


  if(newt == "bathroom"){
    showBathroom('inline-block', nodeID(i).gender);
  }

  // CONSIDER STANDARDIZING WITH BATHROOM++++++++++++++++++++++++++++++++++++++++++++++
  if(newt == "room"){
    showRoom('inline-block', "");
    alert("Room number has not been set.")
  }

  if(newt == "entry"){
    showEntry('inline-block',"");
    alert("Entry number has not been set.")
  }

  if((newt == "stairs") || (newt == "elevator")){
    showStairs('inline-block',"");
    alert("You might be missing some information. Feel free to fill it in.");

  }

  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, colorFind(i,false), 1);
  img_update();
  //redraw selection
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, '#FFFF00', 1);
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius * 0.5, colorFind(i,false), 1);
};

function updateEntry(newe, i){
  nodeID(i).entryway = newe;
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, colorFind(i,false), 1);
  img_update();
  //redraw selection
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, '#FFFF00', 1);
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius * 0.5, colorFind(i,false), 1);
};

function updateRoom(newr, i){
  nodeID(i).room = newr;
};

function updateGender(i){
  var radiobtn = document.getElementById("popfemale");
  if (radiobtn.checked == true)
    nodeID(i).gender = "F";
  else
    nodeID(i).gender = "M";

  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, colorFind(i,false), 1);
  img_update();
  //redraw selection
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, '#FFFF00', 1);
  draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius * 0.5, colorFind(i,false), 1);
};

function updateSet(news, i){
  nodeID(i).stairset = news;
};

function updateFloor(newf, i){
  nodeID(i).floorset = newf;
};

function updateVert(){
  var radiobtn = document.getElementById("popup");
  var radiobtn1 = document.getElementById("popdown");
  if (radiobtn.checked == true)
    nodeID(i).direction = "U";
  else if(radiobtn.checked ==true)
    nodeID(i).direction = "D";
  else nodeID(i).direction = "B";
};

// HIDING FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//takes display status and nodeid
function showRoom(status, id){
  document.getElementById('no2').style.display = status;
  document.getElementById("poproom").style.display = status;
  if (id == ""){
     document.example.poproom.value = "";
  }
  else{
    document.example.poproom.value = nodeID(id).room;
  }
};

//takes displays status and gender
function showBathroom(status, gen){
  document.getElementById('no3').style.display = status;
  document.getElementById('no4').style.display = status;
  document.getElementById('no5').style.display = status;
  document.getElementById("popmale").style.display = status;
  document.getElementById("popfemale").style.display = status;
  var radiobtn;
  var radiobtn1;
  if(status == "none"){
    radiobtn = document.getElementById("popmale");
    radiobtn.checked = false; 
    radiobtn1 = document.getElementById("popfemale");
    radiobtn1.checked = false; 
  }
  else if(gen == "M"){
    radiobtn = document.getElementById("popmale");
    radiobtn.checked = true; 
  }
  else if(gen == "F"){
    radiobtn = document.getElementById("popfemale");
      radiobtn.checked = true;
  }
  else{
    radiobtn = document.getElementById("popfemale");
    radiobtn.checked = true;
    alert("Gender has been set to female by default");
  }

};

//takes display status and node id
function showEntry(status, id){
  document.getElementById('no1').style.display = status;
  document.getElementById("popentry").style.display = status;
  if (id == ""){
    document.example.popentry.value = "";
  }
  else{
    document.example.popentry.value = nodeID(id).entryway;
  }
};


//takes display status and node_id
function showStairs(status, id){
    document.getElementById('no6').style.display = status;
    document.getElementById('popset').style.display = status;
    

    // Is this right? 
    if (status == "none"){
        document.example.popset.value = ""; 
        stairSpec(status);
        elevatorSpec(status);

    }
    //show elevator, hide stairs (FLOOR SETS)
    else if(nodeID(id).type == "elevator"){ 
      elevatorSpec(status);
      stairSpec('none');
    }
    //show stairs, hide elevator (THIS IS UP DOWN)
    else{
      // general
      document.example.popset.value = nodeID(id).stairset;

      // show elevator. hide stairs
      if(nodeID(id).type == "elevator"){ 
        elevatorSpec(status, id);
        stairSpec('none', "");
      }
      //show stairs, hid elevator
      else{ 
        stairSpec(status, id);
        elevatorSpec('none',"");
      }
    }

    function stairSpec(stat, id){
      alert("hi stairs"+ stat);
      document.getElementById('popup').style.display = stat;
      document.getElementById('popdown').style.display = stat;
      document.getElementById('popboth').style.display = stat;
      document.getElementById('no8').style.display = stat;
      document.getElementById('no9').style.display = stat;
      document.getElementById('no10').style.display = stat;

       //RADIOBUTTONS GO HERE
      if (stat != "none"){ 
        var radiobtn1 = document.getElementById("popup");
        var radiobtn2 = document.getElementById("popdown");
        var radiobtn3  = document.getElementById("popboth");
        var dir = nodeID(id).direction;
        
        if (dir== "U") radiobtn1.checked = true; 
        else if (dir == "D") radiobtn2.checked = true;
        else radiobtn3.checked = true;
      }
      // set radiobuttons off b/c none
      else{
        radiobtn1.checked = false; 
        radiobtn2.checked = false; 
        radiobtn3.checked = false; 
      }
    };

    function elevatorSpec(stat, id){
        alert("hi ele"+ stat);
        document.getElementById('popfloors').style.display = stat;
        document.getElementById('no7').style.display = stat;
        if (stat != "none"){
          document.example.popfloors.value = nodeID(id).floorset;
        }
        else{
          document.example.popfloors.value = "";
        }
    };

};
 
 // UNDO AND REDO TOOLS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function undoIt(ev) {
 if (undo.length == 0) {
   alert("Nothing to undo!");
 }
 else {
  var oops = undo.pop(); //get what to undo
   if (oops == 'e') {
     //remove edge from array
     var bye_edge = edges.pop();
     start_coords = nodeID(bye_edge.coords[0]).coords;
     end_coords = nodeID(bye_edge.coords[1]).coords;
     remove_edges(start_coords, end_coords, bye_edge.coords[0], bye_edge.coords[1]);//remove photo
     redo.push(['e', bye_edge]); //add to redo
   } 

   else if (oops == 'n') {
     //remove node from array
     var bye_node = nodes.pop();
     remove_nodes(bye_node.coords);//remove node from drawing
     redo.push(['n', bye_node]);//add to redo
   } 

   else { //undoing resize
     var node_id = oops[0];
     var coords = oops[1]; //coordinates to reset the node to
     var connected_edges = oops[2];
     var old_coords = nodeID(node_id).coords;
     //remove new drawings
     for (var i = 0; i < connected_edges.length; i++) {
       remove_edges(nodeID(connected_edges[i]).coords, old_coords, connected_edges[i], node_id); 
     }
     remove_nodes(old_coords);
     //add new drawings
     for (var i = 0; i < connected_edges.length; i++) { //draw edges
       draw_edge(nodeID(connected_edges[i]).coords[0], nodeID(connected_edges[i]).coords[1], 
         coords[0], coords[1], 'black', 2); 
     }
     for (var i = 0; i < connected_edges.length; i++) { //draw nodes
       draw_node(nodeID(connected_edges[i]).coords[0], nodeID(connected_edges[i]).coords[1], radius, colorFind(connected_edges[i],false), 1); 
     }

     draw_node(coords[0], coords[1], radius, colorFind(node_id,false), 1);
     
     nodeID(node_id).coords = coords; //update coords of node
     img_update();

     //push to redo
     redo.push([node_id, old_coords, connected_edges]); //node id, old coordinates, connect_id[]
   }
 }
};
 
function redoIt(ev) {
 if (redo.length == 0) {
   alert("Nothing to redo!");
 } 
 else {
  var jk = redo.pop();
  if (jk[0] == 'e') { //REDO EDGES
   var redo_edge = jk[1];
   edges.push(redo_edge); //add edge to array
   //get edge coordinates
   start_coords = nodeID(redo_edge.coords[0]).coords;
   end_coords = nodeID(redo_edge.coords[1]).coords;
   //draw edge
   draw_edge(start_coords[0], start_coords[1], end_coords[0], end_coords[1], 'black', 2);
   //draw two noes around it
   draw_node(start_coords[0], start_coords[1], radius, colorFind(redo_edge.coords[0],false), 1);
   draw_node(end_coords[0], end_coords[1], radius, colorFind(redo_edge.coords[1],false), 1);
   img_update();
   undo.push('e'); //add back to undo
  } 

  else if (jk[0] == 'n') { //REDO NODES
   var redo_node = jk[1];
   nodes.push(redo_node); //add node to array
   //draw node
   draw_node(redo_node.coords[0], redo_node.coords[1], radius, colorFind(redo_node.id,false), 1);
   img_update();
   undo.push('n'); //add back to undo
  } 

  else { //REDO RESIZE
   var node_id = jk[0];
   var coords = jk[1]; //coordinates to reset the node to
   var connected_edges = jk[2];
   var old_coords = nodeID(node_id).coords; //current coords of node
   //remove new drawings
   for (var i = 0; i < connected_edges.length; i++) {
     remove_edges(nodeID(connected_edges[i]).coords, old_coords, connected_edges[i], node_id); 
   }
   remove_nodes(old_coords);
   //add new drawings
   for (var i = 0; i < connected_edges.length; i++) { //redraw edges
     draw_edge(nodeID(connected_edges[i]).coords[0], nodeID(connected_edges[i]).coords[1], 
       coords[0], coords[1], 'black', 2); 
   }
   for (var i = 0; i < connected_edges.length; i++) { //redraw nodes
     draw_node(nodeID(connected_edges[i]).coords[0], nodeID(connected_edges[i]).coords[1], 
       radius, colorFind(connected_edges[i],false), 1); 
   }

   draw_node(coords[0], coords[1], radius, colorFind(node_id,false), 1);
   nodeID(node_id).coords = coords; //update coords of node
   img_update();
   
   //push to redo
   undo.push([node_id, old_coords, connected_edges]); //node id, old coordinates, connect_id[]
  }
 }
};
 

// THE TOOLS SECTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//NEW TOOL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Node function out of the Node tool
function Node(id, coords, type) {
   this.id = id;
   this.coords = coords;
   this.type = type;
 };

 //Edge function to create edge data type
 function Edge(coords) {
  this.coords = coords;
 }

tools.info = function () {
   var tool = this;
   this.started = false;
   var closest_node; //[coords, id]

   this.mousedown = function (ev) {
     tool.started = true;
     closest_node = closest(ev._x, ev._y); //returns[coords, id]
     //erase other highlighting by clearing temp canvas
     context.clearRect(0, 0, canvas.width, canvas.height);
     //highlight node
     draw_node(closest_node[0][0], closest_node[0][1], radius, '#FFFF00', 1);
   };

   this.mouseup = function (ev) {
     if (tool.started) {
      tool.started = false;

      //send node_id to gender box
      updateText(closest_node[1]);
     }
   };
 };

// The edge tool.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 tools.edge = function () {
   var tool = this;
   this.started = false;

   var start_x = 0;
   var start_y = 0;
   var start_id;
   var end_id;

   this.mousedown = function (ev) {
     tool.started = true;
     var node = closest(ev._x, ev._y);
     start_x = node[0][0];
     start_y = node[0][1];
     start_id = node[1];
   };

   this.mousemove = function (ev) {
     if (!tool.started) {
       return;
     }

     context.clearRect(0, 0, canvas.width, canvas.height);
     var node = closest(ev._x, ev._y);
     end_id = node[1];

     draw_edge(start_x, start_y, node[0][0], node[0][1], 'black', 2);
   };

   this.mouseup = function (ev) {
     if (tool.started) {
       if(start_id != end_id) {
         tool.mousemove(ev);
         tool.started = false;
         //draw the endpoints onto the nodes
         draw_node(start_x, start_y, radius, colorFind(start_id,false), 1);
         draw_node(nodeID(end_id).coords[0], nodeID(end_id).coords[1], radius, colorFind(end_id,false), 1);
         img_update();
         //////append new edge to array of edges,false
         edges.push(new Edge([start_id, end_id]));
         //update undo
         undo.push("e"); //add new to end
         if(undo.length == undo_length) { 
           undo.shift(); //only store last 10
         }
       }
     }
   }
 };   //end edge tool

//node tool~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 tools.node = function () {
   var tool = this;
   this.started = false;

   this.mousedown = function (ev) {
     tool.started = true;
     tool.x0 = ev._x;
     tool.y0 = ev._y;
     setRadius();
   };

   this.mousemove = function (ev) {
     if (!tool.started) {
       return;
     }
     context.clearRect(0, 0, canvas.width, canvas.height);
     draw_node(tool.x0, tool.y0, radius, colorFind(nodes.length, true), 1);
   };

   this.mouseup = function (ev) {
     if (tool.started) {
      tool.mousemove(ev);
      tool.started = false;
      img_update();

      nodes.push(new Node(new_id,[tool.x0, tool.y0], findNT()));
      new_id++;

      //add extra attributes
      //add bathroom things
      if (document.getElementById("nodeType").value == "bathroom") {
        if (nodeID(new_id - 1).gender = document.getElementsByName("gender")[0].checked)  {
          nodeID(new_id - 1).gender = 'F'; //if female is checked
        }
        else {
          nodeID(new_id - 1).gender = 'M'; //if male is checked
        }
      } 
      else if (document.getElementById("nodeType").value == "room") {
        nodeID(new_id - 1).room = document.getElementsByName('numtextbox')[0].value;
        var value = document.getElementsByName('numtextbox')[0].value;
        if (value != "") { //if not no room number
          value = parseInt(value) + 1;
          document.getElementsByName('numtextbox')[0].value = value.toString();
        }
      } 
      else if (document.getElementById("nodeType").value == 'entry') {
        nodeID(new_id - 1).entryway = document.getElementsByName('entryway')[0].value;
        var value = document.getElementsByName('entryway')[0].value;
        if (value != "") { //if an entryway number
          value = parseInt(value) + 1;
          document.getElementsByName('entryway')[0].value = value.toString();
        }
      }
      else if ((document.getElementById("nodeType").value == 'stairs') || (document.getElementById("nodeType").value == 'elevator')){
        nodeID(new_id - 1).stairset = document.getElementById("stairset").value;
        var value = document.getElementById("stairset").value;
        if (value != "") { //if an entryway number
          value = parseInt(value) + 1;
          document.getElementById("stairset").value = value.toString();
        }
        if (document.getElementById("nodeType").value == 'elevator'){

          // array of floors in format like 1, 2, 4
          var string = document.getElementById("floorset").value;
          var parts;
          if (string.indexOf(", ") != -1){
            parts = string.split(", ");
          }
          else if (string.indexOf(",")!= -1){
            parts = string.split(",");
          }
          nodeID(new_id - 1).floorset = parts;
          }
          // stairs
          else{
            if (nodeID(new_id - 1).vertical = document.getElementsByName("dirnodes")[0].checked)  {
              nodeID(new_id - 1).vertical = 'U'; 
            }
            else if (nodeID(new_id - 1).vertical = document.getElementsByName("dirnodes")[1].checked){
              nodeID(new_id - 1).vertical = 'D'; 
            }
            else{
              nodeID(new_id - 1).vertical = 'B'; 
            }

          }
        }

       //update undo
       undo.push("n"); //add new to end
       if(undo.length == undo_length) { 
         undo.shift(); //only store last 10
       }
     }
   };
 }; //end tools.node

// The resize tool.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 tools.resize = function(){
   var tool = this;
   this.started = false;

   var old_x, old_y, end_x, end_y, snapping_x, snapping_y, current_x, current_y;
   var node_id; //id of the resizing node
   var first_run = false;
   connect_id = []; // ids of the nodes on the other end of edges
   var snapping;

   this.mousedown = function (ev) {
     tool.started = true;
     var close = closest(ev._x, ev._y);
     old_x = close[0][0]; //remember the xcoor of the node
     old_y = close[0][1]; //remember the ycoor of the node
     node_id = close[1];

    //parse through edge array to find connected edges
     for (var i = 0; i < edges.length; i++) { //for every edge
        if (edges[i].coords[0] == node_id) {
           connect_id.push(edges[i].coords[1]); //push id of the other node
        }
        else if (edges[i].coords[1] == node_id){
           connect_id.push(edges[i].coords[0]); //push id of the other node
        }
     }
     //prepare first_run
     first_run = true;

     snapping = document.getElementsByName('snapping')[0].checked;
     //prepare snapping
     if (snapping) { //if snapping true
       snapping_x = true;
       snapping_y = true;
     }
   };

   this.mousemove = function (ev) {
     if (!tool.started) {
       return;
     }
     if (first_run) {
       //removal of original edges to the moved node
       for (var i = 0; i < connect_id.length; i++) {
         remove_edges(nodes[connect_id[i]].coords, [old_x, old_y], connect_id[i], node_id);
        }
       //remove original node
       remove_nodes([old_x, old_y]);
       first_run = false;
     }

     if (!snapping) {
       current_x = ev._x;
       current_y = ev._y;
     } 
     else {
       if (snapping_x) {current_x = ev._x;}
       if (snapping_y) {current_y = ev._y;}
     }

     var tolerance = 2;
     context.clearRect(0, 0, canvas.width, canvas.height);
     //mouseCoords(ev._x, ev._y);

     if (snapping) { //if snapping is on
       for (var i = 0; i < connect_id.length; i++) { //for all neighbors of the node
         var coords = nodes[connect_id[i]].coords;
         if (snapping_x) {
           if (Math.abs(coords[0] - current_x) <= tolerance) {
             current_x = coords[0];
             snapping_x = false;
           }
         }
         if (snapping_y) {
           if (Math.abs(coords[1] - current_y) <= tolerance) {
             current_y = coords[1];
             snapping_y = false;
           }
         }
       }
     } 

     //draw new edges
     for (var i = 0; i < connect_id.length; i++) {
       draw_edge(nodeID(connect_id[i]).coords[0], nodeID(connect_id[i]).coords[1], current_x, current_y, 'black', 2);
     }

     for (var i = 0; i < connect_id.length; i++) {
      draw_node(nodeID(connect_id[i]).coords[0], nodeID(connect_id[i]).coords[1], radius, colorFind(connect_id[i], false), 1)
     }

    draw_node(current_x, current_y, radius, colorFind(node_id, false), 1);  //draw new node
     
     end_x = current_x;
     end_y = current_y;
   };

   this.mouseup = function (ev) {
     if (tool.started) {
       tool.mousemove(ev);
       tool.started = false;
       img_update();
       mouse_context.clearRect(0, 0, mouse_canvas.width, mouse_canvas.height);

       //update coordinates of changed node
       nodeID(node_id).coords = [end_x, end_y];

       connected_edges = connect_id;
       //add to undo list
       undo.push([node_id, [old_x, old_y], connected_edges]); //node id, old coordinates, connect_id[]

       //clear connect_id
       connect_id = [];
     }
   };
 }; //end tools.resize
 
// SAVE, LOAD Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
function saveGraph() {
  var image = document.getElementById('image').value;
  image = image.substr(12);

  function Graph() {
    this.image = image;
    this.nodes = nodes;
    this.edges = edges;
  }
  document.getElementById('graph_info').value = JSON.stringify(new Graph());
}

function loadGraph() {
  clearGraph();
  var graph = document.getElementById('graph_info').value;
  graph = JSON.parse(graph);
  var node_length = nodes.length;
  var edge_length = edges.length;

  //add new edges and nodes
  var new_nodes = graph.nodes;
  var new_edges = graph.edges;
  for (var i = 0; i < new_nodes.length; i++) {
    nodes.push(new_nodes[i]);
  }
  for (var i = 0; i < new_edges.length; i++) {
    edges.push(new_edges[i]);
  }
  //clear temp canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  //draw on temp canvas
  for (var i = edge_length; i < edges.length; i++) {
    draw_edge(nodeID(edges[i].coords[0]).coords[0], nodeID(edges[i].coords[0]).coords[1], nodeID(edges[i].coords[1]).coords[0], nodeID(edges[i].coords[1]).coords[1], 'black', 2);
  }
  for (var i = node_length; i < nodes.length; i++) {
    draw_node(nodeID(i).coords[0], nodeID(i).coords[1], radius, colorFind(i, false), 1);
  }
  img_update();
  //set background IF no current background
}

function clearGraph() {
  //clear image
  context.clearRect(0, 0, canvas.width, canvas.height);
  contexto.clearRect(0, 0, canvaso.width, canvaso.height);
  backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

  //clear nodes and edges
  nodes = [];
  edges = [];
}

// Mouse Coordinates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 function mouseCoords(x, y) {
   var message = 'Mouse position: ' + x + ', ' + y;
   mouse_context.clearRect(0, 0, mouse_canvas.width, mouse_canvas.height);
   mouse_context.font = '12pt Calibri';
   mouse_context.fillStyle = 'black';
   mouse_context.fillText(message, 10, 20);
 } 

// my new fun tools ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//given the mouse coordinates determines if in range of node or edge - if so returns
//whichever object it is closest to
function regionDetection(x, y) { 
  var closest; //closest object
  var distance = Infinity; //distance of closest object
  var location; //location of object in array
  var range = 2;

  //check nodes
  for (var i = 0; i < nodes.length; i++) {
    var c =  nodes[i].coords; //parsing through the coords of every node
    var dist = (x - c[0])*(x - c[0]) + (y - c[1])*(y - c[1]);
    if (Math.sqrt(dist) <= (range + radius)) {
      if (dist < distance) {
        closest = 'n';
        distance = dist;
        location = i;
      }
    }
  }

  //check edges
  for (var i = 0; i < edges.length; i++) {
    var end_nodes = edges[i].coords;
    var coordsA = nodeID(end_nodes[0]).coords;
    var coordsB = nodeID(end_nodes[1]).coords;
    var range = 3;

    //check range
    if ((Math.min(coordsA[0], coordsB[0]) - range) <= x <= (Math.max(coordsA[0], coordsB[0]) + range) && //x coords
        (Math.min(coordsA[1], coordsB[1]) - range) <= y <= (Math.max(coordsA[1], coordsB[1]) + range)) { //y coords
      //find distance to line
      var m = (coordsA[1] - coordsB[1]) / (coordsA[0] - coordsB[0]);
      var dist = Math.abs(y - coordsA[1] - m * x + m * coordsA[0]) / Math.sqrt(1 + m * m);
      if (dist < range && dist < distance) {
        closest = 'e';
        distance = dist;
        location = i;
      }
    }
  }

  if (distance == Infinity) return 'none';
  return [closest, location];
}

var remove;
tools.delete = function(){
   var tool = this;
   this.started = false;
   var closest;
   //var remove;
   var remove_id;

   this.mousedown = function (ev) {
     tool.started = true;
   }

   this.mousemove = function (ev) {
     if (!tool.started) {
       return;
     }
     context.clearRect(0, 0, canvas.width, canvas.height);
     //region detection
     closest = regionDetection(ev._x, ev._y);
     if (closest != 'none') { //if returned something
      remove_id = closest[1];

       //highlight node or edge
       if (closest[0] == 'e') {
        remove = edges[remove_id];
         draw_edge(nodeID(remove.coords[0]).coords[0], nodeID(remove.coords[0]).coords[1], nodeID(remove.coords[1]).coords[0], nodeID(remove.coords[1]).coords[1], 'yellow', 2);
       }
       if (closest[0] == 'n') {
         remove = nodes[remove_id];
         draw_node(remove.coords[0], remove.coords[1], radius, 'yellow', 1);
       }
     }
   };

   this.mouseup = function (ev) {
     if (tool.started) {
      tool.mousemove(ev);
      tool.started = false;
      if (closest != 'none') {
        //remove closest
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (closest[0] == 'e') {
         remove = edges.splice(remove_id, 1)[0];
         remove_edges(nodeID(remove.coords[0]).coords, nodeID(remove.coords[1]).coords, remove.coords[0], remove.coords[1]); //remove from screen
         }
         if (closest[0] == 'n') {
           remove = nodes.splice(remove_id, 1)[0];
           remove_nodes(remove.coords); //remove from screen
         }

        img_update();

        //ADD TO UNDO
      }
   }
 }
};

 // EVENT LISTENERS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 if (window.addEventListener) {
     window.addEventListener('load', init(), false);

 }
