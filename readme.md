# Scrap.js

Scrap.js let's you declaratively define data types that come with rich manipulation and traversal functionality built right in without the boilerplate.

# Project Status

Experimental, expect the API to change (but will follow semver when it does).

# Use

Install:

```sh
npm install @scrap-js/scrap
```

Use:

```javascript
import scrap from '@scrap-js/scrap';
import { reduceSum } from '@scrap-js/scrap/transformers';

let { Node, Leaf } = scrap`
data Node { left: Node | Leaf, right: Node | Leaf }
data Leaf { data: any }
`;

let tree = Node(
  Node(Leaf(1), Leaf(10)),
  Leaf(6)
);

let sum = reduceSum(tree,
                    Leaf.case(({ data }) => data));
// sum === 17;
```

Note at the moment this project uses ES modules exclusively so you'll need a recent version of node or a bundler.

# Documentation

Scrap.js has two main components:

- a declarative DSL for defining data types inside template literals
- a recursion scheme API for performing declarative transformations over the data

## Scrap DSL

Data types are defined within `scrap` template literals like so:

```javascript
import scrap from '@scrap-js/scrap';

let { Pair } = scrap`
data Pair { left: number, right: number }
`;
```

The syntax `data Pair { left: number, right: number }` defines a data type called `Pair` with two fields `left` and `right` both of type `number`. The result of invoking `scrap` is an object with data constructors for all the `data` declarations within the template literal.

As the name implies, data constructors allow you to construct object from your data types. Note that data constructors are not JavaScript `class` constructors and should be invoked without the `new` keyword:

```javascript
let p = Pair(1, 2);
p.left === 1;
p.right === 2;
```

Note that the order of the arguments to the constructor will match the lexical order of fields in the `data` declaration.

### Data Types

A data type field can have the types:

- any type: `any`
- the JavaScript base types: `number`, `string`, `boolean`, ...
- an Array type: `[<type>]`
- the union type: `<type 1> | <type 2>`
- a custom data type defined in another `data` declaration

### Mixins

A `data` declaration can "mixin" fields from another declaration:

```javascript
data Base { a: number }
data Derived { b: string, ...Base }
```

This is the equivalent of writing:

```javascript
data Base { a: number }
data Derived { b: string, a: number }
```

## Scrap API

Scrap.js comes with two main kinds of manipulation functions (with some variants):

- `reconstruct` - take a data structure and rebuild it with (potentially) modifications
- `reduce` - take a data structure and "summarize" it into a different value

These manipulation functions combo with a static function on each data constructor called `case` (described below).

Using a tree structure for our running example:

```javascript

import scrap from '@scrap-js/scrap';

let { Node, Leaf } = scrap`
data Node { left: Node | Leaf, right: Node | Leaf }
data Leaf { data: number }
`;

let tree = Node(
  Node(Leaf(1), Leaf(10)),
  Leaf(6)
);
```

### `reconstruct(data, ...cases)`

Reconstruct `data` bottom-up, matching and transforming each data type by running `cases` over them.

For example, let's say we want to increment the number in each leaf by one:

```javascript
import { reconstruct } from '@scrap-js/scrap/transformers.mjs';

let resultTree = reconstruct(tree,
  Leaf.case(({ data }) => Leaf(data + 1))
);
```

`reconstruct` will walk `tree` bottom-up and apply the function passed to `Leaf.case` to each `Leaf` object it encounters replacing the object with the result of the function application. Any non-`Leaf` objects are left alone (or reconstructed if their children were modified).

Alternatively, say we want to replace all right nodes with `-1`:

```javascript
let resultTree = reconstruct(tree,
  Node.case(({ left, right }) => Node(left, Leaf(-1)))
);
```

Or combining it all together:

```javascript
let resultTree = reconstruct(tree,
  Leaf.case(({ data }) => Leaf(data + 1)),
  Node.case(({ left, right }) => Node(left, Leaf(-1)))
);
```

Variants:

- `reconstructTopDown` - reconstruct top-down instead of bottom-up
- `reconstructBottomUp` - reconstruct bottom-up instead of top-down
- `reconstruct` - an alias of `reconstructBottomUp`

### `reduce(data, empty, concat, ...cases)`

Reduce `data` bottom-up. Run `cases` over each data type. `concat` is used to combine the results of `cases` and `empty` is used when no `cases` match a data type.

An example of summing all the numbers in a tree should be more clear:

```javascript

let sum = reduce(tree, 0, (l, r) => l + r,
                Leaf.case(({ data }) => data));
```

The case `Leaf.case(({ data }) => data)` extracts the number from each `Leaf`. Note the type of the `case` function here is `Leaf => number` whereas when `case` is used in `reconstruct` the type is `Leaf => Leaf`. 

The `concat` function is used to combine (sum) results from each `case` and the `empty` value `0` is used as the default (_whispers:_ [monoid](https://en.wikipedia.org/wiki/Monoid)).


Variants:

- `reduceSum` - like `reduce` but with pre-set `empty` as `0` and `concat` as `+`
- `reduceConcat` - like `reduce` but pre-set `empty` as `[]` and `concat` as `Array.prototype.concat`

# Why the name?

From the excellent paper ["Scrap your boilerplate"](https://www.microsoft.com/en-us/research/wp-content/uploads/2003/01/hmap.pdf).
