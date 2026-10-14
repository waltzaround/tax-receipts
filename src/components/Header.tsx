import { Content } from "../data";
import { calculatorPeriod, calculatorSpendingSource, incomeTaxSource } from "../data/calculator";

const Header = () => (<>
  <header role="banner">
    <p>{Content.header}</p>
  </header>
  <section className="hero" id="main">
    <h1 id="main-title">{Content.hero}</h1>
    <p className="hero-subtitle">
      {Content.subHero}{" "}
      <a href={calculatorSpendingSource} target="_blank" rel="noreferrer noopener">
        actual Core Crown expenses for the {calculatorPeriod}
      </a>
    </p>
    <p className="calculator-note">
      Uses <a href={incomeTaxSource}>income tax rates current in 2026</a> (effective 1 April 2025),
      before tax credits and ACC levies. Your estimated tax is allocated in proportion to each spending category.
    </p>
  </section>
</>);

export { Header }
