const id = x => x;

export function guard(domainPredicate, rangePredicate) {
  return f => {
    return (x, def = id, state) => {
      if (domainPredicate(x)) {
        let range = f(x, state);
        if (typeof rangePredicate === 'function') {
          let message = rangePredicate(range);
          if (message !== true) {
            throw new Error(typeof message === 'string' ? message : 'Failed range predicate in guard');
          }
        }
        return range;
      }
      return def(x);
    }
  };
}


const empty = {};
export default function switchOn(...matchers) {
  if (matchers.length === 0) throw new Error('Must provide matchers');

  return x => {
    for (let matcher of matchers) {
      let r = matcher(x, () => empty);
      if (r !== empty) {
        return r;
      }
    }
    throw new Error('No cases matched');
  }
}
