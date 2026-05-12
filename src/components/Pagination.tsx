import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number): string {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    // Trailing slash required for GitHub Pages static hosting
    return `${baseUrl}/?${params.toString()}`;
  }

  // Generate page numbers to show
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav className="pagination" aria-label="分页">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)}>‹ 上一页</Link>
      )}
      
      {pages.map((page, index) => {
        if (page === '...') {
          return <span key={`ellipsis-${index}`} className="disabled">…</span>;
        }
        
        if (page === currentPage) {
          return (
            <span key={page} className="active" aria-current="page">
              {page}
            </span>
          );
        }
        
        return (
          <Link key={page} href={buildUrl(page)}>
            {page}
          </Link>
        );
      })}
      
      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)}>下一页 ›</Link>
      )}
    </nav>
  );
}
