import { useState, useCallback, useMemo, useEffect } from "react";
import { Content, Incomes2022 } from "./data";
import { calculateTotals, formatCurrency } from "./utils";
import type { CalculateTotalsReturn, InputChangeEvent } from "./types";
import type { FormEvent } from "react";

import "./App.css";

function App() {
  const [incomeInput, setIncomeInput] = useState<string | null>(null);
  const [gstInput, setGstInput] = useState<string | null>(null);
  const [otherTaxInput, setOtherTaxInput] = useState<string | null>(null);
  const [totals, setTotals] = useState<CalculateTotalsReturn>({
    income: "$0.00",
    taxFromIncome: "$0.00",
    taxFromGST: "$0.00",
    taxFromOther: "$0.00",
    totalTax: "$0.00",
    totalsPerCategory: []
  });
  const [isSent, setIsSent] = useState(false);

  const handleIncomeChange = useCallback((event: InputChangeEvent) => {
    const value = event.currentTarget?.value?.replace(/[^0-9\.\,]/g, "");
    setIncomeInput(value);
  }, []);

  const handleGSTChange = useCallback((event: InputChangeEvent) => {
    const value = event.currentTarget?.value?.replace(/[^0-9\.\,]/g, "");
    setGstInput(value);
  }, []);

  const handleOtherTaxChange = useCallback((event: InputChangeEvent) => {
    const value = event.currentTarget?.value?.replace(/[^0-9\.\,]/g, "");
    setOtherTaxInput(value);
  }, []);

  const handleOnSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const income = incomeInput ? Number(incomeInput?.replace(/,/g, "")) : 0;
    const gst = gstInput ? Number(gstInput?.replace(/,/g, "")) : 0;
    const otherTax = otherTaxInput ? Number(otherTaxInput?.replace(/,/g, "")) : 0;
    if (income > 0) {
      const newTotals = calculateTotals({
        income,
        gst,
        otherTax
      });
      setTotals(newTotals);
      setIsSent(true);
    }
  }, [incomeInput, gstInput, otherTaxInput]);

  const lastYear = useMemo(() => new Date().getFullYear() - 1, []);

  useEffect(() => {
    const initialTotals = calculateTotals({
      income: Incomes2022.average,
      gst: 0,
      otherTax: 0
    });
    setTotals(initialTotals);
  }, []);

  return (
    <>
      <header role="banner">
        <p>{Content.header}</p>
      </header>
      <section className="hero" id="main">
        <h1 id="main-title">{Content.hero}</h1>
        <p className="hero-subtitle">
          {Content.subHero}{" "}
          <a href={Content.subHeroHref} target="_blank" rel="noreferrer noopener">
            <span>{lastYear}</span> {Content.subHeroLink}
          </a>
        </p>
      </section>

      <main role="main" className="calculator" id="calculator-inputs">
        <form
          onSubmit={handleOnSubmit}
          method="dialog"
        >
          <div className="calculator-flex">
            <label>
              {Content.incomeInputLabel}
              <i>$</i>
              <input
                className="calculator-input"
                id="input-income"
                inputMode="numeric"
                onChange={handleIncomeChange}
                pattern="\d{1,}[\,\.]{1}\d{1,2}"
                placeholder="0.00"
                type="text"
                value={incomeInput ?? ""}
              />
            </label>
            <label>
              {Content.gstInputLabel}
              <i>$</i>
              <input
                className="calculator-input"
                id="input-spending"
                inputMode="numeric"
                onChange={handleGSTChange}
                pattern="\d{1,}[\,\.]{1}\d{1,2}"
                placeholder="0.00"
                type="text"
                value={gstInput ?? ""}
              />
            </label>
            <label>
              {Content.otherTaxInputLabel}
              <i>$</i>
              <input
                className="calculator-input"
                id="input-other"
                inputMode="numeric"
                onChange={handleOtherTaxChange}
                pattern="\d{1,}[\,\.]{1}\d{1,2}"
                placeholder="0.00"
                type="text"
                value={otherTaxInput ?? ""}
              />
            </label>
          </div>
          <button type="submit">{Content.formSubmit}</button>
        </form>
        {isSent && (
          <section className="contribution">
            <p>{Content.totalsIncome}{totals.taxFromIncome}</p>
            <p>{Content.totalsGst}{totals.taxFromGST}</p>
            <p>{Content.totalsOtherTax}{totals.taxFromGST}</p>
          </section>
        )}
      </main>
      <div>
        <section className="tax-result" id="calculator-results">
          <h2>
            {isSent ? Content.summaryStart : Content.summaryStartMedian}
            <strong>{isSent ? totals.income : formatCurrency(Incomes2022.median)}</strong>
            {Content.summaryMiddle}
            <strong>{totals.totalTax}</strong>
            {Content.summaryEnd}
            {lastYear}:
          </h2>
        </section>
        <section className="summary" id="summary">
          {totals.totalsPerCategory.map(({
            id,
            name,
            paid: {
              amount,
              percentage
            }
          }) => (
            <div className="summary-primary" key={`/#${id}`}>
              <a className="summary-header" href={`/#${id}`}>
                {name}
              </a>
              <p className="summary-value">
                {amount}
              </p>
              <aside>
                {percentage}{Content.ofTotalSpend}
              </aside>
            </div>
          ))}{" "}
          <div className="summary-primary last-2"></div>
          <div className="summary-primary last"></div>
        </section>

        {totals.totalsPerCategory.map(({
          id,
          name,
          paid: {
            amount,
            percentage
          },
          children
        }) => (
          <section className="result" key={id} id={id}>
            <div className="result-primary">
              <h3 className="result-header">{name}</h3>
              <p className="result-value">
                {amount}
              </p>{" "}
              <aside>
                {percentage}{Content.ofTotalSpend}
              </aside>
            </div>
            <div className="result-secondary">
              {children.map((child) => (
                <div key={child.name} className="result-secondary-item">
                  <h3 className="result-header-secondary">{child.name}</h3>
                  <p className="result-value-secondary">
                    {child.paid.amount}
                  </p>
                  <aside>
                    {child.paid.percentageOfParent}{Content.ofDepartmentSpend}
                  </aside>
                  <aside>
                    {child.paid.percentage}{Content.ofTotalSpend}
                  </aside>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer>
        {Content.madeBy}
        <a href={Content.madeByAuthorHref} target="_blank" rel="noreferrer noopener">{Content.madeByAuthor}</a>
        <br />
        <a href="https://github.com/waltzaround/tax-receipts" target="_blank">
          Source code
        </a>
        &nbsp;·&nbsp;
        <a
          href="https://gist.github.com/waltzaround/5c469a4fe012a3b884af4826410cd5fa"
          target="_blank"
        >
          Methodology
        </a>
        &nbsp;·&nbsp;
        <a
          href="https://gist.github.com/waltzaround/39a6c803e68890c392855fe3e6d450d1"
          target="_blank"
        >
          How to calculate total tax
        </a>
        &nbsp;·&nbsp;
        <a href="https://discord.gg/qNEBWZgBwY" target="_blank">
          Discord
        </a>
      </footer>
    </>
  );
}

export default App;
