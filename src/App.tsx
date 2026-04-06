// v2 - rebuilt with env vars
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import ThankYou from "./pages/ThankYou";
import PaymentError from "./pages/PaymentError";
import NotFound from "./pages/NotFound";
import KVKK from "./pages/KVKK";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import DistanceSales from "./pages/DistanceSales";
import Warranty from "./pages/Warranty";
import Quiz from "./pages/Quiz";
import Magaza from "./pages/Magaza";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/magaza" element={<Magaza />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/tesekkurler" element={<ThankYou />} />
          <Route path="/odeme-hata" element={<PaymentError />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/gizlilik" element={<Privacy />} />
          <Route path="/kullanim-sartlari" element={<Terms />} />
          <Route path="/iade-kosullari" element={<Refund />} />
          <Route path="/mesafeli-satis" element={<DistanceSales />} />
          <Route path="/garanti" element={<Warranty />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
