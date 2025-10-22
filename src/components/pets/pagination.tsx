import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;
  const createHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value);
    });
    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-3">
      {currentPage > 1 && (
        <Link className="text-sm font-semibold text-brand-600 hover:underline" href={createHref(currentPage - 1)}>
          ← Назад
        </Link>
      )}
      <span className="rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700">
        Страница {currentPage} из {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link className="text-sm font-semibold text-brand-600 hover:underline" href={createHref(currentPage + 1)}>
          Вперёд →
        </Link>
      )}
    </nav>
  );
}
