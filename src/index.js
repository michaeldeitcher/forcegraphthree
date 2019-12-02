import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GraphNode, treeGraph, forceDirected, everyEdge, everyNode, everyChild } from './graph.js'

var graph = treeGraph(4,4);

var randomMaterial = () => {
  return new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(), Math.random(), Math.random()) } );
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new OrbitControls( camera, renderer.domElement );

var geometry = new THREE.SphereGeometry( .3 );
var circles = [];

var addToScene = node => {
  if(node.mesh) return;
  var mesh = new THREE.Mesh( geometry, randomMaterial() );
  mesh.position.x =  node.pos.x;
  mesh.position.y =  node.pos.y;
  mesh.position.z =  node.pos.z;
  node.mesh = mesh;
  mesh.node = node;
  scene.add(mesh);
  if(node.collapsed) addCircle(node);
}

var removeFromScene = node => {
  removeCircle(node);
  scene.remove(node.mesh);
  node.mesh = null;  
}

var updatePosition = node => {
  if(!node.enabled) return;
  node.mesh.position.x = node.pos.x;
  node.mesh.position.y = node.pos.y;
  node.mesh.position.z = node.pos.z;
  if(node.circle) {
    node.circle.position.copy(node.mesh.position);
  }
}

function addCircle( graph ) {
  var geometry = new THREE.CircleGeometry( .6, 32 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var circle = new THREE.Mesh( geometry, material );
  circle.position.x = graph.pos.x;
  circle.position.y = graph.pos.y;
  circle.position.z = graph.pos.z;  
  graph.circle = circle;
  scene.add( circle );
  circles.push(circle);
} 

function removeCircle( graph ) {
  if(!graph.circle) return;
  scene.remove(graph.circle);
  circles = circles.filter( (item) => item != graph.circle );
  graph.circle = null;  
}

function toggleChildren( graph ) {
  graph.collapsed = !graph.collapsed;
  if(graph.collapsed) 
    addCircle(graph);
  else
    removeCircle(graph);
  let checkForCollapsed = (parent) => {
    if(parent.collapsed) return true;
    if(parent.parent) return checkForCollapsed(parent.parent);
    return false;
  }

  everyChild(graph, (node) => {
    node.enabled = !checkForCollapsed(node.parent);
    if(node.enabled)
      addToScene(node);
    else
      removeFromScene(node);
  });
}

var consolePosition = node => {
    console.log(`id: ${node.id} ${node.pos.x}, ${node.pos.y}, ${node.pos.z}`);
}

var lines = [];
var lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

var addLineToScene = (node, other) => {
  if(!node.enabled || !other.enabled)
    return;
  var geometry = new THREE.Geometry();
  geometry.vertices.push(node.pos);
  geometry.vertices.push(other.pos);
  var line = new THREE.Line( geometry, lineMaterial );
  scene.add(line);  
  lines.push(line);
}
var removeLinesFromScene = () => {    
  while( lines.length ) {
      let line = lines.pop();        
      scene.remove(line);
      line.geometry.dispose();
  } 
}

function mouseFromEvent( event ) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    return mouse;
}

var raycaster = new THREE.Raycaster();
function everyRaycastIntersect( mouse, callback ) {
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );
  var nodes = intersects.filter(item => item.object.node != null ).map(item => item.object.node);
  if(nodes.length > 0 ) callback(nodes[0]);
}

function onMouseClick( event ) {

    let mouse = mouseFromEvent( event );
    everyRaycastIntersect( mouse, toggleChildren );
}

// window.addEventListener( 'mousemove', onMouseMove, false );

window.addEventListener( 'click', onMouseClick, false );

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener( 'resize', onResize, false );  

function animate() {
    requestAnimationFrame( animate );

  renderer.render( scene, camera );

  for(let i=0; i < 10; i++)
    forceDirected(graph);
  removeLinesFromScene();
  everyNode(graph, updatePosition);                
  everyEdge(graph, addLineToScene);
  for(let circle of circles) {
    circle.lookAt(camera.position);
  }
  controls.update();
}

everyNode(graph, addToScene);
camera.position.z = 5;
animate();