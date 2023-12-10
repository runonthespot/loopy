import React, { useState, useEffect } from "react";
import Grid from "./components/Grid";
import "./App.scss";
import { generate } from "random-words";
import ConfettiExplosion from "react-confetti-explosion";

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

const Timer: React.FC<{ hasWon: boolean; resetTimer: number }> = ({
  hasWon,
  resetTimer,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [formattedTime, setFormattedTime] = useState("00:00");

  useEffect(() => {
    setSeconds(0); // reset seconds when resetTimer changes
    if (hasWon) {
      return;
    }
    const interval = setInterval(() => {
      setSeconds((seconds) => {
        const newSeconds = seconds + 1;
        let minutes = Math.floor(newSeconds / 60);
        let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        let formattedSeconds =
          newSeconds % 60 < 10 ? `0${newSeconds % 60}` : newSeconds % 60;
        setFormattedTime(`${formattedMinutes}:${formattedSeconds}`);
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasWon, resetTimer]); // add resetTimer as a dependency

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
  const [loading, setLoading] = useState(true);
  const [resetTimer, setResetTimer] = useState(0); // add new state variable

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gridSize, setGridSize] = useState(5);
  const [gameKey, setGameKey] = useState(0);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--grid-size",
      gridSize.toString()
    );

    setLoading(true);
    const newGrid = generateRandomGrid();
    setInitialGrid(newGrid);
    setGrid(shuffleGrid(newGrid));
    setLoading(false);
  }, [gridSize, gameKey]);

  const generateRandomGrid = () => {
    const words = generate({
      exactly: gridSize,
      minLength: gridSize,
      maxLength: gridSize,
    });
    return words.map((word) => word.toUpperCase().split(""));
  };

  const [initialGrid, setInitialGrid] = useState<string[][]>(
    generateRandomGrid()
  );
  console.log("initialGrid", initialGrid);

  const startNewGame = (newGridSize: number) => {
    if (
      window.confirm(
        `Are you sure you want to start a new ${newGridSize}x${newGridSize} game?`
      )
    ) {
      setGridSize(newGridSize);
      setGameKey(gameKey + 1);
      setHasWon(false);
      setMoves(0);
      setResetTimer(resetTimer + 1); // increment resetTimer to reset the timer
    }
  };

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

        <div className="flex-container">
          <button
            className="instruction-button"
            onClick={() => startNewGame(4)}
          >
            New 4x4 game
          </button>
          <button
            className="instruction-button"
            onClick={() => startNewGame(5)}
          >
            New 5x5 game
          </button>
          <button
            className="instruction-button"
            onClick={() => setModalIsOpen(true)}
          >
            Instructions
          </button>
        </div>

        {hasWon && <ConfettiExplosion />}
      </header>
      {!loading && (
        <Grid
          key={gameKey}
          gridSize={gridSize}
          originalGrid={initialGrid}
          initialGrid={grid}
          setInitialGrid={setGrid}
          setHasWon={setHasWon}
          setMoves={setMoves}
          draggingPosition={draggingPosition}
          cellSize={60}
        />
      )}
      <Timer hasWon={hasWon} resetTimer={resetTimer} />
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
