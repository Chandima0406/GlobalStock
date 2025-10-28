import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function App({ children }) {
  return (
    <div>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}

export default App;
