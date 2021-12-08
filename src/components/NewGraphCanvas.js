import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useState } from "react/cjs/react.development";
import { CANVAS_TOOLS } from "../Main";

const lineStates = {
  NONE: "NONE",
  DRAWING: "DRAWING"
}

const CANVAS_STATES = {
  MOVE_NODE: "MOVE_NODE",
  DRAW_EDGE: "DRAW_EDGE"
}

export const CONTROLS = {
  SELECT: "SELECT",
  ADD_NODE: "ADD_NODE",
  ADD_EDGE: "ADD_EDGE",
  REMOVE: "REMOVE"
};

/**
 * Component for rendering nodes and edges
 */
function NewGraphCanvas(props) {
  const {
    nodes,
    selectedNode,
    setSelectedNode,
    updateNodePosition,
    currTool,
    setCurrTool,
    addEdge,
    removeNode,
    nodeColor
  } = props;


  const svgRef = useRef(null);
  const lineRef = useRef(null);
  const lineStateRef = useRef(lineStates.NONE);

  
  useEffect(() => {
    const svgEl = d3.select(svgRef.current);

    svgEl.on("contextmenu", (e) => {
      e.preventDefault();
      setCurrTool(CONTROLS.SELECT)
      setSelectedNode(null);
    });

    return () => {
      svgEl.on("contextmenu", null);
    }
  }, []);


  useEffect(() => {


    /* Select svg */
    const svgEl = d3.select(svgRef.current);

    /* Clear svg contents before redraw */
    svgEl.selectAll("g").remove(); // Clear svg content before adding new elements 

    const edgeGroup = svgEl.append("g");

    /* Create group for nodes */
    const nodeGroup = svgEl.append("g");

    console.log(nodes);

    svgEl.on("click", () => {

      /* Unselect selected node */
      if (selectedNode) {
        setSelectedNode(null);
        setCurrTool(CONTROLS.SELECT);
      }
    })

    for (const [key, node] of nodes.entries()) {
      const onClick = (e) => {
        e.stopPropagation();

        if (currTool === CONTROLS.SELECT) {
          setSelectedNode(node);
        } else if (selectedNode && currTool === CONTROLS.ADD_EDGE && lineRef.current) {
          addEdge(selectedNode.id, node.id);
        } else if (currTool === CONTROLS.REMOVE) {
          removeNode(node.id);
        }
      }

      const selected = selectedNode?.id == node.id;

      const dragStart = () => {
        if (currTool === CONTROLS.SELECT) {
          setSelectedNode(node);
        } else if (selectedNode && currTool === CONTROLS.ADD_EDGE && lineRef.current) {
          addEdge(selectedNode.id, node.id);
        } else if (currTool === CONTROLS.REMOVE) {
          removeNode(node.id);
        }
      }

      const dragging = (p) => {
        if (currTool === CONTROLS.SELECT) {
          const newX = p.sourceEvent.offsetX;
          const newY = p.sourceEvent.offsetY;
          updateNodePosition(node.id, newX, newY);
        }
      
      }

      const dragEnd = () => {

      }

      const getStroke = () => {
        if (selected && currTool === CONTROLS.ADD_EDGE) {
          return "black"
        }

        if (selected && currTool === CONTROLS.SELECT) {
          return "rgba(66, 153, 225, 1.0)"
        }

        return null;
      }

      nodeGroup.append("circle")
        .style("fill", node.color)
        .attr("r", 20)
        .style("cursor", currTool === CONTROLS.SELECT ? "grab" : null)
        .attr("cx", node.x)
        .attr("cy", node.y)
        .on("click",  onClick)
        .attr("stroke-width", 4)
        .attr("stroke", getStroke())
        .style("stroke-dasharray", currTool === CONTROLS.ADD_EDGE ? 3 : null)
        .attr("filter", selected ? null : "drop-shadow( 3px 3px 2px rgba(0, 0, 0, .13))")
        .call(d3.drag()
          .on('start', dragStart)
          .on('drag', dragging)
          .on('end', dragEnd)
        )
        .on("contextmenu", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (selectedNode && node.id === selectedNode.id && currTool === CONTROLS.ADD_EDGE) {
            setSelectedNode(null);
            setCurrTool(CONTROLS.SELECT)
          } else {
            setSelectedNode(node);
            setCurrTool(CONTROLS.ADD_EDGE);
          }
        })

      for (const nodeId of node.adjacencyList) {
        const adjNode = nodes.get(nodeId);

        edgeGroup.append("line")
          .style("stroke", "black")
          .style("stroke-width", 2)
          .attr("x1", node.x)
          .attr("y1", node.y)
          .attr("x2", adjNode.x)
          .attr("y2", adjNode.y)
      }
    }
  }, [nodes, selectedNode, currTool])

  useEffect(() => {
    if (!selectedNode) return;

    const main = d3.select(svgRef.current);

    if (currTool !== CONTROLS.ADD_EDGE) {
      if (!lineRef.current) return;
      lineRef.current.remove();
      lineRef.current = null;

      lineStateRef.current = lineStates.NONE;
      main.on("mousemove", null);
      return;
    }

    main.on("mousemove", (p) => {
      lineStateRef.current = lineStates.DRAWING;

      const x = p.offsetX;
      const y = p.offsetY;
      if (!lineRef.current) {
        lineRef.current = main.append("line")
          .style("fill", "white")
          .style("stroke", "black")
          .style("stroke-width", 3)
          .style("stroke-dasharray", 3)
          .attr("x1", selectedNode.x)
          .attr("y1", selectedNode.y)
          .attr("x2", x)
          .attr("y2", y)
          .style("pointer-events", "none")
      } else {
        console.log("updating line!")
        lineRef.current
          .attr("x2", x)
          .attr("y2", y)
      }
    })

    return () => {
      if (!lineRef.current) return;
      lineRef.current.remove();
      lineRef.current = null;

      lineStateRef.current = lineStates.NONE;
      main.on("mousemove", null);
    }
  }, [currTool, selectedNode])
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