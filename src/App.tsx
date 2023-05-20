import { useState } from "react";

import "./App.css";
import Budget from "./values.json";

function App() {
  //forgive me for the spaghetti I am about to commit
  //Source: https://www.treasury.govt.nz/sites/default/files/2022-05/befu22.pdf

  //get inputs...
  const [income, setIncome] = useState("");
  const [gstInput, setGstInput] = useState("");
  const [otherTaxInput, setOtherTaxInput] = useState("");
  let [total_tax, setTotalTaxInput] = useState("number");

  const [isSent, setIsSent] = useState(false);

  const handleIncomeChange = (event) => {
    setIncome(event.target.value);
    console.log("Income is:", event.target.value);
  };
  const handleGSTChange = (event) => {
    setGstInput(event.target.value);
    console.log("Spend is:", event.target.value);
  };
  const handleOtherTaxChange = (event) => {
    setOtherTaxInput(event.target.value);
    console.log("Other tax contribution is:", event.target.value);
  };

  const handleTotalTaxChange = (event) => {
    setTotalTaxInput(event.target.value);
    console.log("Total tax contribution is:", event.target.value);
  };

  // income tax section

  const taxBands = [
    { id: "band1", end: 14000, rate: 10.5 },
    { id: "band2", end: 48000, rate: 17.5 },
    { id: "band3", end: 70000, rate: 30 },
    { id: "band4", end: 180000, rate: 33 },
    { id: "band5", end: Infinity, rate: 39 },
  ];
  function calculate() {
    const sum = calculateAmountPerTaxBand(parseFloat(income), taxBands);
    function sumAmount() {
      let total = 0;
      for (let i = 0; i < sum.length; i++) {
        total += sum[i].amount;
      }
      return total;
    }

    const sumsum = sumAmount();

    total_tax =
      sumsum + parseFloat(gstInput) * 0.15 + parseFloat(otherTaxInput);

    setTotalTaxInput(total_tax);

    console.log("Income contribution is:", sumsum);
    console.log("GST tax contribution is:", parseFloat(gstInput) * 0.15);
    console.log("All other tax contribution is:", parseFloat(otherTaxInput));
    console.log("Tax calculated! Total contribution is:", total_tax);
    return total_tax;
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
      <header>
        <aside>Taxreceipt.co.nz</aside>
      </header>
      <section className="hero">
        <h1>Where did your tax go?</h1>
        <p>
          based on{" "}
          <a href="https://www.treasury.govt.nz/sites/default/files/2023-05/befu23.pdf">
            2022 Actual Core Crown Expenses
          </a>
        </p>
      </section>

      <section className="calculator">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculate();
            setIsSent(true);
          }}
        >
          <div className="calculator-flex">
            <label>
              Annual Income
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
              Annual Spending (Optional)
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
              Any other tax contributions (Optional)
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
      </section>
      {isSent && (
        <div>
          <section className="tax-result">
            <h2>
              Based on a total tax bill of{" "}
              <strong>${total_tax.toFixed(2)}</strong>, this is where your money
              went
            </h2>
          </section>
          {Budget.budget.category.map((id) => (
            <section className="result">
              <div className="result-primary">
                <h3 className="result-header">{id.name}</h3>
                <p className="result-value">
                  $
                  {((id.value / Budget.budget.totalSpend) * total_tax).toFixed(
                    2
                  )}
                </p>
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
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
