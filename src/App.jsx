import React, { useState, useEffect } from "react";
import "./App.css";

const WORDS = ["APPLE", "HOUSE", "WORLD", "PLANE"];
const SIZE = 7;
const PLAYERS = ["Jogador 1", "Jogador 2"];

const getRandomInt = (max) => Math.floor(Math.random() * max);

const placeWord = (board, word) => {
  const directions = [
    [1, 0], // Horizontal
    [0, 1], // Vertical
    [1, 1], // Diagonal
  ];
  
  for (let attempt = 0; attempt < 100; attempt++) {
    const row = getRandomInt(SIZE);
    const col = getRandomInt(SIZE);
    const [dx, dy] = directions[getRandomInt(directions.length)];

    let valid = true;
    let positions = [];
    
    for (let i = 0; i < word.length; i++) {
      const x = row + i * dx;
      const y = col + i * dy;
      if (x >= SIZE || y >= SIZE || board[x][y] !== "") {
        valid = false;
        break;
      }
      positions.push([x, y]);
    }
    
    if (valid) {
      positions.forEach(([x, y], index) => (board[x][y] = word[index]));
      return;
    }
  }
};

const generateBoard = () => {
  let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  WORDS.forEach((word) => placeWord(board, word));
  board = board.map((row) => row.map((cell) => (cell === "" ? String.fromCharCode(65 + getRandomInt(26)) : cell)));
  return board;
};

const App = () => {
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundPositions, setFoundPositions] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    setBoard(generateBoard());
  }, []);

  const playerWords = {
    "Jogador 1": [WORDS[0], WORDS[1]],
    "Jogador 2": [WORDS[2], WORDS[3]],
  };

  const isAligned = (selection) => {
    if (selection.length < 2) return true;
    const [r1, c1] = selection[0];
    const [r2, c2] = selection[1];
    const rowDiff = r2 - r1;
    const colDiff = c2 - c1;

    return selection.every(([r, c], index) => {
      return r === r1 + index * rowDiff && c === c1 + index * colDiff;
    });
  };

  const handleCellClick = (row, col) => {
    if (selected.length > 0) {
      const [lastRow, lastCol] = selected[selected.length - 1];
      const isAdjacent = Math.abs(lastRow - row) <= 1 && Math.abs(lastCol - col) <= 1;
      if (!isAdjacent) {
        setSelected([]);
        return;
      }
    }
    const newSelection = [...selected, [row, col]];
    if (isAligned(newSelection)) {
      setSelected(newSelection);
    }
  };

  const submitWord = () => {
    const word = selected.map(([r, c]) => board[r][c]).join("");
    if (playerWords[PLAYERS[currentPlayer]].includes(word) && !foundWords.includes(word)) {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      let newScores = [...scores];
      newScores[currentPlayer] += Math.max(60 - timeTaken, 0);
      setScores(newScores);
      setFoundWords([...foundWords, word]);
      setFoundPositions([...foundPositions, [...selected]]);
      setMessage("Palavra encontrada!");
      setStartTime(Date.now());
      setCurrentPlayer((currentPlayer + 1) % 2);
    } else {
      setMessage("Palavra errada ou já encontrada!");
    }
    setSelected([]);
  };

  return (
    <div className="game-container" onClick={() => setSelected([])}>
      <h1>Caça-Palavras</h1>
      <h2>Vez de: {PLAYERS[currentPlayer]}</h2>
      <div className="scores">
        <p>Jogador 1: {scores[0]} pontos</p>
        <p>Jogador 2: {scores[1]} pontos</p>
      </div>
      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const isSelected = selected.some(([r, c]) => r === rowIndex && c === colIndex);
            const isFound = foundPositions.some((posList) => posList.some(([r, c]) => r === rowIndex && c === colIndex));
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`letter-cell ${isSelected ? "selected" : ""} ${isFound ? "found" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(rowIndex, colIndex);
                }}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>
      <div className="selected-word">Palavra: {selected.map(([r, c]) => board[r][c]).join("")}</div>
      <div className="message">{message}</div>
      <div className="submit-button" onClick={submitWord}>Enviar</div>
      <div className="word-list">
        <h2>Palavras:</h2>
        <h3>Jogador 1:</h3>
        <ul>
          {playerWords["Jogador 1"].map((word) => (
            <li key={word} className={foundWords.includes(word) ? "found" : ""}>{word}</li>
          ))}
        </ul>
        <h3>Jogador 2:</h3>
        <ul>
          {playerWords["Jogador 2"].map((word) => (
            <li key={word} className={foundWords.includes(word) ? "found" : ""}>{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;