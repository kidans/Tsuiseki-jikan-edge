import { describe, expect, it } from 'vitest';
import { MalClient } from '../../src/source/mal-client';

const config = {
  profileTtlSeconds: 1,
  listTtlSeconds: 1,
  animeTtlSeconds: 1,
  catalogTtlSeconds: 1,
  sourceTimeoutMs: 1000,
  maxUpstreamBytes: 10_000,
  malUserAgent: 'test',
};

describe('anime detail structural validation', () => {
  it('accepts a legitimate anime detail page without a Genre field', async () => {
    const genrelessAnime = `<html><body>${'anime detail '.repeat(60)} Score: N/A Type: Music Status: Finished Airing</body></html>`;
    const client = new MalClient(config, async () => new Response(genrelessAnime, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }));

    const result = await client.getHtml(
      'https://myanimelist.net/anime/58313',
      ['Score:', 'Type:', 'Status:'],
    );

    expect(result.kind).toBe('success');
  });

  it('still rejects a challenge page even when universal detail markers are present', async () => {
    const challenge = `<html><body>${'challenge '.repeat(60)} Just a moment Score: N/A Type: Music Status: Finished Airing</body></html>`;
    const client = new MalClient(config, async () => new Response(challenge, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }));

    const result = await client.getHtml(
      'https://myanimelist.net/anime/58313',
      ['Score:', 'Type:', 'Status:'],
    );

    expect(result).toMatchObject({ kind: 'suspicious', reason: 'challenge_or_login' });
  });
});
