import s from "./Header.module.scss"

import { Link, useLocation } from "react-router"
import { useUserStore } from "../stores/useUserStore"
import { api } from "../api"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import Button from "./Button"
import ThemeToggle from "./ThemeToggle"


type Props = {

}

export default function Header({ }: Props) {

    const navigate = useNavigate()

    const { pathname } = useLocation()

    const { user, setUser } = useUserStore()
    const loggedIn = !!user
    const [singleUserMode, setSingleUserMode] = useState(false)

    useEffect(() => {
        async function checkMode() {
            try {
                const mode = await api.checkAuthMode()
                setSingleUserMode(mode.singleUserMode)
            } catch {
                // If we can't check mode, assume normal mode
                setSingleUserMode(false)
            }
        }
        if (loggedIn) {
            checkMode()
        }
    }, [loggedIn])

    async function logout() {
        const ok = await api.logout()
        if (ok) {
            setUser(null)
            navigate("/login")
        }
    }

    return (
        <div className={s.Header}>
            <nav data-centered={!loggedIn}>
                {/* <Link to="/today" data-active={pathname.startsWith("/today")}>Today</Link> */}
                {
                    loggedIn &&
                    <>
                        <Link to="/" data-active={pathname === "/"}>Home</Link>
                        <Link to="/foods" data-active={pathname.startsWith("/foods")}>Foods</Link>
                        <Link to="/calendar" data-active={pathname.startsWith("/calendar")}>Calendar</Link>
                        <Link to="/settings" data-active={pathname.startsWith("/settings")}>Settings</Link>
                    </>
                }
                {
                    !loggedIn &&
                    <>
                        <Link to="/login" data-active={pathname.startsWith("/login")}>Login</Link>
                        <Link to="/signup" data-active={pathname.startsWith("/signup")}>Signup</Link>
                    </>
                }
                {/* <pre>{JSON.stringify({ pathname })}</pre> */}
            </nav>

            {
                loggedIn && !singleUserMode &&
                <Button onClick={logout}>Logout</Button>
            }

            {
                loggedIn &&
                <ThemeToggle />
            }

        </div>
    )
}