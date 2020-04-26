
export const gmapT = Symbol('Data.gmapT');
export const gmapQ = Symbol('Data.gmapQ');
export const dataTag = Symbol('Data.tag');

const valOf = function() { return this.valueOf(); };
const arrayUnit = function() { return []; };

String.prototype[gmapT] = valOf;
String.prototype[gmapQ] = arrayUnit;
Number.prototype[gmapT] = valOf;
Number.prototype[gmapQ] = arrayUnit;
Boolean.prototype[gmapT] = valOf;
Boolean.prototype[gmapQ] = arrayUnit;
BigInt.prototype[gmapT] = valOf;
BigInt.prototype[gmapQ] = arrayUnit;
Array.prototype[gmapT] = function(f) {
  return this.map(f); 
}
Array.prototype[gmapQ] = function(f) {
  if (this.length === 0) return [];
  return [f(this[0]), f(this.slice(1))];
};