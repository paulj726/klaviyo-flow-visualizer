// Flow/flow-action/flow-message parsing for the 2025-01-15+ shape. Fixtures only; no live Klaviyo.
const test = require('node:test');
const assert = require('node:assert');
const S = require('../lib/klaviyoFlowShape');
const F = require('./fixtures/flow-shape.fixture');
const def = F.flow.attributes.definition;

test('flow-action type/status come from attributes.definition', () => {
  assert.strictEqual(S.actionType(F.flowAction), 'send-email');
  assert.strictEqual(S.actionStatus(F.flowAction), 'live');
});

test('legacy action_type SEND_EMAIL still recognised', () => {
  assert.strictEqual(S.actionType({ attributes: { action_type: 'SEND_EMAIL', status: 'live' } }), 'send-email');
  assert.strictEqual(S.actionStatus({ attributes: { status: 'draft' } }), 'draft');
});

test('flow-message fields come from definition (subject_line, name)', () => {
  const m = S.messageFields(F.flowMessage, F.flowAction);
  assert.deepStrictEqual(m, { id: 'M1', name: 'Welcome 1', subjectLine: 'Subject 1', previewText: 'Preview 1',
    fromEmail: 'from@example.com', fromLabel: 'Brand', templateId: 'T1', body: null, channel: 'Email' });
});

test('message fields fall back to the action data.message, then legacy attributes', () => {
  const m = S.messageFields(undefined, def.actions[0]);
  assert.strictEqual(m.id, 'M3'); assert.strictEqual(m.subjectLine, 'Subject 2');
  const legacy = S.messageFields({ id: 'X', attributes: { name: 'Old', content: { subject: 'S', preview_text: 'P' } } });
  assert.strictEqual(legacy.name, 'Old'); assert.strictEqual(legacy.subjectLine, 'S'); assert.strictEqual(legacy.previewText, 'P');
  assert.strictEqual(S.messageFields(undefined, undefined).name, null);
});

test('delay comes from the time-delay action linking into the send, (next link)', () => {
  assert.strictEqual(S.delayBefore({ id: 'S1' }, def.actions), '3 days');
  assert.strictEqual(S.delayBefore(F.flowAction, [F.flowAction, F.delayAction]), 'Immediately');
  const one = [{ id: 'D', type: 'time-delay', links: { next: 'A1' }, data: { unit: 'hours', value: 1 } }];
  assert.strictEqual(S.delayBefore(F.flowAction, one), '1 hour');
  assert.strictEqual(S.delayBefore({ id: 'A3' }, def.actions), 'Immediately'); // split, not delay, links into A3
  assert.strictEqual(S.delayBefore({ attributes: { settings: { delay: '2 days' } } }, []), '2 days');
});

test('definition actions ordered by entry_action_id and links (next / next_if_true)', () => {
  assert.deepStrictEqual(S.orderedDefinitionActions(def).map(a => a.id), ['A1', 'A2', 'S1', 'A3']);
  assert.deepStrictEqual(S.orderedDefinitionActions(undefined), []);
  assert.deepStrictEqual(S.orderedDefinitionActions({ actions: [{ id: 'Z' }] }).map(a => a.id), ['Z']);
});
