import { useQuery } from "@tanstack/react-query"
import { api } from "../api"
import type { MonthlyData } from "../types"


export function useMonthData(year: number, month: number) {

    const getMonthDataQuery = useQuery({
        queryKey: ["month", year, month],
        queryFn: async () => {
            const data = await api.getMonthData(year, month)
            return data
        },
        retry: false,
    })

    return {
        monthData: getMonthDataQuery.data || null,
        loading: getMonthDataQuery.isLoading,
        error: getMonthDataQuery.error,
    }
}
