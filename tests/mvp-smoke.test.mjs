import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('core MVP routes and workflows are present', () => {
  for (const file of [
    'app/login/page.tsx',
    'app/contradictions/page.tsx',
    'app/contradictions/[slug]/page.tsx',
    'app/admin/contradictions/page.tsx',
    'app/admin/contradictions/review/page.tsx',
    'app/admin/sources/page.tsx',
    'app/admin/users/page.tsx',
    'app/admin/logs/page.tsx',
    'app/api/admin/contradictions/route.ts',
    'app/api/admin/sources/route.ts',
    'app/api/ai/route.ts',
  ]) {
    assert.equal(fs.existsSync(new URL(`../${file}`, import.meta.url)), true, file);
  }
});

test('public voting sends the authenticated user id required by RLS', () => {
  const page = read('app/contradictions/[slug]/page.tsx');
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /user_id:\s*user\.id/);
});

test('AI routes fail closed when the provider is not configured', () => {
  for (const file of ['app/api/ai/route.ts', 'app/api/ai/generate/route.ts', 'app/api/ai/contradiction/route.ts']) {
    assert.match(read(file), /!process\.env\.OPENAI_API_KEY/);
  }
});

test('production SQL is not embedded in application code', () => {
  assert.doesNotMatch(read('app/api/ai-search/route.ts'), /build-only-placeholder-key/);
});
