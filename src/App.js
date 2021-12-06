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
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";

import GraphCanvas from "./components/GraphCanvas";
import Graph from "./Graph";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function App() {
  const canvasContainerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });

  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    /* Scale canvas with screen */
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height, width } = entry.contentRect;
        setCanvasDimensions({ width, height });
      }
    });
    /* Track position of mouse for creating new node */
    document.addEventListener("mousemove", (ev) => {
      mousePosRef.current = { x: ev.offsetX, y: ev.offsetY };
    });
    resizeObserver.observe(canvasContainerRef.current);
  }, []);

  const addNode = () => {
    const { x, y } = mousePosRef.current;

    const newNode = {
      id: uuidv4(),
      label: "New Node",
      color: "#ff6361",
      index: nodes.length,
      x,
      y,
    };

    setNodes(nodes.concat(newNode));
  };

  const addEdge = () => {
    const newEdge = {
      from: getRandomInt(0, nodes.length),
      to: getRandomInt(0, nodes.length),
    };

    setEdges(edges.concat(newEdge));
  };

  const renderNodeList = () => {
    return nodes.map((node, i) => {
      const onClickWrapper = (node, i) => {
        const onClick = () => {
          if (selectedNode && selectedNode.id === node.id) {
            setSelectedNode(null);
          } else {
            setSelectedNode(node);
          }
        };

        return onClick;
      };

      const isSelected = selectedNode?.id === node.id;

      return (
        <ListItem
          key={node.id}
          color="gray.300"
          p="0.25rem 1rem"
          fontSize="0.875rem"
          cursor="pointer"
          onClick={onClickWrapper(node, i)}
          borderRadius="0.25rem"
          transition="background 250ms ease"
          alignItems="center"
          _hover={{ bg: !isSelected ? "gray.700" : null }}
          bg={isSelected ? "purple.600" : null}
        >
          <Grid w="100%" gridTemplateColumns="1fr auto" columnGap="1rem">
            <GridItem>{i + 1}</GridItem>
            <GridItem
              borderRadius="0.125rem"
              boxShadow="2xl"
              w="20px"
              bg={node.color}
            ></GridItem>
          </Grid>
        </ListItem>
      );
    });
  };

  return (
    <Grid gridTemplateColumns="250px 1fr auto" h="100vh" w="100vw">
      <GridItem bg="#272B4A" boxShadow="lg">
        <Box p="1rem">
          <Heading
            as="h1"
            fontSize="1.75rem"
            color="gray.100"
            userSelect="none"
          >
            GTSP
          </Heading>
          <Text
            userSelect="none"
            mb="1rem"
            fontSize="0.875rem"
            color="gray.100"
          >
            Ver. 0.1
          </Text>
          <Flex mb="0.5rem" alignItems="baseline">
            <Heading as="h3" fontSize="1rem" color="gray.100">
              Nodes
            </Heading>
            <Text
              ml="0.5rem"
              fontSize="0.875rem"
              fontFamily="monospace"
              color="gray.100"
            >
              n = {nodes.length}
            </Text>
            <Button mt="1rem" size="sm" onClick={addNode} colorScheme="purple">
              Add Node
            </Button>
          </Flex>
          <OrderedList
            listStyleType="none"
            p="1rem"
            boxShadow="2xl"
            borderRadius="0.5rem"
            bg="#1A2039"
            m="0"
          >
            {renderNodeList()}
          </OrderedList>
          <Button mt="1rem" onClick={addEdge} colorScheme="purple">
            Add Edge
          </Button>
          <Kbd>E</Kbd>{" "}
          <Text color="white" ml="0.5rem">
            draw edge mode
          </Text>
          <Kbd>M</Kbd>{" "}
          <Text color="white" ml="0.5rem">
            move edge mode
          </Text>
          <Kbd>N</Kbd>{" "}
          <Text color="white" ml="0.5rem">
            new node
          </Text>
        </Box>
      </GridItem>

      {/* Add canvas */}
      <GridItem ref={canvasContainerRef} overflow="auto" bg="#1A2039">
        <GraphCanvas
          canvasDimensions={canvasDimensions}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setSelectedNode={setSelectedNode}
          selectedNode={selectedNode}
          setEdges={setEdges}
          addNode={addNode}
        />
      </GridItem>
    </Grid>
  );
}

export default App;
