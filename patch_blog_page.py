from pathlib import Path

path = Path(r'c:\Users\HP\Downloads\counsellors-of-india\src\app\blog\page.tsx')
text = path.read_text(encoding='utf-8')
start = text.index('export default async function BlogPage() {')
new_body = '''export default async function BlogPage() {
  const tenant = await getCurrentTenant()
  const posts = await listPublishedBlogPostsServer()

  const activePost = posts[0]

  return (
    <div className="flex min-h-screen flex-col" style={{ background: PAPER }}>
      <SiteNav tenant={{ brandName: tenant.brandName }} />

      {/* ── Hero: faint ruled-notebook lines + paper grain ─────────────── */}
      <section
        className="relative overflow-hidden px-6 pt-24 pb-14"
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
            Blogs
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
        <section className="flex-1 overflow-hidden px-6 pb-28">
          <div className="mx-auto flex min-h-[calc(100vh-220px)] max-w-6xl flex-col items-center justify-center px-4 py-10">
            <div className="w-full rounded-[28px] border border-[#DCCFAF] bg-white/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.1)]">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm uppercase tracking-[0.22em]" style={{ color: SAFFRON }}>
                  Open the practice notebook
                </p>
                <h2 className="text-3xl leading-tight sm:text-4xl" style={{ fontFamily: 'var(--font-fraunces)', color: INK, fontWeight: 500 }}>
                  Turn the page to the next note
                </h2>
              </div>

              <div className="relative mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
                <button
                  type="button"
                  data-role="prev-page"
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DCCFAF] bg-[#FBF7F0] text-[#2B3B37] shadow-sm transition hover:-translate-y-0.5"
                  aria-label="Previous page"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="relative flex min-h-[380px] w-full max-w-[560px] items-center justify-center rounded-[24px] border border-[#E4DCC9] bg-[#F8F2E4] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:p-8">
                  {activePost && (
                    <div className="w-full" data-bookshelf>
                      <OpenBook
                        post={activePost}
                        coverStart={SPINE_COLORS[0]}
                        coverEnd="#223228"
                      />
                      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center text-sm text-[#6B7570]">
                        <span data-role="page-indicator">1 / {posts.length}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  data-role="next-page"
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DCCFAF] bg-[#FBF7F0] text-[#2B3B37] shadow-sm transition hover:-translate-y-0.5"
                  aria-label="Next page"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <Script id="blog-bookshelf-swap" strategy="afterInteractive">
            {`
              (function() {
                const shelf = document.querySelector('[data-bookshelf]');
                if (!shelf) return;

                const centerBook = shelf.querySelector('[data-role="open-book"]');
                const prevButton = document.querySelector('[data-role="prev-page"]');
                const nextButton = document.querySelector('[data-role="next-page"]');
                const pageIndicator = document.querySelector('[data-role="page-indicator"]');
                const coverBg = centerBook?.querySelector('[data-cover="background"]');
                const postData = ${JSON.stringify(posts.map((post, index) => ({
                  id: post.id,
                  slug: post.slug,
                  title: post.title,
                  excerpt: post.excerpt || '',
                  published_at: post.published_at,
                  minutes: estimateReadingMinutes(post.content),
                  coverStart: SPINE_COLORS[index % SPINE_COLORS.length],
                  coverEnd: '#223228',
                })))};

                let currentIndex = 0;

                const formatDate = (iso) => {
                  if (!iso) return '';
                  const date = new Date(iso);
                  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                };

                const updateIndicator = () => {
                  if (pageIndicator) pageIndicator.textContent = `${currentIndex + 1} / ${postData.length}`;
                };

                const animateTurn = (direction) => {
                  if (!centerBook) return;
                  centerBook.style.transition = 'transform 280ms ease';
                  centerBook.style.transform = direction === 'next'
                    ? 'perspective(1100px) rotateY(-14deg) translateX(8px)'
                    : 'perspective(1100px) rotateY(14deg) translateX(-8px)';
                  window.setTimeout(() => {
                    if (centerBook) centerBook.style.transform = '';
                  }, 280);
                };

                const updateCenter = (post) => {
                  if (!centerBook) return;
                  centerBook.dataset.bookId = post.id;
                  centerBook.href = '/blog/' + post.slug;
                  const titleNode = centerBook.querySelector('[data-open="title"]');
                  const metaNode = centerBook.querySelector('[data-open="meta"]');
                  const excerptNode = centerBook.querySelector('[data-open="excerpt"]');
                  if (titleNode) titleNode.textContent = post.title;
                  if (metaNode) metaNode.textContent = formatDate(post.published_at) + ' · ' + post.minutes + ' min read';
                  if (excerptNode) excerptNode.textContent = post.excerpt ? '“' + post.excerpt + '”' : '';
                  if (coverBg) {
                    coverBg.style.setProperty('--cover-start', post.coverStart);
                    coverBg.style.setProperty('--cover-end', post.coverEnd);
                  }
                  updateIndicator();
                };

                updateIndicator();

                prevButton?.addEventListener('click', function (event) {
                  event.preventDefault();
                  event.stopPropagation();
                  currentIndex = (currentIndex - 1 + postData.length) % postData.length;
                  updateCenter(postData[currentIndex]);
                  animateTurn('prev');
                });

                nextButton?.addEventListener('click', function (event) {
                  event.preventDefault();
                  event.stopPropagation();
                  currentIndex = (currentIndex + 1) % postData.length;
                  updateCenter(postData[currentIndex]);
                  animateTurn('next');
                });
              })();
            `}
          </Script>
        </section>
      )}
''' 
text = text[:start] + new_body
path.write_text(text, encoding='utf-8')
print('patched')
