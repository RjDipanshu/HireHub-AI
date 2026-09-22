import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
    return (
        <div className="main-layout">
            <Navbar />

            <main>
                <Outlet />
            </main>
        </div>
    );
}