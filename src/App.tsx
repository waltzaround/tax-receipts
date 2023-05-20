import { useState } from "react";

import "./App.css";
import Budget from "./values.json";

function App() {
  //forgive me for the spaghetti I am about to commit
  //Source: https://www.treasury.govt.nz/sites/default/files/2022-05/befu22.pdf

  //get inputs...
  const [income, setIncome] = useState(0);
  const [gstInput, setGstInput] = useState(0);
  const [otherTaxInput, setOtherTaxInput] = useState(0);
  let [total_tax, setTotalTaxInput] = useState(0);

  const [isSent, setIsSent] = useState(false);

  const handleIncomeChange = (event: any) => {
    setIncome(event.target.value);
    console.log("Income is:", event.target.value);
  };
  const handleGSTChange = (event: any) => {
    setGstInput(event.target.value);
    console.log("Spend is:", event.target.value);
  };
  const handleOtherTaxChange = (event: any) => {
    setOtherTaxInput(event.target.value);
    console.log("Other tax contribution is:", event.target.value);
  };

  const handleTotalTaxChange = (event: any) => {
    setTotalTaxInput(event.target.value);
    console.log("Total tax contribution is:", event.target.value);
  };
  let taxAfterSubmission = 0;
  // income tax section

  const taxBands = [
    { id: "band1", end: 14000, rate: 10.5 },
    { id: "band2", end: 48000, rate: 17.5 },
    { id: "band3", end: 70000, rate: 30 },
    { id: "band4", end: 180000, rate: 33 },
    { id: "band5", end: Infinity, rate: 39 },
  ];
  function calculate() {
    // Income tax calculation
    const sum = calculateAmountPerTaxBand(income, taxBands);
    function sumAmount() {
      let total = 0;
      for (let i = 0; i < sum.length; i++) {
        total += sum[i].amount;
      }
      return total;
    }
    let sumsum = sumAmount();
    taxAfterSubmission = sumsum;

    console.log("Income contribution is:", sumsum);
    console.log("GST tax contribution is:", gstInput * 0.15);
    console.log("All other tax contribution is:", Number(otherTaxInput));
    console.log("Tax calculated! Total contribution is:", total_tax);

    total_tax =
      Number(sumsum) + Number(otherTaxInput) + Number(gstInput * 0.15);

    setTotalTaxInput(total_tax);
    return total_tax;
  }
  function calculateTaxAlone() {
    // Income tax calculation
    const sum = calculateAmountPerTaxBand(income, taxBands);
    function sumAmount() {
      let total = 0;
      for (let i = 0; i < sum.length; i++) {
        total += sum[i].amount;
      }
      return total;
    }
    let sumsum = sumAmount();

    return sumsum;
  }

  type TaxBand = { id: string; end: number; rate: number };
  type BandAmount = { id: string; amount: number };

  function calculateAmountPerTaxBand(income: number, taxBands: TaxBand[]) {
    const amounts: BandAmount[] = [];

    for (let i = 0; i < taxBands.length; i++) {
      const currentTaxBand = taxBands[i];
      const prevTaxBand = taxBands[i - 1] as TaxBand | undefined;
      let taxAmount = 0;

      if (income < currentTaxBand.end) {
        taxAmount =
          (income - (prevTaxBand?.end ?? 0)) * (currentTaxBand.rate / 100);
        amounts.push({ id: currentTaxBand.id, amount: taxAmount });
        break;
      } else {
        taxAmount =
          (currentTaxBand.end - (prevTaxBand?.end ?? 0)) *
          (currentTaxBand.rate / 100);
        amounts.push({ id: currentTaxBand.id, amount: taxAmount });
      }
    }
    return amounts;
  }

  return (
    <>
      <header role="banner">
        <p>Taxreceipt.co.nz</p>
      </header>
      <section className="hero" id="main">
        <h1 id="main-title">Where did your tax go?</h1>
        <p className="hero-subtitle">
          based on{" "}
          <a href="https://www.treasury.govt.nz/sites/default/files/2023-05/befu23.pdf">
            2022 Actual Core Crown Expenses
          </a>
        </p>
      </section>

      <main role="main" className="calculator" id="calculator-inputs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculate();
            setIsSent(true);
          }}
        >
          <div className="calculator-flex">
            <label>
              Your Annual Income (Before Tax)
              <i>$</i>
              <input
                type="number"
                id="input-income"
                className="calculator-input"
                onChange={handleIncomeChange}
                value={income}
                placeholder="0.00"
                step="0.01"
              />
            </label>
            <label>
              Your Annual Spending (Optional)
              <i>$</i>
              <input
                type="number"
                className="calculator-input"
                id="input-spending"
                onChange={handleGSTChange}
                value={gstInput}
                placeholder="0.00"
                step="0.01"
              />
            </label>
            <label>
              Any Other Tax Payments (Optional)
              <i>$</i>
              <input
                type="number"
                id="input-other"
                className="calculator-input"
                onChange={handleOtherTaxChange}
                value={otherTaxInput}
                placeholder="0.00"
                step="0.01"
              />
            </label>
          </div>
          <button onClick={calculate}>Calculate</button>
        </form>
        {isSent && (
          <section className="contribution">
            <p>Income Tax Contribution: ${calculateTaxAlone().toFixed(2)}</p>·
            <p>GST Contribution: ${gstInput * 0.15}</p>·
            <p>Other Tax Contributions: ${otherTaxInput}</p>
          </section>
        )}
      </main>

      {isSent && (
        <div>
          <section className="tax-result" id="calculator-results">
            <h2>
              Based on a total tax bill of{" "}
              <strong>${(total_tax * 1).toFixed(2)}</strong>, this is where your
              money was spent in 2022
            </h2>
          </section>
          <section className="summary" id="summary">
            {Budget.budget.category.map((id) => (
              <div className="summary-primary">
                <a className="summary-header" href={`/#${id.id}`}>
                  {id.name}
                </a>
                <p className="summary-value">
                  $
                  {((id.value / Budget.budget.totalSpend) * total_tax).toFixed(
                    2
                  )}
                </p>
                <aside>
                  {((id.value / Budget.budget.totalSpend) * 100).toFixed(2)}% of
                  total spend
                </aside>
              </div>
            ))}{" "}
            <div className="summary-primary last-2"></div>
            <div className="summary-primary last"></div>
          </section>

          {Budget.budget.category.map((id) => (
            <section className="result" id={id.id}>
              <div className="result-primary">
                <h3 className="result-header">{id.name}</h3>
                <p className="result-value">
                  $
                  {((id.value / Budget.budget.totalSpend) * total_tax).toFixed(
                    2
                  )}
                </p>{" "}
                <aside>
                  {((id.value / Budget.budget.totalSpend) * 100).toFixed(2)}% of
                  total spend
                </aside>
              </div>
              <div className="result-secondary">
                {id.children.map((name) => (
                  <div className="result-secondary-item">
                    <h3 className="result-header-secondary">{name.name}</h3>
                    <p className="result-value-secondary">
                      $
                      {(
                        (name.value / Budget.budget.totalSpend) *
                        total_tax
                      ).toFixed(2)}
                    </p>
                    <aside>
                      {((name.value / id.value) * 100).toFixed(2)}% of
                      department spend
                    </aside>
                    <aside>
                      {((name.value / Budget.budget.totalSpend) * 100).toFixed(
                        2
                      )}
                      % of total spend
                    </aside>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <footer>
        Made by <a href="https://walt.online"> Walter Lim</a>
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
