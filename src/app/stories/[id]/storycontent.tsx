interface StoryContentProps {
  content?: string;
}

export default function StoryContent({ content }: StoryContentProps) {
  if (!content) {
    return null;
  }
  
  return (
    <div className="prose prose-lg max-w-none mb-16">
      {content.split('\n').map((paragraph: string, index: number) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}
