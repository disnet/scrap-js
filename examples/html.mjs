import scrap from '../src/scrap.mjs';
import { reconstruct, reduceSum } from '../src/transformers.mjs';

let { Text, Attr, Html, Head, Title, Script, Body, Div, P, A } = scrap`
data Node { children: [Node] }
data Element { attrs: [Attr], ...Node }

data Attr { name: string, value: string }

data Text { content: string, ...Node }

data Html { ...Element }
data Head { ...Element }
data Title { ...Element }
data Script { ...Element }
data Body { ...Element }
data Div { ...Element }
data A { ...Element }
data P { ...Element }
`;

let example = Html([], [
  Head([], [
    Title([], [Text('Example Page', [])])]),
  Body([], [
    Div([Attr('class', 'content')], [
      P([], [
        Text('This is a very fine paragraph with a ', []),
        A([Attr('href', 'http://example.com')], [
          Text('link', [])])]),
      P([], [
        Text('another fine paragraph', []),
        A([Attr('href', 'http://example.com')], [
          Text('link', [])])]),
    ]),
  ]),
]);

let httpsLinks = reconstruct(
  example,
  Attr.match(a => a.name === 'href' && a.value.startsWith('http:')
                  ? Attr('href', `https:${a.value.slice(5)}`)
                  : a));

let numberOfLinks = reduceSum(example,
                              A.case(() => 1));
console.log(numberOfLinks);