import React, { FC } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import parse from "html-react-parser"
import DOMPurify from "dompurify"

interface MessageMarkdownProps {
  content: string
}

// Custom CSS to remove margins
const noMarginStyle = `
  ul, ol, li, p, h1, h2, h3, h4, h5, h6, blockquote {
    margin: 0 !important;
    padding: 0 !important;
  }
  ul, ol {
    list-style-position: inside !important;
  }
`

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  // Convert all <br> tags to \n line breaks for consistent behavior
  const processedContent = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<br\s*>/gi, "\n")

  // For content with HTML tags (except <br> which we converted)
  if (/<[a-z][\s\S]*>/i.test(content) && !/<br\s*\/?>/i.test(content)) {
    // Sanitize HTML content for security
    const sanitizedContent = DOMPurify.sanitize(processedContent)

    return (
      <>
        <style>{noMarginStyle}</style>
        <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full whitespace-pre-wrap break-words">
          {parse(sanitizedContent)}
        </div>
      </>
    )
  }

  // Default rendering with markdown
  return (
    <>
      <style>{noMarginStyle}</style>
      <MessageMarkdownMemoized
        className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full whitespace-pre-wrap break-words"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p({ children }) {
            return <p className="my-0">{children}</p>
          },
          ul({ children }) {
            return <ul className="my-0 pl-0">{children}</ul>
          },
          ol({ children }) {
            return <ol className="my-0 pl-0">{children}</ol>
          },
          li({ children }) {
            return <li className="my-0">{children}</li>
          },
          img({ node, ...props }) {
            return <img className="max-w-[67%]" {...props} />
          },
          code({ node, className, children, ...props }) {
            const childArray = React.Children.toArray(children)
            const firstChild = childArray[0] as React.ReactElement
            const firstChildAsString = React.isValidElement(firstChild)
              ? (firstChild as React.ReactElement).props.children
              : firstChild
            if (firstChildAsString === "▍") {
              return (
                <span className="mt-1 animate-pulse cursor-default">▍</span>
              )
            }
            if (typeof firstChildAsString === "string") {
              childArray[0] = firstChildAsString.replace("`▍`", "▍")
            }
            const match = /language-(\w+)/.exec(className || "")
            if (
              typeof firstChildAsString === "string" &&
              !firstChildAsString.includes("\n")
            ) {
              return (
                <code className={className} {...props}>
                  {childArray}
                </code>
              )
            }
            return (
              <MessageCodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(childArray).replace(/\n$/, "")}
                {...props}
              />
            )
          }
        }}
      >
        {processedContent}
      </MessageMarkdownMemoized>
    </>
  )
}
