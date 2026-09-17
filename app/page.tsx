'use client';

import React, { useState } from 'react';
import { Swords, Trophy, CheckCircle, Send } from 'lucide-react';

// --- Integrated Logic & Types (No external imports needed) ---
interface ModelCandidate {
  id: string;
  name: string;
  provider: string;
}

const AVAILABLE_MODELS: ModelCandidate[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta' },
];

function initializeBlindBattle(): { modelA: ModelCandidate; modelB: ModelCandidate } {
  const shuffled = [...AVAILABLE_MODELS].sort(() => 0.5 - Math.random());
  return {
    modelA: shuffled[0],
    modelB: shuffled[1],
  };
}

function sanitizeOutput(rawText: string, modelName: string, provider: string): string {
  const pattern = new RegExp(`(as an ai language model|developed by ${provider}|i am ${modelName})`, 'gi');
  return rawText.replace(pattern, '[Identity Redacted]');
}

// --- Main Arena App Component ---
export default function ArenaApp() {
  const [activeTab, setActiveTab] = useState<'arena' | 'leaderboard'>('arena');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const [modelA, setModelA] = useState<ModelCandidate | null>(null);
  const [modelB, setModelB] = useState<ModelCandidate | null>(null);
  const [responseA, setResponseA] = useState<string | null>(null);
  const [responseB, setResponseB] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteChoice, setVoteChoice] = useState<string | null>(null);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Claude 3 Haiku', elo: 1045, wins: 14, matches: 20 },
    { rank: 2, name: 'GPT-4o Mini', elo: 1022, wins: 12, matches: 19 },
    { rank: 3, name: 'Gemini 1.5 Flash', elo: 995, wins: 9, matches: 18 },
    { rank: 4, name: 'Llama 3.1 8B', elo: 938, wins: 6, matches: 17 },
  ]);

  const handleStartBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setHasVoted(false);
    setVoteChoice(null);
    setResponseA(null);
    setResponseB(null);

    const selection = initializeBlindBattle();
    setModelA(selection.modelA);
    setModelB(selection.modelB);

    setTimeout(() => {
      setResponseA(
        sanitizeOutput(
          `To address "${prompt}": Architectural trade-offs require balancing execution speed with decoupled modular boundaries.`,
          selection.modelA.name,
          selection.modelA.provider
        )
      );
      setResponseB(
        sanitizeOutput(
          `Regarding "${prompt}": First-principles engineering prioritizes runtime efficiency, structured state management, and clear APIs.`,
          selection.modelB.name,
          selection.modelB.provider
        )
      );
      setLoading(false);
    }, 1000);
  };

  const castVote = (choice: 'model_a' | 'model_b' | 'tie') => {
    if (hasVoted || !modelA || !modelB) return;
    setHasVoted(true);
    setVoteChoice(choice);

    setLeaderboard((prev) =>
      prev
        .map((item) => {
          if (choice === 'model_a' && item.name === modelA.name) {
            return { ...item, elo: item.elo + 16, wins: item.wins + 1, matches: item.matches + 1 };
          }
          if (choice === 'model_b' && item.name === modelB.name) {
            return { ...item, elo: item.elo + 16, wins: item.wins + 1, matches: item.matches + 1 };
          }
          return item;
        })
        .sort((a, b) => b.elo - a.elo)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Tabs */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">⚔️</span> AI Benchmark Arena
          </h1>
          <p className="text-xs text-slate-400 mt-1">Blind Pairwise Human Evaluation & Dynamic Leaderboard</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'arena' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" /> Battle Arena
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> Global Leaderboard
          </button>
        </div>
      </header>

      {/* Arena View */}
      {activeTab === 'arena' ? (
        <div className="space-y-6">
          <form onSubmit={handleStartBattle} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Enter Evaluation Prompt
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a technical or comparative question..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Evaluating...' : 'Battle'}
              </button>
            </div>
          </form>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-bold tracking-wide text-indigo-400 uppercase">
                    {hasVoted ? `Model: ${modelA?.name}` : '🔒 Model A (Masked)'}
                  </span>
                  {hasVoted && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                  </div>
                ) : responseA ? (
                  <p className="text-sm text-slate-300 leading-relaxed">{responseA}</p>
                ) : (
                  <p className="text-xs text-slate-500 italic">Outputs render here once prompt is submitted.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-bold tracking-wide text-indigo-400 uppercase">
                    {hasVoted ? `Model: ${modelB?.name}` : '🔒 Model B (Masked)'}
                  </span>
                  {hasVoted && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                  </div>
                ) : responseB ? (
                  <p className="text-sm text-slate-300 leading-relaxed">{responseB}</p>
                ) : (
                  <p className="text-xs text-slate-500 italic">Outputs render here once prompt is submitted.</p>
                )}
              </div>
            </div>
          </div>

          {/* Voting Controls */}
          {responseA && responseB && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {hasVoted
                  ? `✅ Selected: ${voteChoice?.replace('_', ' ').toUpperCase()} — Identities unmasked.`
                  : '👉 Cast vote based on response quality:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => castVote('model_a')}
                  disabled={hasVoted}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                >
                  Model A is Better
                </button>
                <button
                  onClick={() => castVote('model_b')}
                  disabled={hasVoted}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                >
                  Model B is Better
                </button>
                <button
                  onClick={() => castVote('tie')}
                  disabled={hasVoted}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-bold transition"
                >
                  Tie
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Leaderboard View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Current Model Standings</h2>
            <p className="text-xs text-slate-400">Live rankings updated via Bradley-Terry Elo updates</p>
          </div>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Model Name</th>
                <th className="px-6 py-4">Elo Rating</th>
                <th className="px-6 py-4">Wins</th>
                <th className="px-6 py-4">Battles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leaderboard.map((item) => (
                <tr key={item.name} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-bold text-indigo-400">#{item.rank}</td>
                  <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400">{item.elo}</td>
                  <td className="px-6 py-4">{item.wins}</td>
                  <td className="px-6 py-4">{item.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}