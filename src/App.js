import { useState } from 'react';

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button className={`square ${isWinning ? 'square--win' : ''}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ boardSize, xIsNext, squares, onPlay }) {
  function handleClick(i) {
    const result = calculateWinner(squares, boardSize);
    if ((result && result.winner) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const result = calculateWinner(squares, boardSize);
  const winner = result?.winner ?? null;
  const winningLine = result?.line ?? [];

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (!squares.includes(null)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const rows = [];
  for (let r = 0; r < boardSize; r++) {
    const rowSquares = [];
    for (let c = 0; c < boardSize; c++) {
      const i = r * boardSize + c;
      rowSquares.push(
        <Square
          key={i}
          value={squares[i]}
          isWinning={winningLine.includes(i)}
          onSquareClick={() => handleClick(i)}
        />
      );
    }
    rows.push(
      <div className="board-row" key={r}>
        {rowSquares}
      </div>
    );
  }

  const gridStyle = {
    gridTemplateColumns: `repeat(${boardSize}, var(--sq))`,
    gridTemplateRows: `repeat(${boardSize}, var(--sq))`
  };

  return (
    <div className="card-body">
      <div className="status">{status}</div>
      <div className="board-container" style={gridStyle}>
        {rows}
      </div>
    </div>
  );

}

export default function Game() {
  const [boardSize, setBoardSize] = useState(3);
  const [history, setHistory] = useState([Array(boardSize * boardSize).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);

  function handleSizeChange(e) {
    const newSize = Number(e.target.value);
    setBoardSize(newSize);
    setHistory([Array(newSize * newSize).fill(null)]);
    setCurrentMove(0);
  }

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((board, index) => {
  const isStart = index === 0;
  const prev = history[index - 1];
  let pos = "";

  if (!isStart && prev) {
    const changed = board.findIndex((v, i) => v !== prev[i]);
    if (changed >= 0) {
      const row = Math.floor(changed / boardSize) + 1;
      const col = (changed % boardSize) + 1;
      pos = `(${row}, ${col})`;
    }
  }

  const label = isStart ? "Go to game start" : `Go to move #${index} ${pos}`;

  return (
    <li key={index}>
      {index === currentMove ? (
        <span className="current-move">
          You are at move #{index} {pos}
        </span>
      ) : (
        <button onClick={() => jumpTo(index)}>{label}</button>
      )}
    </li>
  );
});


  const movesToShow = sortAsc ? moves : [...moves].reverse();
    
  return (
    <div className="game">
        <div className="game-board">
        <div className="controls">
            <div className="controls__group">
            <label className="control">
                <span className="control__label">Board size</span>
                <select className="select" value={boardSize} onChange={handleSizeChange}>
                {[3,4,5].map(n => <option key={n} value={n}>{n} × {n}</option>)}
                </select>
            </label>
            </div>

            <div className="controls__group">
            <button
                className="btn"
                onClick={() => setSortAsc(s => !s)}
                aria-pressed={!sortAsc}
            >
                {sortAsc ? 'Sort: Asc' : 'Sort: Desc'}
            </button>
            </div>
        </div>

        <Board
            boardSize={boardSize}
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
        />
        </div>

        <div className="game-info">
        <ol>{movesToShow}</ol>
        </div>
    </div>
    );

}

function calculateWinner(squares, n) {
  for (let r = 0; r < n; r++) {
    const first = squares[r * n];
    if (!first) continue;
    let win = true;
    const line = [r * n];
    for (let c = 1; c < n; c++) {
      line.push(r * n + c);
      if (squares[r * n + c] !== first) { win = false; break; }
    }
    if (win) return { winner: first, line };
  }

  for (let c = 0; c < n; c++) {
    const first = squares[c];
    if (!first) continue;
    let win = true;
    const line = [c];
    for (let r = 1; r < n; r++) {
      line.push(r * n + c);
      if (squares[r * n + c] !== first) { win = false; break; }
    }
    if (win) return { winner: first, line };
  }

  const firstDiag = squares[0];
  if (firstDiag) {
    let win = true;
    const line = [0];
    for (let i = 1; i < n; i++) {
      line.push(i * (n + 1));
      if (squares[i * (n + 1)] !== firstDiag) { win = false; break; }
    }
    if (win) return { winner: firstDiag, line };
  }

  const antiFirst = squares[n - 1];
  if (antiFirst) {
    let win = true;
    const line = [n - 1];
    for (let i = 1; i < n; i++) {
      line.push((i + 1) * (n - 1));
      if (squares[(i + 1) * (n - 1)] !== antiFirst) { win = false; break; }
    }
    if (win) return { winner: antiFirst, line };
  }

  return null;
}
