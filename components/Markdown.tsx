import { Fragment, type ReactNode } from 'react';
import { REDACTED } from '@/lib/sanitization';

// Small markdown subset for model responses: paragraphs, lists, fences, tables, bold, inline code.
// Swap for react-markdown later if the real models return richer output.

function inline(text: string, key: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[redacted\])/g);
  return parts.map((p, i) => {
    const k = `${key}-${i}`;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={k}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={k}>{p.slice(1, -1)}</code>;
    if (p === REDACTED) return <span key={k} className="redacted" title="Identity scrubbed before voting">redacted</span>;
    return <Fragment key={k}>{p}</Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;

    if (line.startsWith('```')) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      out.push(<pre key={key}><code>{body.join('\n')}</code></pre>);
      continue;
    }

    if (line.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <table key={key}>
          <thead><tr>{head.map((c, j) => <th key={j}>{inline(c, `${key}h${j}`)}</th>)}</tr></thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `${key}r${ri}${j}`)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    const bullet = /^\s*[-*] /;
    const numbered = /^\s*\d+\. /;
    if (bullet.test(line) || numbered.test(line)) {
      const re = bullet.test(line) ? bullet : numbered;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ''));
      const Tag = re === bullet ? 'ul' : 'ol';
      out.push(<Tag key={key}>{items.map((it, j) => <li key={j}>{inline(it, `${key}-${j}`)}</li>)}</Tag>);
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|\s*\||\s*[-*] |\s*\d+\. )/.test(lines[i])) {
      para.push(lines[i++].replace(/^#+\s*/, ''));
    }
    out.push(<p key={key}>{inline(para.join(' '), key)}</p>);
  }

  return <div className="prose-pair">{out}</div>;
}
