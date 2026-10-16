# Rodina Silencio — rozcestník

**Jediné místo**, odkud se dá zjistit, kde je jaká informace o rodině appek
Silencio, jaké verze knihoven kde běží a co je potřeba změnit jinde, když se
mění něco v jedné appce. Každá appka na tenhle soubor odkazuje ze svého
`CLAUDE.md`. Založeno 2026-10-16.

> **Tohle repo je public.** Sem nepatří nic citlivého — ID Supabase projektu,
> uživatelé, e-maily, klíče. To žije v `silencio-hub/docs/` (private).

Repa leží vedle sebe ve složce `silencio/` — na Macu `~/Documents/Webove_projekty/silencio/`,
na VPS `~/Webove_projekty/silencio/`. Odkazy níž jsou relativní k té složce.

## Appky

| Repo | Co to je | Adresa | Dev port | DB schéma |
|---|---|---|---|---|
| `hub` | rozcestník, **přihlašovací brána**, správa uživatelů, proxy sub-appek | `hub.silencio.cz/` | 5174 | `public` (`profiles`) |
| `budgeting` | rozpočty (cost estimates) + PDF, vyúčtování | `/budget/` | 5173 | `public.*` (vědomá výjimka) |
| `cashflow` | cashflow, cache faktur a nákladů z Fakturoidu | `/cashflow/` | 8080 | `cashflow.*` |
| `voicehub` | VoiceHub — nabídky, ceník, projekty | `/voice/` | 8080 ⚠️ | `voicehub.*` |
| `set` | Set — štáb, lokace, timing, call sheet | `/set/` | 8081 | `set.*` |
| `shared` | balíček: design system, AppShell, auth obrazovky, tokeny | git tag | — | `public` (interní klient) |

Každá sub-appka je vlastní Vercel projekt `silencio-<repo>` a hub ji proxuje
pod svou doménou. Login je **jen** na hubu, sub-appky na něj přesměrují.

⚠️ cashflow a voicehub mají oba dev port 8080 — naráz poběží jen jedna na
svém portu, Vite druhé dá nejbližší volný (a to je 8081 = Setu).

## Kde je jaká informace

| Hledáš | Kde |
|---|---|
| Design — wordmark, karty, fonty, chipy, tabulky, tlačítka, favicon | `shared/docs/design-system.md` |
| Integrační pasti nové appky (Tailwind `@source`, `optimizeDeps`, `jsx-runtime`, `useSession`) | `shared/README.md`, sekce „Pasti při integraci" |
| Proč je shared postavený takhle, verzování, peer deps | `shared/docs/rozhodnuti.md` |
| Co se ve které verzi sharedu změnilo | `shared/CHANGELOG.md` |
| Login, role, `profiles.sub_apps`, edge funkce `admin-users` | `hub/docs/uzivatele.md` |
| Rewrites, proxy, trailing slash, **checklist nové sub-appky** | `hub/docs/routing.md` |
| Sdílený Supabase projekt, schémata, RLS `has_sub_app` | `hub/docs/architektura.md` |
| Doména, DNS, env proměnné | `hub/docs/nasazeni.md` + `nasazeni.md` každé appky |
| Doména konkrétní appky (rozpočet, Fakturoid, nabídky, call sheet) | `<appka>/CLAUDE.md` → její `docs/` |
| Celorodinové změny (sjednocení verzí, updaty) | tenhle soubor, sekce [Log](#log-celorodinových-změn) |

Každá appka má stejnou kostru: `CLAUDE.md` (hot cache, čte se první) a `docs/`
s `architektura.md`, `rozhodnuti.md`, `pasti.md`, `nasazeni.md`, `historie.md`
(+ doménové soubory). Shared místo `historie.md` vede `CHANGELOG.md`.

## Pravidla celé rodiny

- **Dokumentace žije v repech, ne v paměti Claude Code** (od 2026-08-14) —
  repa se mezi Macem a VPS synchronizují přes GitHub, paměť ne.
- **Jen `main`, žádné worktrees** (Karel 2026-10-16). Commit průběžně, push jen
  na vyžádání. Po připojení ke stroji `gsync`.
- **Migrace se do rep nepřidávají** — jdou přes Supabase MCP, historii vede
  Supabase, popis schématu je v `docs/architektura.md` appky.
- **Design se mění jen v shared** + bump tagu, žádný copy-paste do appek.
- **Data patří týmu**: RLS přes `has_sub_app('<app>')`, ne vlastnictví řádku.
- **Závislosti: patch/minor klidně, major jen po domluvě s Karlem.** Rozdíl
  verzí mezi appkami je OK, dokud je **zapsaný v tabulce níž**.

## Verze (stav k 2026-10-16)

Aktuální stav vypíše `node shared/scripts/rodina-stav.mjs` (`--audit` přidá
`npm audit`, `--fetch` napřed stáhne stav z GitHubu). Tabulka je stav, který
platí na GitHubu; lokální checkout bez `gsync` + `npm install` může ukazovat starší.

| | hub | budgeting | cashflow | voicehub | set | shared |
|---|---|---|---|---|---|---|
| React | 19.2 | 19.2 | 19.2 | 19.2 | 19.2 | peer |
| React Router | 7.18.4 | 7.18.4 | 7.18.4 | 7.18.4 | 7.18.4 | peer |
| silencio-shared | v0.5.1 | v0.5.1 | v0.5.1 | v0.5.1 | v0.5.1 | — |
| Vite | 8.0 | 8.0 | 8.0 | 8.0 | 8.2 | **6.4** |
| TypeScript | **6.0** | 5.7 | 5.8 | 5.8 | 5.9 | 5.9 |
| Tailwind | 4.3 | 4.3 | 4.3 | 4.3 | 4.3 | peer |
| supabase-js | 2.105 | 2.105 | 2.105 | **2.97** | 2.112 | peer |
| TanStack Query | 5.100 | 5.100 | 5.83 | 5.83 | 5.101 | — |
| zod | **4** | 3 | 3 | 3 | 3 | peer |
| lucide-react | **1.x** | 0.469 | 0.462 | 0.462 | 0.462 | peer |
| sonner | **2** | 1.7 | 1.7 | 1.7 | 1.7 | — |
| tailwind-merge | 3 | **2** | 3 | 3 | 3 | peer |
| date-fns | 4 | 4 | 3.6 | 3.6 | 3.6 | — |
| vitest | — | 5 | **3** | **3** | — | — |
| eslint | **10** | — | 9 | 9 | 9 | — |

**Vědomé rozdíly** (tučně v tabulce) — proč jsou a co by znamenalo je srovnat:

- **Hub je nejnovější** (TS 6, zod 4 + `@hookform/resolvers` 5, lucide 1.x,
  sonner 2, eslint 10). Ostatní appky zůstávají o major zpět; shared má na
  zod/lucide/resolvers peer rozsahy, které pokrývají obě generace.
- **shared staví na Vite 6** — library build s `vite-plugin-dts` 4; Vite 8
  by chtěl majory pluginů (dts 5, static-copy 3+). Konzumentů se to netýká,
  `dist/` je obyčejný ESM.
- **budgeting má tailwind-merge 2**, ostatní 3. Verze 3 je ta pro Tailwind 4
  (2 zná třídy Tailwindu 3) — kandidát na srovnání.
- **cashflow + voicehub mají vitest 3** — kvůli tomu jim `npm audit` hlásí
  2× critical (`tinypool`, jen test runner). Srovnání = vitest 5 jako budgeting.
- **voicehub má supabase-js 2.97**, ostatní 2.105+ — v rámci 2.x, kandidát na
  minor bump.

## Když měníš X, uprav i Y

| Změna | Co dál |
|---|---|
| **Release sharedu** (nový tag) | bump `package.json` + `CHANGELOG.md` + tag; před tím grep konzumentů (README „Co nesmí rozbít update"); bump v appkách, které změnu potřebují; řádek `silencio-shared` v tabulce verzí |
| **Update závislostí v jedné appce** | `node shared/scripts/rodina-stav.mjs --audit`; záznam do `docs/historie.md` appky; přepsat tabulku verzí tady; zvážit totéž v ostatních appkách (a zapsat do Logu) |
| **Nová sub-appka** | checklist v `hub/docs/routing.md` (rewrites ve 3 variantách před catch-all, karta v `HubPage` s trailing slash, `profiles.sub_apps` CHECK + whitelist `admin-users`); `SubAppKey` v shared (pozor na `Record<SubAppKey, …>` v konzumentech); vlastní schéma + RLS `has_sub_app`; volný dev port; řádek v tabulce Appky |
| **Auth flow, AppShell, guardy** | jen v shared + bump; v appkách analogicky (guard trio `RequireAuth → RequirePasswordReady → RequireSubAppAccess`) |
| **Nová složka v `public/` appky** | rewrite ve `vercel.json` té appky **před** catch-all, jinak vrací `index.html` s HTTP 200 |
| **Env proměnná** | v každém Vercel projektu zvlášť — nesdílí se |
| **Schéma databáze** | Supabase MCP `apply_migration`, popis do `docs/architektura.md` appky |

## Log celorodinových změn

### 2026-10-16 — bezpečnostní update závislostí + tenhle rozcestník

`npm audit` sweep přes všech šest rep v jeden den, jen patch/minor.

| Repo | Audit před → po | Hlavní změny |
|---|---|---|
| hub | 10 → **0** | react-router-dom 7.18.4, vite 8.0.16 |
| budgeting | 9 → **0** | react-router-dom 7.18.4, vite 8.0.16, postcss 8.5.30 |
| cashflow | 31 → **5** | + vitest 3.2.7, eslint řetěz (typescript-eslint 8.71) |
| voicehub | 33 → **5** | + vitest 3.2.7, dompurify 3.4.17 (přes jspdf, jde do bundlu) |
| set | 3 → **0** | react-router-dom 7.18.4 (vite 8.2.1 už opravený byl) |
| shared | 20 → **12** | vite 6.4.4; `dist/` bajt po bajtu beze změny → bez tagu |

- React Router 7.18.4 opravuje open redirect přes backslash v `<Link>` /
  `useNavigate`. Ostatní advisories z várky (RSC, SSR hydratace, manifest DoS)
  se týkají jen Framework/RSC módu — rodina jede na `<BrowserRouter>`.
- Vite 8.0.16 = nejnižší opravená verze (`npm audit fix` by vytáhl 8.3).
- Zbylé nálezy jsou dev/build-time a chtějí major: vitest 4+ (cashflow,
  voicehub), `@tailwindcss/typography` pinuje `postcss-selector-parser@6`,
  v shared `vite-plugin-dts` 5 / `vite-plugin-static-copy` 3+ / `tsc-alias`.
- Detail v `docs/historie.md` každé appky, u shared v `CHANGELOG.md`.

Týž den vznikl tenhle soubor + `scripts/rodina-stav.mjs` a ze všech appek
zmizelo zastaralé tvrzení „sdílená pravidla jsou canonical v hub repu".

### 2026-08-14 — sjednocení na `silencio-shared#v0.5.1` + dokumentace do rep

Celá rodina přešla na jeden tag sharedu (dřív v0.3.0–v0.5.0) a dokumentace se
z paměti Claude Code přesunula do rep. Detail v `hub/docs/historie.md`.
