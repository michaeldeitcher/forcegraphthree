import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GraphNode, treeGraph, forceDirected, everyEdge, everyNode } from './graph.js'

var graph = treeGraph(5,4);

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
var addToScene = node => {
  var mesh = new THREE.Mesh( geometry, randomMaterial() );
  mesh.position.x =  node.pos.x;
  mesh.position.y =  node.pos.y;
  mesh.position.z =  node.pos.z;
  node.mesh = mesh;
  mesh.node = node;
  scene.add(mesh);
}

var updatePosition = node => {
  node.mesh.position.x = node.pos.x;
  node.mesh.position.y = node.pos.y;
  node.mesh.position.z = node.pos.z;
}
var consolePosition = node => {
    console.log(`id: ${node.id} ${node.pos.x}, ${node.pos.y}, ${node.pos.z}`);
}

var lines = [];
var lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
var addLineToScene = (node, other) => {
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

everyNode(graph, addToScene);

camera.position.z = 5;


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function render() {
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children );

    for ( var i = 0; i < intersects.length; i++ ) {
      if( intersects[ i ].object.node )
          console.log( intersects[ i ].object.node.id);  
    }
    renderer.render( scene, camera );

}

window.addEventListener( 'mousemove', onMouseMove, false );

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener( 'resize', onResize, false );  

function animate() {
    requestAnimationFrame( animate );

  render();
  for(let i=0; i < 10; i++)
    forceDirected(graph);
  removeLinesFromScene();
  everyNode(graph, updatePosition);                
  everyEdge(graph, addLineToScene);
  controls.update();
}
animate();