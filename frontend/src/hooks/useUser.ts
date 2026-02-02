import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../api"
import type { User, UserTargets } from "../types"


export function useUser() {

    const queryClient = useQueryClient()

    const getUserQuery = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const user = await api.getUser()
            return user
        },
        retry: false,
    })

    const updateTargetsMutation = useMutation({
        mutationKey: ["user", "targets"],
        mutationFn: async (targets: UserTargets) => {
            const updatedUser = await api.updateUserTargets(targets)
            if (updatedUser)
                queryClient.invalidateQueries({ queryKey: ["user"] })
            return updatedUser
        }
    })

    return {
        user: getUserQuery.data || null,
        loading: getUserQuery.isLoading,
        updateTargets: updateTargetsMutation.mutateAsync,
        isUpdatingTargets: updateTargetsMutation.isPending,
    }
}
