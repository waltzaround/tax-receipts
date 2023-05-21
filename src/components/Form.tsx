import { useState, useCallback } from "react";
import { Content } from "../data";
import type {
  CalculateTotalsProps,
  CalculateTotalsReturn,
  InputChangeEvent,
} from "../types";
import type { FormEvent } from "react";

type FormProps = {
  onSubmit: (result: CalculateTotalsProps) => void;
  isSent: boolean;
  totals: CalculateTotalsReturn;
};

const Form = ({ onSubmit, isSent, totals }: FormProps) => {
  const [incomeInput, setIncomeInput] = useState<string>("");
  const [gstInput, setGstInput] = useState<string>("");
  const [otherTaxInput, setOtherTaxInput] = useState<string>("");

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

  const handleOnSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const income = incomeInput
        ? Number(incomeInput?.replace(/[^0-9\.]/g, ""))
        : 0;
      const gst = gstInput ? Number(gstInput?.replace(/[^0-9\.]/g, "")) : 0;
      const otherTax = otherTaxInput
        ? Number(otherTaxInput?.replace(/[^0-9\.]/g, ""))
        : 0;
      if (income > 0) {
        onSubmit({
          income,
          gst,
          otherTax,
        });
      }
    },
    [incomeInput, gstInput, otherTaxInput]
  );

  return (
    <>
      <main role="main" className="calculator" id="calculator-inputs">
        <form onSubmit={handleOnSubmit} method="dialog">
          <div className="calculator-flex">
            <label>
              {Content.incomeInputLabel}
              <i>$</i>
              <input
                className="calculator-input"
                id="input-income"
                inputMode="decimal"
                onChange={handleIncomeChange}
                pattern="\d{1,}[\,\.]{1}\d{1,2}"
                placeholder="0.00"
                type="text"
                value={incomeInput}
              />
            </label>
            <label>
              {Content.gstInputLabel}
              <i>$</i>
              <input
                className="calculator-input"
                id="input-spending"
                inputMode="decimal"
                onChange={handleGSTChange}
                pattern="\d{1,}[\,\.]{1}\d{1,2}"
                placeholder="0.00"
                type="text"
                value={gstInput}
              />
            </label>
            <label>
              {Content.otherTaxInputLabel}
              <i>$</i>
              <input
                className="calculator-input"
                id="input-other"
                inputMode="decimal"
                onChange={handleOtherTaxChange}
                pattern="\d{1,}[\,\.]{1}\d{1,2}"
                placeholder="0.00"
                type="text"
                value={otherTaxInput}
              />
            </label>
          </div>
          <button type="submit">{Content.formSubmit}</button>
        </form>
        {isSent && (
          <section className="contribution">
            <p>
              {Content.totalsIncome}
              {totals.taxFromIncome}
            </p>
            <p>
              {Content.totalsGst}
              {totals.taxFromGST}
            </p>
            <p>
              {Content.totalsOtherTax}
              {totals.taxFromOther}
            </p>
          </section>
        )}
      </main>
    </>
  );
};

export { Form };
