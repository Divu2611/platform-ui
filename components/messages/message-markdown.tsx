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

// Custom CSS to remove margins and fix list height issues, plus bold headers
const noMarginStyle = `
  /* Reset everything to avoid browser defaults */
  ul, ol, li, p, h1, h2, h3, h4, h5, h6, blockquote {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.5 !important;
  }
  
  /* Bold section headers */
  .section-header {
    font-weight: bold !important;
  }
  
  /* Fix list container heights */
  ul, ol, p, li {
    list-style-position: inside !important;
    height: 'fit-content' !important;
    min-height: 0 !important;
    max-height: 'fit-content' !important;
    display: table !important; /* Crucial for height matching */
    width: 100% !important;
    border-collapse: collapse !important;
  }
  
  /* Fix list item display */
  li, ul, ol {
    display: table-row !important; /* Crucial for height matching */
    height: 'fit-content' !important;
  }
  
  /* Disable default markers */
  ul, ol, li {
    list-style: none !important;
  }
  
  /* Override Tailwind prose spacing */
  .prose ul, .prose ol, .prose li, .prose p {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .prose ul li, .prose ol li {
    padding-left: 0 !important;
  }
  
  /* Remove any padding that might be causing the gap */
  .prose > ul, .prose > ol {
    padding: 0 !important;
    margin: 0 !important;
  }
`

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  // Convert all <br> tags to \n line breaks for consistent behavior
  const processedContent = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<br\s*>/gi, "\n")

  if (/<[a-z][\s\S]*>/i.test(content) && !/<br\s*\/?>/i.test(content)) {
    let processedHtml = processedContent.replace(
      /(<p>)(.*?:)(<\/p>)/g,
      '<p class="section-header">$2</p>'
    )

    const sanitizedContent = DOMPurify.sanitize(processedHtml)
    return (
      <>
        <style>{noMarginStyle}</style>
        <div
          className="prose dark:prose-invert min-w-full whitespace-pre-wrap break-words"
          style={{ lineHeight: 1, margin: 0, padding: 0 }}
        >
          {parse(sanitizedContent)}
        </div>
      </>
    )
  }

  return (
    <>
      <style>{noMarginStyle}</style>
      <MessageMarkdownMemoized
        className="prose dark:prose-invert min-w-full whitespace-pre-wrap break-words"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p(props) {
            const { children, ...rest } = props
            const textContent = React.Children.toArray(children)
              .map(child => (typeof child === "string" ? child : ""))
              .join("")
            const isHeader = textContent.trim().endsWith(":")

            return (
              <p
                {...rest}
                className={isHeader ? "section-header" : ""}
                style={{
                  margin: 0,
                  padding: 0,
                  lineHeight: 0,
                  height: "auto",
                  fontWeight: isHeader ? "bold" : "normal"
                }}
              >
                {children}
              </p>
            )
          },
          ul({ children }) {
            return (
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  lineHeight: 0,
                  listStyle: "none",
                  width: "100%",
                  height: "auto"
                }}
              >
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  lineHeight: 0,
                  listStyle: "none",
                  width: "100%",
                  height: "auto",
                  counterReset: "list-counter"
                }}
              >
                {children}
              </ol>
            )
          },
          li(props) {
            const { children, node, ...rest } = props
            return (
              <li
                {...rest}
                style={{
                  margin: 0,
                  padding: 0,
                  lineHeight: 0,
                  height: "auto",
                  listStylePosition: "inside"
                }}
              >
                {children}
                {/* <span style={{ flex: 1, margin: 0, padding: 0 }}>
                  {children}
                </span> */}
              </li>
            )
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
              return <span className="animate-pulse cursor-default">▍</span>
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
