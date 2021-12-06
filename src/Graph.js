/* Main data structure for the Graph */
export default class Graph {
  /* Number of vertices */
  V;

  /* Number of edges */
  E;

  /* Vertex list */
  vertexList;

  constructor() {
    this.V = 0;
    this.E = 0;
    this.vertexList = new Map();
  }

  addNode = (id, x, y) => {
    const newNode = {
      id,
      label: 'New Node',
      color: "#ff6361",
      adjacencyList: [],
      x,
      y,
    };

    this.vertexList.set(id, newNode);
    console.log("this is vertexList", this.vertexList);
    this.V++;
  }

  addEdge = (src, dest) => {
    const sourceNode = this.vertexList.get(src);
    sourceNode.adjacencyList.push(dest);
    this.E++;
  }
  
  /** Test whether src adj to dest */
  adjacent = (src, dest) => {
    const node = this.vertexList.get(src);

    for (const edge of node.adjacencyList) {
      if (edge === dest) {
        return true;
      }
    }

    return false;
  }

  /** Return vertices incident on src  */
  neighbors = (src) => {
    const node = this.vertexList.get(src);
    return node.adjacencyList.map((id) => this.vertexList.get(id));
  }

  removeVertex = (src) => {
    this.vertexList.delete(src);

    for (const [id, vertex] of this.vertexList.entries()) {
      vertex.adjacencyList = vertex.adjacencyList.filter(edge => {
        if (edge === id) {
          this.E--;
          return false;
        }

        return true;
      });
    }

    this.V--;
  }

  removeEdge = (src, id) => {
    const node = this.vertexList.get(src);
    node.adjacencyList = node.adjacencyList.filter(edge => {
      if (edge === id) {
        this.E--;
        return false;
      }

      return true;
    });
  }
}



