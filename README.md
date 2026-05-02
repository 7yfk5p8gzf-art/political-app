# Political App Starter

Ez egy Next.js + Tailwind starter projekt a politikai összehasonlító apphoz.

## Mit tud most?
- publikus kezdőlap
- comparison oldal
- contradiction oldal
- admin login
- role alapú mock auth localStorage-val
- admin dashboard
- review lista
- felhasználólista
- audit log

## Indítás
```bash
npm install
npm run dev
```

Utána nyisd meg:
- http://localhost:3000

## Demo belépések
- `foadmin@app.hu` / `demo123` → Főadmin
- `admin2@app.hu` / `demo123` → Admin
- `reviewer@app.hu` / `demo123` → Reviewer
- `editor@app.hu` / `demo123` → Szerkesztő

## Következő lépések
- Supabase auth
- adatbázis bekötése
- review actionök backenddel
- admin meghívásos rendszer
- AI import workflow
