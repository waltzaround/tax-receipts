import { useState, useEffect, useCallback } from "react";
import { baseTotalReturn } from "./data";
import { calculateTotals } from "./utils";
import { Header, Footer, Form, Result } from "./components";
import type { CalculateTotalsReturn } from "./types";
import { History } from "./components/History";

import "./App.css";

const App = () => {
  const [page, setPage] = useState(() => window.location.hash === "#/history" ? "history" : "receipt");
  useEffect(() => {
    const navigate = () => setPage(window.location.hash === "#/history" ? "history" : "receipt");
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    document.title = page === "history" ? "Budget history | tax.walt.online" : "tax.walt.online";
  }, [page]);
  const [totals, setTotals] = useState<CalculateTotalsReturn>(baseTotalReturn);
  const [isSent, setIsSent] = useState(false);
  const [isActive, setisActive] = useState(false);

  const handleOnSubmit = useCallback((result) => {
    const newTotals = calculateTotals(result);
    setTotals(newTotals);
    setIsSent(true);
    setisActive(true);
  }, []);

  return (
    <>
      <nav className="site-nav" aria-label="Main navigation">
        <a href="/">Tax receipt</a>
        <div className="site-nav-links">
          <a href="/" aria-current={page === "receipt" ? "page" : undefined}>Calculator</a>
          <a href="#/history" aria-current={page === "history" ? "page" : undefined}>Budget history</a>
          <a href="https://github.com/waltzaround/tax-receipts">GitHub</a>
        </div>
      </nav>
      {page === "history" ? <History /> : <>
      <Header />

      <Form isSent={isSent} onSubmit={handleOnSubmit} totals={totals} />
      {isActive != false && (
        <Result totals={totals} />
      )}
      </>}
      <Footer />
    </>
  );
};

export default App;
