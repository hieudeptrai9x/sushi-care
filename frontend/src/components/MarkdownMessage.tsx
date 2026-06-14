import { parseMarkdown, type InlinePart } from '../utils/markdown'

function InlineContent({ parts }: { parts: InlinePart[] }) {
  return parts.map((part, index) => part.type === 'strong'
    ? <strong key={index}>{part.value}</strong>
    : <span key={index}>{part.value}</span>)
}

export function MarkdownMessage({ content }: { content: string }) {
  return <div className="markdown-message">
    {parseMarkdown(content).map((block, index) => {
      if (block.type === 'heading') {
        return <h3 key={index}><InlineContent parts={block.content} /></h3>
      }
      if (block.type === 'ordered-list') {
        return <ol key={index}>{block.items.map((item, itemIndex) =>
          <li key={itemIndex}><InlineContent parts={item} /></li>)}</ol>
      }
      if (block.type === 'unordered-list') {
        return <ul key={index}>{block.items.map((item, itemIndex) =>
          <li key={itemIndex}><InlineContent parts={item} /></li>)}</ul>
      }
      return <p key={index}><InlineContent parts={block.content} /></p>
    })}
  </div>
}
