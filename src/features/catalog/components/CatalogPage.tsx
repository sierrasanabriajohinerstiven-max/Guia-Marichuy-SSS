import React, { useState, useMemo } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { CategoryFilter } from './CategoryFilter';
import { ProductGrid } from './ProductGrid';
import { ProductDetail } from './ProductDetail';
import { Input } from '../../../components/ui/Input';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export interface CatalogPageProps {
  selectedProductId: string | null;
  onSelectProduct: (productId: string | null) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  selectedProductId,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const { categories, loading: loadingCategories } = useCategories();
  const productFilter = useMemo(() => {
    return selectedCategory ? { categoryId: selectedCategory } : undefined;
  }, [selectedCategory]);
  const { products, loading: loadingProducts, error, refetch } = useProducts(productFilter);

  // If a product detail is selected
  const activeProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Filter & sort
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price_cop - b.price_cop);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price_cop - a.price_cop);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, sortBy]);

  if (selectedProductId) {
    return (
      <ProductDetail
        product={activeProduct}
        loading={loadingProducts && !activeProduct}
        error={error}
        onBack={() => onSelectProduct(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Artisan Banner */}
      <div className="glass glass--dark glass--neon text-white p-7 sm:p-12 overflow-hidden [--g-radius:32px]">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#D84315]/40 blur-3xl pointer-events-none" />
        <div className="absolute right-24 -bottom-32 w-72 h-72 rounded-full bg-[#F4B183]/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 border border-white/15 text-[#FFB59A]">
            <Sparkles className="w-3.5 h-3.5" /> Colección 2026 · Cacaos Colombianos
          </span>
          <h1 data-reveal="blur" className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.05]">
            Chocolatería Fina <span className="g-gradient-text">&amp; Artesanal</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Del grano a la barra. Seleccionamos cosechas de origen único en los valles y cordilleras de Colombia, tostadas y refinadas lentamente a la piedra para exaltar perfiles florales, frutales y de nuez.
          </p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="pb-1">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="glass flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-4">
        <div className="flex-1 w-full relative">
          <Input
            placeholder="Buscar por notas de cata, porcentaje o variedad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-56 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#6B6B6B] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
            className="w-full min-h-[44px] px-4 py-2 text-xs bg-white/55 backdrop-blur-md border border-white/75 rounded-2xl text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20"
            aria-label="Ordenar productos"
          >
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre: A - Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={processedProducts}
        loading={loadingProducts}
        error={error}
        onRetry={refetch}
        onViewDetail={(id) => onSelectProduct(id)}
        onResetFilters={() => {
          setSelectedCategory(null);
          setSearchTerm('');
        }}
      />
    </div>
  );
};
