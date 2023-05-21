import { Content, Incomes2022 } from "../data";
import { formatCurrency } from "../utils";
import { Bar } from "./index";

const Result = ({
  isSent,
  lastYear,
  totals
}) => (<div>
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
        <div className="two-columns-flex">
          <a className="summary-header" href={`/#${id}`}>
            {name}
          </a>
          <p className="summary-value">
            {amount}
          </p>
        </div>
        <div>
          <aside>
            {percentage}{Content.ofTotalSpend}
          </aside>
          <Bar width={percentage} />
        </div>
      </div>
    ))}
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
        <Bar width={percentage} />
      </div>
      <div className="result-secondary">
        {children.map((child) => (
          <div key={child.name} className="result-secondary-item">
            <div className="two-columns-flex">
              <h3 className="result-header-secondary">{child.name}</h3>
              <p className="result-value-secondary">
                {child.paid.amount}
              </p>
            </div>
            <div>
              <div>
                <aside>
                  {child.paid.percentageOfParent}{Content.ofDepartmentSpend}
                </aside>
                <aside>
                  {child.paid.percentage}{Content.ofTotalSpend}
                </aside>
              </div>
              <Bar width={child.paid.percentageOfParent} secondaryWidth={child.paid.percentage} />
            </div>
          </div>
        ))}
      </div>
    </section>
  ))}
</div>);

export { Result };