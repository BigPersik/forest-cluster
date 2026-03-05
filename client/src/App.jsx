import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUrlParams, rgsAuthenticate, rgsPlay, rgsEndRound } from './rgs';
import { Grid } from './Grid';
import { FeatureOverlay } from './FeatureOverlay';
import { ThemeBackground } from './ThemeBackground';
import { ForestIcon } from './ForestIcon';
import { translations } from './translations';

const PRECISION = 1e6;
const BET_OPTIONS = [1, 2, 5, 10, 15, 25, 50, 75, 100];

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
  const [featureOverlayDismissed, setFeatureOverlayDismissed] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [betDropdownOpen, setBetDropdownOpen] = useState(false);
  const [winHistory, setWinHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lang, setLang] = useState(() => (localStorage.getItem('forest-lang') || 'ua'));
  const t = (key) => translations[lang]?.[key] ?? key;
  useEffect(() => { localStorage.setItem('forest-lang', lang); }, [lang]);
  const sessionID = useRef(getUrlParams().sessionID || 'demo-session-' + Date.now());
  const rgsUrl = useRef(getUrlParams().rgs_url || '/rgs');
  const replayModeRef = useRef(replayMode);
  replayModeRef.current = replayMode;

  const authenticate = useCallback(async () => {
    try {
      const data = await rgsAuthenticate(rgsUrl.current, sessionID.current);
      setBalance(data.balance?.amount ?? 0);
      if (data.round) setRound(data.round);
      setError(null);
    } catch (e) {
      setError(e.message || t('authFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  const betAmountPrecision = (BET_OPTIONS.includes(betAmount) ? betAmount : 1) * PRECISION;

  const handleSpin = useCallback(async (mode = 'BASE') => {
    if (replayModeRef.current) return;
    setError(null);
    setLoading(true);
    try {
      const amount = betAmountPrecision;
      const data = await rgsPlay(rgsUrl.current, sessionID.current, amount, mode);
      const prevWin = round?.win != null ? Number(round.win) : 0;
      if (prevWin > 0) setWinHistory((h) => [prevWin, ...h].slice(0, 50));
      setBalance(data.balance?.amount ?? 0);
      setRound(data.round);
      const evs = data.round?.events ?? [];
      let idx = evs.length ? evs.length - 1 : 0;
      for (let i = evs.length - 1; i >= 0; i--) {
        if (evs[i]?.type === 'winInfo') { idx = i; break; }
      }
      setEventIndex(idx);
      setFeatureOverlayDismissed(false);
    } catch (e) {
      setError(e.message || t('playFailed'));
    } finally {
      setLoading(false);
    }
  }, [betAmountPrecision, round?.win]);

  if (loading && balance === null) {
    return (
      <div className="game-container">
        <p>{t('loading')}</p>
      </div>
    );
  }

  const events = round?.events ?? [];
  const revealIndex = (() => {
    for (let i = eventIndex; i >= 0; i--) {
      if (events[i]?.type === 'reveal') return i;
    }
    return -1;
  })();
  const currentBoard = revealIndex >= 0 && events[revealIndex]?.board ? events[revealIndex].board : null;
  const winInfoCurrent = (() => {
    const next = revealIndex >= 0 ? events[revealIndex + 1] : null;
    return next?.type === 'winInfo' ? next : null;
  })();
  const winPositions = (() => {
    if (!winInfoCurrent?.wins) return new Set();
    const set = new Set();
    winInfoCurrent.wins.forEach(w => w.positions?.forEach(p => set.add(p)));
    return set;
  })();
  const SYMBOL_NAMES = ['Forest', 'Gumleaf', 'Billabong', 'A', 'K', 'Q', 'J', '10', 'Wild', 'Scatter'];
  const winBreakdown = winInfoCurrent?.wins?.length
    ? winInfoCurrent.wins.map(w => `${w.kind}× ${SYMBOL_NAMES[w.symbol] ?? w.symbol}`).join(', ')
    : null;

  const totalWin = (() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i]?.type === 'finalWin') return events[i].amount;
    }
    return 0;
  })();

  const featureEvent = events.find(e => e.type === 'feature');
  const featureName = featureEvent?.feature === 'koala_spins' ? 'Forest Spins' : featureEvent?.feature === 'gumleaf_grove' ? 'Gumleaf Grove' : featureEvent?.feature === 'billabong_bonus' ? 'Billabong Bonus' : null;
  const showFeature = replayMode && featureEvent && eventIndex >= events.indexOf(featureEvent) && !featureOverlayDismissed;
  const winFromFeatureOnly = round?.win != null && Number(round.win) > 0 && !winBreakdown && featureName;
  const winIncludesFeature = round?.win != null && Number(round.win) > 0 && winBreakdown && featureName;

  return (
    <>
      <ThemeBackground />
      <div className="lang-switcher">
        <button type="button" className={`lang-btn ${lang === 'ua' ? 'lang-btn-active' : ''}`} onClick={() => setLang('ua')}>UA</button>
        <span className="lang-sep">/</span>
        <button type="button" className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => setLang('en')}>EN</button>
      </div>
      <div className="game-container" data-replay={replayMode}>
      <header className="game-header">
        <div className="game-header-koala">
          <ForestIcon className="koala-logo" size={56} />
          <h1 className="game-title">{t('title')}</h1>
        </div>
        <p className="game-subtitle">{t('subtitle')}</p>
      </header>

      {rulesOpen && (
        <div className="rules-overlay" onClick={() => setRulesOpen(false)} role="dialog" aria-modal="true" aria-label="Правила гри">
          <div className="rules-panel" onClick={e => e.stopPropagation()}>
            <div className="rules-header">
              <h2>{t('rulesTitle')}</h2>
              <button type="button" className="rules-close" onClick={() => setRulesOpen(false)} aria-label={t('close')}>×</button>
            </div>
            <div className="rules-body">
              <p><strong>{t('rulesGrid')}</strong></p>
              <p><strong>{t('rulesWin')}</strong></p>
              <p><strong>{t('rulesCascade')}</strong></p>
              <p><strong>{t('rulesScatter')}</strong></p>
              <ul className="rules-list">
                <li><strong>{t('rulesScatter3')}</strong></li>
                <li><strong>{t('rulesScatter4')}</strong></li>
                <li><strong>{t('rulesScatter5')}</strong></li>
              </ul>
              <p><strong>{t('rulesForestSpins')}</strong></p>
              <p><strong>{t('rulesGumleaf')}</strong></p>
              <p><strong>{t('rulesBillabong')}</strong></p>
              <p><strong>{t('rulesBet')}</strong></p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      <div className="balance-strip">
        <span className="balance">{t('balance')}: {balance != null ? formatDollars(balance) : '—'} <span className="currency">USD</span></span>
        {round?.win != null && Number(round.win) > 0 && (
          <span className="win-display highlight">{t('win')}: {formatDollars(round.win)}</span>
        )}
      </div>
      {winBreakdown && (
        <p className="win-breakdown">{t('winBreakdown')}: {winBreakdown} {t('winBreakdownHint')}</p>
      )}
      {winFromFeatureOnly && (
        <p className="win-breakdown">{t('winFromFeatureOnly')}: <strong>{featureName}</strong></p>
      )}
      {winIncludesFeature && (
        <p className="win-breakdown">{t('winIncludesFeature')}: <strong>{featureName}</strong></p>
      )}

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
          type="button"
          className="secondary bet-trigger-btn"
          onClick={() => setBetDropdownOpen(true)}
          disabled={loading}
          data-replay-keep
        >
          {t('bet')}: {betAmount} $
        </button>
      {betDropdownOpen && (
        <div className="bet-modal-overlay" onClick={() => setBetDropdownOpen(false)} role="dialog" aria-modal="true" aria-label={t('betChoose')}>
          <div className="bet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bet-modal-header">
              <h2 className="bet-modal-title">{t('betChoose')}</h2>
              <button type="button" className="bet-modal-close" onClick={() => setBetDropdownOpen(false)} aria-label={t('close')}>×</button>
            </div>
            <div className="bet-modal-body">
              {BET_OPTIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`bet-modal-option ${betAmount === val ? 'bet-modal-option-selected' : ''}`}
                  onClick={() => { setBetAmount(val); setBetDropdownOpen(false); }}
                >
                  {val} $
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
        <button
          onClick={() => handleSpin('BASE')}
          disabled={loading || (balance != null && Number(balance) < betAmountPrecision)}
          data-replay-keep
        >
          {t('spinNormal')}
        </button>
        <button
          onClick={() => handleSpin('SUPER')}
          disabled={loading || (balance != null && Number(balance) < betAmountPrecision)}
          data-replay-keep
        >
          {t('spinSuper')}
        </button>
      </div>

      <div className="corner-left">
        <button type="button" className="btn-corner" onClick={() => setRulesOpen(true)}>{t('rules')}</button>
      </div>
      <div className="corner-right">
        <button type="button" className="btn-corner" onClick={() => setHistoryOpen(true)}>{t('winHistory')}</button>
      </div>
      {historyOpen && (
        <div className="bet-modal-overlay history-overlay" onClick={() => setHistoryOpen(false)} role="dialog" aria-modal="true" aria-label={t('winHistory')}>
          <div className="bet-modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bet-modal-header">
              <h2 className="bet-modal-title">{t('winHistory')}</h2>
              <button type="button" className="bet-modal-close" onClick={() => setHistoryOpen(false)} aria-label={t('close')}>×</button>
            </div>
            <div className="history-modal-body">
              {winHistory.length === 0 ? (
                <p className="history-empty">{t('winHistoryEmpty')}</p>
              ) : (
                <ul className="history-list">
                  {winHistory.map((amount, i) => (
                    <li key={i}>{formatDollars(amount)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showFeature && featureEvent && (
        <FeatureOverlay
          lang={lang}
          feature={featureEvent.feature}
          data={featureEvent}
          bet={round?.bet != null ? Number(round.bet) : PRECISION}
          onClose={() => {
            setEventIndex(events.length - 1);
            setFeatureOverlayDismissed(true);
          }}
        />
      )}
    </div>
    </>
  );
}
