/**
 * Minimal Markdown -> HTML renderer for blog post content.
 *
 * Deliberately NOT a full Markdown implementation (no react-markdown or
 * similar is installed in this project, and this file can't run `npm
 * install` on your machine) -- it covers exactly the subset the admin form
 * is meant to be used with: ## / ### headings, blank-line-separated
 * paragraphs, **bold**, *italic*, and [link](url) syntax. If posts start
 * needing more (tables, images, nested lists), that's the signal to add a
 * real Markdown library instead of growing this by hand.
 *
 * HTML-escapes the raw input FIRST, then re-introduces only the specific
 * tags this function itself generates -- so a post body can never inject
 * arbitrary HTML/scripts, even though blog_posts is admin-only content.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

export function renderMarkdown(raw: string): string {
  const escaped = escapeHtml(raw)
  const blocks = escaped.split(/\n\s*\n/)

  return blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      const h3 = trimmed.match(/^###\s+(.*)$/)
      if (h3) return `<h3>${renderInline(h3[1])}</h3>`

      const h2 = trimmed.match(/^##\s+(.*)$/)
      if (h2) return `<h2>${renderInline(h2[1])}</h2>`

      // Blockquote (> text, one or more lines) -- rendered by the blog's
      // CSS as an editorial pull-quote (marginalia), not a boxed callout.
      if (trimmed.split('\n').every((line) => /^&gt;\s?/.test(line.trim()) || line.trim() === '')) {
        const quoteText = trimmed
          .split('\n')
          .map((line) => line.replace(/^&gt;\s?/, '').trim())
          .filter(Boolean)
          .join(' ')
        return `<blockquote>${renderInline(quoteText)}</blockquote>`
      }

      const boldLine = trimmed.match(/^\*\*(.+?)\*\*\s*$/)
      if (boldLine) return `<p><strong>${renderInline(boldLine[1])}</strong></p>`

      // A blank-line-separated block that's a run of `**Q**\nanswer` pairs
      // (our FAQ sections) -- render each line as its own paragraph so a
      // bolded question and its answer don't collapse onto one line.
      if (trimmed.includes('\n')) {
        return trimmed
          .split('\n')
          .map((line) => `<p>${renderInline(line.trim())}</p>`)
          .join('')
      }

      return `<p>${renderInline(trimmed)}</p>`
    })
    .join('\n')
}

/** Rough reading-time estimate for the "N min read" label -- 200 wpm,
 *  rounded up so a 1-word post still shows "1 min" not "0 min". */
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
