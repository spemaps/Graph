/* Inspired by ROBO Design
 * https://dev.opera.com/articles/html5-canvas-painting/
 */


  var canvas, context, canvaso, contexto, backgroundCanvas, backgroundContext, mouse_canvas, mouse_context;
  var toollist; 
  var radius = 3;
  var undo_length = 10;
  var newheight;

  // The active tool instance.
  var tool;
  var tool_default = 'node';

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

    //hide all tools
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

}


  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
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
    if (func) {
      func(ev);
    }
  }

 // The event handler for any changes made to the tool selector. 
  function ev_tool_change (ev) {
    for(var i = 0; i < toollist.length; i++) {  
      if(toollist[i].checked == true)  {
            var selectedT = toollist[i].value
            tool = new tools[selectedT];
         
            if (selectedT == 'node') {
              document.getElementById("nodeType").style.display = "inline-block";
              document.getElementById("snapping").style.display = "none";
              document.getElementById('radius').style.display = 'inline-block';
              document.getElementById('info').style.display = 'none';

              if (document.getElementById("nodeType").value == "bathroom") {
                document.getElementById('gender').style.display = 'inline-block';

                document.getElementById('roomNumber').style.display = 'none';
                document.getElementById('entryway').style.display = 'none';
                document.getElementById('stairset').style.display = 'none';
                document.getElementById('floorset').style.display = 'none';
                document.getElementById('stair').style.display = 'none';
                document.getElementById('stair1').style.display = 'none';
              }
              else if (document.getElementById("nodeType").value == "room") { // text box appears if node type is room 
                document.getElementById('roomNumber').style.display = 'inline-block';

                document.getElementById('gender').style.display = 'none';
                document.getElementById('entryway').style.display = 'none';
                document.getElementById('stairset').style.display = 'none';
                document.getElementById('floorset').style.display = 'none';
                document.getElementById('stair').style.display = 'none';
                document.getElementById('stair1').style.display = 'none';
              }
              else if (document.getElementById("nodeType").value == "entry") { // text box appears if node type is room 
                document.getElementById('entryway').style.display = 'inline-block';

                document.getElementById('roomNumber').style.display = 'none';
                document.getElementById('gender').style.display = 'none';
                document.getElementById('stairset').style.display = 'none';
                document.getElementById('floorset').style.display = 'none';
                document.getElementById('stair').style.display = 'none';
                document.getElementById('stair1').style.display = 'none';

              }
              else if ((document.getElementById("nodeType").value == "stairs") || (document.getElementById("nodeType").value == "elevator")){
                document.getElementById('roomNumber').style.display = 'none';
                document.getElementById('gender').style.display = 'none';
                document.getElementById('entryway').style.display = 'none';
                
                document.getElementById('stairset').style.display = 'inline-block';
                document.getElementById('floorset').style.display = 'inline-block';
                document.getElementById('stair').style.display = 'inline-block';
                document.getElementById('stair1').style.display = 'inline-block';
              }
              else {
                document.getElementById('gender').style.display = 'none';
                document.getElementById('roomNumber').style.display = 'none';
                document.getElementById('entryway').style.display = 'none';
                document.getElementById('stairset').style.display = 'none';
                document.getElementById('floorset').style.display = 'none';
                document.getElementById('stair').style.display = 'none';
                document.getElementById('stair1').style.display = 'none';
              }
            }
            else if (selectedT == 'resize'){
              document.getElementById("snapping").style.display = "inline-block";
              document.getElementById("nodeType").style.display = "none";
              document.getElementById('gender').style.display = 'none';
              document.getElementById('roomNumber').style.display = 'none';
              document.getElementById('entryway').style.display = 'none';
              document.getElementById('radius').style.display = 'none';
              document.getElementById('info').style.display = 'none';
            }
            else if (selectedT == 'info') {
              document.getElementById("snapping").style.display = "none";
              document.getElementById("nodeType").style.display = "none";
              document.getElementById('gender').style.display = 'none';
              document.getElementById('roomNumber').style.display = 'none';
              document.getElementById('entryway').style.display = 'none';
              document.getElementById('radius').style.display = 'none';
              document.getElementById('info').style.display = 'inline-block';
            } else {
              document.getElementById("nodeType").style.display = "none";
              document.getElementById("snapping").style.display = "none";
              document.getElementById('gender').style.display = 'none';
              document.getElementById('roomNumber').style.display = 'none';
              document.getElementById('entryway').style.display = 'none';
              document.getElementById('radius').style.display = 'none';
              document.getElementById('info').style.display = 'none';
            }
            //clear temporary canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

      }
    }
  }
   // This object holds the implementation of each drawing tool.
   var tools = {};
 
   var nodes = []; //array of nodes
   var edges = []; //array of the id's of the nodes
   var undo = [];
   var redo = [];

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
   }
 
 //random functions section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     //closest function
     //find circle closest to x, y
     //!!! returns coords,id
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

   //Node function out of the Node tool
   function Node(id, coords, type) {
       this.id = id;
       this.coords = coords;
       this.type = type;
     };
 
   function colorFind(node_id) {
       var nodeType;
       var gender;
       if (nodes.length == node_id) 
         nodeType = findNT();
       else 
         nodeType = nodes[node_id].type;
       if (nodeType =='walk')
         return 'black';
       else if (nodeType =='room')
         return 'red';
       else if (nodeType =='bathroom') {
        if (nodes.length == node_id) {
          if (document.getElementsByName("gender")[0].checked) gender = 'F';
          else gender = 'M';
        } else gender = nodes[node_id].gender;
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
     }

//set radius
function setRadius() {
    //set radius size
    if (document.getElementsByName('radius')[0].value == '') {
      alert('radius is undefined!');
    }
    radius = parseFloat(document.getElementsByName('radius')[0].value);
}

 
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
    draw_edge(nodes[edges[i][0]].coords[0], nodes[edges[i][0]].coords[1], nodes[edges[i][1]].coords[0], nodes[edges[i][1]].coords[1], 'black', 2);
  }
  for (var i = node_length; i < nodes.length; i++) {
    draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, colorFind(i), 1);
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
           draw_node(start_x, start_y, radius, colorFind(start_id), 1);
           draw_node(nodes[end_id].coords[0], nodes[end_id].coords[1], radius, colorFind(end_id), 1);
           img_update();
           //////append new edge to array of edges
           edges.push([start_id, end_id]);
           //update undo
           undo.push("e"); //add new to end
           if(undo.length == undo_length) { 
             undo.shift(); //only store last 10
           }
         }
       }
     }
   };

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
       draw_node(tool.x0, tool.y0, radius, colorFind(nodes.length), 1);
     };
 
 
     this.mouseup = function (ev) {
       if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();

        nodes.push(new Node(nodes.length,[tool.x0, tool.y0], findNT()));

        //add extra attributes
        //add bathroom things
        if (document.getElementById("nodeType").value == "bathroom") {
          if (nodes[nodes.length - 1].gender = document.getElementsByName("gender")[0].checked)  {
            nodes[nodes.length - 1].gender = 'F'; //if female is checked
          }
          else {
            nodes[nodes.length - 1].gender = 'M'; //if male is checked
          }
        } else if (document.getElementById("nodeType").value == "room") {
          nodes[nodes.length - 1].room = document.getElementsByName('numtextbox')[0].value;
          var value = document.getElementsByName('numtextbox')[0].value;
          if (value != "") { //if not no room number
            value = parseInt(value) + 1;
            document.getElementsByName('numtextbox')[0].value = value.toString();
          }
        } else if (document.getElementById("nodeType").value == 'entry') {
          nodes[nodes.length - 1].entryway = document.getElementsByName('entryway')[0].value;
          var value = document.getElementsByName('entryway')[0].value;
          if (value != "") { //if an entryway number
            value = parseInt(value) + 1;
            document.getElementsByName('entryway')[0].value = value.toString();
          }
        }
        else if ((document.getElementById("nodeType").value == 'stairs') || (document.getElementById("nodeType").value == 'elevator')){
          nodes[nodes.length - 1].stairset = document.getElementById("stairset").value;
          var value = document.getElementById("stairset").value;
          if (value != "") { //if an entryway number
            value = parseInt(value) + 1;
            document.getElementById("stairset").value = value.toString();
          }

          // array of floors in format like 1, 2, 4
          var string = document.getElementById("floorset").value;
          var parts;
          if (string.indexOf(", ") != -1){
            parts = string.split(", ");
          }
          else if (string.indexOf(",")!= -1){
            parts = string.split(",");
          }
          nodes[nodes.length - 1].floorset = parts;

          
          
        }
 
 
         //update undo
         undo.push("n"); //add new to end
         if(undo.length == undo_length) { 
           undo.shift(); //only store last 10
           }
       }
     };
   };


 
 //function that removes edges on canvas~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
   contexto.fillStyle = colorFind(start_id);
   contexto.fill();
   contexto.lineWidth = 1;
   contexto.strokeStyle = colorFind(start_id);
   contexto.stroke();
   contexto.closePath();
 
   contexto.beginPath();
   contexto.arc(end_coords[0], end_coords[1], radius, 0, 2 * Math.PI);
   contexto.fillStyle = colorFind(end_id);
   contexto.fill();
   contexto.strokeStyle = colorFind(end_id);
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

 //CHANGES CHANGES CHANGES CHANGES CHANGES CHANGES CHANGES CHANGES CHANGES 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 function updateText(node_id){
  document.example.popx.value = nodes[node_id].coords[0];
  document.example.popy.value = nodes[node_id].coords[1];
  document.example.poptype.value = nodes[node_id].type;

  //get nodeID and draw node
  draw_node(nodes[node_id].coords[0], nodes[node_id].coords[1], radius, '#FFFF00', 1);
  draw_node(nodes[node_id].coords[0], nodes[node_id].coords[1], radius * 0.5, colorFind(node_id), 1);
  document.getElementById('findme').value = node_id;
  // document.example.populateme.value = JSON.stringify(nodes[5]);

  if(nodes[node_id].type== "room"){  
    document.getElementById("poproom").style.display = "inline-block";
    document.example.poproom.value = nodes[node_id].room;
    //hide bathroom and entry specific facets and clear fields
    document.getElementById("popentry").style.display = "none";
    document.example.popentry.value = "";
    document.getElementById('no1').style.display = 'none';
    document.getElementById('no2').style.display = 'inline-block';
    document.getElementById('no3').style.display = 'none';
    document.getElementById("popmale").style.display = "none";
    document.getElementById("popfemale").style.display = "none";
    document.getElementById('no4').style.display = 'none';
    document.getElementById('no5').style.display = 'none';
    var radiobtn = document.getElementById("popmale");
    radiobtn.checked = false; 
    var radiobtn1 = document.getElementById("popfemale");
    radiobtn1.checked = false; 


  }


  else if(nodes[node_id].type== "entry"){  
    document.getElementById("popentry").style.display = "inline-block";
    document.example.popentry.value = nodes[node_id].entryway;

    //hide bathroom and room specific fields and clear fields
    document.getElementById("poproom").style.display = "none";
    document.example.poproom.value = "";
    
    document.getElementById("popmale").style.display = "none";
    document.getElementById("popfemale").style.display = "none";
    var radiobtn = document.getElementById("popmale");
    radiobtn.checked = false; 
    var radiobtn1 = document.getElementById("popfemale");
    radiobtn1.checked = false; 
    document.getElementById('no1').style.display = 'inline-block';
    document.getElementById('no2').style.display = 'none';
    document.getElementById('no3').style.display = 'none';
    document.getElementById('no4').style.display = 'none';
    document.getElementById('no5').style.display = 'none';
  }

  else if(nodes[node_id].type == "bathroom"){
    document.getElementById("popmale").style.display = "inline-block";
    document.getElementById("popfemale").style.display = "inline-block";
    document.getElementById('no1').style.display = 'none';
    document.getElementById('no2').style.display = 'none';
    document.getElementById('no3').style.display = 'inline-block';

    var radiobtn;


    if(nodes[node_id].gender == "F"){
      radiobtn = document.getElementById("popfemale");
      radiobtn.checked = true;
      document.getElementById('no4').style.display = 'inline-block';
      document.getElementById('no5').style.display = 'inline-block';
    }
    else{
      radiobtn = document.getElementById("popmale");
      radiobtn.checked = true; 
      document.getElementById('no4').style.display = 'inline-block';
      document.getElementById('no5').style.display = 'inline-block';
    }

    //hide room and entry; clear
    document.getElementById("popentry").style.display = "none";
    document.example.popentry.value = "";
    document.getElementById("poproom").style.display = "none";
    document.example.poproom.value = "";

  }
  else{
    // hide all optional elements
    document.getElementById("popentry").style.display = "none";
    document.example.popentry.value = "";
    document.getElementById("poproom").style.display = "none";
    document.example.poproom.value = "";

    document.getElementById("popmale").style.display = "none";
    document.getElementById("popfemale").style.display = "none";
    var radiobtn = document.getElementById("popmale");
    radiobtn.checked = false; 
    var radiobtn1 = document.getElementById("popfemale");
    radiobtn1.checked = false; 
    document.getElementById('no1').style.display = 'none';
    document.getElementById('no2').style.display = 'none';
    document.getElementById('no3').style.display = 'none';
    document.getElementById('no4').style.display = 'none';
    document.getElementById('no5').style.display = 'none';

  }

};

// Get edits from Nodeinfo and store with nodes.



function updateX(newx, i){
  var old_x = nodes[i].coords[0];
  nodes[i].coords[0] = newx;
  remove_nodes([old_x, nodes[i].coords[1]]);
  context.clearRect(0, 0, canvas.width, canvas.height);
  //move node
  draw_node(newx, nodes[i].coords[1], radius, colorFind(i), 1);
  img_update();
  //redraw selection
  draw_node(newx, nodes[i].coords[1], radius, '#FFFF00', 1);
  draw_node(newx, nodes[i].coords[1], radius * 0.5, colorFind(i), 1);
};


function updateY(newy, i){
  var old_y = nodes[i].coords[1];
  nodes[i].coords[1] = newy;
  remove_nodes([nodes[i].coords[0], old_y]);
  context.clearRect(0, 0, canvas.width, canvas.height);
  //move node
  draw_node(nodes[i].coords[0], newy, radius, colorFind(i), 1);
  img_update();
  //redraw selection
  draw_node(nodes[i].coords[0], newy, radius, '#FFFF00', 1);
  draw_node(nodes[i].coords[0], newy, radius * 0.5, colorFind(i), 1);
  alert("Have I been redrawn?");
};


function updateType(newt, i){
  // do not needlessly erase important info if user changes to same type
  if((document.getElementById("popentry").style.display != "none") && (newt !="entry")){
    document.example.popentry.value = "";
    document.getElementById('no1').style.display = 'none';
  }
  if((document.getElementById("poproom").style.display != "none") && (newt != "room")){
    document.example.poproom.value = "";
    document.getElementById('no2').style.display = 'none';
  }
  if((document.getElementById("popfemale").style.display != "none") &&(newt != "bathroom")){
    radiobtn = document.getElementById("popmale");
    radiobtn.checked = false; 
    radiobtn1 = document.getElementById("popfemale");
    radiobtn1.checked = false; 
     document.getElementById('no3').style.display = 'none';
    document.getElementById('no4').style.display = 'none';
    document.getElementById('no5').style.display = 'none';

  }

  nodes[i].type = newt;

  if(newt == "bathroom"){
  

    document.getElementById('no3').style.display = 'inline-block';
    document.getElementById('no4').style.display = 'inline-block';
    document.getElementById('no5').style.display = 'inline-block';
     document.getElementById("popmale").style.display = "inline-block";
    document.getElementById("popfemale").style.display = "inline-block";
    radiobtn = document.getElementById("popfemale");
    radiobtn.checked = true;

    alert("Gender has been set to female by default");

   
  }

  if(newt == "room"){
   

    document.getElementById('no2').style.display = 'inline-block';
    document.getElementById("poproom").style.display = "inline-block";
    alert("Room number has not been set.")

  }

  if(newt == "entry"){
    

    document.getElementById('no1').style.display = 'inline-block';
    document.getElementById("popentry").style.display = "inline-block";
    alert("Entry number has not been set.")
  }

  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, colorFind(i), 1);
  img_update();
  //redraw selection
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, '#FFFF00', 1);
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius * 0.5, colorFind(i), 1);
};

function updateEntry(newe, i){
  nodes[i].entryway = newe;

  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, colorFind(i), 1);
  img_update();
  //redraw selection
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, '#FFFF00', 1);
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius * 0.5, colorFind(i), 1);
   alert("Have I been redrawn?");
};

function updateRoom(newr, i){
  nodes[i].room = newr;

  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, colorFind(i), 1);
  img_update();
  //redraw selection
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, '#FFFF00', 1);
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius * 0.5, colorFind(i), 1);
    alert("Have I been redrawn?");
};



function updateGender(i){
  var radiobtn = document.getElementById("popfemale");
  if (radiobtn.checked == true)
    nodes[i].gender = "F";
  else
    nodes[i].gender = "M";

  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, colorFind(i), 1);
  img_update();
  //redraw selection
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius, '#FFFF00', 1);
  draw_node(nodes[i].coords[0], nodes[i].coords[1], radius * 0.5, colorFind(i), 1);
  
};
 
 //UNDO AND REDO TOOLS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  function undoIt(ev) {
   if (undo.length == 0) {
     alert("Nothing to undo!");
   }
   else {
    var oops = undo.pop(); //get what to undo
     if (oops == 'e') {
       //remove edge from array
       var bye_edge = edges.pop();
       start_coords = nodes[bye_edge[0]].coords;
       end_coords = nodes[bye_edge[1]].coords;
       
       remove_edges(start_coords, end_coords, bye_edge[0], bye_edge[1]);//remove photo
 
       redo.push(['e', bye_edge]); //add to redo
     } else if (oops == 'n') {
       //remove node from array
       var bye_node = nodes.pop();
 
       remove_nodes(bye_node.coords);//remove node from drawing
 
       redo.push(['n', bye_node]);//add to redo
     } else { //undoing resize
       var node_id = oops[0];
       var coords = oops[1]; //coordinates to reset the node to
       var connected_edges = oops[2];
       var old_coords = nodes[node_id].coords;
 
       //remove new drawings
       for (var i = 0; i < connected_edges.length; i++) {
         remove_edges(nodes[connected_edges[i]].coords, old_coords, connected_edges[i], node_id); 
       }
       remove_nodes(old_coords);
 
       //add new drawings
       for (var i = 0; i < connected_edges.length; i++) { //draw edges
         draw_edge(nodes[connected_edges[i]].coords[0], nodes[connected_edges[i]].coords[1], 
           coords[0], coords[1], 'black', 2); 
       }
       for (var i = 0; i < connected_edges.length; i++) { //draw nodes
         draw_node(nodes[connected_edges[i]].coords[0], nodes[connected_edges[i]].coords[1], radius, colorFind(connected_edges[i]), 1); 
       }
       draw_node(coords[0], coords[1], radius, colorFind(node_id), 1);
       
       nodes[node_id].coords = coords; //update coords of node
       img_update();
 
       //push to redo
       redo.push([node_id, old_coords, connected_edges]); //node id, old coordinates, connect_id[]
     }
   }
  };
 
 
  function redoIt(ev) {
   if (redo.length == 0) {
     alert("Nothing to redo!");
   } else {
    var jk = redo.pop();
    if (jk[0] == 'e') { //REDO EDGES
     var redo_edge = jk[1];
     edges.push(redo_edge); //add edge to array
     //get edge coordinates
     start_coords = nodes[redo_edge[0]].coords;
     end_coords = nodes[redo_edge[1]].coords;
     //draw edge
     draw_edge(start_coords[0], start_coords[1], end_coords[0], end_coords[1], 'black', 2);
     //draw two noes around it
     draw_node(start_coords[0], start_coords[1], radius, colorFind(redo_edge[0]), 1);
     draw_node(end_coords[0], end_coords[1], radius, colorFind(redo_edge[1]), 1);
     img_update();
 
     undo.push('e'); //add back to undo
    } else if (jk[0] == 'n') { //REDO NODES
     var redo_node = jk[1];
     nodes.push(redo_node); //add node to array
     //draw node
     draw_node(redo_node.coords[0], redo_node.coords[1], radius, colorFind(redo_node.id), 1);
     img_update();
 
     undo.push('n'); //add back to undo
    } else { //REDO RESIZE
     var node_id = jk[0];
     var coords = jk[1]; //coordinates to reset the node to
     var connected_edges = jk[2];
     var old_coords = nodes[node_id].coords; //current coords of node
 
     //remove new drawings
     for (var i = 0; i < connected_edges.length; i++) {
       remove_edges(nodes[connected_edges[i]].coords, old_coords, connected_edges[i], node_id); 
     }
     remove_nodes(old_coords);
 
     //add new drawings
     for (var i = 0; i < connected_edges.length; i++) { //redraw edges
       draw_edge(nodes[connected_edges[i]].coords[0], nodes[connected_edges[i]].coords[1], 
         coords[0], coords[1], 'black', 2); 
     }
     for (var i = 0; i < connected_edges.length; i++) { //redraw nodes
       draw_node(nodes[connected_edges[i]].coords[0], nodes[connected_edges[i]].coords[1], 
         radius, colorFind(connected_edges[i]), 1); 
     }
     draw_node(coords[0], coords[1], radius, colorFind(node_id), 1);
     nodes[node_id].coords = coords; //update coords of node
     img_update();
     
     //push to redo
     undo.push([node_id, old_coords, connected_edges]); //node id, old coordinates, connect_id[]
    }
   }
  };
 
    // The resize tool.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   tools.resize = function () {
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
          if (edges[i][0] == node_id) {
             connect_id.push(edges[i][1]); //push id of the other node
          }
          else if (edges[i][1] == node_id){
             connect_id.push(edges[i][0]); //push id of the other node
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
 
     //closest function~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     //find node closest to x, y
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
           //return array of closest node center coordinates and id
           return [close, id];
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
       } else {
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
         draw_edge(nodes[connect_id[i]].coords[0], nodes[connect_id[i]].coords[1], current_x, current_y, 'black', 2);
       }

       for (var i = 0; i < connect_id.length; i++) {
        draw_node(nodes[connect_id[i]].coords[0], nodes[connect_id[i]].coords[1], radius, colorFind(connect_id[i]), 1)
       }

        draw_node(current_x, current_y, radius, colorFind(node_id), 1);  //draw new node
       
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
         nodes[node_id].coords = [end_x, end_y];
 
         connected_edges = connect_id;
         //add to undo list
         undo.push([node_id, [old_x, old_y], connected_edges]); //node id, old coordinates, connect_id[]
 
         //clear connect_id
         connect_id = [];
       }
     };
   };
 
 function mouseCoords(x, y) {
   var message = 'Mouse position: ' + x + ', ' + y;
   mouse_context.clearRect(0, 0, mouse_canvas.width, mouse_canvas.height);
   mouse_context.font = '12pt Calibri';
   mouse_context.fillStyle = 'black';
   mouse_context.fillText(message, 10, 20);
 }

//NEW TOOL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

 
 if(window.addEventListener) {
     window.addEventListener('load', init(), false)
 }