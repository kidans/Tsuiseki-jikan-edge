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

describe('manga detail structural validation', () => {
  it('accepts a legitimate manga detail page without a Genre field', async () => {
    const genrelessManga = `<html><body>${'manga detail '.repeat(60)} Score: N/A Type: Manga Status: Finished Published: Jan 1, 2015</body></html>`;
    const client = new MalClient(config, async () => new Response(genrelessManga, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }));

    const result = await client.getHtml(
      'https://myanimelist.net/manga/82743',
      ['Score:', 'Type:', 'Status:'],
    );

    expect(result.kind).toBe('success');
  });

  it('still rejects a challenge page even when universal detail markers are present', async () => {
    const challenge = `<html><body>${'challenge '.repeat(60)} Just a moment Score: N/A Type: Manga Status: Finished</body></html>`;
    const client = new MalClient(config, async () => new Response(challenge, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }));

    const result = await client.getHtml(
      'https://myanimelist.net/manga/82743',
      ['Score:', 'Type:', 'Status:'],
    );

    expect(result).toMatchObject({ kind: 'suspicious', reason: 'challenge_or_login' });
  });
});
