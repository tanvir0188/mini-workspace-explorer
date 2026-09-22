"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface DashboardLoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

const DashboardLoadingContext = createContext<DashboardLoadingContextType>({
    isLoading: false,
    setLoading: () => {},
});

export function useDashboardLoading() {
    return useContext(DashboardLoadingContext);
}

export function DashboardLoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

    return (
        <DashboardLoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </DashboardLoadingContext.Provider>
    );
}
