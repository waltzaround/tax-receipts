import { Content } from "../data";

const Footer = () => (<footer>
  {Content.madeBy}
  <a href={Content.madeByAuthorHref} target="_blank" rel="noreferrer noopener">{Content.madeByAuthor}</a>
  <br />
  <a href={Content.madeByRepoHref} target="_blank" rel="noreferrer noopener">
    {Content.madeByRepoText}
  </a>
</footer>);

export { Footer }