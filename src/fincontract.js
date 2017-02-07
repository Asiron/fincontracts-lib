
var Currency = {
  USD  : 0,
  EUR  : 1,
  SIZE : 2
}

class Fincontract {
  constructor(issuer, owner, proposedOwner, rootDescription) {
    this.issuer = issuer;
    this.owner  = owner;
    this.proposedOwner = proposedOwner;
    this.rootDescription = rootDescription;
  }
}

class FincNode {
  constructor(children) {
    this.children  = children;
  }
}

class FincTimebound extends FincNode {
  constructor(child, lowerBound, upperBound) {
    super(child);
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
  }
  
  eval() {
    return this.children.eval().map( 
      (i) => this.upperBound < Date.now() ? [0,0] : i
    );
  }
}

class FincAndNode extends FincNode {
  constructor(leftChild, rightChild) {
    super([leftChild, rightChild]);
  }
  
  eval() {
    let left  = this.children[0].eval();
    let right = this.children[1].eval();
    return zip(left,right).map( 
      ([iA, iB]) => [iA[0]+iB[0], iA[1]+iB[1]]
    );
  }
}

class FincIfNode extends FincNode {
  constructor(leftChild, rightChild) {
    super([leftChild, rightChild]);
  }
  
  eval() {
    let left  = this.children[0].eval();
    let right = this.children[1].eval();
    return zip(left,right).map( 
      ([iA, iB]) => [Math.min(iA[0], iB[0]), Math.max(iA[1], iB[1])]
    );
  }
}

class FincOrNode extends FincNode {
  constructor(leftChild, rightChild) {
    super([leftChild, rightChild]);
  }
  
  eval() {
    let left  = this.children[0].eval();
    let right = this.children[1].eval();
    return zip(left,right).map( 
      ([iA, iB]) => [Math.min(iA[0], iB[0]), Math.max(iA[1], iB[1])]
    );
  }
}

class FincGiveNode extends FincNode {
  constructor(child) {
    super(child);
  }
  
  eval() {
    return this.children.eval().map( (i) => [-i[1], -i[0]] );
  }
}

class FincScaleObservableNode extends FincNode {
  constructor(child, range) {
    super(child);
    this.range = range;
  }
  
  eval() {
    return this.children.eval().map(
      (i) => {
        let a = flatten(cross(this.range,i)).map(tupleMUL);
        return [a.min(), a.max()];
    }); 
  }
}

class FincScaleNode extends FincNode {
  constructor(child, scale) {
    super(child);
    this.scale = scale;
  }

  eval() {
    return this.children.eval().map((i) => [i[0]*this.scale, i[1]*this.scale]);
  }
}

class FincOneNode extends FincNode {
  constructor(currency) {
    super(null);
    this.currency = currency;
  }

  eval() { 
    let arr = makeArray(Currency.SIZE, [0,0]); 
    arr[this.currency] = [1,1];
    return arr;
  }
}

class FincZeroNode extends FincNode {
  constructor() {
    super(null);
  }

  eval() { 
    return makeArray(Currency.SIZE, [0,0]); 
  }
}