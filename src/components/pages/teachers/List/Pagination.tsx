import React from 'react';
import { Pagination as BsPagination, Form, Row, Col } from 'react-bootstrap';
import { useTheme } from '@/context/ThemeContext';

interface TeacherPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const TeacherPagination: React.FC<TeacherPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Pagination windowing (show up to 5 page numbers around currentPage)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 mt-3 pt-2">
      {/* Showing count and page size selector */}
      <div className="d-flex align-items-center gap-2 text-muted small">
        <span>
          Showing{' '}
          <strong className={isDark ? 'text-light' : 'text-dark'}>
            {startItem}–{endItem}
          </strong>{' '}
          of <strong className={isDark ? 'text-light' : 'text-dark'}>{totalItems}</strong>
        </span>
        <span className="mx-1">•</span>
        <div className="d-flex align-items-center gap-1.5">
          <span>Per page:</span>
          <Form.Select
            size="sm"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            style={{ width: '70px', paddingRight: '1.75rem', height: '28px', fontSize: '0.8rem' }}
            className={isDark ? 'bg-dark text-white border-secondary' : ''}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <BsPagination size="sm" className="mb-0">
          <BsPagination.First disabled={currentPage === 1} onClick={() => onPageChange(1)} />
          <BsPagination.Prev
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />

          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return <BsPagination.Ellipsis key={`ellipsis-${index}`} disabled />;
            }
            const pageNum = page as number;
            return (
              <BsPagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </BsPagination.Item>
            );
          })}

          <BsPagination.Next
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />
          <BsPagination.Last
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          />
        </BsPagination>
      )}
    </div>
  );
};

export const Pagination = TeacherPagination;
export default TeacherPagination;

