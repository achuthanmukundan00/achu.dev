# Local 0.53 — installed cuts

Personal site copy of the Skaft Local type system, release `0.53`.

Source: `skaft-software/skaft` → `assets/fonts/` (installed from the
`local-typeface` release by `scripts/update-local-font.sh`). Lineage, copyright,
and license notices live in `NOTICE.md` and `LICENSES/`.

## Which cut is used where

| File | Cut | Used for |
| --- | --- | --- |
| `LocalGrotesk.woff2` | variable (`wght` 400–700) | Headings and display type only, as `"Local Grotesk Display"` |
| `LocalGrotesk-Regular.woff2` | static 400 | Body text |
| `LocalGrotesk-Bold.woff2` | static 700 | `strong`, emphasis in body text |
| `LocalMono-Regular.woff2` | static 400 | Labels, metadata, code, terminal text |
| `LocalMono-Bold.woff2` | static 700 | Bold terminal and code text |
| `LocalMono.woff2` | variable (`wght` 400–700) | Not referenced by this site |

`font-synthesis: none` is set site-wide, so the static text and mono cuts only
render the weights that are actually installed.

## Checksums

```text
cc43bd03fc8e4832ab674e4cdd125d5afdfc896e238844f511defb9a4bf687ca  LocalGrotesk.woff2
b05b858990a9c65d91b17b6003623a1dcc595785eb4ba522ac798c7c89c088c0  LocalGrotesk-Regular.woff2
c771aaa36d22e53462a03deea058620a0bcc4c63f4da9765a828888132771d44  LocalGrotesk-Bold.woff2
037051bef6377135fcbb4da14075464777bd5e11dd1e5f452252ea10dc47d2e7  LocalMono.woff2
62c64f1cc165bce9579c32250eb3c69d96957d1c404287ca8493e88d805028ec  LocalMono-Regular.woff2
3440355e48b3c00c079e40dce77ada8fd942f8421da6b1e033d56ea518a26ded  LocalMono-Bold.woff2
```
