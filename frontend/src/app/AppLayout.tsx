import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-base text-ink">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        {/* min-w-0 กัน flex item ล้นกรอบเมื่อมีตาราง/ข้อความยาว */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      {/* วางนอก flex แถวเนื้อหา เพื่อให้เครดิตพาดเต็มความกว้างใต้ทั้งเมนูและเนื้อหา */}
      <Footer />
    </div>
  );
}
