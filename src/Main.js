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
  HStack,
  Center,
  Stack,
  Kbd
} from "@chakra-ui/react";
import {
  MdOutlinePanTool,
  MdAddCircleOutline,
  MdTimeline,
  MdSettings,
  MdRemoveCircleOutline
} from "react-icons/md";

import Graph from "./Graph";
import GraphCanvas, { CONTROLS } from "./components/NewGraphCanvas";
import { MathComponent } from 'mathjax-react'

import { v4 as uuidv4 } from "uuid";

const NODE_COLORS = [
  {
    color: "#ff6361",
    key: "Q"
  },
  {
    color: "#845ec2",
    key: "W"
  },
  {
    color: "#ff9671",
    key: "E"
  },
  {
    color: "#ffc75f",
    key: "R"
  },
]
export const CANVAS_TOOLS = [
  {
    toolName: CONTROLS.SELECT,
    Icon: MdOutlinePanTool,
  },
  {
    toolName: CONTROLS.ADD_NODE,
    Icon: MdAddCircleOutline,
  },
];

function Main() {
  const [currTool, setCurrTool] = useState(CONTROLS.ADD_NODE);

  const [vertexList, setVertexList] = useState(new Map());
  const [V, setV] = useState(0);
  const [E, setE] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [nodeColor, setNodeColor] = useState("#ff6361")
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
  }, [currTool, vertexList, nodeColor]);

  /* On mount */
  useEffect(() => {
    const handler = (e) => {
      console.log(e);
      switch (e.key) {
        case "1":
          setCurrTool(CONTROLS.SELECT);
          break;

        case "2":
          setSelectedNode(null);
          setCurrTool(CONTROLS.ADD_NODE);
          break;

        case "3":
          setSelectedNode(null);
          setCurrTool(CONTROLS.REMOVE);
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
      color: nodeColor,
      adjacencyList: [],
      id,
      x,
      y,
    };

    vertexList.set(id, newNode);
    setV(V + 1);

    setVertexList(new Map(vertexList));
  };

  const addEdge = (src, dest) => {
    const srcNode = vertexList.get(src);
    srcNode.adjacencyList.push(dest);
    setVertexList(new Map(vertexList))
    setE(e => e + 1);
  }

  const removeNode = (src) => {

    vertexList.delete(src);


    let newE = E;
    for (const [id, vertex] of vertexList.entries()) {
      vertex.adjacencyList = vertex.adjacencyList.filter(edge => {
        if (edge === src) {
          newE--;
          return false;
        }

        return true;
      });
    }
    console.log("new E", newE);


    setV(V - 1);
    setE(newE);

    setVertexList(new Map(vertexList))
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
          <Icon size="1.5rem" />
        </Button>
      );
    });
  };

  const updateNodePosition = (id, x, y) => {
    const oldNode = vertexList.get(id);
    oldNode.x = x;
    oldNode.y = y;
    setVertexList(new Map(vertexList));
  }

  const renderNodeColors = () => {
    return NODE_COLORS.map((option) => {
      const { color, key } = option;

      const onClick = () => {
        setIsOpen(false);
        setNodeColor(color)
      }

      return (
        <Flex flexDir="column" alignItems="center" onClick={onClick}>
        <Box boxShadow="lg" height="2rem" width="2rem" borderRadius="0.25rem" background={color} />
        <span><Kbd>{key}</Kbd></span>
      </Flex>
      );
    })
  }

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
        <GraphCanvas
          nodes={vertexList}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          updateNodePosition={updateNodePosition}
          currTool={currTool}
          setCurrTool={setCurrTool}
          addEdge={addEdge}
          removeNode={removeNode}
        />
      </Box>

      <Stack
        pos="absolute"
        bg="white"
        padding="0.5rem"
        borderRadius="1rem"
        boxShadow="0px 0px 16px -1px rgba(0, 0, 0, 0.05), 0px 0px 16px -8px rgba(0, 0, 0, 0.05), 0px 0px 16px -12px rgba(0, 0, 0, 0.12), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)"
        top="1rem"
        left="1rem"
        fontSize="0.875rem"
        spacing="0rem"
      >
        <Text fontSize="1rem" fontWeight="semibold">Information</Text>
        <MathComponent tex={String.raw`V = ${V}`} />
        <MathComponent tex={String.raw`E = ${E}`} />
      </Stack>

      {/* Controls container */}
      <Flex justifyContent={"center"} w="100%" pos="absolute" bottom="1rem" pointerEvents={"none"} onClick={e => e.stopPropagation()}>
        {/* Controls */}
        <HStack pointerEvents={"all"}
          bg="white"
          padding="0.5rem"
          borderRadius="1rem"
          boxShadow="0px 0px 16px -1px rgba(0, 0, 0, 0.05), 0px 0px 16px -8px rgba(0, 0, 0, 0.05), 0px 0px 16px -12px rgba(0, 0, 0, 0.12), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)"
        >

          <Button
            variant="control"
            active={CONTROLS.SELECT === currTool || CONTROLS.ADD_EDGE === currTool}
            onClick={(e) => { e.stopPropagation(); setCurrTool(CONTROLS.SELECT) }}
          >
            <MdOutlinePanTool size="1.5rem" />
          </Button>

          <Button
            variant="control"
            active={CONTROLS.ADD_NODE === currTool}
            onClick={(e) => { e.stopPropagation(); setCurrTool(CONTROLS.ADD_NODE) }}
          >
            <MdAddCircleOutline size="1.5rem" />
          </Button>

          {/* Color picker */}

          <Box pos="relative">

            <Box boxShadow="lg" onClick={() => setIsOpen(!isOpen)} height="2rem" width="2rem" borderRadius="0.25rem" background="#ff6361">
            </Box>

            {isOpen &&
              <HStack
                padding="0.5rem"
                borderRadius="1rem"
                pos="absolute"
                bottom="calc(100% + 1.25rem)"
                boxShadow="0px 0px 16px -1px rgba(0, 0, 0, 0.05), 0px 0px 16px -8px rgba(0, 0, 0, 0.05), 0px 0px 16px -12px rgba(0, 0, 0, 0.12), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)"
                bg="white"
                right="50%"
                transform="translateX(50%)"
              >
                {/* <Flex flexDir="column" alignItems="center">
                  <Box boxShadow="lg" height="2rem" width="2rem" borderRadius="0.25rem" background="#ff6361" />
                  <span><Kbd>Q</Kbd></span>
                </Flex>
                <Flex flexDir="column" alignItems="center">
                  <Box boxShadow="lg" height="2rem" width="2rem" borderRadius="0.25rem" background="#845ec2" />
                  <span><Kbd>W</Kbd></span>
                </Flex>

                <Flex flexDir="column" alignItems="center">
                <Box boxShadow="lg" height="2rem" width="2rem" borderRadius="0.25rem" background="#ff9671" />
                <span><Kbd>E</Kbd></span>
                </Flex>

                <Flex flexDir="column" alignItems="center">
                <Box boxShadow="lg" height="2rem" width="2rem" borderRadius="0.25rem" background="#ffc75f" />
                <span><Kbd>R</Kbd></span>
                </Flex> */}

                {renderNodeColors()}
              </HStack>}
          </Box>


          <Button
            variant="control"
            active={CONTROLS.REMOVE === currTool}
            onClick={(e) => { e.stopPropagation(); setCurrTool(CONTROLS.REMOVE) }}
          >
            <MdRemoveCircleOutline size="1.5rem" />
          </Button>
        </HStack>
      </Flex>
    </Grid>
  );
}

export default Main;
