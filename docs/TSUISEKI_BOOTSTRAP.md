# Tsuiseki MAL Edge bootstrap

This fork is maintained for Tsuiseki as an exact-MyAnimeList factual/taxonomy evidence service.

Upstream: `LucasHenriqueDiniz/jikan-edge` (MIT). Keep upstream attribution and license intact.

## Initial Production contract

Tsuiseki should depend only on:

```text
GET /health
GET /v1/anime/:malId
GET /v1/manga/:malId
```

The fork currently preserves the upstream route surface during bootstrap so we can deploy and validate an unchanged known-good baseline first. Broad routes are **not** part of Tsuiseki's accepted dependency contract and may be trimmed after exact-id acceptance.

Identity rule:

```text
TSUI UUID + exact accepted MAL alias
→ exact MAL Edge detail request
```

Never use MAL Edge title search as canonical identity authority.

## Cloudflare setup handoff

Run from this repository/branch after authenticating Wrangler to the intended Cloudflare account:

```bash
pnpm install --frozen-lockfile
npx wrangler login
npm run setup:tsuiseki
npm run test
npm run typecheck
npm run build
npm run deploy
```

`setup:tsuiseki` must:

- create or reuse D1 `tsuiseki-jikan-edge`;
- replace the fail-safe placeholder D1 id in `wrangler.jsonc`;
- keep upstream `jikan.lucashdo.com` routes absent;
- identify the Worker as `tsuiseki-jikan-edge`;
- apply all D1 migrations.

Do not deploy if `wrangler.jsonc` still contains the all-zero D1 placeholder.

After setup, inspect the `wrangler.jsonc` diff and commit the resolved D1 binding back to the bootstrap PR so future deployments are reproducible. The D1 database id is configuration, not a credential. Never commit Cloudflare API tokens, OAuth/session material, or other authentication secrets.

## First live acceptance

After deployment, record the Worker URL and verify:

```bash
curl -fsS https://<worker>/health
curl -fsS https://<worker>/v1/anime/1
curl -fsS https://<worker>/v1/manga/2
```

Require:

- health database check = `ok`;
- exact requested MAL id is echoed by the response;
- anime and manga detail responses contain the expected normalized `data` object;
- repeat requests become cached;
- a known cached row can be served stale if an upstream refresh fails;
- no redirects or requests leave the allowed `myanimelist.net` source policy.

## Tsuiseki integration boundary

Do **not** rewrite Tsuiseki consumers around the jikan-edge wire schema.

Introduce/retain one internal MAL evidence contract in the main Tsuiseki repository and adapt this service into it. The rest of Tsuiseki should not care whether MAL evidence came from historical Jikan v4 or Tsuiseki MAL Edge.

Desired reading/anime factual ladder after acceptance:

```text
accepted local state
→ Tsuiseki MAL Edge
→ Shikimori
→ AniList terminal
→ truthful unresolved
```

AniList remains terminal and independently disableable.

D1 is an upstream cache/LKG buffer only. Accepted canonical facts and provenance remain in Tsuiseki's canonical database under the existing TSUI UUID.

## Provenance

New evidence from this service must not be mislabeled as `jikan` merely for compatibility. Use a distinct provider/source identity such as `mal_edge` once the main Tsuiseki schema/policy is reviewed.

Historical Jikan observations remain `jikan`.

## Phase H gate

Do not begin broad Reading Factual Phase H merely because this Worker deploys.

First prove:

1. Worker + D1 exact-id anime/manga acceptance;
2. Tsuiseki adapter normalization and exact-id guard;
3. `MAL Edge → Shikimori → AniList terminal` sequencing;
4. provider-off/local-only product acceptance remains green;
5. MAL Edge outage retains Tsuiseki LKG and falls back without identity mutation;
6. bounded call accounting/backoff is preserved.

Then Phase H may resume with MAL Edge as the primary MAL factual resolver.
