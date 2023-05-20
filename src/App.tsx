import { useState } from "react";

import "./App.css";

function App() {
  //forgive me for the spaghetti I am about to commit
  //Source: https://www.treasury.govt.nz/sites/default/files/2022-05/befu22.pdf

  // Methodology:  Value divided by 107.901 billion (2021 actual core crown expenses) multiplied by 100 as a percentage of...

  const tax_input = "0";
  const taxBands = [
    { id: "band1", end: 14000, rate: 10.5 },
    { id: "band2", end: 48000, rate: 17.5 },
    { id: "band3", end: 70000, rate: 30 },
    { id: "band4", end: 180000, rate: 33 },
    { id: "band5", end: Infinity, rate: 39 },
  ];

  function calculate() {
    console.log("Tax calculated!");
    const income = 130000;
    const amount = calculateAmountPerTaxBand(income, taxBands);

    console.log(amount);
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
        <div className="calculator-flex">
          <label>
            Annual Income
            <i>$</i>
            <input
              type="number"
              id="input-income"
              className="calculator-input"
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
              placeholder="0.00"
              step="0.01"
            />
          </label>
        </div>
        <button onClick={calculate}>Calculate</button>
      </section>
      <section className="tax-result">
        <h2>
          Based on a total tax bill of <strong>$12,121</strong>, this is where
          your money went
        </h2>
      </section>
      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">
            Social Security and Welfare Expenses
          </h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental Expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Social rehabilitation and compensation
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Flexi-wage subsidy</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              New Zealand Superannuation
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Jobseeker Support and Emergency Benefit
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Supported living payment
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Sole parent support</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Family Tax Credit</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Other working for families tax credits
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Accommodation Assistance
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Income-Related Rents</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Disability Assistance</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">COVID leave support</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Winter energy</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Best Start</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Orphan's / unsupported Child's benefit
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Hardship Assistance</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Paid Parental Leave</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Childcare Assistance</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Veteran's Pension</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Wage Subsidy Scheme</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other benefits</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Other non-departmental expenses
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item"></div>
        </div>
      </section>
      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">Health Expenses</h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental outputs</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Purchasing of health services
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              National disability support services
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Other non-departmental outputs
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Health payments to ACC</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              National health response to COVID-19
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item"></div>
          <div className="result-secondary-item"></div>
        </div>
      </section>
      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">Education Expenses</h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Early childhood education
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Primary Schools</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Secondary Schools</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">School transport</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Special needs support</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Professional development
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Schooling Improvement</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">School Lunch Programme</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Tertiary Tuition</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other tertiary funding</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Student Allowances</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Student Loans</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              COVID-19 apprentice support
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
        </div>
      </section>

      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">Core Government Expenses</h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Official development assistance
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Tax receivable write-down and impairments
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Science expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Crown Research Institutes: COVID-19
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Shovel ready project funding
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Indemnity and guarantee expenses
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Non-departmental expenses
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other Expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
        </div>
      </section>

      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">Law and Order Expenses</h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Police</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Department of Corrections
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Ministry of Justice</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">NZ Customs Service</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other departments</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item"></div>
        </div>
      </section>

      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">
            Transport and communication expenses
          </h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental outputs</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Waka Kotahi NZ Transport Agency
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Rail funding</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Funding to support the aviation and transport Industries
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Funding to support Waka Kotahi due to impact of COVID-19
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Shovel ready project funding to Crown Infrastructure Partners
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Other non-departmental expenses
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item"></div>
        </div>
      </section>

      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">
            Economic and industrial services expenses
          </h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Departmental outputs</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Employment initiatives</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Non-departmental outputs
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              KiwiSaver (includes HomeStart grant)
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Initial fair value write-down on the Small Business Cashflow
              Scheme loans
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              COVID-19 Resurgence Support Payments
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Shovel ready funding to support energy projects
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Shovel ready project funding to support regional projects
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              Worker redeployment package
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item"></div>
          <div className="result-secondary-item"></div>
        </div>
      </section>

      <section className="result">
        <div className="result-primary">
          <h3 className="result-header">Defence expenses</h3>
          <p className="result-value">$1,231.00</p>
        </div>
        <div className="result-secondary">
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">
              New Zealand Defence Force expenses
            </h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>
          <div className="result-secondary-item">
            <h3 className="result-header-secondary">Other expenses</h3>
            <p className="result-value-secondary">$1,231.00</p>
          </div>

          <div className="result-secondary-item"></div>
        </div>
      </section>
    </>
  );
}

export default App;
