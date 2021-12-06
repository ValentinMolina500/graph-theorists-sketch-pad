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
/**
 * Component for rendering nodes and edges
 */
function GraphCanvas(props) {
  const {
    canvasDimensions,
    nodes,
    edges,
    setSelectedNode,
    selectedNode,
    setNodes,
    setEdges,
    addNode,
    update
  } = props;

  const [canvasState, setCanvasState] = useState(CANVAS_STATES.MOVE_NODE);

  const svgRef = useRef(null);
  const lineRef = useRef(null);
  const lineStateRef = useRef(lineStates.NONE);

  useEffect(() => {

    const handler = (e) => {
      console.log(e);
      switch (e.key) {
        case "e":
          setCanvasState(CANVAS_STATES.DRAW_EDGE);
          break;

        case "m":
          setCanvasState(CANVAS_STATES.MOVE_NODE);
          break;

        case "n":
          addNode();
      }

    }
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler)

    }
  }, [nodes]);

  useEffect(() => {
    const svgEl = d3.select(svgRef.current);

    svgEl.on("contextmenu", (e) => {
      e.preventDefault();
      setCanvasState(CANVAS_STATES.MOVE_NODE);
    });

    return () => {
      svgEl.on("contextmenu", null);
    }
  }, []);
  /* Redraw the canvas */
  useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("g").remove(); // Clear svg content before adding new elements 
    const main = svgEl
    const svg = svgEl.append("g");
    main.on("click", () => { setSelectedNode(null); setCanvasState(CANVAS_STATES.MOVE_NODE) });

    const loops = edges.filter(e => (e.to === e.from));
    const loopArc = d3.arc().innerRadius(30).outerRadius(32).startAngle(0)
      .endAngle(2 * Math.PI)

    svg.selectAll("path")
      .data(loops)
      .enter().append("path")
      .attr("d", loopArc)
      .attr("fill", "white")
      .attr("transform", e => {
        const node = nodes[e.from];
        return `translate(${node.x + 25}, ${node.y - 25})`;
      })

    console.log("this is edges", loops);
    svg.selectAll("line")
      .data(edges)
      .enter().append("line")
      .style("fill", "white")
      .style("stroke", "white")
      .style("stroke-width", 2)
      .attr("x1", (e) => {
        const fromNode = nodes[e.from];
        return fromNode.x;
      })
      .attr("y1", (e) => {
        const fromNode = nodes[e.from];
        return fromNode.y;
      })
      .attr("x2", (e) => {
        const toNode = nodes[e.to];
        return toNode.x;
      })
      .attr("y2", (e) => {
        const toNode = nodes[e.to];
        return toNode.y;
      })


    const onNodeClick = (pointerEvent, node) => {
      pointerEvent.stopPropagation();

      if (selectedNode && selectedNode && lineRef.current) {

        if (selectedNode.id !== node.id) {
          setEdges(edges => edges.concat({ from: selectedNode.index, to: node.index }))

        } else {
          setEdges(edges => edges.concat({ from: selectedNode.index, to: selectedNode.index }))
        }
      } else {
        setSelectedNode(node);

      }

    }

    const dragStart = (p, node, nodes) => {
      if (selectedNode && selectedNode && lineRef.current) {
        if (selectedNode.id !== node.id) {
          setEdges(edges => edges.concat({ from: selectedNode.index, to: node.index }))

        } else {
          setEdges(edges => edges.concat({ from: selectedNode.index, to: selectedNode.index }))
        }
      } else {
        setSelectedNode(node);

      }
      p.sourceEvent.stopPropagation();
    }

    function dragging(p, datum) {
      if (canvasState !== CANVAS_STATES.MOVE_NODE) {
        return;
      }
      const newX = p.sourceEvent.offsetX;
      const newY = p.sourceEvent.offsetY;

      setNodes(nodes => nodes.map(node => {
        if (datum.id === node.id) {
          node.x = newX;
          node.y = newY;
        }

        return node;
      }))
    }


    const dragEnd = (p, node, nodes) => {
      // setSelectedNode(null);
      // removeHelperLine();
    }

    svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .on("click", onNodeClick)
      .style("fill", (d) => d.color)
      .style("stroke", (d) => selectedNode?.id === d.id ? "#ffa600" : null)
      .style("stroke-width", (d) => selectedNode?.id === d.id ? 4 : 0)
      .attr("r", 20)
      .style("cursor", "grab")
      .attr("cx", (d) => d.x)
      .call(d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd)
      )
      .style("stroke-dasharray", (d) => (selectedNode?.id === d.id && canvasState === CANVAS_STATES.DRAW_EDGE) ? 3: null)
      .attr("cy", (d) => d.y)
      .on("contextmenu", (mouseEvent, datum) => {
        mouseEvent.stopPropagation();
        mouseEvent.preventDefault();
        if (canvasState === CANVAS_STATES.MOVE_NODE) {
          setNodes(nodes => nodes.filter(node => {
            return node.id !== datum.id
          }))
        } else {
          setSelectedNode(datum);
        }
      
      })



  }, [nodes, edges, selectedNode, canvasState]);

  useEffect(() => {
    if (!selectedNode) return;

    const main = d3.select(svgRef.current);

    if (canvasState !== CANVAS_STATES.DRAW_EDGE) {
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
          .style("stroke", "#ffa600")
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
  }, [canvasState, selectedNode])

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

export default GraphCanvas;