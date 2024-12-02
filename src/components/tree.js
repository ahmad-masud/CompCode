import React, { useEffect, memo } from "react";
import { ReactFlow, useNodesState, useEdgesState, Handle, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import positions from "../content/positions.json";
import { useNavigate } from "react-router-dom";
import "../styles/tree.css";

const Node = memo(({ data }) => {
  const { topic } = data;
  const { getEdges } = useReactFlow();
  const navigate = useNavigate();
  const edges = getEdges();

  const hasIncomingEdges = edges.some(
    (edge) => edge.target === topic.name.replace(/\s+/g, "-").toLowerCase()
  );

  const hasOutgoingEdges = edges.some(
    (edge) => edge.source === topic.name.replace(/\s+/g, "-").toLowerCase()
  );

  return (
    <div
      className="node"
      onClick={() =>
        navigate(`/roadmap/${topic.name.replace(/\s+/g, "-").toLowerCase()}`)
      }
    >
      {hasIncomingEdges && (
        <Handle
          type="target"
          position="top"
          id={`${topic.name}-target`}
        />
      )}
      <p className="node-title">{topic.name}</p>
      <div className="node-details">
        <p>{topic.avgAcceptance}</p>
        <p className={topic.mostCommonDifficulty.toLowerCase()}>
          {topic.mostCommonDifficulty}
        </p>
      </div>
      <div className="company-progress-bar">
        <div
          className="company-progress"
          style={{
            width: `${(topic.solvedProblems / topic.numProblems) * 100}%`,
          }}
        ></div>
      </div>
      {hasOutgoingEdges && (
        <Handle
          type="source"
          position="bottom"
          id={`${topic.name}-source`}
        />
      )}
    </div>
  );
});

const nodeTypes = { customNode: Node };

const Tree = ({ companiesData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const generateNodesAndEdges = (data, positions) => {
    const positionMap = positions.reduce((acc, pos) => {
      acc[pos.name] = { x: pos.x, y: pos.y };
      return acc;
    }, {});

    const initialNodes = data.map((topic) => ({
      id: topic.name.replace(/\s+/g, "-").toLowerCase(),
      type: "customNode",
      data: { topic },
      position: positionMap[topic.name.replace(/\s+/g, "-").toLowerCase()] || {
        x: 0,
        y: 0,
      },
    }));

    const initialEdges = data.flatMap((topic) =>
      (topic.children || []).map((childName) => ({
        id: `${topic.name}->${childName}`.replace(/\s+/g, "-").toLowerCase(),
        source: topic.name.replace(/\s+/g, "-").toLowerCase(),
        target: childName.replace(/\s+/g, "-").toLowerCase(),
      }))
    );

    return { initialNodes, initialEdges };
  };

  useEffect(() => {
    if (companiesData.length > 0) {
      const { initialNodes, initialEdges } = generateNodesAndEdges(
        companiesData,
        positions
      );
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [companiesData, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={nodeTypes}
      ></ReactFlow>
    </ReactFlowProvider>
  );
};

export default Tree;
