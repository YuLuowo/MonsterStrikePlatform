"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MonstersList } from "@/types/monster";
import { MonsterCard } from "@/components/custom/monster-card";
import { MonsterCardSkeleton } from "@/components/custom/monster-card-skeleton";
import MonsterFilters from "./monster-filters";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const LIMIT = 100;

function validatePageNumber(page: number, totalPages: number): number {
    if (!Number.isInteger(page) || page < 1 || Number.isNaN(page)) {
        return 1;
    }

    if (page > totalPages) {
        return Math.max(1, totalPages);
    }

    return page;
}

export function AllMonstersSection() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<MonstersList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPage = (() => {
        const pageParam = searchParams.get("page");
        if (!pageParam) return 1;

        const pageNum = Number(pageParam);
        if (Number.isInteger(pageNum) && pageNum > 0) {
            return pageNum;
        }
        return 1;
    })();

    useEffect(() => {
        const pageParam = searchParams.get("page");
        const pageNum = pageParam ? Number(pageParam) : 1;

        if (!pageParam || !Number.isInteger(pageNum) || pageNum < 1) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("page", "1");
            router.push(`?${newSearchParams.toString()}`, {scroll: false});
        }
    }, [searchParams, router]);

    useEffect(() => {
        const fetchMonsters = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const params = new URLSearchParams(searchParams as never as URLSearchParams);
                params.set("page", String(currentPage));
                params.set("limit", String(LIMIT));
                const response = await fetch(`/api/monsters?${params.toString()}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch monsters: ${response.statusText}`);
                }

                const result: MonstersList = await response.json();
                setData(result);

                const validatedPage = validatePageNumber(result.page, result.totalPages);
                if (validatedPage !== result.page) {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.set("page", validatedPage.toString());
                    router.push(`?${newSearchParams.toString()}`, {scroll: false});
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error occurred");
                console.error("Error fetching monsters:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMonsters();
    }, [currentPage, router, searchParams]);

    const handlePageChange = (page: number) => {
        const validatedPage = validatePageNumber(page, data?.totalPages || 1);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", validatedPage.toString());
        router.push(`?${newSearchParams.toString()}`, {scroll: false});
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center text-red-500">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-8">
            <MonsterFilters key={String(searchParams)} />
            {isLoading && (
                <div
                    className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 mb-8 px-3 md:px-0">
                    {Array.from({length: 100}).map((_, idx) => (
                        <MonsterCardSkeleton key={idx}/>
                    ))}
                </div>
            )}
            {!isLoading && data && data.data.length > 0 && (
                <>
                    <div
                        className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 mb-8 px-3 md:px-0">
                        {data.data.map((monster) => (
                            <MonsterCard key={monster.number} monster={monster}/>
                        ))}
                    </div>

                    {data.totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) {
                                                handlePageChange(currentPage - 1);
                                            }
                                        }}
                                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                        text="上一頁"
                                    />
                                </PaginationItem>

                                {(() => {
                                    const maxPagesToShow = 5;
                                    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                                    const endPage = Math.min(data.totalPages, startPage + maxPagesToShow - 1);

                                    if (endPage - startPage + 1 < maxPagesToShow) {
                                        startPage = Math.max(1, endPage - maxPagesToShow + 1);
                                    }

                                    if (startPage > 1) {
                                        return (
                                            <>
                                                <PaginationItem>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(1);
                                                        }}
                                                    >
                                                        1
                                                    </PaginationLink>
                                                </PaginationItem>
                                                {startPage > 2 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                )}
                                                {Array.from({length: endPage - startPage + 1}, (_, idx) => {
                                                    const pageNum = startPage + idx;
                                                    return (
                                                        <PaginationItem key={pageNum}>
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={currentPage === pageNum}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handlePageChange(pageNum);
                                                                }}
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                })}
                                                {endPage < data.totalPages - 1 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                )}
                                                {endPage < data.totalPages && (
                                                    <PaginationItem>
                                                        <PaginationLink
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePageChange(data.totalPages);
                                                            }}
                                                        >
                                                            {data.totalPages}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )}
                                            </>
                                        );
                                    }

                                    return Array.from({length: endPage - startPage + 1}, (_, idx) => {
                                        const pageNum = startPage + idx;
                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === pageNum}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(pageNum);
                                                    }}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    });
                                })()}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < data.totalPages) {
                                                handlePageChange(currentPage + 1);
                                            }
                                        }}
                                        className={currentPage >= data.totalPages ? "pointer-events-none opacity-50" : ""}
                                        text="下一頁"
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

            {!isLoading && (!data || data.data.length === 0) && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">沒有找到任何對應被動的怪物</p>
                </div>
            )}
        </div>
    );
}







