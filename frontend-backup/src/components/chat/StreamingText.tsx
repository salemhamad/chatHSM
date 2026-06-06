import { Markdown } from '../ui/Markdown';

interface StreamingTextProps {
  content: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({ content }) => {
  return (
    <div className="relative">
      <Markdown content={content} />
      <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-400 animate-blink" />
    </div>
  );
};
