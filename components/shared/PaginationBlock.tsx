"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginationBlockProps {
    meta: {
        totalItem: number;
        current_page: number;
        next_page?: number | null;
        page_item?: number;
    } | null;
    pageSize?: number;
    onNavigate?: (url: string) => void;
}

export function PaginationBlock({ meta, pageSize, onNavigate }: PaginationBlockProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    if (!meta) {
        return null;
    }

    const sizeFromUrl = searchParams.get("size");
    const limit = pageSize || (sizeFromUrl ? Number(sizeFromUrl) : 10);
    const totalItem = Number(meta.totalItem);
    const currentPage = Number(meta.current_page);

    if (totalItem <= limit) {
        return null; // No need for pagination if items fit in a single page
    }

    const totalPages = Math.ceil(totalItem / limit);

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
        e.preventDefault();
        const url = createPageURL(page);
        if (onNavigate) {
            onNavigate(url);
        } else {
            router.push(url);
        }
    };

    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pages = getPageNumbers();
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return (
        <Pagination className="justify-end mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={hasPrevPage ? createPageURL(currentPage - 1) : "#"}
                        onClick={(e) => {
                            if (hasPrevPage) handlePageChange(e, currentPage - 1);
                            else e.preventDefault();
                        }}
                        className={!hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>

                {pages.map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            href={createPageURL(page)}
                            onClick={(e) => handlePageChange(e, page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href={hasNextPage ? createPageURL(currentPage + 1) : "#"}
                        onClick={(e) => {
                            if (hasNextPage) handlePageChange(e, currentPage + 1);
                            else e.preventDefault();
                        }}
                        className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
