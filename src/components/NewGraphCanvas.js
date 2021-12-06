import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useState } from "react/cjs/react.development";

const lineStates = {
  NONE: "NONE",
  DRAWING: "DRAWING"
}

const CANVAS_STATES = {
  MOVE_NODE: "MOVE_NODE",
  DRAW_EDGE: "DRAW_EDGE"
}

export const CONTROLS = {
  PAN: "PAN",
  ADD_NODE: "ADD_NODE",
  ADD_EDGE: "ADD_EDGE",
};

/**
 * Component for rendering nodes and edges
 */
function NewGraphCanvas(props) {
  const {
    nodes 
  } = props;


  const svgRef = useRef(null);



  useEffect(() => {


    /* Select svg */
    const svgEl = d3.select(svgRef.current);

    /* Clear svg contents before redraw */
    svgEl.selectAll("g").remove(); // Clear svg content before adding new elements 

    const edgeGroup = svgEl.append("g");

    /* Create group for nodes */
    const nodeGroup = svgEl.append("g");

  console.log(nodes);

    
    for (const [key, node] of nodes.entries()) {
      nodeGroup.append("circle")
      .style("fill", node.color)
      .attr("r", 20)
      .style("cursor", "grab")
     
      .attr("cx", node.x)
      .attr("cy", node.y)
      .attr("stroke-width", 1)
      .attr("filter", "drop-shadow( 3px 3px 2px rgba(0, 0, 0, .13))")

      for (const nodeId of node.adjacencyList) {
        const adjNode = nodes.get(nodeId);

        edgeGroup.append("line")
          .style("stroke", "#2D3748")
        .attr("x1", node.x)
        .attr("y1", node.y)
        .attr("x2", adjNode.x)
        .attr("y2", adjNode.y )
      }
    }
  }, [nodes])
  
     



  return (
    <svg ref={svgRef} width="100%" height="100%">
       <defs>
            <pattern
              id="smallGrid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="gray"
                stroke-width="0.5"
              />
            </pattern>
            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="80" fill="url(#smallGrid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="gray"
                stroke-width="1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default NewGraphCanvas;