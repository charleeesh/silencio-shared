# silencio-shared

Sdílený design system pro ekosystém **Silencio** — `hub`, `budgeting`, `cashflow`, `voicehub`, `set`. Jeden zdroj pravdy pro AppShell, auth flow, theme provider a design tokeny.

## Proč existuje

Před extrakcí žil identický kód ve čtyřech repech — `AppShell.tsx`, `ThemeProvider.tsx`, login/forgot/reset stránky, `index.css` s brand tokeny. Když se v jedné z nich opravil bug, ostatní zdrojily, dokud se to nepropsalo manuálním copy-paste. `silencio-shared` ten copy-paste řez.

## Kdo je canonical zdroj

**Tenhle balíček.** Změny designu se dělají tady a sub-apps si je berou bumpem tagu.

> **Historická poznámka.** Do fáze 6 byl canonical zdroj hub (`silencio/hub/src/`)
> a tenhle balíček byl jen jeho extrahovaný snapshot — proto starší verze README
> říkala „změny se dělají nejdřív v hubu, pak se portují sem". To už **neplatí**.
> Fáze 6 a 7 hub vykuchaly: dnes má `hub/src/` sedm souborů, žádné `components/`,
> `auth/` ani `theme/`, a jeho `index.css` neobsahuje jediný brand token —
> importuje je z `silencio-shared/tokens.css` úplně stejně jako každá sub-app.
> Hub je dnes konzument jako ostatní, jen s vlastním rozcestníkem.
> Opraveno 2026-08-11 při stavbě sub-app `set`.

## Interní dokumentace

Tenhle README je pro **konzumenty** (jak balíček používat). Vývojová dokumentace
balíčku je v:

- [CLAUDE.md](CLAUDE.md) — hot cache: příkazy, co vědět před sáhnutím na kód
- [docs/design-system.md](docs/design-system.md) — rodinová design pravidla (wordmark, karty, fonty, chipy, tabulky, tlačítka, favicon)
- [docs/rozhodnuti.md](docs/rozhodnuti.md) — proč je balíček postavený takhle + zamítnuté nápady

## Instalace

V `package.json` sub-app:

```json
{
  "dependencies": {
    "silencio-shared": "github:charleeesh/silencio-shared#v0.1.0"
  }
}
```

```bash
npm install
```

Bumpování verze: změň tag (`#v0.1.0` → `#v0.2.0`) a `npm update silencio-shared`.

## Použití

### 1. Importuj CSS tokeny

V hlavním globálním CSS sub-app (`src/index.css`):

```css
@import "tailwindcss";
@import "silencio-shared/tokens.css";
```

⚠️ **Tailwind v4 quirk:** `silencio-shared/tokens.css` **neimportuje** `tailwindcss` — sub-app si Tailwind taháт sama. Tokens jen rozšiřují `@theme` o brand barvy/fonty a hlídají `border-color` v `@layer base`.

### 2. Mountuj ThemeProvider

V `App.tsx`:

```tsx
import { ThemeProvider } from "silencio-shared";

export function App() {
  return (
    <ThemeProvider>
      {/* router … */}
    </ThemeProvider>
  );
}
```

### 3. AppShell + Auth

```tsx
import { Routes, Route } from "react-router-dom";
import {
  AppShell,
  RequireAuth,
  RedirectIfAuthed,
  LoginPage,
  ForgotPasswordPage,
  SetNewPasswordPage,
  ExpiredLinkPage,
} from "silencio-shared";

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthed><LoginPage appWordmark="Cashflow" /></RedirectIfAuthed>} />
      <Route path="/auth/forgot" element={<ForgotPasswordPage appWordmark="Cashflow" />} />
      <Route path="/auth/reset" element={<SetNewPasswordPage appWordmark="Cashflow" />} />
      <Route path="/auth/expired" element={<ExpiredLinkPage appWordmark="Cashflow" />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell appName="Cashflow">
              <Dashboard />
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
```

`appName` v `AppShell` = wordmark vedle loga (`[silencio] CASHFLOW`). `appWordmark` v auth pages = hero text na login screenu (`Silencio\nCashflow.`).

### 4. UI primitives

```tsx
import {
  MetricCard,
  PageHeader,
  PrimaryButton,
  SpotlightCard,
  NeutralChip,
  SignalChip,
  BrandChip,
  cn,
} from "silencio-shared";
```

### 5. Favicon

Sub-app `public/favicon.ico` musí být canonical Silencio favicon. Buď jednorázové překopírování z `node_modules/silencio-shared/public/favicon.ico` do `<sub-app>/public/favicon.ico`, nebo postscript v `package.json`:

```json
{
  "scripts": {
    "postinstall": "cp node_modules/silencio-shared/public/favicon.ico public/favicon.ico"
  }
}
```

## Peer dependencies

Balíček nic nebundluje. Sub-app musí mít nainstalované:

| Package | Verze |
|---|---|
| `react`, `react-dom` | `^19.0.0` |
| `react-router-dom` | `^7.0.0` |
| `tailwindcss` | `^4.0.0` |
| `@supabase/supabase-js` | `^2.0.0` |
| `lucide-react` | `>=0.400.0` |
| `clsx`, `tailwind-merge` | `^2 / ^3` |
| `react-hook-form` | `^7.0.0` |
| `@hookform/resolvers` | `^3 / ^4 / ^5` |
| `zod` | `^3 / ^4` |

Sub-app si nadále drží **vlastní Supabase client** v `src/lib/supabase.ts` pro schema-specific dotazy (`cashflow.*`, `voicehub.*`). Sdílený balíček si **interně** dělá vlastní `public.*` client z env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` pro auth + profiles (theme). Oba klienti sdílí session přes localStorage.

## Pasti při integraci

Pět věcí, které při napojení nové sub-app spolehlivě spálí půl hodiny. Všechny
jsou vykoupené krví — čísla v závorkách jsou, kde se to stalo poprvé.

### 1. Tailwind v4 nescanuje `node_modules` (hub fáze 6/C)

Bez `@source` se utility classes použité **uvnitř** shared komponent
(`light:hidden`, `text-silencio-lime`) nedostanou do generovaného CSS. Projev:
v Light mode jsou vidět obě loga přes sebe, brand barvy nefungují.

```css
@import "tailwindcss";
@import "silencio-shared/tokens.css";
@source "../node_modules/silencio-shared/dist";   /* ← tohle */
```

### 2. `optimizeDeps.exclude: ["silencio-shared"]` (hub fáze 6/C)

Bez excludu Vite předžvýká shared přes esbuild, které zachází s
`import.meta.env` jinak než Vite source-pipeline → runtime env vars se
neresolvují. Projev: „missing VITE_SUPABASE_URL", i když `.env` sedí.

### 3. …ale `react/jsx-runtime` musí být v `include` (set fáze 0, 2026-08-11)

Důsledek pastí č. 2: když je shared vyloučený, Vite nepředžvýká ani jeho import
`react/jsx-runtime`, který je CJS. Projev: **appka se vůbec nenamountuje**, bílá
stránka a v konzoli `does not provide an export named 'Fragment'`.

```ts
optimizeDeps: {
  include: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
  exclude: ["silencio-shared"],
}
```

### 4. Importuj `useSession`, nikdy `useAuth` (voicehub fáze 6/B)

`useAuth` je jen alias na `useSession`. Rolldown (Vite 8) má bug v re-export
aliasech → `import { useAuth }` spadne na `MISSING_EXPORT`. `useSession` funguje
vždy.

### 5. Shared nesmí číst env přes dot-access (v0.1.0–v0.1.2)

Interní kód balíčku nesmí psát `import.meta.env.VITE_X`. Vite library build (kde
`shared/.env` neexistuje) to staticky nahradí za `undefined` a Rollup celý blok
vytree-shakne jako dead code. Používej bracket-access
`(import.meta as any)["env"]["VITE_X"]` — Vite static analyzer ho nematchne, takže
zůstane runtime výrazem. Týká se jen kódu **uvnitř** tohohle balíčku.

### Vlastní Supabase klient sub-appky

Sub-app si drží vlastní klient se svým schématem (`set`, `cashflow`, `voicehub`).
**Nepředávej ho sharedu přes `setSupabaseClient()`**, pokud má nastavené
`db.schema` — shared čte `public.profiles` a s cizím schématem by hledal
`<schema>.profiles` a rozbil auth. Dva klienti sdílí session přes localStorage.

## Co balíček NEobsahuje

- **Per-app pages** (Dashboard, Projects, Transactions, atd.) — sub-app si vlastní.
- **Supabase typy** — každá sub-app má `database.types.ts` ze svého schema namespace.
- **Per-app routing** — sub-app má vlastní React Router config.
- **Per-app `.env` / Supabase client** — env vars jsou per-projekt v Vercelu.

## Žít s tím

Pokud chceš v jedné sub-app jiný styl než ve sdíleném:
- **Drobná odchylka** → override přes Tailwind classes (předej `className` propu) nebo wrapper komponent.
- **Větší změna** → udělej ji tady, v `silencio-shared`, a bumpni tag.

## Workflow pro update

1. Změna kódu v `silencio/shared/src/...`
2. **Ověř dopad na konzumenty** — viz „Co nesmí rozbít update" níž
3. Bump verze v `package.json` a doplň `CHANGELOG.md`
4. Commit + tag + push:
   ```bash
   git commit -am "v0.2.0: …"
   git tag v0.2.0
   git push origin main --tags
   ```
5. V sub-app, která tu změnu potřebuje, updatuj `package.json` (`#v0.1.0` → `#v0.2.0`) + `npm install`

Ke kroku 5: **nemusí se bumpovat všechny appky najednou.** Pokud je změna
aditivní, ostatní můžou zůstat na starém tagu, dokud ji nepotřebují — ušetří to
zbytečné deploymenty. Verzní skew je v pořádku, dokud je vědomý.

## Co nesmí rozbít update

Balíček konzumuje pět appek pinnutých na git tag. Rozbitá změna se **neprojeví
hned** — appka na starém tagu jede dál a spadne až při svém příštím bumpu, což
je zákeřnější než okamžitý fail. Proto před každým releasem:

**Grepni konzumenty na měněný symbol:**

```bash
cd ~/Documents/Webove_projekty/silencio
for r in hub budgeting cashflow voicehub set; do
  echo "=== $r ==="; grep -rn "NazevSymbolu" $r/src 2>/dev/null
done
```

**Co je bezpečné a co ne:**

| Změna | Dopad |
|---|---|
| Nový export, nová komponenta, nový CSS token | ✅ bezpečné |
| Přidání členu do union typu (`type X = "a" \| "b"` → `\| "c"`) | ⚠️ bezpečné **jen když** nikde není `Record<X, …>` — přidaný klíč z takového objektu udělá neúplný a build spadne |
| Nový povinný prop | ❌ rozbije každého konzumenta |
| Přejmenování/odebrání exportu | ❌ dtto |
| Změna chování existující komponenty | ❌ tiché, projeví se až v produkci |

Když změna musí být breaking, popiš v `CHANGELOG.md` migrační kroky pro
sub-appky — jako to dělá v0.3.0.

## Build

```bash
npm install
npm run build
```

Produkuje:
- `dist/index.js` — ESM bundle
- `dist/index.d.ts` — TypeScript typy
- `dist/tokens.css` — design tokeny
- `dist/assets/logo/silencio-{white,black}.png` — branding
- `public/favicon.ico` — canonical favicon (mimo `dist`)

## Licence

Private. Silencio FX s.r.o.
