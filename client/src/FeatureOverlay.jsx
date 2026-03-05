import React from 'react';
import { translations } from './translations';

const PRECISION = 1e6;

/** multiplier: math units (e.g. 2.5x). bet: in precision units. Returns USD string. */
function multiplierToUsd(multiplier, bet) {
  const b = Number(bet) || PRECISION;
  return ((multiplier ?? 0) * (b / PRECISION)).toFixed(2);
}

export function FeatureOverlay({ feature, data, bet, onClose, lang = 'ua' }) {
  const t = (key) => (translations[lang] && translations[lang][key]) || translations.ua[key] || key;
  const title =
    feature === 'koala_spins' ? t('featureForestSpins') :
    feature === 'gumleaf_grove' ? t('featureGumleaf') :
    feature === 'billabong_bonus' ? t('featureBillabong') : t('featureBonus');

  return (
    <div className="feature-panel">
      <div className="modal-box">
        <h2>{title}</h2>
        {feature === 'koala_spins' && (
          <p>{t('featureFreeSpins')}: {data.spinCount} — {t('featureTotalWin')}: ${multiplierToUsd(data.totalWin, bet)}</p>
        )}
        {feature === 'gumleaf_grove' && (
          <>
            <p>{t('featurePicks')}:</p>
            <div className="picks">
              {(data.picks ?? []).map((p, i) => (
                <span key={i} className="pick-item">${multiplierToUsd(p.multiplier ?? p, bet)}</span>
              ))}
            </div>
            <p>{t('featureTotal')}: ${multiplierToUsd(data.totalMultiplier, bet)}</p>
          </>
        )}
        {feature === 'billabong_bonus' && (
          <>
            <p>{t('featureMultipliers')}:</p>
            <div className="picks">
              {(data.picks ?? []).map((p, i) => (
                <span key={i} className="pick-item">${multiplierToUsd(Number(p), bet)}</span>
              ))}
            </div>
            <p>{t('featureTotal')}: ${multiplierToUsd(data.totalMultiplier, bet)}</p>
          </>
        )}
        <button type="button" onClick={onClose}>{t('featureContinue')}</button>
      </div>
    </div>
  );
}
