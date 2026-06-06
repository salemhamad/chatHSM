import React from 'react';

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const lines = content.split('\n');
  
  const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      const isBold = i % 2 === 1;
      
      const codeParts = part.split('`');
      const rendered = codeParts.map((codePart, j) => {
        const isCode = j % 2 === 1;
        if (isCode) {
          return (
            <code key={j} className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-cyan-300 text-sm">
              {codePart}
            </code>
          );
        }
        return codePart;
      });

      if (isBold) {
        return (
          <strong key={i} className="font-semibold text-cyan-200">
            {rendered}
          </strong>
        );
      }
      return <React.Fragment key={i}>{rendered}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-1">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return (
            <h4 key={index} className="text-base font-bold mt-3 mb-1 text-white">
              {parseInline(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-white">
              {parseInline(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={index} className="text-xl font-bold mt-5 mb-2 text-white">
              {parseInline(line.slice(2))}
            </h2>
          );
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
          return (
            <ul key={index} className="list-disc ps-5 my-0.5">
              <li className="text-white/90">{parseInline(line.slice(2))}</li>
            </ul>
          );
        }

        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }

        // Standard paragraph
        return (
          <p key={index} className="my-0.5 text-white/90">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
};
