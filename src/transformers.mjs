import { gmapT, gmapQ } from './protocol.mjs';

const EMPTY = {};

export function reconstructBottomUpC(...fs) {
  return x => {
    if (typeof x[gmapT] !== 'function') throw new Error(`Unsupported value missing definition for gmapT protocol: ${x}`);
    // first go down the tree
    let arg = x[gmapT](reconstructBottomUpC(...fs));
    // then try each reconstructing function in tern. Return the first one
    // that makes a modification
    for (let f of fs) {
      let r = f(arg, () => EMPTY);
      if (r !== EMPTY) {
        return r;
      }
    }
    return arg;
  }
}

export function reconstructTopDownC(...fs) {
  return x => {
    let toUse = x;
    // try each reconstructing function in turn, the first to return
    // a new value wins. If no function makes a modification still go down
    for (let f of fs) {
      let r = f(x, () => EMPTY);
      if (r !== EMPTY) {
        toUse = r;
        break;
      }
    }
    if (typeof toUse[gmapT] !== 'function') throw new Error(`Unsupported value missing definition for gmapT protocol: ${x}`);
    return toUse[gmapT](reconstructTopDownC(...fs));
  }
}


export function reconstructBottomUp(x, ...fs) {
  return reconstructBottomUpC(...fs)(x);
}
export function reconstructTopDown(x, ...fs) {
  return reconstructTopDownC(...fs)(x);
}
export function reconstruct(x, ...fs) {
  return reconstructBottomUp(x, ...fs);
}

export function reduceBottomUpC(empty, concat) {
  return (...fs) => {
    return x => {
      if (typeof x[gmapQ] !== 'function') throw new Error(`Unsupported value missing definition for gmapQ protocol: ${x}`);
      let bottomMap = x[gmapQ](reduceBottomUpC(empty, concat)(...fs));
      let bottomResult = Object.values(bottomMap).reduce(concat, empty);
      for (let f of fs) {
        let r = f(x, () => EMPTY, bottomMap);
        if (r !== EMPTY) {
          return r;
        }
      }
      return bottomResult;
    };
  };
}

export function reduceSum(x, ...fs) {
  return reduceBottomUpC(0, (l, r) => l + r)(...fs)(x);
}

export function reduceConcat(x, ...fs) {
  return reduceBottomUpC([], (l, r) => l.concat(r))(...fs)(x);
}


export function reduceBottomUp(x, empty, concat, ...fs) {
  return reduceBottomUpC(empty, concat)(...fs)(x);
}

export function reduce(x, empty, concat, ...fs) {
  return reduceBottomUp(x, empty, concat, ...fs);
}
