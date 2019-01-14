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