import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

var randomMaterial = () => {
    return new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(), Math.random(), Math.random()) } );
  }
  
var idIndex = 0;

  class GraphNode {
    constructor(depth) {
      const x = 10 - Math.random() * 20;
      const y = Math.random() * 4 -depth;
      const z = Math.random() * -4;
      this.pos = new THREE.Vector3( x, y, z ); 
      this.id = idIndex;
      idIndex += 1;
      
      if(idIndex == 0)
        this.pos = new THREE.Vector3( 0,0,0 ); 

      this.edges = [];
    }
    connect(other) {
      this.edges.push(other);
      other.edges.push(this);
    }
    hasEdge(other) {
      return this.edges.includes(other);
    }
  }
  
  function treeGraph(depth, branches) {
    let graph = [ new GraphNode(depth)];
    if (depth > 1) {
      for( let i = 0; i < branches; i++ ){
        let subGraph = treeGraph(depth - 1, branches);
        graph[0].connect(subGraph[0]);
        graph = graph.concat(subGraph);
      }
    }
    return graph;
  }
  
  var graph = treeGraph(4,4);
  function everyNode(graph, callback ) {
    for (let node of graph ) {
      callback(node);
    }
  }
  
  const springLength =  1;
  const springStrength = 2;
  const repulsionStrength = .2;
  
  
  function forceDirected(graph) {
    for (let i = 0; i < graph.length; i++ ) {
      let node = graph[i];
      for( let j = i + 1; j < graph.length; j++ ) {
        let other = graph[j];
        let apart = new THREE.Vector3().copy(other.pos);
        apart.sub(node.pos);
        var distance = other.pos.distanceTo(node.pos);
        distance = Math.max(1, distance);
        let forceSize = -repulsionStrength / (distance * distance);
        if( node.hasEdge(other) ) {
          forceSize += (distance - springLength * springStrength);
        }
        apart.normalize();
        apart.multiplyScalar(forceSize/100);        
        node.pos.add(apart);
        other.pos.sub(apart);      
      }
    }
  }
  
  function everyEdge(graph, callback) {
    for (let i = 0; i < graph.length; i++ ) {
      let node = graph[i];
      for( let j = i + 1; j < graph.length; j++ ) {
        let other = graph[j];
        if( node.hasEdge(other) ) {
          callback(node, other);
        }
      }
    }
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