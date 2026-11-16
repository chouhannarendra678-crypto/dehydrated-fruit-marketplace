import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useLocation, Link } from 'react-router-dom';
import { SlidersHorizontal, Store, MapPin, ShieldCheck, Star } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ProductGrid from '../../components/common/ProductGrid';
import ProductFilters from '../../components/common/ProductFilters';
import ProductSort from '../../components/common/ProductSort';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { useGetPublicProductsQuery } from '../../services/productApi';
import { useGetCategoriesQuery } from '../../services/categoryApi';
import { useGetPublicSellersQuery } from '../../services/sellerApi';

const ExploreFruitsPage = ({ defaultTab = 'fruits' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { slug: routeCategorySlug } = useParams();

  const search = searchParams.get('search') || '';
  const categoryParam = routeCategorySlug || searchParams.get('category') || '';
  const tabParam = searchParams.get('tab');

  const isBrandsRoute =
    location.pathname === '/brands' ||
    location.pathname === '/sellers' ||
    defaultTab === 'brands' ||
    tabParam === 'brands' ||
    tabParam === 'sellers';

  const [activeTab, setActiveTab] = useState(isBrandsRoute ? 'brands' : 'fruits');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [availability, setAvailability] = useState('');
  const [addedSugarOnly, setAddedSugarOnly] = useState('');
  const [preservativesOnly, setPreservativesOnly] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync tab with URL changes
  useEffect(() => {
    const isBrands =
      location.pathname === '/brands' ||
      location.pathname === '/sellers' ||
      defaultTab === 'brands' ||
      tabParam === 'brands' ||
      tabParam === 'sellers';
    setActiveTab(isBrands ? 'brands' : 'fruits');
  }, [location.pathname, tabParam, defaultTab]);

  // Sync category param if URL changes
  useEffect(() => {
    if (routeCategorySlug) {
      setSelectedCategory(routeCategorySlug);
    } else if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category'));
    }
  }, [routeCategorySlug, searchParams]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sort, minPrice, maxPrice, weight, availability, addedSugarOnly, preservativesOnly, selectedRating]);

  // Tab switch handler that synchronizes searchParams in URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const nextParams = new URLSearchParams(searchParams);
    if (newTab === 'brands') {
      nextParams.set('tab', 'brands');
    } else {
      nextParams.delete('tab');
    }
    setSearchParams(nextParams);
  };

  // Queries
  const { data: catData } = useGetCategoriesQuery();
  const { data: prodData, isLoading: prodsLoading } = useGetPublicProductsQuery({
    search: search || undefined,
    category: selectedCategory || undefined,
    sort,
    weight: weight || undefined,
    availability: availability || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    addedSugar: addedSugarOnly !== '' ? addedSugarOnly : undefined,
    preservatives: preservativesOnly !== '' ? preservativesOnly : undefined,
    rating: selectedRating || undefined,
    page,
    limit: 12,
  });

  const { data: sellersData, isLoading: sellersLoading } = useGetPublicSellersQuery({
    search: search || undefined,
    limit: 48,
  });

  const categories = catData?.data?.categories || [];
  const products = prodData?.data?.products || [];
  const pagination = prodData?.data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const sellers = sellersData?.data?.sellers || [];

  const handlePriceChange = (type, val) => {
    if (type === 'min') setMinPrice(val);
    if (type === 'max') setMaxPrice(val);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setWeight('');
    setAvailability('');
    setAddedSugarOnly('');
    setPreservativesOnly('');
    setSelectedRating('');
    setSort('newest');
    if (activeTab === 'brands') {
      setSearchParams({ tab: 'brands' });
    } else {
      setSearchParams({});
    }
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="space-y-8 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest tracking-tight">
            {activeTab === 'brands'
              ? 'Verified Fruit Brands & Orchards'
              : currentCategoryObj
              ? currentCategoryObj.name
              : 'Explore Dehydrated Fruits'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {activeTab === 'brands'
              ? 'Connect directly with certified regional dehydration processors, solar-dry pioneers, and organic growers.'
              : 'Compare harvest batches, moisture levels, and direct producer pricing across verified orchards.'}
          </p>
        </div>

        {/* View Tabs & Mobile Filter Button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex bg-oat-card p-1 rounded-lg border border-forest/15 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => handleTabChange('fruits')}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'fruits'
                  ? 'bg-forest text-white shadow-2xs font-bold'
                  : 'text-forest/70 hover:text-forest'
              }`}
            >
              Fruit Batches {products.length > 0 && `(${pagination.total || products.length})`}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('brands')}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'brands'
                  ? 'bg-forest text-white shadow-2xs font-bold'
                  : 'text-forest/70 hover:text-forest'
              }`}
            >
              Verified Brands {sellers.length > 0 && `(${sellers.length})`}
            </button>
          </div>

          {activeTab === 'fruits' && (
            <>
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-forest/20 bg-oat-card text-xs font-semibold text-forest shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-forest" />
                <span>Filters</span>
              </button>
              <ProductSort value={sort} onChange={setSort} />
            </>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'fruits' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              weight={weight}
              onSelectWeight={setWeight}
              availability={availability}
              onToggleAvailability={setAvailability}
              addedSugarOnly={addedSugarOnly}
              onToggleAddedSugar={setAddedSugarOnly}
              preservativesOnly={preservativesOnly}
              onTogglePreservatives={setPreservativesOnly}
              selectedRating={selectedRating}
              onSelectRating={setSelectedRating}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden col-span-1 mb-4">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setShowMobileFilters(false);
                }}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={handlePriceChange}
                weight={weight}
                onSelectWeight={setWeight}
                availability={availability}
                onToggleAvailability={setAvailability}
                addedSugarOnly={addedSugarOnly}
                onToggleAddedSugar={setAddedSugarOnly}
                preservativesOnly={preservativesOnly}
                onTogglePreservatives={setPreservativesOnly}
                selectedRating={selectedRating}
                onSelectRating={setSelectedRating}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* Right Product Grid */}
          <div className="lg:col-span-3 space-y-6">
            {search && (
              <div className="p-3.5 rounded-lg bg-oat-card border border-forest/15 text-xs text-ink flex items-center justify-between shadow-2xs">
                <span>
                  Showing results for: <strong className="text-forest">"{search}"</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="font-bold text-tomato hover:underline text-[11px] cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}

            {prodsLoading ? (
              <Loader message="Loading dehydrated fruit catalog..." />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  emptyTitle="No Dehydrated Fruits Match Criteria"
                  emptyDescription="Try clearing active filters or search terms to see all available fruit batches."
                />

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pt-6 border-t border-forest/15 flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Verified Sellers Grid Tab */
        <div className="space-y-6">
          {search && (
            <div className="p-3.5 rounded-lg bg-oat-card border border-forest/15 text-xs text-ink flex items-center justify-between shadow-2xs">
              <span>
                Matching brands for: <strong className="text-forest">"{search}"</strong>
              </span>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'brands' })}
                className="font-bold text-tomato hover:underline text-[11px] cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {sellersLoading ? (
            <Loader message="Loading certified fruit brands and producers..." />
          ) : sellers.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No Brands Match Your Search"
              description="No approved fruit orchards or producers matched the search query."
              actionLabel="Show All Brands"
              onAction={() => setSearchParams({ tab: 'brands' })}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((s) => (
                <div
                  key={s._id}
                  className="p-6 rounded-lg bg-oat-card border border-forest/15 hover:border-forest/40 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden font-display shadow-2xs">
                        {s.logo?.url ? (
                          <img src={s.logo.url} alt={s.storeName} className="w-full h-full object-cover" />
                        ) : (
                          s.storeName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-forest font-display truncate">{s.storeName}</h3>
                        {s.businessAddress?.city && (
                          <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-forest shrink-0" />
                            <span>
                              {s.businessAddress.city}
                              {s.businessAddress.state ? `, ${s.businessAddress.state}` : ''}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {s.description || 'Verified dehydration processor specializing in natural orchard fruits.'}
                    </p>

                    <div className="flex items-center gap-3 text-xs pt-1">
                      {s.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-forest/10 text-forest text-[10px] font-bold border border-forest/20">
                          <ShieldCheck className="w-3 h-3 text-forest" /> FSSAI Certified
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[#C88E2D] font-bold text-xs ml-auto">
                        <Star className="w-3.5 h-3.5 fill-[#C88E2D] text-[#C88E2D]" />
                        <span>{s.rating > 0 ? s.rating.toFixed(1) : '5.0'}</span>
                        <span className="text-[10px] text-ink-subtle font-normal">({s.reviewCount || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-forest/15">
                    <Link to={`/sellers/${s.slug}`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                        Visit Orchard Store
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreFruitsPage;
