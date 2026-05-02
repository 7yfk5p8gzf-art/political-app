# Login + admin setup

## Mit csináltam
- a mock localStorage login helyett Supabase auth alapú login került be
- az admin shell már valódi bejelentkezett felhasználót vár
- a sidebar szerepkör szerint mutat menüpontokat
- a felhasználólista most a `profiles` táblából jön
- a role módosítás a `profiles.role` mezőt frissíti
- bekerült egy SQL fájl is: `supabase/auth_setup.sql`

## Amit neked kell megcsinálni Supabase-ben
1. Nyisd meg a Supabase projektedet.
2. Menj az SQL Editorba.
3. Futtasd le a `supabase/auth_setup.sql` teljes tartalmát.
4. Authentication / Providers alatt az Email providert hagyd bekapcsolva.
5. Csinálj felhasználókat Auth > Users alatt vagy a login oldalon keresztül.
6. Az első főadmint állítsd be SQL-lel például így:

```sql
update public.profiles
set role = 'superadmin'
where email = 'foadmin@app.hu';
```

## Fontos env változók
Az `.env.local` fájlban kell lennie ezeknek:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Hol teszteld
- `/login`
- `/admin`
- `/admin/users`

## Megjegyzés
TypeScript ellenőrzés lefutott hibamentesen. A teljes `next build` itt a környezet miatt nem futott le, mert a Linuxos SWC csomagot online akarta letölteni, de internet nem volt a konténerben.
