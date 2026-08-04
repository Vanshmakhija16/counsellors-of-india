import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowRight, ArrowUpRight, PenLine } from 'lucide-react'
import { getCurrentTenant } from '@/lib/tenants/server'
import { listPublishedBlogPostsServer } from '@/lib/blog.server'
import type { BlogPost } from '@/lib/blog'
import { estimateReadingMinutes } from '@/lib/markdown'
import FooterReveal from '@/components/landing/FooterReveal'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practice-growth tips, guides, and stories for therapists and counsellors.',
}

// ── "The Practice Notebook" design tokens ──────────────────────────────
// Paper, not stark white; deep forest ink instead of near-black; saffron
// reserved for small signature marks only (dots, underlines, tag borders)
// -- never as a background fill. See src/app/blog/[slug]/page.tsx for the
// matching post-page tokens and the pull-quote/marginalia treatment.
const PAPER   = '#FBF7F0'
const INK     = '#2B3B37'
const INK_MUT = '#6B7570'
const RULE    = '#E4DCC9'
const SAFFRON = '#FF9933'

// A small family of cloth-bound greens -- variety like a real shelf, but
// staying inside the notebook palette rather than going full rainbow.
const SPINE_COLORS = ['#2F4A45', '#3B5744', '#26362F', '#3A4A38', '#2A403D']

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Closed spine -- a book standing upright, viewed from the side ──────
function SpineBook({ post, index, wide }: { post: BlogPost; index: number; wide: boolean }) {
  const color = SPINE_COLORS[index % SPINE_COLORS.length]
  return (
    <button
      type="button"
      data-role="spine-book"
      data-book-id={post.id}
      data-spine-index={index}
      className="group relative shrink-0 self-stretch transition-transform duration-300 ease-out hover:-translate-y-3"
      style={{ width: wide ? 56 : 48 }}
      title={post.title}
    >
      <div
        data-spine-bg="true"
        className="relative h-full overflow-hidden rounded-t-[4px]"
        style={{
          background: `linear-gradient(to right, rgba(255,255,255,0.16) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.35) 100%), ${color}`,
          boxShadow: '3px 0 8px rgba(0,0,0,0.18)',
        }}
      >
        <div className="absolute inset-x-[14%] top-[9%] h-[2px]" style={{ background: `${SAFFRON}90` }} />
        <div className="absolute inset-x-[14%] bottom-[9%] h-[2px]" style={{ background: `${SAFFRON}90` }} />

        <div className="absolute inset-0 flex items-center justify-center py-12">
          <span
            data-spine="title"
            className="line-clamp-1 text-[11px] font-semibold tracking-[0.04em]"
            style={{
              writingMode: 'vertical-rl',
              fontFamily: 'var(--font-fraunces)',
              color: '#F2E9D8',
              maxHeight: '78%',
            }}
          >
            {post.title}
          </span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -bottom-2 left-[8%] right-[8%] h-2 rounded-full opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: 'rgba(32,46,40,0.45)' }}
      />
    </button>
  )
}

// ── Center book, open -- the featured post shown across two pages ──────
function OpenBook({ post, coverStart, coverEnd }: { post: BlogPost; coverStart: string; coverEnd: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-role="open-book"
      data-book-id={post.id}
      className="group relative mx-1 shrink-0 sm:mx-3"
      title={post.title}
    >
      <div className="relative w-[340px] sm:w-[520px]">
        <div
          data-cover="background"
          className="absolute inset-x-[6%] bottom-0 h-[90%] rounded-t-[7px]"
          style={{
            background: 'linear-gradient(155deg, var(--cover-start, #2F4A45), var(--cover-end, #223228))',
            '--cover-start': coverStart,
            '--cover-end': coverEnd,
          } as React.CSSProperties}
        />

        <div className="relative flex items-end justify-center">
          <div
            className="pointer-events-none absolute left-[10%] bottom-0 h-[280px] w-[44%] rounded-tl-[7px] rounded-bl-[3px] bg-[#F0E9D8] sm:h-[335px]"
            style={{ transform: 'rotate(-0.9deg)' }}
          />
          <div
            className="pointer-events-none absolute right-[10%] bottom-0 h-[280px] w-[44%] rounded-tr-[7px] rounded-br-[3px] bg-[#F0E9D8] sm:h-[335px]"
            style={{ transform: 'rotate(0.9deg)' }}
          />
          <div
            className="relative z-10 h-[280px] w-[52%] origin-bottom-right rounded-tl-[7px] rounded-bl-[3px] sm:h-[335px]"
            style={{
              background: '#F8F2E4',
              boxShadow: '-3px 5px 12px rgba(0,0,0,0.12)',
              transform: 'rotate(-1.2deg)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2"
            style={{ background: '#E8DDD0' }}
          />
          <div
            className="relative z-10 h-[280px] w-[52%] origin-bottom-left rounded-tr-[7px] rounded-br-[3px] sm:h-[335px]"
            style={{
              background: '#F8F2E4',
              boxShadow: '3px 5px 12px rgba(0,0,0,0.12)',
              transform: 'rotate(1.2deg)',
            }}
          />

          <div data-open-content className="pointer-events-none absolute inset-x-0 bottom-0 top-2 z-30 grid grid-cols-2 gap-6 px-8 sm:px-14">
            <div className="flex flex-col items-start justify-center gap-3 text-left">
              <span className="h-px w-10" style={{ background: SAFFRON }} />
              <p data-open="meta" className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: INK_MUT }}>
                {formatDate(post.published_at)} &middot; {estimateReadingMinutes(post.content)} min read
              </p>
              <h2
                data-open="title"
                className="text-[19px] leading-[1.3] sm:text-[24px]"
                style={{ fontFamily: 'var(--font-fraunces)', color: INK, fontWeight: 500 }}
              >
                {post.title}
              </h2>
              <span className="h-px w-10" style={{ background: SAFFRON }} />
            </div>

            <div className="relative flex flex-col items-start justify-center gap-3 text-left">
              <span className="h-px w-10" style={{ background: SAFFRON }} />
              {post.excerpt ? (
                <p
                  data-open="excerpt"
                  className="text-[12px] italic leading-relaxed sm:text-[13px]"
                  style={{ fontFamily: 'var(--font-fraunces)', color: INK_MUT }}
                >
                  &ldquo;{post.excerpt}&rdquo;
                </p>
              ) : (
                <div className="h-0.5 w-16 rounded-full bg-[#E7DCC8]" />
              )}
              <div
                className="pointer-events-none absolute bottom-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45"
                style={{ background: SAFFRON }}
              >
                <ArrowUpRight size={16} color="#223029" strokeWidth={2.5} />
              </div>
              <span className="h-px w-10" style={{ background: SAFFRON }} />
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute -bottom-3 left-[10%] right-[10%] h-3 rounded-full blur-md"
          style={{ background: 'rgba(32,46,40,0.42)' }}
        />
      </div>
    </Link>
  )
}

export default async function BlogPage() {
  const tenant = await getCurrentTenant()
  const posts = await listPublishedBlogPostsServer()

  const [activePost, ...spinePosts] = posts
  const half = Math.ceil(spinePosts.length / 2)
  const leftSpines = spinePosts.slice(0, half)
  const rightSpines = spinePosts.slice(half)

  return (
    <div className="flex min-h-screen flex-col" style={{ background: PAPER }}>
      <SiteNav tenant={{ brandName: tenant.brandName }} />

      {/* ── Hero: faint ruled-notebook lines + paper grain ─────────────── */}
      <section
        className="relative overflow-hidden px-6 pt-24 pb-10"
        style={{
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
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="h-px w-8" style={{ background: SAFFRON }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: SAFFRON }}>
              The Practice Notebook
            </span>
            <span className="h-px w-8" style={{ background: SAFFRON }} />
          </div>
          <h1
            className="text-4xl leading-[1.15] sm:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)', color: INK, fontWeight: 500 }}
          >
            {/* Notes on building a calm, thriving practice. */} Blogs
          </h1>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="flex-1 px-6 pb-24">
          <div
            className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border px-8 py-16 text-center"
            style={{ borderColor: RULE, borderStyle: 'dashed', background: '#FFFFFF80' }}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#FFF1DC', color: '#9A5200' }}>
              <PenLine size={22} />
            </div>
            <h2 className="mb-2 text-[22px]" style={{ fontFamily: 'var(--font-fraunces)', color: INK }}>
              First entries coming soon
            </h2>
            <p className="mb-7 max-w-sm text-[13.5px] leading-relaxed" style={{ color: INK_MUT }}>
              We&apos;re writing guides on growing a private practice, getting your first online clients, and running
              a calm, well-organised counselling business. Check back soon.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold text-white transition"
              style={{ background: SAFFRON }}
            >
              List your practice <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="flex-1 overflow-x-auto px-6 pb-28">
          {/* ── The shelf: closed spines flank one open book in the
              center. The open book carries the latest post's headline
              and excerpt across its two pages; every spine (and the open
              book) is its own link to that post. A shelf ledge with a
              soft under-shadow grounds the whole row. ── */}
          <div className="mx-auto w-fit min-w-full" data-bookshelf>
            <div className="flex items-end justify-center gap-2.5 px-4 pt-1 sm:gap-3.5">
                          {activePost && (
                <OpenBook
                  post={activePost}
                  coverStart={SPINE_COLORS[0]}
                  coverEnd="#223228"
                />
              )}
              {leftSpines.map((post, i) => (
                <SpineBook key={post.id} post={post} index={i} wide={i % 2 === 0} />
              ))}



              {rightSpines.map((post, i) => (
                <SpineBook key={post.id} post={post} index={i + half} wide={i % 2 === 1} />
              ))}
            </div>

            <div className="relative mx-auto mt-3 max-w-4xl">
              <div className="h-[8px] rounded-[2px]" style={{ background: '#DCCFAF' }} />
              <div className="h-[4px] rounded-b-[2px]" style={{ background: '#C9B990' }} />
            </div>
          </div>

          <Script id="blog-bookshelf-swap" strategy="afterInteractive">
            {`
              (function() {
                const shelf = document.querySelector('[data-bookshelf]');
                if (!shelf) return;

                const centerBook = shelf.querySelector('[data-role="open-book"]');
                const spineBooks = Array.from(shelf.querySelectorAll('[data-role="spine-book"]'));
                const coverBg = centerBook?.querySelector('[data-cover="background"]');
                const postData = ${JSON.stringify([
                  activePost,
                  ...leftSpines,
                  ...rightSpines,
                ].map((post, index) => ({
                  id: post.id,
                  slug: post.slug,
                  title: post.title,
                  excerpt: post.excerpt || '',
                  published_at: post.published_at,
                  minutes: estimateReadingMinutes(post.content),
                  coverStart: SPINE_COLORS[index % SPINE_COLORS.length],
                  coverEnd: '#223228',
                  spineColor: SPINE_COLORS[index % SPINE_COLORS.length],
                })))};

                let currentOpenId = centerBook?.dataset.bookId || '';
                if (!currentOpenId) return;

                const getPost = (id) => postData.find((post) => String(post.id) === String(id));
                const formatDate = (iso) => {
                  if (!iso) return '';
                  const date = new Date(iso);
                  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                };

                const openContent = centerBook?.querySelector('[data-open-content]');
                const setCenterOpen = (isOpen) => {
                  if (!centerBook) return;
                  centerBook.dataset.open = isOpen ? 'true' : 'false';
                  if (openContent) {
                    openContent.style.display = isOpen ? 'grid' : 'none';
                    openContent.style.opacity = isOpen ? '1' : '0';
                    openContent.style.pointerEvents = isOpen ? 'auto' : 'none';
                  }
                };

                if (centerBook && openContent) {
                  setCenterOpen(centerBook.dataset.open !== 'false');
                }

                const updateCenter = (post) => {
                  if (!centerBook) return;
                  centerBook.dataset.bookId = post.id;
                  centerBook.href = '/blog/' + post.slug;
                  centerBook.querySelector('[data-open="title"]').textContent = post.title;
                  centerBook.querySelector('[data-open="meta"]').textContent = formatDate(post.published_at) + ' · ' + post.minutes + ' min read';
                  const excerptNode = centerBook.querySelector('[data-open="excerpt"]');
                  if (excerptNode) {
                    excerptNode.textContent = post.excerpt ? '“' + post.excerpt + '”' : '';
                  }
                  if (coverBg) {
                    coverBg.style.setProperty('--cover-start', post.coverStart);
                    coverBg.style.setProperty('--cover-end', post.coverEnd);
                  }
                };

                spineBooks.forEach((spine) => {
                  spine.addEventListener('click', function (event) {
                    const clickedId = spine.dataset.bookId;
                    if (!clickedId) return;
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

                    const clickedPost = getPost(clickedId);
                    if (!clickedPost) return;

                    if (clickedId === currentOpenId) {
                      return;
                    }

                    updateCenter(clickedPost);
                    setCenterOpen(true);
                    currentOpenId = clickedId;
                  });
                });

                // Next.js's <Link> intercepts clicks using the href it was
                // given at render time — mutating centerBook.href above (in
                // updateCenter) only changes the raw DOM attribute, which
                // Link's own click handler ignores. Without this, clicking
                // the open book after picking a different spine always
                // navigated to the ORIGINAL first post, no matter what was
                // selected. Bypass Link's router entirely here so it always
                // goes to whichever post is actually showing.
                if (centerBook) {
                  centerBook.addEventListener('click', function (event) {
                    const post = getPost(currentOpenId);
                    if (!post) return;
                    event.preventDefault();
                    window.location.href = '/blog/' + post.slug;
                  });
                }
              })();
            `}
          </Script>
        </section>
      )}

      <SiteFooter tenant={{ brandName: tenant.brandName, footerTagline: tenant.footerTagline }} />
        <FooterReveal wordmark={tenant.brandName} />
  
    </div>
  )
}
