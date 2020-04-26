import parse from './parser.mjs';
import { dataTag, gmapT, gmapQ } from './protocol.mjs';
import { guard } from './switch-on.mjs';

function dataToString(d) {
  if (d === null) return 'null';
  if (d === void 0) return 'undefined';
  if (typeof d === 'string' || typeof d === 'boolean' || typeof d === 'number') {
    return JSON.stringify(d);
  }
  return d.toString();
}

function createDeclaration({ name, bindings }) {
  let classTag = Symbol(name);

  let data = class {

    constructor(...args) {
      if (args.length != bindings.length) {
        throw new Error(`Expected ${bindings.length} arguments but got ${args.length} when constructing data type ${name}`);
      }
      let idx = 0;
      for (let { name } of bindings) {
        this[name] = args[idx];
        ++idx;
      }
    }

    [gmapT](f) {
      return new data(...bindings.map(({ name }) => f(this[name])));
    }

    [gmapQ](f) {
      return bindings.map(({ name }) => f(this[name]));
    }

    [dataTag]() {
      return classTag;
    }

    toString() {
      return `data ${name} { ${
        bindings.map(({ name }) => `${name}: ${dataToString(this[name])}`).join(', ')
      } }` 
    }
  }

  let ctor = (...args) => new data(...args);
  ctor.match = guard(
    x => x != null && typeof x[dataTag] === 'function' && x[dataTag]() === classTag,
    r => r != null && typeof r[dataTag] === 'function' && r[dataTag]() === classTag ? true : `Must return a result of type ${name}`
  );
  ctor.case = guard(
    x => x != null && typeof x[dataTag] === 'function' && x[dataTag]() === classTag
  );

  return ctor;
}

export default function data(strings) {
  let decls = parse(strings[0]);
  let namespace = {};

  for (let dataDecl of decls) {
    let decl = createDeclaration(dataDecl);
    namespace[dataDecl.name] = decl;
  }

  return namespace;
}