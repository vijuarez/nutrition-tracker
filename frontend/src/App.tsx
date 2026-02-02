import { BrowserRouter, Route, Routes } from "react-router"
import Layout from "./components/Layout"
import CurrentDay from "./components/CurrentDay"
import Foods from "./components/Foods"
import Login from "./components/Login"
import Signup from "./components/Signup"
import SettingsPage from "./components/SettingsPage"


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>

          <Route index element={<CurrentDay />} />
          <Route path="foods" element={<Foods />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}


/************* Routes *************/

export function Home() {
  return (
    <div>Home</div>
  )
}