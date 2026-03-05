# Покрокова інструкція: деплой гри на Vercel

Робіть **саме в цьому порядку**. Якщо проєкт на Vercel у вас уже є — краще його видалити і створити новий за цими кроками.

---

## Крок 1. Відкрити створення проєкту

1. Зайдіть на **https://vercel.com** і увійдіть у свій акаунт.
2. Натисніть кнопку **«Add New…»** (або **«New Project»**).
3. Оберіть **«Import Git Repository»** і знайдіть репо **BigPersik/forest-cluster** (або як у вас названий репо з грою).
4. Натисніть **«Import»** біля цього репо.

---

## Крок 2. Root Directory — залишити порожнім

1. Знайдіть блок **«Root Directory»**.
2. **Не вводьте** `client` — залиште поле **порожнім** (корінь репо).
3. У репо в корені вже є **vercel.json**: він задає збірку з папки `client` і вихід **client/dist**.
4. Якщо раніше було вказано `client` — видаліть це значення (Edit → очистити поле → зберегти).

Це обов’язково: Vercel має збирати саме папку **client**, а не корінь репо.

---

## Крок 3. Не перевизначайте Build та Output у Vercel

Щоб не було помилки «не знайдено вихідного каталогу dist», **не увімкуйте Override** для Build Command та Output Directory — тоді використовуватиметься **vercel.json** з репо:

- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/dist`

Якщо в Settings → General → Build and Development Settings у вас увімкнено **Override** і вказано Output Directory = **dist** — Vercel шукатиме **dist** у корені репо (його там немає; збірка створює **client/dist**). Вимкніть Override для Output Directory або вкажіть **`client/dist`**.

---

## Крок 4. Змінна середовища для RGS (обовʼязково)

1. Знайдіть блок **«Environment Variables»** (Змінні середовища).
2. У полі **Name** введіть: `VITE_RGS_URL`
3. У полі **Value** введіть URL вашого RGS на Render, наприклад:  
   `https://forest-cluster.onrender.com`  
   (без слеша в кінці, свій URL скопіюйте з Render.)
4. Оберіть середовище **Production** (і за бажанням Preview).
5. Натисніть **Add** (Додати).

**Важливо:** ця змінна підставляється **під час збірки**. Якщо ви додали її після першого деплою — обовʼязково зробіть **Redeploy**, інакше клієнт буде звертатися до `/rgs` на Vercel і ви побачите **HTTP 404** та **Balance: — USD**.

---

## Крок 5. Запустити деплой

1. Переконайтесь, що:
   - **Root Directory:** порожньо (корінь репо)
   - Build та Output беруться з **vercel.json** (Output = `client/dist`)
   - **Environment Variable:** `VITE_RGS_URL` = URL з Render (наприклад `https://forest-cluster.onrender.com`)
2. Натисніть **«Deploy»** (Розгорнути).
3. Дочекайтесь завершення збірки (зазвичай 1–2 хвилини).

Якщо все зроблено правильно, статус стане **«Ready»** і з’явиться посилання на сайт (на кшталт `https://forest-cluster-xxx.vercel.app`). Це посилання можна надсилати друзям для гри.

---

## Перед тим як натиснути Redeploy

- **Settings → Environment Variables:** є змінна **`VITE_RGS_URL`** = `https://forest-cluster.onrender.com` (Production).
- **Root Directory** порожній; **Override** для Output Directory вимкнено (або вказано `client/dist`).

Після цього можна натискати **Redeploy**.

---

## Якщо проєкт уже існує — лише виправити налаштування

1. Відкрийте проєкт на Vercel.
2. Ліва колонка → **Settings** (Налаштування).
3. Відкрийте **General** і прокрутіть вниз **або** відкрийте **Build and Deployment** (якщо є такий пункт).
4. Знайдіть блок із налаштуваннями збірки (Build / Framework / Output).
5. **Вимкніть Override** для Output Directory (щоб використовувався vercel.json з репо).
6. Якщо Override увімкнено — у полі **Output Directory** вкажіть **`client/dist`** (не `dist` і не `public`).
7. **Root Directory** залиште порожнім.
8. Збережіть (Save).
9. Вкладка **Deployments** → останній деплой → **⋯** (три крапки) → **Redeploy**.

---

## Коротко

| Що налаштувати   | Значення |
|------------------|----------|
| Root Directory   | порожньо (корінь репо) |
| Build / Output   | з **vercel.json** (Output = `client/dist`) |
| Змінна           | `VITE_RGS_URL` = `https://ваш-rgs.onrender.com` |

Помилка «не знайдено вихідного каталогу dist» зникає, коли Output Directory = **`client/dist`** (або Override вимкнено і використовується vercel.json).

---

## Чому та сама помилка знову з’являється?

Якщо Vercel знову пише «не знайдено вихідного каталогу dist», майже завжди це одне з двох:

### 1. У Vercel увімкнено Override і вказано «dist»

Налаштування з дашборду **мають пріоритет** над `vercel.json`. Якщо в **Settings → General → Build and Development Settings** увімкнено **Override** для **Output Directory** і в полі вказано **`dist`**, Vercel ігнорує наш `vercel.json` і шукає папку **`dist`** у корені репо (її там немає).

**Що зробити:**  
Вимкніть **Override** для Output Directory (перемикач вимкнено — тоді використовується `vercel.json` з репо з полем `"outputDirectory": "client/dist"`).  
Або залиште Override увімкненим, але в полі введіть **саме** `client/dist`, а не `dist`.  
Збережіть і зробіть **Redeploy**.

### 2. Збірка на Vercel не відпрацьовує — папка не створюється

Якщо команда збірки падає з помилкою (наприклад, `npm install` або `vite build`), папка **client/dist** взагалі не з’являється, і Vercel показує ту саму помилку.

**Що зробити:**  
Відкрийте останній деплой → вкладка **Building** / логи збірки. Перевірте, чи завершується без помилок команда типу `cd client && npm install && npm run build`. Якщо бачите червоні помилки — виправте їх (залежності, версія Node тощо).

**Перевірка локально:** у терміналі в корені репо виконайте:

```bash
cd client && npm install && npm run build
```

Після успішного виконання має з’явитися папка **client/dist**. Якщо локально збірка проходить, а на Vercel ні — дивіться логи збірки на Vercel.

---

## На екрані HTTP 404 і Balance: — USD

Це означає, що клієнт (на Vercel) не може досягти RGS (на Render): запит йде не туди або RGS не відповідає.

**Що зробити:**

1. **Перевірте змінну на Vercel:**  
   **Settings → Environment Variables.** Має бути **`VITE_RGS_URL`** = `https://forest-cluster.onrender.com` (або ваш URL RGS на Render), без слеша в кінці. Середовище — **Production**.

2. **Після додавання або зміни змінної обовʼязково зробіть Redeploy.**  
   У Vite `VITE_*` підставляються під час збірки. Якщо змінну додали після деплою, старий білд використовує `/rgs` → запит йде на сам Vercel → 404.  
   **Deployments** → останній деплой → **⋯** → **Redeploy**.

3. **Перевірте RGS на Render:**  
   Відкрийте у браузері `https://forest-cluster.onrender.com` — сервер має відповідати. Якщо сервіс «засинає», перший запит може бути повільним; дочекайтесь або перезапустіть сервіс на Render.
