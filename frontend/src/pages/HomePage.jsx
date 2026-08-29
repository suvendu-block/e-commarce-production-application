import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, SearchX } from 'lucide-react';
import { listProducts, getTopProducts } from '../store/slices/productSlice';
import { CATEGORIES, PAGE_SIZE } from '../constants';
import { dbProducts } from '../api/mockData';
import ProductCard from '../components/ui/ProductCard';
import Paginate from '../components/ui/Paginate';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';
import Reveal from '../components/ui/Reveal';
import CountUp from '../components/ui/CountUp';
import Meta from '../components/ui/Meta';
import { classNames } from '../utils/helpers';

const categoryCounts = CATEGORIES.map((c) => ({
  name: c,
  count: dbProducts.filter((p) => p.category === c).length,
}));

const HomePage = () => {
  const dispatch = useDispatch();
  const { pageNumber = '1', keyword: keywordParam } = useParams();
  const [searchParams] = useSearchParams();

  const keyword = keywordParam ? decodeURIComponent(keywordParam) : searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const page = Number(pageNumber) || 1;
  const isSearch = Boolean(keyword || category || page > 1);

  const { products, pages, loading, error, count } = useSelector((s) => s.product.list);
  const top = useSelector((s) => s.product.top);

  useEffect(() => {
    dispatch(
      listProducts({
        keyword,
        page,
        pageSize: PAGE_SIZE,
        category: category || undefined,
      })
    );
  }, [dispatch, keyword, page, category]);

  useEffect(() => {
    dispatch(getTopProducts());
  }, [dispatch]);

  const tabClass = (active) =>
    classNames(
      'chip transition',
      active
        ? 'border-ink font-semibold text-ink'
        : 'border-transparent text-muted hover:border-line hover:text-ink'
    );

  /* ── Search / category results mode ───────────────────────── */
  if (isSearch) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <Meta
          title={keyword ? `Search: ${keyword}` : category || undefined}
          description="Electronics, apparel and home essentials, chosen for craft."
        />

        <p className="kicker mb-4">{keyword ? 'Search' : 'Collection'}</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">
          {keyword ? (
            <>
              Results for “<em>{keyword}</em>”
            </>
          ) : (
            category
          )}
        </h1>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-0">
          <Link
            to={keyword ? `/search/${encodeURIComponent(keyword)}` : '/'}
            className={classNames(tabClass(!category), '!border-b-0')}
          >
            All
          </Link>
          {CATEGORIES.map((c) => {
            const isActive = category === c;
            const to = keyword
              ? `/search/${encodeURIComponent(keyword)}?category=${encodeURIComponent(c)}`
              : `/?category=${encodeURIComponent(c)}`;
            return (
              <Link key={c} to={to} className={classNames(tabClass(isActive), '!border-b-0')}>
                {c}
              </Link>
            );
          })}
        </div>

        {loading ? (
          <Loader className="py-24" />
        ) : error ? (
          <Message variant="error" className="mt-8">
            {error}
          </Message>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-28 text-center">
            <SearchX className="h-8 w-8 text-faint" aria-hidden="true" />
            <p className="font-serif text-2xl text-ink">Nothing found</p>
            <p className="max-w-sm text-sm text-muted">
              Try a different search term, or browse the collection from the top.
            </p>
            <Link to="/" className="btn-primary mt-2">
              Browse all
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-faint">
              {count} piece{count === 1 ? '' : 's'}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Paginate pages={pages} page={page} keyword={keyword} category={category} />
          </>
        )}
      </div>
    );
  }

  /* ── Marketing homepage ───────────────────────────────────── */
  const featured = top.products.slice(0, 4);

  return (
    <div>
      <Meta
        title="Everyday things, beautifully made"
        description="Nordstroma — electronics, apparel and home essentials, chosen for craft and longevity."
      />

      {/* ── Hero: full-bleed image + serif message ────────────── */}
      <section className="relative flex min-h-[88dvh] items-center justify-center overflow-hidden">
        <img
          src="https://picsum.photos/seed/nordstroma-hero/1920/1080"
          alt="The Nordstroma collection"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl px-6 text-center text-bg">
          <p className="kicker mb-6 !text-bg/70">Nordstroma — Est. 2026</p>
          <h1 className="font-serif text-4xl leading-[1.08] md:text-6xl lg:text-7xl">
            Everyday things, <em>beautifully made.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-bg/80 md:text-base">
            Electronics, apparel and home essentials, chosen for craft and priced honestly.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#selected-pieces"
              className="btn-primary min-w-56 !bg-paper !text-ink hover:!bg-bg"
            >
              Shop the collection
            </a>
            <a
              href="#the-index"
              className="btn-outline min-w-56 !border-bg/50 !text-bg hover:!border-bg hover:!bg-bg/10"
            >
              The index
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="h-10 w-px bg-bg/50" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-bg/70">Scroll</span>
        </div>
      </section>

      {/* ── Intro: statement + portrait, stats with diagonal rule ─ */}
      <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="font-serif text-3xl leading-[1.15] text-ink md:text-5xl">
              A store is a <em>place</em>, not a feed. We build ours around{' '}
              <em>things worth keeping.</em>
            </h2>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted">
              Nordstroma began as a small shelf of carefully chosen objects. Today the collection
              spans five categories, but the rule hasn't moved: if we wouldn't keep it, we don't
              sell it.
            </p>
            <Link to="/" className="link-arrow group mt-9">
              Explore the collection
              <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="aspect-[3/4] overflow-hidden bg-surface-2">
              <img
                src="https://picsum.photos/seed/nordstroma-intro/900/1200"
                alt="A carefully arranged selection from the collection"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>

        {/* Stats — mirrors the reference: value, diagonal rule, value */}
        <div className="mt-20 flex flex-col items-start gap-6 border-t border-line pt-12 md:mt-28 md:flex-row md:items-center md:gap-0">
          <Reveal className="flex-1">
            <CountUp
              end={dbProducts.length}
              className="font-serif text-6xl text-ink md:text-7xl"
            />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
              Products
            </p>
          </Reveal>
          <svg
            width="74"
            height="120"
            viewBox="0 0 74 120"
            fill="none"
            aria-hidden="true"
            className="text-line md:mx-14"
          >
            <line x1="73" y1="0.5" x2="1" y2="119.5" stroke="currentColor" />
          </svg>
          <Reveal delay={120} className="flex-1">
            <CountUp end={CATEGORIES.length} className="font-serif text-6xl text-ink md:text-7xl" />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
              Categories
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Category index: editorial list rows ───────────────── */}
      <section id="the-index" className="mx-auto max-w-[1400px] scroll-mt-16 px-4 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl text-ink md:text-4xl">The index</h2>
          <div className="mt-8">
            {categoryCounts.map((c) => (
              <Link
                key={c.name}
                to={`/?category=${encodeURIComponent(c.name)}`}
                className="group flex items-center justify-between border-t border-line py-6 transition-colors last:border-b hover:border-ink md:py-7"
              >
                <span className="flex items-baseline gap-5">
                  <span className="font-serif text-2xl text-ink transition-transform duration-300 group-hover:translate-x-2 md:text-4xl">
                    {c.name}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
                    {c.count} piece{c.count === 1 ? '' : 's'}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-5 w-5 text-faint transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ink"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Selected pieces: asymmetric editorial grid ────────── */}
      <section id="selected-pieces" className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 md:py-32 scroll-mt-16">
        <Reveal className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Selected pieces</h2>
          <a href="#the-index" className="link-arrow group shrink-0">
            View all
            <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
          </a>
        </Reveal>

        {top.loading ? (
          <Loader />
        ) : top.error ? (
          <Message variant="error">{top.error}</Message>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-12">
            {featured.map((product, i) => {
              const span = i % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5';
              return (
                <Reveal key={product._id} delay={(i % 2) * 120} className={`${span} col-span-1`}>
                  <ProductCard product={product} tall />
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Banner: full-bleed italic statement ───────────────── */}
      <section className="relative flex min-h-[70dvh] items-center justify-center overflow-hidden">
        <img
          src="https://picsum.photos/seed/nordstroma-banner/1920/900"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/35" aria-hidden="true" />
        <Reveal className="relative z-10 max-w-3xl px-6 text-center">
          <p className="font-serif text-3xl italic leading-snug text-bg md:text-5xl">
            Made to be <em className="text-bg">kept</em>, not replaced.
          </p>
        </Reveal>
      </section>
    </div>
  );
};

export default HomePage;
