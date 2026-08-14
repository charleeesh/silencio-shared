# Design system rodiny Silencio

Rodinová design pravidla — platí pro **všechny** appky (hub, budgeting, cashflow,
voicehub, set), protože je implementuje tento balíček. Stav k 2026-08-14.

Tohle je canonical zdroj: pravidlo se změní tady + bump tagu, ne copy-pastem
v appkách.

## AppShell wordmark `[logo] NAME`

Header vlevo nahoře vždy vykresluje **logo + bold uppercase wordmark** názvu
appky vedle sebe. Žádné samostatné hero „Ahoj Karle" / „Vítejte" — jde se rovnou
do funkcionality.

```tsx
<AppShell appName="Cashflow">   // → [silencio] CASHFLOW
```

Wordmark: `font-wordmark text-[17px] uppercase leading-none tracking-[0.04em]`,
logo `h-5 w-auto`, vertikálně centrované.

**Proč:** konzistentní brand napříč všemi tools; hero pozdrav je v single-user
appce redundantní a ředí důraz na akce.

## Karty: `rounded-2xl` + SpotlightCard

Všechny tile-like karty (rozcestník, dashboard widgety, list items):
- `rounded-2xl` (16px) — bento aesthetic; `rounded-md` působilo jako admin panel,
  `rounded-3xl` cartoonsky, 16px je sweet spot
- `<SpotlightCard>` wrapper — mouse-tracking radiální gradient (brand-defining
  interakce, vybráno z reactbits.dev)
- per-accent brand rgba (lime / blue / magenta / amber)
- aktivní karta `maxOpacity={0.6}`, disabled `{0.35}`

## Žádný hero greeting

Rozcestník i dashboardy jsou čisté: header + obsah + footer. Hero text **jen**
pokud sděluje něco context-specific (např. „Aktuální projekt: XYZ"), nikdy
generický pozdrav.

## Fonty

Jeden font system pro **všechny** appky — žádné per-app variace.

| Role | Font | Použití |
|---|---|---|
| `font-sans` | **Inter** (400/500/600/700) | body text, popisky, UI |
| `font-display` | **Space Grotesk** (500/600/700) | nadpisy, titulky karet |
| `font-wordmark` | **Archivo Black** (900) | brand wordmark v AppShell headeru |

Loading přes Google Fonts v `index.html`, tokeny `--font-sans/display/wordmark`
v `@theme`.

**Proč:** Karel 2026-05-17 — *„do budoucna sjednocene nechci aby vsude byly ruzne
fonty"*. Brand musí být konzistentní. Archivo Black jako wordmark: single-weight,
blokový, silný, funguje pro krátké (HUB) i dlouhé (BUDGETING) slovo. Space
Grotesk Bold jako wordmark Karel **zamítl** („nefunguje, nehodí se").

## Chipy — tři typy, vybírej podle významu

| Typ | Styling | Použití |
|---|---|---|
| `NeutralChip` | `rounded-full border border-border bg-muted text-foreground px-2.5 py-0.5 text-xs font-medium` | jazyky, region, tagy — **default** |
| `SignalChip` | text-only barevný (lime/blue/magenta), bez bg | stav: Zaplaceno (lime), Odesláno (blue), Po splatnosti (magenta) |
| `BrandChip` | `bg-silencio-{accent}/15 text-silencio-{accent}` | aktivní filtr, „primary" akce sparingly |

**Proč:** brand barvy (lime má lightness 86 %) jsou v Light módu jako čistý text
na světlém pozadí nečitelné. Karel narazil na neviditelný „Čeština" chip
(`text-primary` v Light). Pravidlo: default je neutral; brand barva jako text jen
s bg opacity (`/15`), a vždy **dual-mode check** (čitelné v Light i Dark?).

## Tabulky

Canonical pattern pro sub-appky:

```tsx
<div className="overflow-hidden rounded-md border border-border bg-card">
  <table className="w-full text-sm">
    <thead className="bg-card text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      <tr><th className="px-4 py-3 text-left">Sloupec</th></tr>
    </thead>
    <tbody>
      <tr className="border-t border-border hover:bg-card/60">
        <td className="px-4 py-3">…</td>
      </tr>
    </tbody>
  </table>
</div>
```

Tabulku použij při hodně sloupcích stejné struktury, sortable/filterable datech,
numerických sloupcích (`tabular-nums`). Karta-per-řádek je OK pro avatar +
víceřádková metadata (voicehub speaker list).

## Tlačítka — hierarchie

1. **`PrimaryButton`** — hlavní CTA, lime + bold + šipka. `!w-auto px-5` pro
   inline (page header). **Jeden na page header**, žádné dva vedle sebe.
2. **shadcn Button `variant="outline"`** — sekundární (Filtry, Zpět, Storno)
3. **`variant="ghost"`** — terciární (ikonové akce)
4. **`variant="destructive"`** — destruktivní (Smazat)

## Favicon

Canonical `public/favicon.ico` (Silencio logo, md5 `89c0284266683bbe786fab2dcf4cef3d`).
Všechny appky mají **identický** soubor — favicon je brand konstanta, žádné
per-app variace. Sub-appka s `base: "/<prefix>/"` (voicehub, set) potřebuje
v `index.html` explicitní `<link rel="icon" href="/<prefix>/favicon.ico">`,
protože holé `/favicon.ico` v hub-proxy kontextu nematchne.

## Tailwind v4 border fix

V `@layer base` musí být `*, ::before, ::after { border-color: var(--border); }`
— bez toho shadcn `border` className mapuje na `currentColor` → tlustý černý
outline. Je v `tokens.css`, takže appky ho dostanou importem tokenů.
