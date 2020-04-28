import parse from '../src/parser.mjs';
import data from '../src/scrap.mjs';
import switchOn, { guard } from '../src/switch-on.mjs';
import { reconstruct, reconstructTopDown, reduce, reduceSum, reduceConcat} from '../src/transformers.mjs';
import test from 'ava';

test('basic parsing', t => {
  t.snapshot(parse('data Company { }  '));
  t.snapshot(parse('data Company { a: string, }  '));
  t.snapshot(parse('data Company { a: string, b: number }  '));
  t.snapshot(parse('data Company { a: [string], b: number }  '));
  t.snapshot(parse('data Company { a: string | number, b: number }  '));
  t.snapshot(parse('data Company { a: string | number | [boolean], b: number }  '));
  t.snapshot(parse('data Company { a: [string | number] }  '));
  t.snapshot(parse(`
  data Company {}
  data Company2 { a: string }
  `));
});

test('parsing can handle spreading', t => {
  t.snapshot(parse(`
data A { a: string }
data B { ...A }
`));

  t.snapshot(parse(`
data A { a: string }
data B { b: number, ...A }
`));
  t.snapshot(parse(`
data A { a: string }
data B { b: number, ... A }
`));
  t.snapshot(parse(`
data A { a: string }
data B { ...A, b: number }
`));
});

test('basic data constructing', t => {
  let { A } = data`data A { a: string, b: number }`;
  let a = A('a', 1);
  t.is(a.a, 'a');
  t.is(a.b, 1);
});

test('match over same data', t => {
  let { A } = data`data A { a: string, b: number }`;
  let a = A('a', 1);
  let f = A.match(({ a, b }) => A(a + 'a', b + 1))
  let aa = f(a);
  t.is(aa.a, 'aa');
  t.is(aa.b, 2);
});

test('match over primitive data', t => {
  let { A } = data`data A { a: string, b: number }`;
  let f = A.match(({ a, b }) => A(a + 'a', b + 1))
  let x = f(1);
  t.is(x, 1);
});

test('match over different data', t => {
  let { A, B } = data`
  data A { a: string, b: number }
  data B { b: string }
  `;
  let f = A.match(({ a, b }) => A(a + 'a', b + 1))
  let b = B('b');
  let bb = f(b);
  t.is(b, bb);
});

test('throw if match returns wrong type', t => {
  let { A, B } = data`
  data A { a: string, b: number }
  data B { b: string }
  `;
  let f = A.match(({ a, b }) => B(a + 'a'))
  let a = A('a', 1);
  t.throws(() => f(a));
});

test('guard with domain predicate works', t => {
  let number = guard(x => typeof x === 'number');
  let inc = number(n => n + 1);

  t.is(inc(1), 2);
  t.is(inc('a'), 'a');
});

test('guard with range predicate works', t => {
  let number = guard(x => typeof x === 'number', r => typeof r === 'string');
  let ntoString = number(n => '' + n);

  t.is(ntoString(1), '1');
  t.is(ntoString('a'), 'a');
});

test('guard with failing range predicate throws', t => {
  let number = guard(x => typeof x === 'number', r => typeof r === 'string');
  let ntoString = number(n => n);

  t.is(ntoString('a'), 'a');
  t.throws(() => ntoString(1))
});

test('switchOn works', t => {
  let number = guard(x => typeof x === 'number');
  let string = guard(x => typeof x === 'string');

  let switchFn = switchOn(
    number(n => 'isNumber:' + n),
    string(s => 'isString:' + s),
    els => 'isOther:' + els,
  );

  t.is(switchFn(1), 'isNumber:1');
  t.is(switchFn('a'), 'isString:a');
  t.is(switchFn(false), 'isOther:false');
});

test('switchOn with overlapping guards short circuits', t => {
  let number = guard(x => typeof x === 'number');
  let pos = guard(x => x > 0);

  let switchFn = switchOn(
    number(n => 'isNumber:' + n),
    pos(s => 'isPositive:' + s),
    els => 'isOther:' + els,
  );

  t.is(switchFn(1), 'isNumber:1');
  t.is(switchFn(false), 'isOther:false');
});

test('case on data type works', t => {
  let { A, B } = data`
  data A { a: string, b: number }
  data B { b: string }
  `;

  let switchFn = switchOn(
    A.case(({ a, b }) => 'isA'),
    B.case(({ b }) => 'isB'),
  );

  t.is(switchFn(A('a', 1)), 'isA');
  t.is(switchFn(B('b')), 'isB');
});

test('reconstructing works 1 deep', t => {
  let { A } = data`
  data A { a: string, b: number }
  `;

  let a = A('a', 1);

  let r = reconstruct(a,
    A.match(({ a, b }) => A('a' + a, 1 + b))
  );

  t.is(r.a, 'aa');
  t.is(r.b, 2);

});

test('reconstructing works two deep', t => {
  let { A, B } = data`
  data A { a: string, b: B }
  data B { b: string }
  `;

  let a = A('a', B('b'));

  let r = reconstruct(a,
    A.match(({ a, b }) => A('a' + a, b)),
    B.match(({ b }) => B(b + 'b'))
  );

  t.is(r.a, 'aa');
  t.is(r.b.b, 'bb');
});

test('reconstructing works bottom up', t => {
  let { A, B } = data`
  data A { a: string, b: B }
  data B { b: string }
  `;

  let a = A('a', B('b'));

  let r = reconstruct(a,
    A.match(({ a, b }) => A('b:' + b.b, b)),
    B.match(({ b }) => B(b + 'b'))
  );

  t.is(r.a, 'b:bb');
  t.is(r.b.b, 'bb');
});

test('reconstructingTopDown works top down', t => {
  let { A, B } = data`
  data A { a: string, b: B }
  data B { b: string }
  `;

  let a = A('a', B('b'));

  let r = reconstructTopDown(a,
    A.match(({ a, b }) => A('b:' + b.b, b)),
    B.match(({ b }) => B(b + 'b'))
  );

  t.is(r.a, 'b:b');
  t.is(r.b.b, 'bb');
});

test('reduce works', t => {
  let { A, B } = data`
  data A { a: string, b: B }
  data B { b: string }
  `;

  let a = A('a', B('b'));

  let r = reduce(
    a,
    '',
    (l, r) => l + r,
    A.case(({ a, b }) => a),
    B.case(({ b }) => b)
  );

  t.is(r, 'ab');
});

test('reduceSum works', t => {
  let { A, B } = data`
  data A { a: string, b: B }
  data B { b: string }
  `;

  let a = A('a', B('b'));

  let r = reduceSum(
    a,
    B.case(({ b }) => 1)
  );

  t.is(r, 1);
});

test('reduceConcat works', t => {
  let { A, B } = data`
  data A { a: string, b: B }
  data B { b: string }
  `;

  let a = A('a', B('b'));

  let r = reduceConcat(
    a,
    A.case(({ a, b }) =>  [a]),
    B.case(({ b }) => [b])
  );

  t.deepEqual(r, ['a', 'b']);
});

test('mixins work', t => {
  {
    let { A, B } = data`
  data A { a: string }
  data B { b: string, ...A }
  `;

    t.snapshot(B('b', 'a'));
  }

  {
    let { A, B } = data`
  data A { a: string }
  data B { ...A, b: string }
  `;

    t.snapshot(B('a', 'b'));
  }
});

test('the html example works', t => {
  let { Text, Attr, Html, Head, Title, Script, Body, Div, P, A } = data`
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

  t.snapshot(example);

  let numberOfLinks = reduceSum(example,
                                A.case(() => 1));
  t.is(numberOfLinks, 2);

  t.snapshot(reconstruct(example,
                         Attr.match(a => a.name === 'href' && a.value.startsWith('http:')
                                    ? Attr('href', `https:${a.value.slice(5)}`)
                                    : a)));

});
