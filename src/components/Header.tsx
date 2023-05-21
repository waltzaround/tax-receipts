import { Content } from "../data";

const Header = ({ lastYear }) => (<>
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
</>);

export { Header }