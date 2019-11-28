import * as THREE from 'three';

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

  export { GraphNode, treeGraph, forceDirected, everyEdge, everyNode }