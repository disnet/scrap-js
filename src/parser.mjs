import { lang, empty, succeed } from 'parser-lang';


function Ident(name) {
  return { type: 'ident', name };
}
const isIdent = (o, value) => o != null && o.type === 'ident' && (value == null || o.name === value);
function Punc(punc) {
  return { type: 'punc', punc };
}
const isPunc = (o, value) => o != null && o.type === 'punc' && (value == null || o.punc === value);

let { tokens } = lang`

empty = @${empty()} ;

sp = /[\s]+/ ;

optSp = sp | @${succeed()} ;

ident = /[a-zA-Z][a-zA-Z0-9]*/ > ${Ident} ;

punc = /[\{\}\[\]:,|]/ > ${Punc} ;

ellipses = '...' > ${Punc} ;

token = ident | punc | ellipses ;

tokens = optSp token tokens > ${([, t, ts]) => ([t, ...ts])}
       | optSp empty > ${() => []};
`;

function DataDecl(name, bindings) {
  return {
    type: 'DataDecl',
    name, bindings,
  };
}
function Binding(name, bindingType) {
  return {
    type: 'Binding',
    name, bindingType,
  };
}
function BaseType(name) {
  return {
    type: 'BaseType',
    name,
  };
}
function ArrayType(type) {
  return {
    type: 'ArrayType',
    innerType: type,
  };
}
function UnionType(alternatives) {
  return {
    type: 'UnionType',
    alternatives,
  };
}
function Mixin(name) {
  return {
    type: 'Mixin', name,
  };
}

let { definitions } = lang`
empty = @${empty()} ;

comma = !${o => isPunc(o, ',')} ;
optComma = comma  | @${succeed()} ;

colon = !${o => isPunc(o, ':')} ;
pipe = !${o => isPunc(o, '|')} ;
ellipses = !${o => isPunc(o, '...')} ;

ident = !${isIdent} ;
punc = !${isPunc} ;

dataKwd = !${o => isIdent(o, 'data')} ;

openCurly = !${o => isPunc(o, '{')} ;
closeCurly = !${o => isPunc(o, '}')} ;

openSquare = !${o => isPunc(o, '[')} ;
closeSquare = !${o => isPunc(o, ']')} ;

baseType = openSquare unionType closeSquare > ${([, type]) => ArrayType(type)}
         | ident > ${({ name }) => BaseType(name)}
         ;

unionType = baseType (pipe baseType)+ > ${([t, ts]) => UnionType([t, ...ts.map(([, snd]) => snd)])}
          | baseType
          ;

binding = ident colon unionType > ${([{ name }, , type]) => Binding(name, type)}
        | ellipses ident > ${([, { name }]) => Mixin(name)}
        ;

declBody =  binding (comma binding )* optComma > ${([head, tail]) => [head, ...tail.map(([, snd]) => snd)]} ;

dataDecl = dataKwd ident openCurly closeCurly > ${([, { name }]) => DataDecl(name, [])}
         | dataKwd ident openCurly declBody closeCurly > ${([, { name }, , bindings]) => DataDecl(name, bindings)}
     ;

definitions = dataDecl* ;
`;

function lex(s) {
  return tokens.tryParse(s);
}

export default function parse(s) {
  return definitions.tryParse(lex(s));
}
