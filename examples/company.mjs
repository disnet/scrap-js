import data from '../src/data.mjs';
import { reconstruct, reduce } from '../src/transformers.mjs';

// example from "Scrap your boilerplate"
// https://www.microsoft.com/en-us/research/wp-content/uploads/2003/01/hmap.pdf

let { Company, Dept, PersonUnit, DeptUnit, Employee, Person, Salary } = data`
data Company { depts: [Dept] }
data Dept { name: string, manager: Employee, subUnit: [PersonUnit | DeptUnit] }
data PersonUnit { empl: Employee }
data DeptUnit { dept: Dept }
data Employee { person: Person, salary: Salary }
data Person { name: string, address: string }
data Salary { amount: number }
`;

let ralf = Employee(Person("Ralf", "California"), Salary(100));
let joost = Employee(Person("Joost", "California"), Salary(200));
let marlow = Employee(Person("Marlow", "California"), Salary(300));
let blair = Employee(Person("Blair", "California"), Salary(20000));

let example = Company([
  Dept("Research", ralf, [PersonUnit(joost), PersonUnit(marlow)]),
]);

function increaseSalary(company, incAmount) {
  return reconstruct(
    company,
    Salary.match(({amount}) => Salary(amount * (1 + incAmount)))
  );
}
console.dir(increaseSalary(example, 0.1), { depth: null });

function salaryBill(company) {
  return reduce(
    company,
    0,
    (l, r) => l + r,
    Salary.case(({ amount }) => amount)
  );
}

console.log(salaryBill(example));
