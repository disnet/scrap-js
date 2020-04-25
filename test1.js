function Company(depts) {
  return {
    depts
  };
}

function Dept(name, manager, subunit) {
  return {
    name, manager, subunit
  };
}

function SubUnit() {}
function PersonUnit(empl) {
  return {
    empl
  };
}
function DeptUnit(dept) {
  return {
    dept
  };
}

function Employee(person, salary) {
  return {
    person, salary
  };
}


function Person(name, address) {
  return {
    name, address
  };
}


function Salary(amount) {
  return {
    amount
  };
}

let ralf = Employee(Person("Ralf", "California"), Salary(100));
let joost = Employee(Person("Joost", "California"), Salary(200));
let marlow = Employee(Person("Marlow", "California"), Salary(300));
let blair = Employee(Person("Blair", "California"), Salary(20000));

let example = Company([
  Dept("Research", ralf, [PersonUnit(joost), PersonUnit(marlow)]),
]);
