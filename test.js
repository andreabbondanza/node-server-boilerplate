class andrea {
  Id = 1;
  name = "asd";
  get ciao() {
    return "ciao";
  }
  metodo() {}

  metodo1() {}
}

const c = new andrea();

//console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(c)));

//console.log(Reflect.ownKeys(Reflect.getPrototypeOf(c)));

// console.log(getInstanceMethodNames(c));

for (const iterator of Object.keys(c)) {
  console.log(iterator);
}

const a = "user/:id/pippo";
const b = "user/5/pippo";
const aaa = /^user\/\d+\/pippo$/.test(b);

console.log(aaa);
