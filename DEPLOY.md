# Деплой Forest Cluster на безкоштовний хост

Гра складається з **клієнта** (сайт) і **RGS** (сервер). Потрібні два безкоштовні хости.

---

## 1. RGS (сервер) на Render.com

1. Зареєструйся на [render.com](https://render.com) (безкоштовно).
2. **New → Web Service**.
3. Підключи репозиторій з проєктом (GitHub/GitLab). Якщо коду ще немає в репо — спочатку зроби `git init`, додай файли і запуш у GitHub.
4. Налаштування:
   - **Root Directory:** залиш порожнім (корінь репо).
   - **Runtime:** Node.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Натисни **Create Web Service**.
6. Після деплою скопіюй URL сервісу, наприклад:  
   `https://forest-cluster-rgs.onrender.com`  
   Це твій **RGS URL** — він потрібен для клієнта.

**Важливо:** на безкоштовному плані Render засинає після ~15 хв без запитів. Перший запит після цього може йти 30–60 с — це нормально.

---

## 2. Клієнт (сайт) на Vercel

1. Зареєструйся на [vercel.com](https://vercel.com) (безкоштовно).
2. **Add New → Project** і підключи той самий репозиторій.
3. Налаштування:
   - **Root Directory:** натисни **Edit** і вкажи папку **`client`**.
   - **Framework Preset:** Vite (Vercel підхопить автоматично).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** — додай змінну:
   - **Name:** `VITE_RGS_URL`
   - **Value:** твій RGS URL з кроку 1, наприклад:  
     `https://forest-cluster-rgs.onrender.com`  
   (без слеша в кінці)
5. Натисни **Deploy**.

Після деплою Vercel дасть посилання на сайт, наприклад:  
`https://forest-cluster-xxx.vercel.app` — його можна кидати друзям.

---

## Якщо репо ще не на GitHub

У папці проєкту виконай:

```bash
cd "d:\Work\Test program\koala-cluster"
git init
git add .
git commit -m "Forest Cluster game"
```

Далі створи новий репозиторій на GitHub і зроби:

```bash
git remote add origin https://github.com/ТВІЙ_ЛОГІН/forest-cluster.git
git branch -M main
git push -u origin main
```

Після цього підключай цей репо до Render і Vercel, як у кроках вище.

---

## Перевірка

1. Відкрий посилання з Vercel.
2. Має з’явитися гра, баланс (наприклад $100.00) і кнопки Spin.
3. Якщо з’явиться помилка типу "Auth failed" або "Play failed" — перевір, що:
   - RGS на Render у статусі **Live**,
   - у Vercel в змінних задано **VITE_RGS_URL** з правильним URL RGS (без слеша в кінці).

Готове посилання на гру можна надсилати друзям.
