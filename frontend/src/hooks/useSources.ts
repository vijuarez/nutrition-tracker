import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../api"
import { useUserStore } from "../stores/useUserStore"

export function useSources() {
    const queryClient = useQueryClient()
    const { user } = useUserStore()

    const sourcesQuery = useQuery({
        queryKey: ["sources", user],
        queryFn: api.getSources,
        enabled: !!user,
    })

    const saveConfigMutation = useMutation({
        mutationFn: ({ sourceId, config }: { sourceId: string, config: any }) => 
            api.saveSourceConfig(sourceId, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sources"] })
        }
    })

    const searchMutation = useMutation({
        mutationFn: (query: string) => api.searchRemote(query),
    })

    return {
        sources: Array.isArray(sourcesQuery.data) ? sourcesQuery.data : [],
        isLoading: sourcesQuery.isLoading,
        saveConfig: saveConfigMutation.mutateAsync,
        searchRemote: searchMutation.mutateAsync,
        isSearching: searchMutation.isPending,
    }
}
