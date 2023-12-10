// src/components/Grid.tsx
import React, { useState, useEffect } from "react";
import { useGesture } from "react-use-gesture";
import Cell from "./Cell";
import "./Grid.scss";

interface GridProps {
  gridSize: number;
  originalGrid: string[][];
  initialGrid: string[][];
  setMoves: React.Dispatch<React.SetStateAction<number>>;
  setInitialGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  setHasWon: React.Dispatch<React.SetStateAction<boolean>>;
  draggingPosition: {
    row: number;
    col: number;
    distance: number;
  };
  cellSize: number;
}

//Function that given an array, a direction (row, column), a row index, column index and a direction tuple,
//shifts the corresponding row or column array in the direction of the tuple by the magnitude of the tuple

const shiftGrid = (
  grid: string[][],
  direction: "row" | "column",
  rowIndex: number,
  colIndex: number,
  directionTuple: [number, number],
  mutate: boolean
) => {
  let newGrid = mutate ? grid : grid.map((row) => [...row]);

  let shiftAmount = directionTuple[0] + directionTuple[1];
  console.log("shiftAmount", shiftAmount);
  if (direction === "row") {
    const row = newGrid[rowIndex];
    const shiftedRow = shiftArray(row, shiftAmount);
    newGrid[rowIndex] = shiftedRow;
  } else {
    const column = newGrid.map((row) => row[colIndex]);
    const shiftedColumn = shiftArray(column, shiftAmount);
    newGrid = newGrid.map((row, index) => {
      row[colIndex] = shiftedColumn[index];
      return row;
    });
  }
  return newGrid;
};

// Helper function to shift an array in both directions
const shiftArray = (arr: string[], shiftAmount: number) => {
  const length = arr.length;
  shiftAmount = ((shiftAmount % length) + length) % length; // Handle negative shiftAmount
  return [
    ...arr.slice(length - shiftAmount),
    ...arr.slice(0, length - shiftAmount),
  ];
};

const Grid: React.FC<GridProps> = ({
  originalGrid,
  initialGrid,
  setInitialGrid,
  setHasWon,
  setMoves,
  cellSize,
  gridSize,
}) => {
  const [grid, setGrid] = useState(initialGrid);

  const [cellDirection, setCellDirection] = useState<"row" | "column">("row");
  const [draggingPosition, setDraggingPosition] = useState({
    row: -1,
    col: -1,
    distance: 0,
  });

  useEffect(() => {
    setGrid(initialGrid);
  }, [initialGrid]);

  const bind = useGesture({
    onDrag: ({
      args: [rowIndex, colIndex],
      movement: [mx, my],
      initial: [ix, iy],
      memo,
      event,
    }) => {
      // Prevent the default behavior of the browser

      event.preventDefault();
      // Determine the direction based on the initial drag
      let direction: "row" | "column" =
        Math.abs(mx) > Math.abs(my) ? "row" : "column";

      if (!memo) {
        // Store the initial x and y positions when the drag starts
        memo = { direction, initialX: ix, initialY: iy, initialDistance: 0 };
      }

      // Calculate the distance from the initial position
      const distanceX = mx; // Use mx directly for horizontal movement
      const distanceY = my; // Use my directly for vertical movement

      // Use the horizontal distance for rows and vertical distance for columns
      let distance = direction === "row" ? distanceX : distanceY;

      // Calculate the absolute distance
      const absDistance = Math.abs(distance);
      const cellsMoved = Math.floor((absDistance + cellSize / 2) / cellSize);
      //wrap cellsMoved between 0 and 4

      const absCellsMoved = Math.floor((distance + cellSize / 2) / cellSize);

      if (cellsMoved >= 1) {
        // Shift the grid
        const directionTuple: [number, number] =
          direction === "row" ? [0, absCellsMoved] : [absCellsMoved, 0];
        console.log(
          initialGrid,
          "Shift Grid",
          direction,
          rowIndex,
          colIndex,
          directionTuple
        );
        let newgrid = shiftGrid(
          initialGrid,
          direction,
          rowIndex,
          colIndex,
          directionTuple,
          false
        );

        setGrid(newgrid);

        // Adjust the initial position and distance
        const adjustment = -cellsMoved * cellSize * (distance > 0 ? -1 : 1);
        if (direction === "row") {
          memo.initialX += adjustment;
        }
        if (direction === "column") {
          memo.initialY += adjustment;
        }

        distance -= adjustment;
      }
      // Calculate the blend factor using a cubic ease in/out function
      let blendFactor = absDistance / (cellSize / 2);
      blendFactor =
        blendFactor < 0.5
          ? 4 * blendFactor * blendFactor * blendFactor
          : (blendFactor - 1) * (2 * blendFactor - 2) * (2 * blendFactor - 2) +
            1;

      // If the blend factor is less than or equal to 1, set the cell direction
      if (blendFactor <= 1) {
        if (direction === "row" || direction === "column") {
          setCellDirection(direction);
        }
      }
      // Call onSlide with the distance moved since the initial position
      setDraggingPosition({
        row: cellDirection === "row" ? rowIndex : -1,
        col: cellDirection === "column" ? colIndex : -1,
        distance,
      });

      // Update the memo with the current distance
      memo.initialDistance = distance;

      return memo;
    },

    onDragEnd: ({ memo }) => {
      if (memo) {
        const { direction, initialDistance } = memo;

        setDraggingPosition({
          row: direction === "row" ? draggingPosition.row : -1,
          col: direction === "column" ? draggingPosition.col : -1,
          distance: 0,
        });

        // Update initialGrid with the current grid state
        setInitialGrid(grid);
        setMoves((moves) => moves + 1);
        checkWin();
      }
    },
  });

  const getCellColor = (rowIndex: number, colIndex: number) => {
    if (
      rowIndex < originalGrid.length &&
      colIndex < originalGrid[0].length &&
      grid[rowIndex][colIndex] === originalGrid[rowIndex][colIndex]
    ) {
      return "green";
    } else if (
      rowIndex < originalGrid.length &&
      originalGrid[rowIndex].includes(grid[rowIndex][colIndex])
    ) {
      return "yellow";
    } else {
      return "white";
    }
  };

  const checkWin = () => {
    let win = true;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i].join("") !== originalGrid[i].join("")) {
        win = false;
      }
    }
    setHasWon(win);
  };

  return (
    <div className="grid">
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            letter={letter}
            rowIndex={rowIndex}
            colIndex={colIndex}
            direction={cellDirection}
            draggingPosition={draggingPosition}
            color={getCellColor(rowIndex, colIndex)}
            {...bind(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Grid;
