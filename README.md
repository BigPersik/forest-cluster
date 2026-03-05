# Koala Cluster — 7×7 Stake Engine Slot

Слот-гра з сіткою **7×7**, кластерними виплатами (мін. 5 по горизонталі/вертикалі), каскадами з гравітацією вниз та повною відповідністю **Stake Engine** (stateless RGS, Replay, Social).

## Вимоги (здійснено)

- **Архітектура:** Stateless, результати спіна в момент ініціації, RGS — єдине джерело результатів, Replay Mode, Social Mode, версіонування збірок.
- **Логіка:** Сітка 7×7, кластери тільки по горизонталі та вертикалі, мін. 5 символів, каскади з гравітацією вниз, повністю детермінований RNG, без клієнтської рандомізації.
- **Режими:** NORMAL, SUPER (RTP 96.50%), Direct Feature Entry без зміни RTP.
- **Фічі:** Koala Spins, Gumleaf Grove, Billabong Bonus; стан фіч повністю в події ставки; попередньо розраховані pick-результати; без прогресивних джекпотів.
- **Replay:** Піксельно ідентичне відтворення, без live-елементів, повна детермінованість.
- **UI:** Адаптивний, під усі роздільності Stake, 60 FPS, оптимізація під мобільні, без витоку пам’яті.

## Структура

```
koala-cluster/
├── math/           # Математика гри (детермінований RNG, кластери, каскади, фічі)
├── rgs/            # Mock RGS сервер (Stake Engine API)
├── client/        # React-клієнт (7×7 сітка, Replay, фічі)
└── library/       # Після симуляції: books, lookup tables, index.json, RTP звіт
```

## Запуск

```bash
cd koala-cluster
npm install
npm run dev
```

- RGS: `http://localhost:3333`
- Клієнт: `http://localhost:5173` (проксує `/rgs` на RGS)

Параметри URL клієнта (як у Stake):  
`?sessionID=...&lang=en&device=desktop&rgs_url=/rgs`

## Симуляція та математика

- **Мінімум 100M симуляцій на режим** (NORMAL, SUPER).
- Звіт: RTP ±0.05%, hit frequency, волатильність, частота фіч, валідація макс. виграшу.

Швидка перевірка (1M спінів на режим):

```bash
cd math && node run-simulation.js --quick
```

Повна симуляція (100M):

```bash
cd math && node run-simulation.js
```

Результати:

- `library/books/books_base.jsonl`, `books_super.jsonl`
- `library/lookup_tables/lookUpTable_base.csv`, `lookUpTable_super.csv`
- `library/publish_files/index.json` (версія збірки в полі `version`)
- `library/rtp_report.json` — RTP, hit freq, volatility, feature freq, max win

**Примітка:** Поточні ваги в `math/constants.js` дають сирий RTP (не 96% / 96.5%). Для ±0.05% потрібен крок оптимізації ваг (на кшталт Stake math-sdk): симуляція → аналіз → підбір ваг у lookup table → повтор до досягнення цільового RTP.

## RGS API (mock)

- `POST /wallet/authenticate` — sessionID → balance, config, round
- `POST /play` — amount, sessionID, mode (BASE|SUPER), опційно `featureEntry`: `koala_spins` | `gumleaf_grove` | `billabong_bonus`
- `POST /wallet/end-round`
- `POST /bet/event` — збереження стану фіч у події

Гроші: 6 знаків після коми (1 = 1_000_000).

## Режими та фічі

| Режим   | RTP (ціль) | Опис                          |
|---------|------------|-------------------------------|
| NORMAL  | 96.00%     | Базовий кластерний режим      |
| SUPER   | 96.50%     | Окрема математика, вищі виплати |

| Фіча          | Тригер (скеттери) | Опис                    |
|---------------|--------------------|-------------------------|
| Koala Spins   | 3                  | Безкоштовні спіни       |
| Gumleaf Grove | 4                  | Pick-гра (мультиплікатори) |
| Billabong Bonus | 5                | Pick мультиплікаторів   |

Direct Feature Entry: у запиті `/play` передати `featureEntry: "koala_spins"` (або інший) — раунд буде з відповідною фічею; RTP не змінюється (підбір seed з пулу результатів з цією фічею).

## Версіонування

Версія математики задається в `math/constants.js` (paytable, weights). Зміни потребують повторної симуляції та оновлення `library/` та `publish_files/`.
