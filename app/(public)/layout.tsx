// app/(marketing)/layout.tsx
import Nav from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}