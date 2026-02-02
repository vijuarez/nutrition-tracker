import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../api"
import type { Food } from "../types.backend"
import { useUserStore } from "../stores/useUserStore"


export function useFoods() {

    const queryClient = useQueryClient()
    const { user } = useUserStore()

    const getAllFoodsQuery = useQuery({
        queryKey: ["foods", user], // Refetch whenever the user changes
        queryFn: api.getAllFoods,
        staleTime: Infinity,
        retry: false,
    })
    const allFoods = getAllFoodsQuery.data || []

    // Whenever the fetched foods change, update fuse search so it's in sync
    // useEffect(() => {
    //     if (allFoods) {
    //         fuseSearch.setCollection(allFoods)
    //     }
    // }, [allFoods])

    const addFoodMutation = useMutation({
        mutationKey: ["foods"],
        mutationFn: async (food: Omit<Food, "id">) => {
            const createdFoods = await api.createFoods([food])
            queryClient.invalidateQueries({ queryKey: ["foods"] })
            return createdFoods
        }
    })

    const setFoodsMutation = useMutation({
        mutationKey: ["foods"],
        mutationFn: async (foods: Omit<Food, "id">[]) => {
            const newFoods = await api.setAllFoods(foods)
            queryClient.invalidateQueries({ queryKey: ["foods"] })
            return newFoods
        }
    })

    const updateFoodMutation = useMutation({
        mutationKey: ["foods"],
        mutationFn: async (food: Food) => {
            const ok = await api.updateFood(food)
            if (ok)
                queryClient.invalidateQueries({ queryKey: ["foods"] })
            return ok
        }
    })

    const deleteFoodMutation = useMutation({
        mutationKey: ["foods"],
        mutationFn: async (foodId: string) => {
            await api.deleteFood(foodId)
            queryClient.invalidateQueries({ queryKey: ["foods"] })
        }
    })

    return {
        allFoods,
        setFoods: setFoodsMutation.mutateAsync,
        addFood: addFoodMutation.mutateAsync,
        deleteFood: deleteFoodMutation.mutateAsync,
        updateFood: updateFoodMutation.mutateAsync,
    }
}
