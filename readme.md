# Scrap.js

Scrap.js let's you declaratively define data types that come with rich manipulation and traversal functionality built right in with no boilerplate.

```js
import scrap from '@scrap-js/scrap';
import { reduceSum } from '@scrap-js/scrap/transformers';

let {} = scrap`
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
  Head([], [Title([], [Text('Example Page', [])])]),
  Body([], [
    Div([Attr('class', 'content')], [
      P([], [
      Text('This is a very fine paragraph with a ', []), 
      A([Attr('href', 'https://example.com')], [Text('link', [])])])
    ]),
  ]),
]));

let numberOfJunkyards = reduceSum(example,
  Junkyard.case(({ address, availableScrap }) => 1),
);

let totalScrap = reduceSum(example,
  Junkyard.case(({ address, availableScrap }) => availableScrap)
);
```


Why the name?

From the excellent paper ["Scrap your boilerplate"](https://www.microsoft.com/en-us/research/wp-content/uploads/2003/01/hmap.pdf)
