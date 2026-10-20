// Client-side scrub so a response cannot reveal which model wrote it before the vote.
// The backend should sanitize too; this is the last line of defence in the browser.

const BRANDS = [
  'openai', 'chatgpt', 'gpt-?\\d[\\w.-]*', 'anthropic', 'claude', 'google', 'gemini', 'bard',
  'meta', 'llama', 'mistral', 'mixtral', 'deepseek', 'qwen', 'grok', 'xai', 'cohere',
];

const SELF_ID = [
  'as an ai (?:language )?model[^.,]*',
  "i(?:'m| am) (?:a )?(?:large )?language model[^.,]*",
  '(?:created|developed|trained|made|built) by \\w+',
];

const brandRe = new RegExp(`\\b(?:${BRANDS.join('|')})\\b`, 'gi');
const selfRe = new RegExp(SELF_ID.join('|'), 'gi');

export const REDACTED = '[redacted]';

export function sanitize(text: string): string {
  if (!text) return '';
  return text.replace(selfRe, REDACTED).replace(brandRe, REDACTED);
}
