import React, { useState, useEffect } from "react";
import Grid from "./components/Grid";
import "./App.scss";
import { generate } from "random-words";
import ConfettiExplosion from "react-confetti-explosion";
import logo from "./logo.png";

import Modal from "react-modal";
import "./components/Cell.scss";

const shuffleGrid = (inputGrid: string[][]) => {
  const flatGrid = inputGrid.flat();
  for (let i = flatGrid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flatGrid[i], flatGrid[j]] = [flatGrid[j], flatGrid[i]];
  }
  return chunkArray(flatGrid, inputGrid[0].length);
};

const chunkArray = (array: string[], chunkSize: number) => {
  return Array(Math.ceil(array.length / chunkSize))
    .fill([])
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));
};
const confettiConfig = {
  spread: 360,
  startVelocity: 40,
  elementCount: 1000,
  dragFriction: 0.12,
  duration: 30000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#000", "#333", "#666"],
};

const Timer: React.FC<{ hasWon: boolean }> = ({ hasWon }) => {
  const [seconds, setSeconds] = useState(0);
  const [formattedTime, setFormattedTime] = useState("00:00");

  useEffect(() => {
    if (hasWon) {
      return;
    }
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    let minutes = Math.floor(seconds / 60);
    //produce nicely formatted time with leading zeros
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    let formattedSeconds =
      seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
    setFormattedTime(`${formattedMinutes}:${formattedSeconds}`);

    return () => clearInterval(interval);
  }, [hasWon, seconds]);

  return (
    <div className="timer-container">
      <h2>
        Time
        <br />
        <span className="info">{formattedTime}</span>
      </h2>
    </div>
  );
};

const App: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const generateRandomGrid = () => {
    const words = generate({ exactly: 5, minLength: 5, maxLength: 5 });
    return words.map((word) => word.toUpperCase().split(""));
  };

  const [initialGrid, setInitialGrid] = useState<string[][]>(
    generateRandomGrid()
  );
  console.log("initialGrid", initialGrid);

  const [grid, setGrid] = useState(shuffleGrid(initialGrid));

  const [draggingPosition, setDraggingPosition] = useState({
    row: -1,
    col: -1,
    distance: 0,
  });

  const cellSize = 60;
  const shiftGrid = (
    xcoord: number,
    ycoord: number,
    xshift: number,
    yshift: number,
    mutate: boolean
  ) => {};

  // src/App.t

  return (
    <div className="App">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Instruction Modal"
        className="modal"
      >
        <h2>Instructions</h2>
        <p className="instruction-text">
          Drag the rows and columns to solve the puzzle. The goal is to get the
          letters in each row to spell a 4 letter word.
        </p>
        <div className="instruction-container">
          <div className="flex-container">
            <div className="cell cell-green">G</div>
            <p className="instruction-text-cell">
              Green cells indicate a letter in the correct row and column.
            </p>
          </div>
          <div className="flex-container">
            <div className="cell cell-yellow">Y</div>
            <p className="instruction-text-cell">
              Yellow cells indicate a letter in the correct row, but wrong
              column.
            </p>
          </div>
          <div className="flex-container">
            <div className="cell cell-white">W</div>
            <p className="instruction-text-cell">
              White cells indicate a letter in the correct column, but wrong
              row.
            </p>
          </div>
        </div>
        <button
          className="instruction-button"
          onClick={() => setModalIsOpen(false)}
        >
          Close
        </button>
      </Modal>

      <header className="App-header">
        <img
          src={process.env.PUBLIC_URL + "/logo.png"}
          alt="Logo"
          style={{ width: "20%", height: "auto", margin: "20px" }}
        />

        <button
          className="instruction-button"
          onClick={() => setModalIsOpen(true)}
        >
          Open Instructions
        </button>
        {hasWon && <ConfettiExplosion />}
      </header>

      <Grid
        originalGrid={initialGrid}
        initialGrid={grid}
        setInitialGrid={setGrid}
        setHasWon={setHasWon}
        setMoves={setMoves}
        draggingPosition={draggingPosition}
        cellSize={60}
      />
      <Timer hasWon={hasWon} />
      <div className="moves-container">
        <h2>
          Moves
          <br />
          <span className="info">{moves}</span>
        </h2>
      </div>

      {hasWon && (
        <div className="win-container">
          <h2>You Win!</h2>
          <button
            className="instruction-button"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
