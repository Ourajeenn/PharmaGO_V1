import { ReactNode } from "react";
import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";

interface MainLayoutProps {
    children: ReactNode;
    /** Hide the header (e.g., for full-screen pages) */
    hideHeader?: boolean;
    /** Hide the footer (e.g., for dashboard pages) */
    hideFooter?: boolean;
    /** Extra classes for the main content area */
    className?: string;
}

/**
 * MainLayout — Consistent page wrapper
 * Provides Header + Footer + consistent bg for all public-facing pages.
 * Use hideHeader/hideFooter for special pages (dashboards, auth, etc.)
 */
const MainLayout = ({ children, hideHeader = false, hideFooter = false, className = "" }: MainLayoutProps) => {
    return (
        <div className={`min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans ${className}`}>
            {!hideHeader && <Header />}
            <main className="flex-1">{children}</main>
            {!hideFooter && <Footer />}
        </div>
    );
};

export default MainLayout;
