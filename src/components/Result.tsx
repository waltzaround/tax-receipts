import { Content, Incomes2022 } from "../data";
import { formatCurrency } from "../utils";

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
</div>);

export { Result };