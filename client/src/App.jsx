import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUrlParams, rgsAuthenticate, rgsPlay, rgsEndRound } from './rgs';
import { Grid } from './Grid';
import { FeatureOverlay } from './FeatureOverlay';
import { ThemeBackground } from './ThemeBackground';
import { ForestIcon } from './ForestIcon';

const PRECISION = 1e6;

function formatDollars(n) {
  const value = (Number(n) / PRECISION).toFixed(2);
  return `$${value}`;
}

export default function App() {
  const [balance, setBalance] = useState(null);
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replayMode, setReplayMode] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);
  const sessionID = useRef(getUrlParams().sessionID || 'demo-session-' + Date.now());
  const rgsUrl = useRef(getUrlParams().rgs_url || '/rgs');

  const authenticate = useCallback(async () => {
    try {
      const data = await rgsAuthenticate(rgsUrl.current, sessionID.current);
      setBalance(data.balance?.amount ?? 0);
      if (data.round) setRound(data.round);
      setError(null);
    } catch (e) {
      setError(e.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  const handleSpin = useCallback(async (mode = 'BASE') => {
    if (replayMode) return;
    setError(null);
    setLoading(true);
    try {
      const amount = PRECISION;
      const data = await rgsPlay(rgsUrl.current, sessionID.current, amount, mode);
      setBalance(data.balance?.amount ?? 0);
      setRound(data.round);
      setEventIndex(0);
    } catch (e) {
      setError(e.message || 'Play failed');
    } finally {
      setLoading(false);
    }
  }, [replayMode]);

  const handleReplay = useCallback(() => {
    if (!round?.events?.length) return;
    setReplayMode(true);
    setEventIndex(0);
  }, [round]);

  const handleEndReplay = useCallback(() => {
    setReplayMode(false);
  }, []);

  const handleEndRound = useCallback(async () => {
    try {
      const data = await rgsEndRound(rgsUrl.current, sessionID.current);
      setBalance(data.balance?.amount ?? 0);
      setRound(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  if (loading && balance === null) {
    return (
      <div className="game-container">
        <p>Loading...</p>
      </div>
    );
  }

  const events = round?.events ?? [];
  const currentBoard = (() => {
    for (let i = eventIndex; i >= 0; i--) {
      if (events[i]?.type === 'reveal' && events[i].board) return events[i].board;
    }
    return null;
  })();

  const winPositions = (() => {
    for (let i = eventIndex; i >= 0; i--) {
      if (events[i]?.type === 'winInfo' && events[i].wins) {
        const set = new Set();
        events[i].wins.forEach(w => w.positions?.forEach(p => set.add(p)));
        return set;
      }
    }
    return new Set();
  })();

  const totalWin = (() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i]?.type === 'finalWin') return events[i].amount;
    }
    return 0;
  })();

  const featureEvent = events.find(e => e.type === 'feature');
  const showFeature = featureEvent && eventIndex >= events.indexOf(featureEvent);

  return (
    <>
      <ThemeBackground />
      <div className="game-container" data-replay={replayMode}>
      <header className="game-header">
        <div className="game-header-koala">
          <ForestIcon className="koala-logo" size={56} />
          <h1 className="game-title">Forest Cluster</h1>
        </div>
        <p className="game-subtitle">Лісова галявина • 7×7 • Кластери та каскади</p>
      </header>

      {error && <p className="error-msg">{error}</p>}

      <div className="balance-strip">
        <span className="balance">Balance: {balance != null ? formatDollars(balance) : '—'} <span className="currency">USD</span></span>
        {round?.win != null && Number(round.win) > 0 && (
          <span className="win-display highlight">Win: {formatDollars(round.win)}</span>
        )}
      </div>

      <Grid
        board={currentBoard}
        roundId={round?.id}
        winPositions={winPositions}
        eventIndex={eventIndex}
        events={events}
        onAdvance={() => setEventIndex(i => Math.min(i + 1, events.length - 1))}
        replayMode={replayMode}
      />

      <div className="controls">
        <button
          onClick={() => handleSpin('BASE')}
          disabled={loading || (balance != null && Number(balance) < PRECISION)}
          data-replay-keep
        >
          Spin (NORMAL)
        </button>
        <button
          onClick={() => handleSpin('SUPER')}
          disabled={loading || (balance != null && Number(balance) < PRECISION)}
          data-replay-keep
        >
          Spin (SUPER)
        </button>
        {round?.events?.length && (
          <>
            <button onClick={handleReplay} className="secondary" data-replay-keep>Replay</button>
            {replayMode && (
              <button onClick={handleEndReplay} className="secondary" data-replay-keep>End Replay</button>
            )}
          </>
        )}
        {round && !replayMode && (
          <button onClick={handleEndRound} className="secondary">End Round</button>
        )}
      </div>

      {showFeature && featureEvent && (
        <FeatureOverlay
          feature={featureEvent.feature}
          data={featureEvent}
          onClose={() => setEventIndex(events.length - 1)}
        />
      )}
    </div>
    </>
  );
}
