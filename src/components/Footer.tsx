import { Content } from "../data";

const Footer = () => (<footer>
  {Content.madeBy}
  <a href={Content.madeByAuthorHref} target="_blank" rel="noreferrer noopener">{Content.madeByAuthor}</a>
  <br />
  <a href={Content.madeByRepoHref} target="_blank" rel="noreferrer noopener">
    {Content.madeByRepoText}
  </a>
  &nbsp;·&nbsp;
  <a
    href={Content.methodologyHref}
    target="_blank"
    rel="noreferrer noopener"
  >
    {Content.methodology}
  </a>
  &nbsp;·&nbsp;
  <a
    href={Content.howToGistHref}
    target="_blank"
    rel="noreferrer noopener"
  >
    {Content.howToGist}
  </a>
  &nbsp;·&nbsp;
  <a
    href={Content.discordHref}
    target="_blank"
    rel="noreferrer noopener"
  >
    {Content.discord}
  </a>
</footer>);

export { Footer }