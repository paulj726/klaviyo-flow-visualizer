// Shared Klaviyo API settings. The ONE place the API revision is set.
// Revisions are supported for 2 years; 2024-10-15 reached end of support on 2026-10-15.
// Changelog: https://developers.klaviyo.com/en/docs/changelog
const KLAVIYO_REVISION = '2026-01-15'; // supported until ~Jan 2028
const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api';

// Follow cursor paging (links.next) for a list endpoint and return all `data` items.
// fetchJson(endpoint) must fetch `${KLAVIYO_API_BASE}${endpoint}` and return parsed JSON.
// Next links are only followed on the Klaviyo API host, so the API key never goes elsewhere.
async function fetchAllPages(endpoint, fetchJson, maxPages = 50) {
  const items = [];
  let next = endpoint;
  for (let page = 0; next && page < maxPages; page++) {
    const result = await fetchJson(next);
    items.push(...(result?.data || []));
    const link = result?.links?.next;
    next = link && link.startsWith(KLAVIYO_API_BASE + '/') ? link.slice(KLAVIYO_API_BASE.length) : null;
  }
  return items;
}

module.exports = { KLAVIYO_REVISION, KLAVIYO_API_BASE, fetchAllPages };
