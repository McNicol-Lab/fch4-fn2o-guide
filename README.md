# Getting started with FCH₄ and FN₂O

A short, public guide for adding methane (FCH₄) and nitrous oxide (FN₂O) eddy-covariance fluxes to research workflows, written for prospective and early-career flux scientists.

**Live site:** https://mcnicol-lab.github.io/fch4-fn2o-guide/

The guide draws on the work of the FLUXNET-Coop CH₄/N₂O Data Processing Committee. It is a getting-started complement to, **not a replacement for**, the [ICOS Ecosystem Instructions for turbulent flux measurements of CH₄ and N₂O](https://www.europe-fluxdata.eu/icos/documents/instructions/eddych4n2o) (Nicolini et al. 2024, [doi:10.18160/61J9-4MMK](https://doi.org/10.18160/61J9-4MMK)).

Hosted by [ecoϕlab](https://mcnicol-lab.github.io/ecophilab/) (McNicol Lab, University of Illinois Chicago).

## Contents

| File | Page |
|---|---|
| `index.qmd` | Overview (goals, objectives, relation to ICOS) |
| `network.qmd` | Network (anonymous community snapshot + name opt-in) |
| `work.qmd` | Work completed (timeline, workshops, progress) |
| `guide/index.qmd` | Guide overview |
| `guide/high-frequency.qmd` | High-frequency data collection and processing |
| `guide/half-hourly.qmd` | Half-hourly processing (QC, u*, gap-filling, uncertainty) |
| `guide/ancillary.qmd` | Ancillary variables |
| `js/opt-in.js` | Client-side opt-in check |
| `data/email-hashes.json` | SHA-256 hashes of committee contact emails (no plaintext) |
| `data/opted-in.json` | Public list of display names that asked to be listed |

## Name opt-in (privacy)

The Network page lets people already on the private committee contact list ask to be listed by name. The typed email is trimmed, lowercased, and hashed with SHA-256 **in the browser** (Web Crypto) and compared with `data/email-hashes.json`. The email is never uploaded or stored. On a match with consent, the display name is shown immediately in that browser (localStorage), and the visitor can open a pre-filled GitHub issue titled `opt-in: <display name>` that contains only the display name.

**Maintainers:** to publish a name for everyone, add the display name to `data/opted-in.json` (a JSON array of strings, e.g. `["Display Name"]`), rebuild, and push both branches. To remove a listing, delete it from that file and republish. Never commit plaintext emails, participant spreadsheets, or meeting notes.

## Rebuild and publish

The site uses [Quarto](https://quarto.org) and a two-branch layout (no GitHub Actions):

- `main` — Quarto sources (this branch)
- `gh-pages` — rendered `_site/` plus `.nojekyll`; GitHub Pages serves this branch from `/`

```bash
# 1. Edit sources on main, then render
quarto render                      # writes _site/

# 2. Commit and push sources
git add -A && git commit -m "Update content" && git push origin main

# 3. Publish the rendered site to gh-pages
rm -rf /tmp/ghp && git fetch origin gh-pages && git worktree add /tmp/ghp gh-pages
find /tmp/ghp -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a _site/. /tmp/ghp/
touch /tmp/ghp/.nojekyll
cd /tmp/ghp && git add -A && git commit -m "Publish site" && git push origin gh-pages
cd - && git worktree remove /tmp/ghp
```

Check that the render finished without errors before publishing so no partial HTML is pushed.

## Acknowledgment

This resource draws on the work of the FLUXNET-Coop CH₄/N₂O Data Processing Committee. Thanks to FLUXNET-Coop and to everyone who has contributed time, code, data, and workshop energy.
