// Sample content for the in-browser mock. Delete once the real backend is wired in.

export const MOCK_MODELS = [
  { id: 'claude', name: 'Claude Sonnet', provider: 'Anthropic', rating: 1288 },
  { id: 'gpt', name: 'GPT', provider: 'OpenAI', rating: 1274 },
  { id: 'gemini', name: 'Gemini Pro', provider: 'Google', rating: 1251 },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', rating: 1239 },
  { id: 'llama', name: 'Llama', provider: 'Meta', rating: 1217 },
  { id: 'mistral', name: 'Mistral Large', provider: 'Mistral AI', rating: 1206 },
];

export const PROMPT_SUGGESTIONS: Record<string, string[]> = {
  coding: [
    'Write a debounce hook in React that cancels on unmount.',
    'Why does my Python asyncio loop block when I call requests.get?',
  ],
  research: [
    'Summarise the trade-offs between RAG and fine-tuning for a support bot.',
    'What evidence is there that spaced repetition beats re-reading?',
  ],
  system: [
    'Design a rate limiter for a public API with 50k clients.',
    'How would you store and rank pairwise votes for 2M users?',
  ],
};

type Template = (prompt: string) => string;

const short = (p: string) => (p.length > 64 ? `${p.slice(0, 64).trim()}...` : p);

// Two voices per domain so A and B read differently: one terse, one thorough.
export const TEMPLATES: Record<string, Template[]> = {
  coding: [
    () => `Short version: keep the side effect inside the hook and clean it up.

\`\`\`ts
export function useDebounce<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
\`\`\`

The cleanup runs on every change and on unmount, so nothing fires late.`,
    (p) => `As an AI language model developed by Anthropic, I'll walk through this carefully.

**Task:** ${short(p)}

1. **Find the blocking call.** Anything synchronous inside the event loop stalls every other task.
2. **Swap the client.** Use an async client (httpx.AsyncClient or aiohttp) so the await actually yields.
3. **Bound concurrency.** Wrap requests in an asyncio.Semaphore(10) so you do not flood the target.

\`\`\`python
async with httpx.AsyncClient(timeout=10) as client:
    results = await asyncio.gather(*(client.get(u) for u in urls))
\`\`\`

**Edge case:** if a library has no async API, push it to a thread with \`asyncio.to_thread\`.`,
    (p) => `Here is a minimal, typed answer to "${short(p)}".

- Start from the failing case and write a test that reproduces it.
- Fix the smallest unit that makes the test pass.
- Only then refactor names and structure.

\`\`\`ts
it('cancels pending work on unmount', () => {
  const { unmount } = renderHook(() => useDebounce('x', 50));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
\`\`\``,
  ],
  research: [
    () => `**Answer in three lines**

RAG keeps knowledge fresh and auditable; fine-tuning changes tone and format, not facts.
For a support bot whose docs change weekly, start with RAG.
Fine-tune later only if responses still sound off-brand.`,
    (p) => `Let me frame "${short(p)}" as a comparison.

| | Retrieval (RAG) | Fine-tuning |
|---|---|---|
| Fresh facts | Yes, re-index docs | No, needs retraining |
| Citations | Natural | Hard |
| Cost to change | Low | High |
| Style control | Weak | Strong |

**What the evidence says:** most gains on factual QA come from retrieval quality (chunking, reranking), not model weights. Fine-tuning helps when the format is rigid, like JSON tickets.

**Caveat:** results vary by domain; run a 50-question eval on your own tickets before deciding.`,
    (p) => `I'm a large language model trained by Google, and here is how I would research this.

1. Define the question precisely: ${short(p)}
2. Collect primary sources first (papers, official docs), then commentary.
3. Look for disagreement between sources; that is where the real answer lives.

Bottom line: the strongest studies point the same way, but sample sizes are small, so treat it as likely rather than settled.`,
  ],
  system: [
    () => `Token bucket per API key, stored in Redis.

- Key: \`rl:{apiKey}\`, fields \`tokens\`, \`ts\`
- Refill lazily on each request with a Lua script so read and write are atomic
- 50k clients is roughly 50k small hashes, well under 100 MB

Return \`429\` with \`Retry-After\`. Done.`,
    (p) => `**Design for: ${short(p)}**

**1. Requirements.** Per-client limits, burst tolerance, under 2 ms overhead, survives a node restart.

**2. Algorithm.** Sliding-window log is exact but heavy. Token bucket gives bursts and constant memory, so pick that.

**3. Storage.** Redis cluster, one hash per client, atomic Lua refill. Shard by client id.

**4. Failure mode.** If Redis is unreachable, fail open with a local in-memory bucket and alert. Failing closed takes the whole API down with the limiter.

**5. Observability.** Emit \`allowed\`, \`throttled\` counters per plan tier so product can tune limits.`,
    (p) => `Think in layers for "${short(p)}":

- **Edge:** coarse IP limits at the CDN to absorb abuse.
- **Gateway:** per-key token bucket (Redis).
- **Service:** concurrency caps on expensive endpoints.

Each layer protects the next one, so no single limiter has to be perfect.`,
  ],
};

export const GENERIC_TEMPLATES: Template[] = [
  (p) => `Direct answer to "${short(p)}":

The most useful first step is to narrow the goal. Pick one outcome you can measure, try the simplest approach that could work, and adjust from what you observe.`,
  (p) => `**Breaking down: ${short(p)}**

1. **Context.** What constraints are fixed, and which are preferences?
2. **Options.** List two or three approaches with their costs.
3. **Decision.** Choose the one that is cheapest to reverse.
4. **Check.** Decide now what result would make you change course.`,
];
