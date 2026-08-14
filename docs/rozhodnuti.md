# Rozhodnutí

Proč je balíček postavený takhle. Datováno. Stav k 2026-08-14.

## Canonical zdroj designu je tenhle balíček (od fáze 6, potvrzeno 2026-08-11)

Do fáze 6 (jaro 2026) byl canonical zdroj **hub** a `silencio-shared` byl jen
jeho extrahovaný snapshot — pravidla se měnila v hubu a portovala sem. **To už
neplatí.** Fáze 6 a 7 hub vykuchaly: dnes má `hub/src/` sedm souborů, žádné
`components/`/`auth/`/`theme/`, a tokeny importuje z `silencio-shared` stejně
jako každá sub-appka. **Hub je dnes konzument jako ostatní.** Změna designu se
dělá tady + bump tagu.

> Starší dokumentace (README balíčku i hub) tvrdila opak; opraveno 2026-08-11 při
> stavbě sub-appky Set. Pokud v paměti nebo starém komentáři narazíš na „canonical
> je hub, sem se jen portuje", je to zastaralé.

## Balíček má vlastní interní Supabase klient

Místo aby shared přijímal `supabase` přes prop nebo context, **interně volá
`createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)`** v
`src/lib/supabase.ts`. Default schema `public` — používá se pro auth a `profiles`
(theme persist).

**Proč:** vyhnout se prop-drilling / context boilerplate. Sub-appka jen nastaví
env vars a balíček funguje out-of-the-box. Duplicitní auth listener (sub-app
klient i shared klient reagují na `onAuthStateChange`) je akceptovatelný overhead
pro single-user provoz.

Sub-appka si drží **vlastní** klient pro svoje schema (`cashflow.*`, `voicehub.*`,
`set.*`). Oba klienti sdílí session přes localStorage (stejný origin
`hub.silencio.cz`). **Nepředávej sub-app klient sharedu přes `setSupabaseClient()`,
pokud má nastavené `db.schema`** — shared čte `public.profiles` a s cizím
schématem by hledal `<schema>.profiles` a rozbil auth.

## AppShell — HubHomeLink + signOutTarget

`AppShell` má interní `HubHomeLink`: v `import.meta.env.DEV` renderuje
`<Link to="/">` (sub-app dashboard), v produkci `<a href="https://hub.silencio.cz/">`
(cesta zpět do hubu). Prop `signOutTarget` (default `/login`) řídí, kam se jde po
odhlášení. Sub-app i hub tak používají **identický** AppShell.

## AuthLayout — `appWordmark` prop

Login screen vykresluje `Silencio\n<appWordmark>.`. Místo hard-coded textu per
appka přijímá `AuthLayout` prop `appWordmark`, appka ho passne:
`<LoginPage appWordmark="Cashflow" />`.

## MetricCard — generický `value: ReactNode`

Použit voicehub variant (`value: ReactNode`, bez vestavěného formátování) místo
cashflow variantu (`value: number + formatCZK`). Formátování si volá call site
(`formatCZK(amount)`). Podporuje `onClick`, `active`, `accent`, `icon`, `rightSlot`.

## Chip — tři varianty

`NeutralChip` / `SignalChip` / `BrandChip` — kdy který, viz
[design-system.md](design-system.md). Důvod tří variant je čitelnost brand barev
v Light módu.

## Peer deps, žádný Radix

Balíček nic nebundluje — react, react-dom, react-router-dom, tailwindcss,
supabase-js, lucide-react, clsx, tailwind-merge, react-hook-form, zod jsou **peer
deps**. Sdílené komponenty **nepoužívají Radix** (Radix žije jen v interních UI
komponentách sub-appek), takže balíček zůstává lehký.

## Verzování — vědomý skew je OK

Verze přes git tagy (`#v0.5.1`), žádný npm registry. **Nemusí se bumpovat všechny
appky najednou** — pokud je změna aditivní, ostatní můžou zůstat na starém tagu,
dokud ji nepotřebují (ušetří zbytečné deploye). Skew je v pořádku, dokud je
vědomý. (Sjednocení na jednu verzi se dělá, když je důvod — naposledy celá rodina
na v0.5.1 dne 2026-08-14.)

Detaily releasu a „co nesmí rozbít update" jsou v [README](../README.md).

## Zamítnuté

- **Space Grotesk Bold jako wordmark** — Karel zamítl („nefunguje, nehodí se"),
  zvolen Archivo Black.
- **`setSupabaseClient()` s cizím `db.schema`** — rozbíjí auth (shared čte
  `public.profiles`); navíc explicit klient + StrictMode zasekával `useSession`
  na `loading: true`. Používá se implicit env fallback.
- **Radix ve sdílených komponentách** — drží se mimo, ať je balíček lehký.
