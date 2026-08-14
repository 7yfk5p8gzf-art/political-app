# Political Compare MVP

Next.js + Supabase alapú politikai összehasonlító MVP.

## Fő funkciók

- publikus kezdőlap
- publikus comparison és contradiction oldalak, forrásokkal, AI-összefoglalóval és szavazással
- Supabase Auth alapú bejelentkezés és szerepkörös admin felület
- forrás- és contradiction-kezelés, review/publish workflow
- comparison-kezelés
- felhasználó- és szerepkör-kezelés
- audit log és AI-generálás/keresés
- production RLS, UUID foreign key és orphan vote cleanup/migration SQL-ek

## Indítás
```bash
npm install
npm run dev
```

Utána nyisd meg:
- http://localhost:3000

## Ellenőrzés

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build:ci
```

Éles futtatáshoz a Supabase és az AI szolgáltatás valódi környezeti változóit kell a deployment secret store-ban beállítani. A production adatbázis SQL-eit a `supabase/` könyvtár tartalmazza; ezeket nem futtatja a build vagy a CI.
