// Parse Klaviyo flow / flow-action / flow-message resources in the revision 2025-01-15+ shape,
// falling back to the legacy (pre-2025) attribute fields. Every reader tolerates missing fields.
// Spec: klaviyo/openapi b29d5f7 openapi/stable.json (version 2026-01-15):
//   FlowActionEncodedResponseObjectResource.attributes = created, updated, definition
//   FlowMessageEncodedResponseObjectResource.attributes = channel, created, updated, definition
//   SendEmailAction {id,type:'send-email',links,data:{message:FlowEmail,status}}
//   TimeDelayAction {id,type:'time-delay',links,data:{unit,value,secondary_value,timezone}}
//   FlowEmail: name, subject_line, preview_text, from_email, from_label, template_id, id
//   FlowSms: name, body, id

const normType = (t) => (typeof t === 'string' ? t.toLowerCase().replace(/_/g, '-') : null);

// Accepts a flow-action resource ({attributes:{definition}}) or a bare definition action ({type,data}).
const actionDef = (a) => a?.attributes?.definition || (a?.type && a?.data !== undefined ? a : null) || {};
const actionType = (a) => normType(actionDef(a).type ?? a?.attributes?.action_type);
const actionStatus = (a) => actionDef(a).data?.status ?? a?.attributes?.status ?? null;

// Next action ids an action links to (plain step: next; split: next_if_true / next_if_false).
const nextIds = (def) => ['next', 'next_if_true', 'next_if_false'].map(k => def?.links?.[k]).filter(Boolean);

// Delay text for the time-delay action that links directly into actionId, e.g. "3 days".
// Legacy attributes.settings.delay wins if present. Returns 'Immediately' when nothing is found.
function delayBefore(action, defActions = []) {
  const legacy = action?.attributes?.settings?.delay || action?.attributes?.settings?.time_delay;
  if (legacy) return legacy;
  const id = action?.id ?? actionDef(action).id;
  const prev = defActions.map(actionDef).find(d => normType(d.type) === 'time-delay' && nextIds(d).includes(String(id)));
  const v = prev?.data?.value;
  if (v === undefined || v === null) return 'Immediately';
  const unit = prev.data.unit || 'days';
  return `${v} ${v === 1 ? unit.replace(/s$/, '') : unit}`;
}

// Message fields from a flow-message resource, the action's embedded data.message, or legacy attributes.
function messageFields(message, action) {
  const d = message?.attributes?.definition || {};
  const m = actionDef(action).data?.message || {};
  const a = message?.attributes || {};
  const c = a.content || {};
  const pick = (...vals) => vals.find(v => v !== undefined && v !== null && v !== '') ?? null;
  return {
    id: pick(message?.id, m.id, d.id),
    name: pick(d.name, m.name, a.name),
    subjectLine: pick(d.subject_line, m.subject_line, a.subject, c.subject),
    previewText: pick(d.preview_text, m.preview_text, c.preview_text),
    fromEmail: pick(d.from_email, m.from_email, c.from_email),
    fromLabel: pick(d.from_label, m.from_label, c.from_label),
    templateId: pick(d.template_id, m.template_id),
    body: pick(d.body, m.body, c.body),
    channel: pick(a.channel),
  };
}

// Actions from a Get Flow definition in graph order (entry_action_id, then links), unreached last.
function orderedDefinitionActions(definition) {
  const actions = Array.isArray(definition?.actions) ? definition.actions : [];
  const byId = new Map(actions.map(a => [String(a.id), a]));
  const seen = new Set(); const out = []; const queue = [definition?.entry_action_id].filter(Boolean).map(String);
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id) || !byId.has(id)) continue;
    seen.add(id); out.push(byId.get(id)); queue.push(...nextIds(byId.get(id)).map(String));
  }
  return out.concat(actions.filter(a => !seen.has(String(a.id))));
}

module.exports = { normType, actionDef, actionType, actionStatus, delayBefore, messageFields, orderedDefinitionActions, nextIds };
