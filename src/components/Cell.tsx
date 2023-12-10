// src/components/Cell.tsx
import { animated, useSpring } from "react-spring";
import React from "react";
import "./Cell.scss"; // Assuming you have styles defined for Cell

interface CellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  draggingPosition: {
    row: number;
    col: number;
    distance: number;
  };
  direction: "row" | "column";
  color: string;
  [key: string]: any; // For additional props from the bind function
}

const Cell: React.FC<CellProps> = ({
  letter,
  rowIndex,
  colIndex,
  draggingPosition,
  direction,
  color,
  ...bindProps
}) => {
  const isDraggingRow = draggingPosition.row === rowIndex;
  const isDraggingCol = draggingPosition.col === colIndex;
  const dragDistance =
    isDraggingRow || isDraggingCol ? draggingPosition.distance : 0;

  const style = useSpring({
    transform: `translate${direction === "row" ? "X" : "Y"}(${dragDistance}px)`,
    immediate: true,
    borderColor: color, // Changed from backgroundColor to borderColor
  });

  return (
    <animated.div className={`cell cell-${color}`} style={style} {...bindProps}>
      {letter}
    </animated.div>
  );
};

export default Cell;
