import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Grid,
  GridItem,
  Heading,
  Box,
  Text,
  OrderedList,
  ListItem,
  Flex,
  Kbd,
  HStack,
  Center,
  Stack
} from "@chakra-ui/react";
import {
  MdOutlinePanTool,
  MdAddCircleOutline,
  MdTimeline,
  MdSettings,
} from "react-icons/md";
import Graph from "./Graph";
import GraphCanvas, { CONTROLS } from "./components/NewGraphCanvas";
import { MathComponent } from 'mathjax-react'

import { v4 as uuidv4 } from "uuid";

const CANVAS_TOOLS = [
  {
    toolName: CONTROLS.PAN,
    Icon: MdOutlinePanTool,
  },
  {
    toolName: CONTROLS.ADD_NODE,
    Icon: MdAddCircleOutline,
  },
  {
    toolName: CONTROLS.ADD_EDGE,
    Icon: MdTimeline,
  },
];

function Main() {
  const [currTool, setCurrTool] = useState(CONTROLS.PAN);

  const [vertexList, setVertexList] = useState(new Map());
  const [V, setV] = useState(0);
  const [E, setE] = useState(0);

  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    /* Track position of mouse for creating new node */
    document.addEventListener("mousemove", (ev) => {
      mousePosRef.current = { x: ev.offsetX, y: ev.offsetY };
    });
  }, []);

  useEffect(() => {
    if (currTool === CONTROLS.ADD_NODE) {
      const _addNode = () => {
        addNode();
      }
      document.addEventListener("click", _addNode);
      return () => {
        document.removeEventListener("click", _addNode);
      };
    }
  }, [currTool, vertexList]);

  /* On mount */
  useEffect(() => {
    const handler = (e) => {
      console.log(e);
      switch (e.key) {
        case "1":
          setCurrTool(CONTROLS.PAN);
          break;

        case "2":
          setCurrTool(CONTROLS.ADD_NODE);
          break;

        case "3":
          setCurrTool(CONTROLS.ADD_EDGE);
          break;

        default:
          break;
      }
    };
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, []);

  const addNode = () => {
    const { x, y } = mousePosRef.current;
    const id = uuidv4();
    const newNode = {
      label: "New Node",
      color: "#ff6361",
      adjacencyList: [],
      id,
      x,
      y,
    };

    vertexList.set(id, newNode);
    setV(V + 1);

    setVertexList(new Map(vertexList));
  };

  const addEdge = () => {
    let src;
    let dest;
    for (const [key, node] of vertexList) {
      if (!src) {
        src = key;
        continue;
      }

      dest = key;
      break;
    }
    
    const srcNode = vertexList.get(src);
    srcNode.adjacencyList.push(dest);
    setVertexList(new Map(vertexList))
    setE(E + 1);
  }

  const renderTools = () => {
    return CANVAS_TOOLS.map((tool) => {
      const { toolName, Icon } = tool;

      return (
        <Button
          variant="control"
          active={toolName === currTool}
          onClick={(e) => { e.stopPropagation(); setCurrTool(toolName) }}
        >
          <Icon size="1.25rem" />
        </Button>
      );
    });
  };
  return (
    <Grid
      h="100vh"
      w="100vw"
      pos="relative"
      bg="rgb(248, 249, 250)"
      gridTemplateColumns={"1fr"}
      gridTemplateRows={"1fr"}
    >
      <Box h="100%" w="100%">
        <GraphCanvas nodes={vertexList} />
      </Box>

      <Stack
        pos="absolute"
        bg="white"
        padding="0.5rem"
        borderRadius="1rem"
        boxShadow="0px 0px 16px -1px rgba(0, 0, 0, 0.05), 0px 0px 16px -8px rgba(0, 0, 0, 0.05), 0px 0px 16px -12px rgba(0, 0, 0, 0.12), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)"
        top="1rem"
        left="1rem"
        fontSize="0.75rem"
        spacing="0rem"
      >
        <Text fontSize="0.875rem" fontWeight="semibold">Information</Text>
        <MathComponent  tex={String.raw`V = ${V}`} />
        <MathComponent  tex={String.raw`E = ${E}`} />
      </Stack>

      {/* Controls container */}
      <Flex justifyContent={"center"} w="100%" pos="absolute" bottom="1rem">
        {/* Controls */}
        <HStack
          bg="white"
          padding="0.5rem"
          borderRadius="1rem"
          boxShadow="0px 0px 16px -1px rgba(0, 0, 0, 0.05), 0px 0px 16px -8px rgba(0, 0, 0, 0.05), 0px 0px 16px -12px rgba(0, 0, 0, 0.12), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)"
        >
          {renderTools()}

          <Button variant="control" onClick={(e) => { e.stopPropagation(); addEdge()}}>
            <MdTimeline/>
          </Button>
        </HStack>
      </Flex>
    </Grid>
  );
}

export default Main;
