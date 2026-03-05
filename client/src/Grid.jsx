import React, { useEffect, useRef, useState } from 'react';

const SYMBOL_LABELS = ['Forest', 'Gumleaf', 'Billabong', 'A', 'K', 'Q', 'J', '10', 'Wild', 'Scatter'];
const COLS = 7;
const EXIT_DURATION_MS = 420;

function boardKey(b) {
  return b && b.length === 49 ? b.join(',') : '';
}

export function Grid({ board, roundId, winPositions, eventIndex, events, onAdvance, replayMode }) {
  const [dropKey, setDropKey] = useState(0);
  const [displayBoard, setDisplayBoard] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const prevBoardRef = useRef(null);
  const prevKeyRef = useRef('');
  const prevRoundIdRef = useRef(null);
  const nextBoardRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!board || board.length !== 49) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setDisplayBoard(null);
      setIsExiting(false);
      prevBoardRef.current = null;
      prevKeyRef.current = '';
      return;
    }

    const key = boardKey(board);
    const isNewRound = roundId != null && roundId !== prevRoundIdRef.current;

    if (isNewRound || prevKeyRef.current === '') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      prevRoundIdRef.current = roundId;
      prevKeyRef.current = key;
      prevBoardRef.current = board;
      setDisplayBoard(board);
      setIsExiting(false);
      setDropKey((k) => k + 1);
      return;
    }

    if (key === prevKeyRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    nextBoardRef.current = board;
    setDisplayBoard(prevBoardRef.current);
    setIsExiting(true);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      const next = nextBoardRef.current;
      if (next) {
        setDisplayBoard(next);
        prevBoardRef.current = next;
        prevKeyRef.current = boardKey(next);
      }
      setIsExiting(false);
      setDropKey((k) => k + 1);
    }, EXIT_DURATION_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [board, roundId]);

  useEffect(() => {
    if (!replayMode || !events?.length || eventIndex >= events.length - 1) return;
    const timeout = setTimeout(() => {
      if (typeof onAdvance === 'function') onAdvance();
    }, 500);
    return () => clearTimeout(timeout);
  }, [replayMode, eventIndex, events?.length, onAdvance]);

  if (!displayBoard || displayBoard.length !== 49) {
    return (
      <div className="grid-wrap">
        {Array.from({ length: 49 }, (_, i) => (
          <div key={i} className="cell" />
        ))}
      </div>
    );
  }

  const isDrop = !isExiting;
  const showWin = isDrop && winPositions;

  return (
    <div className="grid-wrap">
      {displayBoard.map((sym, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const delay = col * 0.055 + row * 0.03;
        const exitDelay = row * 0.04 + col * 0.02;
        const isWin = showWin?.has(i);
        return (
          <div
            key={isExiting ? `exit-${i}` : `${dropKey}-${i}`}
            className={`cell ${isExiting ? 'cell-exit' : 'cell-drop'} ${isWin ? 'win' : ''}`}
            title={SYMBOL_LABELS[sym] ?? sym}
            data-col={col}
            data-row={row}
            style={{
              animationDelay: isExiting ? `${exitDelay}s` : `${delay}s`,
            }}
          >
            {SYMBOL_LABELS[sym]?.charAt(0) ?? sym}
            {isWin && (
              <span className="cell-cross" aria-hidden="true">
                <span className="cell-cross-line" />
                <span className="cell-cross-line" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
