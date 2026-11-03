// Shape from Cofounder's read-only Get Flow (R7idNT) + klaviyo/openapi b29d5f7 stable.json (2026-01-15).
// Ids and keys only; no profile data. Values are placeholders.
const flow = {
  type: 'flow', id: 'FLOW1',
  attributes: {
    name: 'Welcome', status: 'live', archived: false, created: '2026-01-01T00:00:00+00:00', updated: '2026-01-01T00:00:00+00:00', trigger_type: 'Added to List',
    definition: {
      triggers: [{ type: 'list', id: 'LIST1' }],
      profile_filter: null,
      entry_action_id: 'A1',
      actions: [
        { id: 'A3', type: 'send-email', links: { next: null },
          data: { status: 'live', message: { id: 'M3', name: 'Welcome 2', subject_line: 'Subject 2', preview_text: 'Preview 2', from_email: 'from@example.com', from_label: 'Brand', reply_to_email: null, template_id: 'T3', smart_sending_enabled: true, transactional: false } } },
        { id: 'A1', type: 'send-email', links: { next: 'A2' },
          data: { status: 'live', message: { id: 'M1', name: 'Welcome 1', subject_line: 'Subject 1', preview_text: 'Preview 1', from_email: 'from@example.com', from_label: 'Brand', reply_to_email: null, template_id: 'T1', smart_sending_enabled: true, transactional: false } } },
        { id: 'A2', type: 'time-delay', links: { next: 'S1' }, data: { unit: 'days', value: 3, secondary_value: null, timezone: 'profile' } },
        { id: 'S1', type: 'conditional-split', links: { next_if_true: 'A3', next_if_false: null }, data: { profile_filter: { condition_groups: [] } } },
      ],
    },
  },
};
// Flow-action resource: attributes are only created, updated, definition.
const flowAction = { type: 'flow-action', id: 'A1', attributes: { created: '2026-01-01T00:00:00+00:00', updated: '2026-01-01T00:00:00+00:00', definition: flow.attributes.definition.actions[1] } };
const delayAction = { type: 'flow-action', id: 'A2', attributes: { created: null, updated: null, definition: flow.attributes.definition.actions[2] } };
// Flow-message resource: attributes are only channel ('Email'), created, updated, definition.
const flowMessage = { type: 'flow-message', id: 'M1', attributes: { channel: 'Email', created: null, updated: null,
  definition: { id: 'M1', name: 'Welcome 1', subject_line: 'Subject 1', preview_text: 'Preview 1', from_email: 'from@example.com', from_label: 'Brand', template_id: 'T1' } } };
module.exports = { flow, flowAction, delayAction, flowMessage };
