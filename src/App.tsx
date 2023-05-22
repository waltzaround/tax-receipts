import { useState, useMemo, useEffect, useCallback } from "react";
import { baseTotalReturn, Incomes2022 } from "./data";
import { calculateTotals } from "./utils";
import { Header, Footer, Form, Result } from "./components";
import type { CalculateTotalsReturn } from "./types";

import "./App.css";

const App = () => {
  const [totals, setTotals] = useState<CalculateTotalsReturn>(baseTotalReturn);
  const [isSent, setIsSent] = useState(false);
  const [isActive, setisActive] = useState(false);

  const lastYear = useMemo(() => new Date().getFullYear() - 1, []);

  const handleOnSubmit = useCallback((result) => {
    const newTotals = calculateTotals(result);
    setTotals(newTotals);
    setIsSent(true);
    setisActive(true);
  }, []);

  useEffect(() => {
    const initialTotals = calculateTotals({
      income: Incomes2022.average,
      gst: 0,
      otherTax: 0,
    });
    setTotals(initialTotals);
  }, []);

  return (
    <>
      <Header lastYear={lastYear} />

      <Form isSent={isSent} onSubmit={handleOnSubmit} totals={totals} />
      {isActive != false && (
        <Result isSent={isSent} lastYear={lastYear} totals={totals} />
      )}
      <Footer />
    </>
  );
};

export default App;
