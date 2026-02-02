import s from "./Header.module.scss"

import { Link, useLocation } from "react-router"
import { useUserStore } from "../stores/useUserStore"
import { api } from "../api"
import { useNavigate } from "react-router"
import Button from "./Button"


type Props = {

}

export default function Header({ }: Props) {

    const navigate = useNavigate()

    const { pathname } = useLocation()

    const { user, setUser } = useUserStore()
    const loggedIn = !!user

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
                loggedIn &&
                <Button onClick={logout}>Logout</Button>
            }

        </div>
    )
}