/**
 * REFINZI — Destination Context Awareness
 * 
 * Provides secondary destination awareness:
 * Identifies the context of where the user is typing (Gmail, Notion, LinkedIn, ChatGPT, Zendesk, etc.).
 * If the website is unknown or custom, derives a clean site name or gracefully defaults to 'general'.
 * Unknown websites are FULLY supported.
 */

const KNOWN_DESTINATIONS: Record<string, string> = {
  'mail.google.com': 'Gmail',
  'outlook.live.com': 'Outlook',
  'outlook.office.com': 'Outlook',
  'outlook.office365.com': 'Outlook',
  'linkedin.com': 'LinkedIn',
  'twitter.com': 'X',
  'x.com': 'X',
  'reddit.com': 'Reddit',
  'notion.so': 'Notion',
  'slack.com': 'Slack',
  'discord.com': 'Discord',
  'zendesk.com': 'Zendesk',
  'salesforce.com': 'Salesforce',
  'hubspot.com': 'HubSpot',
  'chatgpt.com': 'ChatGPT',
  'claude.ai': 'Claude',
  'gemini.google.com': 'Gemini',
  'perplexity.ai': 'Perplexity',
  'github.com': 'GitHub',
  'docs.google.com': 'Google Docs',
  'word.office.com': 'Microsoft Word',
  'atlassian.net': 'Jira',
};

/**
 * Derives a clean human-readable destination context name.
 */
export function getDestinationName(host?: string): string {
  let hostname = host;
  if (!hostname && typeof window !== 'undefined' && window.location) {
    hostname = window.location.hostname;
  }

  if (!hostname) return 'general';
  hostname = hostname.toLowerCase();

  // 1. Check exact match
  if (KNOWN_DESTINATIONS[hostname]) {
    return KNOWN_DESTINATIONS[hostname];
  }

  // 2. Check suffix/subdomain match (e.g. company.zendesk.com -> Zendesk)
  for (const [domainKey, cleanName] of Object.entries(KNOWN_DESTINATIONS)) {
    if (hostname.endsWith(domainKey) || hostname.includes(domainKey)) {
      return cleanName;
    }
  }

  // 3. Handle local testing hosts
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'Local Test';
  }

  // 4. Derive from main domain name (e.g. "app.mycompany.com" -> "Mycompany")
  const parts = hostname.split('.').filter((p) => p !== 'www' && p !== 'app' && p !== 'com' && p !== 'io' && p !== 'co' && p !== 'net' && p !== 'org');
  if (parts.length > 0) {
    const mainPart = parts[parts.length - 1];
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  }

  return 'general';
}
