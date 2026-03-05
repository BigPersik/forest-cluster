import React from 'react';

export function FeatureOverlay({ feature, data, onClose }) {
  const title =
    feature === 'koala_spins' ? 'Forest Spins' :
    feature === 'gumleaf_grove' ? 'Gumleaf Grove' :
    feature === 'billabong_bonus' ? 'Billabong Bonus' : 'Bonus';

  return (
    <div className="feature-panel">
      <div className="modal-box">
        <h2>{title}</h2>
        {feature === 'koala_spins' && (
          <p>Free spins: {data.spinCount} — Total win: ${(data.totalWin ?? 0).toFixed(2)}</p>
        )}
        {feature === 'gumleaf_grove' && (
          <>
            <p>Picks:</p>
            <div className="picks">
              {(data.picks ?? []).map((p, i) => (
                <span key={i} className="pick-item">${(p.multiplier ?? p).toFixed(2)}</span>
              ))}
            </div>
            <p>Total: ${(data.totalMultiplier ?? 0).toFixed(2)}</p>
          </>
        )}
        {feature === 'billabong_bonus' && (
          <>
            <p>Multipliers:</p>
            <div className="picks">
              {(data.picks ?? []).map((p, i) => (
                <span key={i} className="pick-item">${Number(p).toFixed(2)}</span>
              ))}
            </div>
            <p>Total: ${(data.totalMultiplier ?? 0).toFixed(2)}</p>
          </>
        )}
        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}
