import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteNavbar from '@/components/layout/SiteNavbar'
import '@/app/page.css'
import SiteFooter from '@/components/layout/SiteFooter'
import FooterReveal from '@/components/landing/FooterReveal'
import { getCurrentTenant } from '@/lib/tenants/server'
import { getPublishedBlogPostBySlugServer, listPublishedBlogPostsServer } from '@/lib/blog.server'
import { renderMarkdown, estimateReadingMinutes } from '@/lib/markdown'
import BookReader from './BookReader'


interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlugServer(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.meta_description ?? post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
    },
  }
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── "The Practice Notebook" tokens -- kept identical to /blog/page.tsx ──
const PAPER = '#FBF7F0'
const RULE = '#E4DCC9'

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const tenant = await getCurrentTenant()
  const post = await getPublishedBlogPostBySlugServer(slug)

  if (!post) notFound()

  const contentHtml = renderMarkdown(post.content)

  return (
    <div className="flex flex-col blog-post-shell" style={{ background: PAPER }}>
      <SiteNavbar tenant={{ brandName: tenant.brandName }} />

      {/* Exactly one viewport tall — nav + back-link + book fit here with
          no scrolling needed. Footer lives below this box as normal
          scrollable content, reachable by scrolling further, but never
          required just to see the book itself. */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          height: 'calc(100dvh - var(--nav-h, 72px))',
          marginTop: 'var(--nav-h, 72px)',
          background: PAPER,
          backgroundImage: `
            repeating-linear-gradient(
              to bottom,
              transparent 0px, transparent 35px,
              ${RULE}66 35px, ${RULE}66 36px
            ),
            url('/grain.png')
          `,
          backgroundSize: 'auto, 480px',
          backgroundBlendMode: 'normal, multiply',
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-6 pt-15">

          {/* Back — fixed height, not part of the book */}
          <Link
            href="/blog"
            className="mb-4 ml-6 inline-flex shrink-0 items-center gap-2 self-start text-sm font-medium text-[#5d665f] hover:text-[#2B3B37]"
          >
            <ArrowLeft size={15} />
            ALL BLOGS
          </Link>

          {/* BOOK — margin on all 4 sides via the p-4 wrapper below, fills
              exactly the remaining space in this viewport-height box. */}
          <div className="min-h-0 flex-1 p-4">
            <BookReader
              title={post.title}
              dateLabel={formatDate(post.published_at)}
              readingMinutes={estimateReadingMinutes(post.content)}
              contentHtml={contentHtml}
            />
          </div>
        </div>
      </div>

      <style>{`
.blog-book-header{
    margin-bottom:2rem;
}
.blog-book-kicker{
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-bottom:1px solid #ddd0b7;
    padding-bottom:1rem;
    margin-bottom:1.25rem;
    font-size:.7rem;
    text-transform:uppercase;
    letter-spacing:.35em;
    color:#8c7b63;
}
.blog-book-meta{
    display:flex;
    align-items:center;
    gap:.5rem;
    margin-bottom:1.25rem;
    font-size:.7rem;
    text-transform:uppercase;
    letter-spacing:.18em;
    color:#8c7b63;
}
.blog-book-dot{
    width:8px;
    height:8px;
    border-radius:999px;
    background:#ff9933;
    display:inline-block;
}
.blog-book-title{
    font-family:var(--font-fraunces);
    color:#26332F;
    font-weight:500;
    font-size:2.2rem;
    line-height:1.15;
}

.blog-book-columns{
    font-size:16px;
    line-height:1.85;
    color:#37403B;
}

.blog-book-columns p{
    margin-bottom:1.4rem;
}

.blog-book-columns h2{
    margin-top:2.25rem;
    margin-bottom:.9rem;
    font-size:1.6rem;
    font-family:var(--font-fraunces);
    color:#24312E;
    font-weight:500;
}

.blog-book-columns h3{
    margin-top:1.75rem;
    margin-bottom:.7rem;
    font-size:1.25rem;
    font-family:var(--font-fraunces);
    color:#24312E;
}

.blog-book-columns strong{
    color:#202c29;
}

.blog-book-columns ul{
    padding-left:1.5rem;
    margin:1.1rem 0;
    break-inside:avoid-column;
}

.blog-book-columns li{
    margin-bottom:.6rem;
}

.blog-book-columns a{
    color:#a85c05;
    text-decoration:none;
    border-bottom:1px solid #ff9933;
}

.blog-book-columns blockquote{
    position:relative;
    margin:2rem 0;
    padding-left:1.5rem;
    font-size:1.15rem;
    line-height:1.6;
    font-family:var(--font-fraunces);
    color:#24312E;
    font-style:italic;
    border-left:2px solid #d5c6a7;
    break-inside:avoid-column;
}
.blog-book-columns blockquote::before{
    content:"";
    position:absolute;
    width:7px;
    height:7px;
    border-radius:999px;
    background:#ff9933;
    left:-4.5px;
    top:8px;
}

.blog-book-columns img{
    max-width:100%;
    margin:1.5rem 0;
    border-radius:10px;
    box-shadow:0 15px 40px rgba(0,0,0,.12);
    break-inside:avoid-column;
}

.blog-book-columns hr{
    margin:2rem 0;
    border:none;
    border-top:1px solid #ddd0b7;
}

/* This page's book viewport is exactly one dvh tall, so the footer sits
   right at the bottom edge of the initial viewport -- the global
   "hide nav while footer is in view" rule (globals.css, driven by
   SiteFooter's IntersectionObserver at threshold:0.01) was firing the
   instant the page loaded, before the user ever scrolled, hiding the nav
   permanently. Scoped override: keep the nav visible here regardless of
   footer-in-view state. Higher specificity than the global rule (3
   classes vs 2), so no !important needed. */
body.footer-in-view .blog-post-shell .site-topnav{
    opacity:1;
    transform:none;
    pointer-events:auto;
}
      `}</style>

      <SiteFooter tenant={{ brandName: tenant.brandName, footerTagline: tenant.footerTagline }} />

      <FooterReveal wordmark={tenant.brandName} />
    </div>
  )
}
