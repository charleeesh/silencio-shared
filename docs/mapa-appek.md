# Mapa appek Silencio

**Jediné místo**, odkud se dá zjistit, kde je jaká informace o appkách Silencio,
jaké verze knihoven kde běží a co je potřeba změnit jinde, když se mění něco
v jedné appce. Každá appka na tenhle soubor odkazuje ze svého `CLAUDE.md`.
Založeno 2026-10-16 (do téhož dne se jmenoval `rodina.md`).

> **Tohle repo je public.** Sem nepatří nic citlivého — ID Supabase projektu,
> uživatelé, e-maily, klíče. To žije v `silencio-hub/docs/` (private).

Repa leží vedle sebe ve složce `silencio/` — na Macu `~/Documents/Webove_projekty/silencio/`,
na VPS `~/Webove_projekty/silencio/`. Cesty níž jsou relativní k té složce.

## Appky

| Repo | Co to je | Adresa | Dev port | DB schéma |
|---|---|---|---|---|
| `hub` | rozcestník, **přihlašovací brána**, správa uživatelů, proxy sub-appek | `hub.silencio.cz/` | 5174 | `public` (`profiles`) |
| `budgeting` | rozpočty (cost estimates) + PDF, vyúčtování | `/budget/` | 5173 | `public.*` (vědomá výjimka) |
| `cashflow` | cashflow, cache faktur a nákladů z Fakturoidu | `/cashflow/` | 8080 | `cashflow.*` |
| `voicehub` | VoiceHub — dabéři, nabídky, ceník, projekty | `/voice/` | 8082 | `voicehub.*` |
| `set` | Set — štáb, lokace, timing, call sheet | `/set/` | 8081 | `set.*` |
| `shared` | balíček: design system, AppShell, auth obrazovky, tokeny | git tag | — | `public` (interní klient) |

Každá sub-appka je vlastní Vercel projekt `silencio-<repo>` a hub ji proxuje
pod svou doménou. Login je **jen** na hubu, sub-appky na něj přesměrují.
Všechny dev porty jsou různé, takže může běžet víc appek naráz.

## Kde je jaká informace

| Hledáš | Kde |
|---|---|
| Design — wordmark, karty, fonty, chipy, tabulky, tlačítka, favicon | `shared/docs/design-system.md` |
| Integrační pasti nové appky (Tailwind `@source`, `optimizeDeps`, `jsx-runtime`, `useSession`) | `shared/README.md`, sekce „Pasti při integraci" |
| Proč je shared postavený takhle, verzování, peer deps | `shared/docs/rozhodnuti.md` |
| Co se ve které verzi sharedu změnilo | `shared/CHANGELOG.md` |
| Login, role, kdo je v systému, `profiles.sub_apps`, edge funkce `admin-users` | `hub/docs/uzivatele.md` |
| Rewrites, proxy, trailing slash, **checklist nové sub-appky** | `hub/docs/routing.md` |
| Sdílený Supabase projekt, schémata, RLS `has_sub_app` | `hub/docs/architektura.md` |
| Doména, DNS, env proměnné | `hub/docs/nasazeni.md` + `nasazeni.md` každé appky |
| **Recept na převzetí cizí appky do rodiny** (odpojit Lovable / původní Supabase → naše Supabase → design → routing) | `voicehub/docs/historie.md`, sekce „Přenos do rodiny Silencio (Fáze A–G)" |
| Doména konkrétní appky (rozpočet, Fakturoid, nabídky, call sheet) | `<appka>/CLAUDE.md` → její `docs/` |
| Změny napříč appkami (sjednocení verzí, updaty) | tenhle soubor, sekce [Log](#log-změn-napříč-appkami) |

Každá appka má stejnou kostru: `CLAUDE.md` (hot cache, čte se první) a `docs/`
s `architektura.md`, `rozhodnuti.md`, `pasti.md`, `nasazeni.md`, `historie.md`
(+ doménové soubory). Shared místo `historie.md` vede `CHANGELOG.md`.

## Pravidla pro všechny appky

- **Všechno o kódu žije v repech** — ne v paměti Claude Code ani v globálním
  `~/.claude/CLAUDE.md` na počítači (Karel 2026-10-16: pracuje na víc strojích
  a globální nastavení drží jen osobní věci). Repa se synchronizují přes GitHub.
- **Karel není programátor.** Vysvětluj česky, s příklady z běžného života,
  a u každé knihovny řekni, k čemu je — viz [slovníček](#slovníček-pojmů) níž.
- **Jen `main`, žádné worktrees** (Karel 2026-10-16). Commit průběžně, push jen
  na vyžádání. Po připojení ke stroji `gsync`.
- **Migrace se do rep nepřidávají** — jdou přes Supabase MCP, historii vede
  Supabase, popis schématu je v `docs/architektura.md` appky.
- **Design se mění jen v shared** + bump tagu, žádný copy-paste do appek.
- **Data patří týmu**: RLS přes `has_sub_app('<app>')`, ne vlastnictví řádku.
- **Závislosti: patch/minor klidně, major po domluvě s Karlem** a s kontrolou
  (typecheck, testy, build, `vite preview`). Rozdíl verzí mezi appkami je OK,
  dokud je **zapsaný v tabulce níž**.

## Verze (stav k 2026-10-16)

Aktuální stav vypíše `node shared/scripts/stav-appek.mjs` (`--audit` přidá
`npm audit`, `--fetch` napřed stáhne stav z GitHubu). Tabulka je stav na
GitHubu; lokální složka bez `gsync` + `npm install` může ukazovat starší.

| | hub | budgeting | cashflow | voicehub | set | shared |
|---|---|---|---|---|---|---|
| React | 19.2 | 19.2 | 19.2 | 19.2 | 19.2 | peer |
| React Router | 7.18 | 7.18 | 7.18 | 7.18 | 7.18 | peer |
| silencio-shared | v0.5.1 | v0.5.1 | v0.5.1 | v0.5.1 | v0.5.1 | — |
| Vite | 8.0 | 8.0 | 8.0 | 8.0 | 8.2 | 8.0 |
| TypeScript | 6.0 | **5.7** | 6.0 | 6.0 | 6.0 | 6.0 |
| Tailwind | 4.3 | 4.3 | 4.3 | 4.3 | 4.3 | peer |
| tailwind-merge | 3 | 3 | 3 | 3 | 3 | peer |
| supabase-js | 2.105 | 2.105 | 2.118 | 2.118 | 2.118 | peer |
| TanStack Query | 5.100 | 5.100 | 5.104 | 5.104 | 5.104 | — |
| zod | 4 | **3** | 4 | 4 | 4 | peer |
| @hookform/resolvers | 5 | **3** | 5 | 5 | 5 | peer |
| lucide-react | 1.x | **0.469** | 1.x | 1.x | 1.x | peer |
| sonner | 2 | **1.7** | 2 | 2 | 2 | — |
| date-fns | 4 | 4 | 4 | 4 | 4 | — |
| vitest | — | 5 | 5 | 5 | — | — |
| eslint | 10 | — | 10 | 10 | 10 | — |

**Vědomé rozdíly** (tučně):

- **budgeting je o generaci zpět** (TypeScript 5.7, zod 3, lucide 0.469,
  sonner 1.7). Odloženo, dokud Karel nedokončí vyúčtování (F2b) — upgrade by
  se mu pletl pod rukama. Recept je stejný jako u cashflow/voicehub/set
  2026-10-16 (viz Log): pozor hlavně na **ikony značek**, které lucide 1.0
  vyřadil, a na formuláře se `z.coerce` (zod 4 rozlišuje vstup a výstup).
- shared má zod / lucide / resolvers / tailwind-merge jako **peer** s rozsahy,
  které pokrývají obě generace — budgeting i ostatní appky s ním fungují.

**Co `npm audit` ještě hlásí a proč je to OK** (vše jen při vývoji/sestavení,
nic z toho se nedostane do appky v prohlížeči):

- cashflow, voicehub: 2× moderate — `@tailwindcss/typography` (styly pro dlouhé
  texty) pinuje starý `postcss-selector-parser`; opravená verze neexistuje.
- shared: 7× high — v knihovnách na hledání souborů, které používají nástroje
  `tsc-alias` a `vite-plugin-static-copy` při sestavení balíčku nad naším
  vlastním kódem. Zbavit se jich = přepsat importy ve 31 souborech; nestojí to
  za riziko.

## Když měníš X, uprav i Y

| Změna | Co dál |
|---|---|
| **Release sharedu** (nový tag) | bump `package.json` + `CHANGELOG.md` + tag; před tím grep konzumentů (README „Co nesmí rozbít update"); bump v appkách, které změnu potřebují; řádek `silencio-shared` v tabulce verzí |
| **Update závislostí v jedné appce** | `node shared/scripts/stav-appek.mjs --audit`; záznam do `docs/historie.md` appky; přepsat tabulku verzí tady; zvážit totéž v ostatních appkách (a zapsat do Logu) |
| **Nová sub-appka** | checklist v `hub/docs/routing.md` (rewrites ve 3 variantách před catch-all, karta v `HubPage` s trailing slash, `profiles.sub_apps` CHECK + whitelist `admin-users`); `SubAppKey` v shared (pozor na `Record<SubAppKey, …>` v konzumentech); vlastní schéma + RLS `has_sub_app`; volný dev port; řádek v tabulce Appky; převzatá appka → recept VoiceHub Fáze A–G |
| **Auth flow, AppShell, guardy** | jen v shared + bump; v appkách analogicky (guard trio `RequireAuth → RequirePasswordReady → RequireSubAppAccess`) |
| **Nová složka v `public/` appky** | rewrite ve `vercel.json` té appky **před** catch-all, jinak vrací `index.html` s HTTP 200 |
| **Env proměnná** | v každém Vercel projektu zvlášť — nesdílí se |
| **Schéma databáze** | Supabase MCP `apply_migration`, popis do `docs/architektura.md` appky |
| **Dev port** | musí být unikátní — tabulka Appky + `vite.config.ts` + `.claude/launch.json` appky |

## Slovníček pojmů

Pro Karla — co ty názvy znamenají, s příkladem.

| Pojem | K čemu je | Příklad |
|---|---|---|
| **React** | základ, ze kterého je každá appka postavená | cihly a malta domu |
| **Vite** | „stavbyvedoucí" — z našich souborů postaví hotovou appku pro web, při vývoji ji ukazuje živě | `npm run dev` = rozestavěný dům, kde vidíš každou změnu hned; `npm run build` = kolaudace |
| **TypeScript** | hlídač, který kontroluje kód ještě před spuštěním | jako kontrola pravopisu ve Wordu — nepustí „sečti jméno a datum" |
| **Tailwind** | vzhled: barvy, mezery, písmo zapsané krátkými slovy přímo u prvků | `bg-silencio-lime` = limetkové pozadí tlačítka |
| **tailwind-merge** | rozhodčí, když se na jednom prvku sejdou dva protichůdné styly | tlačítko „modré" + „zelené" → platí to poslední |
| **React Router** | navigace mezi stránkami appky | rozcestník v budově: `/budget/edit/…` → editor |
| **Supabase** (+ supabase-js) | databáze a přihlašování v cloudu; supabase-js je „telefon", kterým appka s databází mluví | uložení rozpočtu, přihlášení |
| **TanStack Query** | chytrý pošťák pro data — načte je, pamatuje si je, a když se změní, obnoví obrazovku | seznam rozpočtů se nenačítá znovu při každém kliknutí |
| **zod** | kontrolor formulářů | „e-mail musí mít zavináč", „číslo dne aspoň 1" — chybu hlásí česky |
| **react-hook-form** (+ resolvers) | správce formulářů — co je vyplněné, co odeslat; resolvers ho propojí se zodem | dialog „Nová osoba" |
| **lucide-react** | knihovna ikonek | oko u hesla, šipky, koš |
| **sonner** | vyskakovací hlášky v rohu obrazovky | „Uloženo ✓", „Něco se pokazilo" |
| **date-fns** | počítání s datumy | „16. 10. 2026", „za 3 dny" |
| **vitest** | automatické testy — robot, který po každé změně přepočítá výpočty a ohlásí, když nesedí | 45 testů výpočtů vyúčtování v budgetingu |
| **eslint** | korektor kódu — hlídá styl a typické chyby; na appku samotnou nemá vliv | „tahle proměnná se nikde nepoužívá" |
| **npm** | „obchod" s knihovnami | — |
| `package.json` | nákupní seznam: jaké knihovny a v jakých verzích | „zod verze 4" |
| `package-lock.json` | účtenka: přesně co se koupilo, ať Mac, VPS i Vercel mají totéž | — |
| `node_modules/` | spíž, kde koupené knihovny leží (není v gitu) | — |
| **`npm install`** | dojdi nakoupit podle seznamu | nutné po `gsync`, když jiné sezení změnilo seznam — jinak ve spíži leží staré knihovny a appka u tebe běží jinak než na Vercelu |
| **`npm audit`** | kontrola, jestli některá knihovna nemá známou bezpečnostní díru | — |
| **`gsync`** | stáhne z GitHubu, co se mezitím změnilo jinde (jiný stroj, jiné sezení) | první příkaz po připojení k počítači |
| **verze 7.18.4** | první číslo = velká změna (může rozbít), druhé = nové funkce, třetí = opravy | patch/minor bez ptaní, major po domluvě |
| **peer závislost** | shared si knihovnu „půjčí" od appky, ve které běží, místo aby nesl vlastní | proto každá appka může mít svou verzi zodu |
| **build / bundle** | hotová zabalená appka, kterou Vercel posílá do prohlížeče | soubor `dist/assets/index-….js` |
| **dev server / port** | appka puštěná u tebe na počítači na adrese `localhost:<port>` | `localhost:5173/budget/` |

## Log změn napříč appkami

### 2026-10-16 — sjednocení verzí, mapa appek

Odpoledne po bezpečnostním updatu (níž) dorovnány cashflow, voicehub, set
a shared na verze hubu: TypeScript 6, zod 4 + resolvers 5, lucide 1.x,
sonner 2, date-fns 4, eslint 10, vitest 5, supabase-js 2.118, TanStack 5.104;
shared navíc Vite 6 → 8. Budgeting jen tailwind-merge 3 (zbytek odložen, viz výš).
Co se cestou našlo a opravilo:

- **lucide 1.0 vyřadil ikony značek** — VoiceHub `PublicOffer` (veřejná
  nabídka pro klienty) importoval Facebook + Instagram; bez opravy by stránka
  spadla. Ikony přeneseny do `voicehub/src/components/BrandIcons.tsx` + test.
- **vite-plugin-static-copy 3+ mění cesty** — `tokens.css` a loga by v shared
  `dist/` skončily jinde a appky by je nenašly; opraveno `rename.stripBase`.
  Výstup shared ověřen: typy, `tokens.css` a loga bajt po bajtu stejné, JS má
  stejných 56 exportů; hub s novým `dist/` sestaven a spuštěn.
- TypeScript 6 vyřadil `baseUrl` → odstraněn (set, shared), shared potřebuje
  `rootDir` v build tsconfigu.
- Nepoužívané věci pryč: `ui/calendar.tsx` + `react-day-picker` (cashflow,
  voicehub — byly v nich jediné chyby typecheku), `vite-plugin-dts` (shared).
- eslint-plugin-react-hooks 7 přidal pravidla pro React Compiler — vypnuta,
  platí stejná dvě jako dřív (zapnout = samostatný úkol).
- VoiceHub dev port 8080 → 8082 (kolidoval s cashflow).
- Výsledek `npm audit`: hub 0, budgeting 0, set 0, cashflow 2, voicehub 2,
  shared 7 (všechny build-time, viz výš).

### 2026-10-16 — bezpečnostní update závislostí

`npm audit` sweep přes všech šest rep v jeden den, jen patch/minor.

| Repo | Audit před → po | Hlavní změny |
|---|---|---|
| hub | 10 → **0** | react-router-dom 7.18.4, vite 8.0.16 |
| budgeting | 9 → **0** | react-router-dom 7.18.4, vite 8.0.16, postcss 8.5.30 |
| cashflow | 31 → **5** | + vitest 3.2.7, eslint řetěz (typescript-eslint 8.71) |
| voicehub | 33 → **5** | + vitest 3.2.7, dompurify 3.4.17 (přes jspdf, jde do bundlu) |
| set | 3 → **0** | react-router-dom 7.18.4 (vite 8.2.1 už opravený byl) |
| shared | 20 → **12** | vite 6.4.4; `dist/` bajt po bajtu beze změny → bez tagu |

React Router 7.18.4 opravuje open redirect přes backslash v `<Link>` /
`useNavigate`; ostatní advisories z várky (RSC, SSR hydratace, manifest DoS)
se týkají jen Framework/RSC módu — appky jedou na `<BrowserRouter>`. Detail
v `docs/historie.md` každé appky, u shared v `CHANGELOG.md`. Týž den vznikla
tahle mapa + skript a ze všech appek zmizelo zastaralé „sdílená pravidla jsou
canonical v hub repu".

### 2026-08-14 — sjednocení na `silencio-shared#v0.5.1` + dokumentace do rep

Celá rodina přešla na jeden tag sharedu (dřív v0.3.0–v0.5.0) a dokumentace se
z paměti Claude Code přesunula do rep. Detail v `hub/docs/historie.md`.
