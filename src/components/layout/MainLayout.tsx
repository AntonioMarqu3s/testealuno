
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function MainLayout({ children, title, className }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header title={title} />
          <main className={cn("flex-1 p-4 md:p-6", className)}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
