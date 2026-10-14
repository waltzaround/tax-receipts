import { Content } from "../data";
import { calculatorPeriod } from "../data/calculator";
import { Bar } from "./index";

const Result = ({ totals }) => (
  <div>
    <section className="tax-result" id="calculator-results">
      <h2>
        {Content.summaryStart}
        {Content.summaryMiddle}
        <strong>{totals.totalTax}</strong>
        {Content.summaryEnd}
        the {calculatorPeriod}:
      </h2>
    </section>
    <section className="summary" id="summary">
      {totals.totalsPerCategory.map(
        ({ id, name, paid: { amount, percentage }, children }) => (
          <div className="summary-primary" key={`/#${id}`}>
            <div className="two-columns-flex">
              {children.length > 0 ? (
                <a className="summary-header" href={`/#${id}`}>{name}</a>
              ) : <span className="summary-header">{name}</span>}
              <p className="summary-value">{amount}</p>
            </div>
            <div>
              <aside>
                {percentage}
                {Content.ofTotalSpend}
              </aside>
              <Bar width={percentage} />
            </div>
          </div>
        )
      )}
    </section>
    {totals.totalsPerCategory.filter(category => category.children.length > 0).map(
      ({ id, name, paid: { amount, percentage }, children }) => (
        <section className="result" key={id} id={id}>
          <div className="result-primary">
            <h3 className="result-header">{name}</h3>
            <p className="result-value">{amount}</p>{" "}
            <aside>
              {percentage}
              {Content.ofTotalSpend}
            </aside>
            <Bar width={percentage} />
          </div>
          <div className="result-secondary">
            {children.map((child) => (
              <div key={child.name} className="result-secondary-item">
                <div className="two-columns-flex">
                  <h3 className="result-header-secondary">{child.name}</h3>
                  <p className="result-value-secondary">{child.paid.amount}</p>
                </div>
                <div>
                  <div>
                    <aside>
                      {child.paid.percentageOfParent}
                      {Content.ofDepartmentSpend}
                    </aside>
                    <aside>
                      {child.paid.percentage}
                      {Content.ofTotalSpend}
                    </aside>
                  </div>
                  <Bar
                    width={child.paid.percentageOfParent}
                    secondaryWidth={child.paid.percentage}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )
    )}
  </div>
);

export { Result };
