# Changelog

Verzování podle [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Distribuce přes git tagy (`vX.Y.Z`), žádný npm registry.

## v0.5.0 — 2026-08-11

### Added

- **`AppShell` má slot `nav`** — navigace sub-appky se vykresluje v hlavičce
  **vedle wordmarku** (`[logo] SET  Projekty  Adresář`), což je layout, který
  rodina používá. Prop je volitelný, takže appky bez navigace se nezmění.
- **`AppNavLink`** — položka té navigace se sjednoceným stylem. Aktivní se
  odlišuje jen tučností a plnou barvou textu, žádné podtržení ani pozadí.

```tsx
<AppShell
  appName="Set"
  nav={
    <>
      <AppNavLink to="/" end>Projekty</AppNavLink>
      <AppNavLink to="/adresar">Adresář</AppNavLink>
    </>
  }
>
```

### Proč to vzniklo

Shared `AppShell` slot pro navigaci neměl, takže **cashflow si celý AppShell
naforkovalo** (`cashflow/src/components/AppShell.tsx`), aby menu do hlavičky
dostalo — přesně ten copy-paste drift, kvůli kterému tenhle balíček vznikl.
Set na to narazil jako druhý v pořadí; místo třetí kopie přibyl slot sem.

Cashflow fork tím pádem může zaniknout — jeho AppShell se od sdíleného liší
už jen tím, že má místo `UserMenu` prosté tlačítko „Odhlásit se" (stav před
user managementem). **Migrace cashflow není součástí tohohle releasu**, sister
repy se nemění bez Karlova vědomí. Až na to dojde: smazat lokální `AppShell.tsx`
a `NavLink.tsx`, importovat `AppShell` + `AppNavLink` ze sharedu.

### Ověření dopadu

Grep konzumentů: hub, budgeting, voicehub i set volají `<AppShell>` bez `nav`.
Prop je volitelný → aditivní, nic se nerozbije. Cashflow konzumuje vlastní
kopii, takže se ho změna netýká vůbec.

## v0.4.2 — 2026-08-11

### Fixed

- **`ChangePasswordModal` tiše polykal chybu RLS** — dlužná oprava, naplánovaná
  10. 8. jako „v0.3.1", která nikdy neproběhla. `supabase.update()` při zamítnutí
  RLS **nevyhazuje výjimku**, vrací `{ error }`. Kód návratovou hodnotu ignoroval
  → `setSuccess(true)` i po neúspěšném UPDATE → uživatel věřil, že má heslo
  změněné, ale `must_change_password` zůstalo `true` → při dalším načtení zase
  zamčený forced modal bez úniku. Teď se `error` kontroluje a vyhodí.

  Kořenová příčina (chybějící `GRANT EXECUTE` na `current_user_role()`) byla
  opravena v DB 10. 8., takže se to dnes nespustí. Tohle je obrana proti
  jakémukoli budoucímu RLS zamítnutí. Týká se **ne-adminů** — admin projde
  short-circuitem na `user_is_admin()`, proto to Karel nikdy neviděl.

### Docs

- **README opraven na realitu.** Tvrdil, že canonical zdroj designu je
  `silencio/hub/src/` a tenhle balíček je jen jeho snapshot — což přestalo platit
  po fázích 6 a 7, které hub vykuchaly. Dnes má `hub/src/` sedm souborů, žádné
  `components/`/`auth/`/`theme/`, a brand tokeny importuje odsud jako každá
  sub-app. Canonical je nadále tenhle balíček; historie je v README zachovaná.
- **Nová sekce „Pasti při integraci"** — pět gotchas, které dosud žily jen
  v Karlově memory, ne v repu: `@source` pro Tailwind v4, `optimizeDeps.exclude`,
  nově objevený `react/jsx-runtime` v `include`, `useSession` místo `useAuth`,
  a zákaz dot-access na `import.meta.env` uvnitř balíčku.
- **Nová sekce „Co nesmí rozbít update"** — grep konzumentů před releasem
  a tabulka bezpečných vs. breaking změn. Pozor hlavně na `Record<UnionType, …>`:
  widening unionu je jinak bezpečné, ale takový objekt rozbije.
- Workflow upraven: **nemusí se bumpovat všechny appky najednou**, aditivní
  změna může zůstat nevyzvednutá, dokud ji appka nepotřebuje.

## v0.4.1 — 2026-08-11

### Added

- **`--color-silencio-amber`** (`oklch(78% 0.16 65)`) — čtvrtý brand akcent.
  Hub měl jen lime / blue / magenta, což se čtyřmi sub-app kartami nevyšlo.
  Amber je přiřazený Setu (`utility: text-silencio-amber`, `bg-silencio-amber`).

## v0.4.0 — 2026-08-11

### Added

- **Sub-app klíč `set`** — nová sub-app Silencio Set (plánování natáčecího dne
  + call sheet). Aditivní rozšíření na čtyřech místech:
  - `SubAppKey` = `'budgeting' | 'cashflow' | 'voicehub' | 'set'`
  - `SubApp` (odvozený z `BASE_URL`) rozpoznává `/set/` → `'set'`
  - `RequireSubAppAccess` DEFAULT_APP_NAMES: `set → "Set"`
  - `AdminUsersPage` SUB_APP_OPTIONS: checkbox "Set"

### Vyžaduje DB migraci

`public.profiles.sub_apps` má CHECK constraint, který nový klíč musí povolit:

```sql
alter table public.profiles drop constraint profiles_sub_apps_check;
alter table public.profiles add constraint profiles_sub_apps_check
  check (sub_apps <@ array['budgeting','cashflow','voicehub','set']::text[]);
```

Bez ní `AdminUsersPage` uloží `sub_apps` s `'set'` → constraint violation.
Widening constraintu je bezpečné, existující řádky vyhoví.

### Poznámka pro sister repy

Změna je čistě aditivní — budgeting/cashflow/voicehub můžou zůstat na v0.3.0.
Hub by měl bumpnout na v0.4.0, aby v AdminUsersPage nabídl checkbox "Set".

## v0.3.0 — 2026-05-26

### Added

- **`RequirePasswordReady`** — globální gate komponent přesunutý z hubu do
  sharedu, aby ho mohly sub-appky stejně používat. Zobrazí forced
  ChangePasswordModal kolem children, pokud `profile.must_change_password=true`.
- **`RequireSubAppAccess`** — guard komponent pro sub-app routes. Bere
  `subApp` prop (`'budgeting' | 'cashflow' | 'voicehub'`) a ověří, že
  `profile.sub_apps` ho obsahuje. Admin projde vždy. Pokud user nemá přístup,
  zobrazí "Přístup zamítnut" page s odkazem zpět na hub.

### Migration guide pro sub-appky

Nahradit ve sub-app root:

```tsx
// Před
<RequireAuth>
  <App />
</RequireAuth>

// Po
<RequireAuth>
  <RequirePasswordReady>
    <RequireSubAppAccess subApp="budgeting">
      <App />
    </RequireSubAppAccess>
  </RequirePasswordReady>
</RequireAuth>
```

Hub stejně, ale bez `RequireSubAppAccess` (hub home filtruje karty sám podle
`profile.sub_apps`).

## v0.2.1 — 2026-05-26

### Fixed

- **`import.meta.env.DEV` DCE bug v `AppShell.HubHomeLink` a `UserMenu`** —
  v0.2.0 a dříve měly dot-access `import.meta.env.DEV`, který Vite library
  build inline-replacoval konstantou ze shared kontextu (`false`, protože
  shared build neměl Vite dev). Důsledek: v dev hubu kliknutí na logo / na
  "Správa uživatelů" v UserMenu poslalo na produkční `hub.silencio.cz`
  místo lokálního routeru. Stejný DCE pattern jako u env vars ve v0.1.0–v0.1.2
  `supabase.ts`. Fix: nová `isDevMode()` funkce v `lib/constants.ts` čte
  `DEV` přes bracket-access.

### Added

- **`isDevMode()`** export z `silencio-shared` — runtime detekce dev modu,
  bezpečná pro library mode buildy.

## v0.2.0 — 2026-05-26

### Added — User management

- **`UserMenu`** dropdown v `AppShell` — nahrazuje plain `Odhlásit se` button.
  Položky: *Změnit heslo*, *Správa uživatelů* (jen admin), *Odhlásit se*.
  Admin URL je override-able přes nový `AppShell` prop `adminUrl` (default:
  dev hub → `/admin/users`, sub-app/prod → `https://hub.silencio.cz/admin/users`).
- **`ChangePasswordModal`** — modal pro change-password flow. Podporuje
  `forced` mode pro `must_change_password` gating (bez křížku, bez backdrop
  close).
- **`AdminUsersPage`** — plnoformátová admin stránka. List uživatelů,
  create/edit/delete modaly, dva módy reset hesla (dočasné heslo /
  email link). Sama si guarduje admin role.
- **`useCurrentProfile`** hook — načte `public.profiles` row pro aktuální
  session (role, sub_apps, must_change_password, …). Reload přes `refresh()`.
- **`adminApi`** — thin wrapper kolem edge function `admin-users`:
  `listAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`,
  `resetAdminUserPassword`.

### Changed

- `AppShell` má nový prop `adminUrl` (volitelný override pro UserMenu).
- `AppShell` už nepoužívá `useNavigate`/`signOut` přímo — sign-out logika
  je v UserMenu.

### DB foundation (migrace 30 v `dduwconnyjoloykfsscz`)

- `public.profiles.email` (kopie z `auth.users.email`, sync trigger)
- `public.profiles.sub_apps text[]` s CHECK constraintem na
  `{budgeting, cashflow, voicehub}`
- `public.profiles.must_change_password boolean`
- Trigger `handle_new_user` → vytvoří profile při `auth.users` INSERT
- RLS: admin INSERT/DELETE policy na `profiles`

### Edge function

- `admin-users` — router-style endpoint pro list/create/update/delete/reset.
  Ověřuje admin role uvnitř (JWT → profiles.role), pro skutečnou operaci
  používá service-role klient.

## v0.1.3 — 2026-05-22

### Fixed

- **Kritický runtime bug v `supabase` exportu** — v0.1.0–v0.1.2 měly dist
  `dist/index.js` redukovaný jen na `function le() { throw "missing
  VITE_..." }`, protože Vite library build inline-replaceoval
  `import.meta.env.VITE_SUPABASE_URL` na `undefined` (shared adresář nemá
  `.env`), Rollup pak tree-shaknul celý `createClient` blok jako dead code.
  Sub-app at runtime nedostala funkční klient → `useSession`/`RequireAuth`/
  `ThemeProvider` padaly s "missing VITE_SUPABASE_URL" i když sub-app
  vars správně nastavila. Fix: env-var read přes bracket-access
  (`(import.meta as any)["env"]["VITE_..."]`), který Vite static analyzer
  nematchuje, takže reference zůstává runtime.

### Added

- **`setSupabaseClient(client)` export** — explicitní initialization path.
  Sub-app v `main.tsx` může předat svůj vlastní Supabase klient sharedu
  (tím se auth + theme persist sdílí stejnou instanci jako doménová data).
  Pokud sub-app nezavolá, shared si nadále vytvoří vlastní klient z env
  vars (fallback path, viz fix výše).

## v0.1.2 — 2026-05-22

### Fixed

- **`supabase` export je teď lazy přes Proxy** — předchozí top-level `throw new Error(...)` na chybějících env vars způsoboval dead-code elimination za throwem v Rolldown/Vite 8 buildu sub-app, takže named exports z bundle (`AppShell`, `useAuth`, `PrimaryButton`, atd.) nešly importovat (`MISSING_EXPORT` error). Lazy init odloží env check až na první přístup k `supabase.xyz`, takže parsing modulu projde čistě a sub-app build vidí všechny exporty.

## v0.1.1 — 2026-05-22

### Fixed

- **`prepare` script** přidán do `scripts` → npm automaticky spustí `npm run build` po `npm install` v sub-app. Bez toho sub-app dostala package bez `dist/` adresáře (git deps neberou v potaz `files` field jako `npm publish`), takže `import { AppShell } from "silencio-shared"` selhalo s "Cannot find module". Nyní instalace přes git dep funguje out-of-the-box.

## v0.1.0 — 2026-05-22

Initial extract z hub canonical zdroje + voicehub. Plánovaná Fáze 6 z hub progressu.

### Added

- **Design tokens** (`tokens.css`) — Tailwind v4 `@theme` s Inter / Space Grotesk / Archivo Black fonty, lime/blue/magenta brand barvami, dark default `:root` + `.light` custom variant. Plus border-color fix v `@layer base` (Tailwind v4 + shadcn compat).
- **Komponenty**: `AppShell` (s interním `HubHomeLink` pro dev/prod větvení), `SpotlightCard`, `MetricCard` (generic `ReactNode` value + `children` slot + `onClick`/`active`/`accent`), `PageHeader`, `PrimaryButton`.
- **Auth**: `RequireAuth` + `RedirectIfAuthed` (`AuthRoute` alias), `useSession` (`useAuth` alias), full pages `LoginPage` / `ForgotPasswordPage` / `SetNewPasswordPage` / `ExpiredLinkPage` (každá přes `appWordmark` prop), `mapAuthError` s česky lokalizovanými hláškami.
- **Auth primitives**: `AuthLayout` (s `appWordmark` propem), `AuthHeading`, `AuthLink`, `FormError`, `Logo`, `UnderlineInput`, `PasswordInput`.
- **Theme**: `ThemeProvider`, `useTheme`/`useThemePreference`, `ThemeToggle`, persist do `public.profiles.theme_preference` přes interní Supabase client.
- **Chips**: `NeutralChip`, `SignalChip` (text-only lime/blue/magenta), `BrandChip` (bg/15 + brand text).
- **Lib**: `cn()`, `HUB_HOME_URL`, `getCurrentSubApp()`, expose `supabase` (interní klient pro `public.*` schema).
- **Assety**: `silencio-{white,black}.png` logo, canonical `favicon.ico`.

### Notes

- Vite library mode, ESM only.
- Sub-app musí nastavit env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` — bez nich balíček hodí error při startu.
- Sub-app si nadále nese vlastní Supabase client pro per-schema doménová data (cashflow/voicehub). Session sdílena přes localStorage.
