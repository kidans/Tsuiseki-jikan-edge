# Upstream maintenance policy

Tsuiseki does not treat `LucasHenriqueDiniz/jikan-edge` as branch authority.

This public repository is an independently maintained downstream/reference fork. The original repository is an optional source of parser discoveries, MyAnimeList source-shape fixes, Cloudflare compatibility fixes, and other useful maintenance evidence. Upstream commits are reviewed semantically before adoption; they are not merged or pushed into `main` by automation.

The Production authority is the private Tsuiseki MAL Edge repository. A conflict-free Git merge is not evidence that an upstream change preserves Tsuiseki semantics.

## Intake rule

The recurring MAL Edge maintenance audit compares the last audited upstream SHA with current `LucasHenriqueDiniz/jikan-edge@main` and classifies relevant changes as:

- safe useful upstream maintenance;
- already present or superseded by Tsuiseki;
- conflicting with Tsuiseki semantics or architecture;
- irrelevant to Tsuiseki;
- requiring manual review.

Only an explicit, narrow Tsuiseki pull request may adopt an upstream behavior. No workflow in this repository may automatically merge or push parent history into `main`.

The former `.github/workflows/sync-parent.yml` transport was retired on 2026-09-24 because it encoded ancestry as authority and could reintroduce behavior Tsuiseki had intentionally corrected.
