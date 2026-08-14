# silencio-shared

Sdílený design system rodiny Silencio — AppShell, auth flow, ThemeProvider,
design tokeny, UI primitivy. Konzumují ho jako git-tag dependency **všechny**
appky: hub, budgeting, cashflow, voicehub, set. **Jediný public repo rodiny.**

## Příkazy

```bash
npm run build      # vite build + d.ts (běží i jako prepare při git-dep installu)
npm run typecheck  # tsc --noEmit
npm run clean      # rm -rf dist
```

Není to nasazovaná appka — žádný Vercel, žádné routy. Distribuuje se **git
tagem**, appky ho tahnou přes `"silencio-shared": "github:charleeesh/silencio-shared#vX.Y.Z"`.

## Kde co hledat

| Soubor | O čem |
|---|---|
| [README.md](README.md) | konzumentská dok. — instalace, použití, **5 integračních pastí**, workflow releasu, „co nesmí rozbít update" |
| [CHANGELOG.md](CHANGELOG.md) | verzní historie |
| [docs/design-system.md](docs/design-system.md) | rodinová design pravidla — wordmark, karty, fonty, chipy, tabulky, tlačítka, favicon |
| [docs/rozhodnuti.md](docs/rozhodnuti.md) | **proč** — vlastní Supabase klient, AppShell, MetricCard, peer deps + zamítnuté |

## Co musíš vědět, než sáhneš na kód

**Tenhle balíček JE canonical zdroj designu.** Ne hub — ten je od fáze 6
konzument jako ostatní. Pravidlo se mění tady + bump tagu, žádný copy-paste do
appek. Kdyby paměť nebo starý komentář tvrdil „canonical je hub", je to
zastaralé.

**Release rozbije konzumenty se zpožděním.** Appka na starém tagu jede dál a
spadne až při svém příštím bumpu. Proto **před releasem grepni konzumenty** na
měněný symbol (`for r in hub budgeting cashflow voicehub set; do grep -rn Symbol
$r/src; done`) a řiď se tabulkou „Co nesmí rozbít update" v README. Aditivní
změna = bezpečná; nový povinný prop / přejmenování / změna chování = breaking.

**Balíček má vlastní interní Supabase klient** (`public` schema, pro auth +
`profiles`). Sub-appka má vlastní klient pro svoje schema. Nepředávej ho sharedu
přes `setSupabaseClient()`, pokud má `db.schema` — rozbije auth.

**Integrační pasti** (Tailwind `@source`, `optimizeDeps.exclude`, `jsx-runtime`
v `include`, `useSession` ne `useAuth`, žádný env dot-access uvnitř balíčku) jsou
v README, sekce „Pasti při integraci". Nedvojit je sem.

**Peer deps, žádný Radix** ve sdílených komponentách — ať balíček zůstane lehký.

**Verzní skew je OK**, dokud je vědomý — aditivní změna nevynucuje bump všech
appek naráz.

## Hranice

- Změny **aditivně a okomentovaně**; konzumenty (5 appek) napřed grepnout.
- Bump verze + `CHANGELOG.md` + git tag ke každému releasu.
- Commituje se průběžně, **push a tag jen na vyžádání**.

## Poznámka k paměti

Znalosti o balíčku jsou od 2026-08-14 v repu (tenhle CLAUDE.md + docs/), ne
v lokální paměti Claude Code. Nová zjištění piš sem, ne do paměti — repo se
synchronizuje přes GitHub, paměť ne.
