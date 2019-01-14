class Node {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;

    if(z != undefined)
      this.z = z;

    this.isSupport = false;

    // Restricciones rotacionales
    this.rX = false;
    this.rY = false;
    this.rZ = false;

    // Restricciones lineales
    this.lX = false;
    this.lY = false;
    this.lZ = false;

    // Contador para sabes cuantas veces está un nodo en una barra
    this.barCount = 0;

    // Fuerzas lineales
    this.fX = 0;
    this.fY = 0;
    this.fZ = 0;

    // Fuerzas rotacionales / momentum
    this.mX = 0;
    this.mY = 0;
    this.mZ = 0;
  }
}

class Bar {
  constructor(start, end, area, elasticity, I, G, J, C) {
    this.startNode = start;
    this.endNode = end;
    this.area = area;
    this.elasticity = elasticity;
    this.I = I;
    this.G = G;
    this.J = J;
    this.C = C;

    // Fuerzas lineales
    this.wX = 0;
    this.wY = 0;
    this.wZ = 0;

    // Direccion de las fuerzas lineales P
    this.pPx = 0;
    this.pPy = 0;
    this.pPz = 0;
    this.pMx = 0;
    this.pMy = 0;
    this.pMz = 0;

    // Direccion de las fuerzas lineales D
    this.dPx = 0;
    this.dPy = 0;
    this.dPz = 0;
    this.dMx = 0;
    this.dMy = 0;
    this.dMz = 0;
  }

  get deltaX() {
    return this.endNode.x - this.startNode.x;
  }

  get deltaY() {
    return this.endNode.y - this.startNode.y;
  }

  get calculateL() {
    return Math.sqrt(Math.pow(this.deltaX, 2) + Math.pow(this.deltaY, 2));
  }
}