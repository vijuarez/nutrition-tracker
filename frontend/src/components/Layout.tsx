import s from "./Layout.module.scss"


import { Outlet, useNavigate } from "react-router"
import Header from "./Header"
import { useEffect } from "react"
import { api } from "../api"
import { useUserStore } from "../stores/useUserStore"
import { useFoods } from "../hooks/useFoods"
import { fuseSearch } from "../fuse-search"


type Props = {

}

export default function Layout({ }: Props) {

    const navigate = useNavigate()

    const { setUser } = useUserStore()

    // On page load, check auth mode and handle accordingly:
    // - Single user mode: automatically login without credentials
    // - Normal mode: check onboarding -> check cookies -> redirect to login if needed
    useEffect(() => {
        async function initAuth() {
            try {
                // Check if single user mode is enabled
                const authMode = await api.checkAuthMode()
                
                if (authMode.singleUserMode) {
                    // Single user mode - automatically login without credentials
                    const response = await api.loginWithCredentials("", "") // Backend ignores credentials in single user mode
                    if (response && 'user' in response) {
                        setUser(response.user)
                        navigate("/")
                    }
                    return
                }
                
                // Normal mode - check if onboarding is needed
                const onboard = await api.checkOnboarding()
                if (onboard) {
                    navigate("/signup")
                    return
                }
                
                // Normal mode - try to login with cookies
                const user = await api.loginWithCookies()
                if (!user) {
                    navigate("/login")
                    return
                }
                setUser(user)
                navigate("/")
            } catch (error) {
                console.error("Auth initialization error:", error)
                // In case of error, redirect to login
                navigate("/login")
            }
        }
        initAuth()
    }, [])

    // On page load, fetch all custom foods and load them into Fuse
    const { allFoods } = useFoods()
    useEffect(() => {
        // console.info("user changed, refetching allFoods:", { user, allFoods })
        // console.info("fuseSearch.setCollection:", allFoods)
        if (allFoods.length > 0)
            fuseSearch.setCollection(allFoods)
    }, [allFoods])

    return (
        <div className={s.Layout}>
            <Header />
            <main><Outlet /></main>
        </div>
    )
}