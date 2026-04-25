import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, Wallet, LayoutDashboard, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: Activity },
  { name: "Budgets", path: "/budgets", icon: Wallet },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Accounts", path: "/accounts", icon: Wallet },
];

const NavItems = ({ location }) => (
  <>
    {NAV_LINKS.map((link) => {
      const Icon = link.icon;
      const isActive = location.pathname === link.path;
      return (
        <Link
          key={link.path}
          to={link.path}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          {link.name}
        </Link>
      );
    })}
  </>
);
function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg hidden sm:block tracking-tight">
                FinTrack
              </span>
            </Link>

            <div className="hidden md:flex gap-1">
              <NavItems location={location} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {/* Future User Menu Placeholder */}
              <div className="h-8 w-8 rounded-full bg-muted border border-border" />
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                  <div className="flex flex-col gap-6 py-6">
                    <Link to="/" className="flex items-center gap-2 px-2">
                      <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-lg">FinTrack</span>
                    </Link>
                    <div className="flex flex-col gap-2">
                      <NavItems location={location} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
