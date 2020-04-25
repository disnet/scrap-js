class Company {
  constructor(depts) {
    this.depts = depts;
  }
}

class Dept {
  constructor(name, manager, subunit) {
    this.name = name;
    this.manager = manager;
    this.subunit = subunit;
  }
}

class SubUnit {}
class PersonUnit extends SubUnit {
  constructor(empl) {
    this.empl = empl;
  }
}
class DeptUnit extends SubUnit {
  constructor(dept) {
    this.dept = dept;
  }
}

class Employee {
  constructor(person, salary) {
    this.person = person;
    this.salary = salary;
  }
}

class Person {
  consturctor(name, address) {
    this.name = name;
    this.address = address;
  }
}

class Salary {
  constructor(amount) {
    this.amount = amount;
  }
}

let ralf = new Employee(new Person("Ralf", "California"), new Salary(100));
let joost = new Employee(new Person("Joost", "California"), new Salary(200));
let marlow = new Employee(new Person("Marlow", "California"), new Salary(300));
let blair = new Employee(new Person("Blair", "California"), new Salary(20000));

let example = new Company([
  new Dept("Research", ralf, [new PersonUnit(joost), new PersonUnit(marlow)]),
  new Dept("Strategy", blair, []),
]);
