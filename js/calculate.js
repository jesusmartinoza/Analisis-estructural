
//Coordenadas de los nodos
var nodeX = [];
var nodeY = [];
var nodeZ = [];
//Apoyos
var supports = [];
//Restricciones de los apoyos
var restrictionsLx = [];
var restrictionsLy = [];
var restrictionsLz = [];
var restrictionsRx = [];
var restrictionsRy = [];
var restrictionsRz = [];
//Nodos iniciales de barras
var barsIni = [];
//Nodos finales de barras
var barsFin = [];
//Áreas
var areas = [];
//Elasticidad
var elasticity = [];
var barsI = [];
var barsG = [];
var barsJ = [];
var barsC = [];
//Barras con defectos constructivos
var barsD = [];
//Defectos constructivos
var dc = [];
//Apoyos con asentamientos
var settlements = [];
var dsX = [];
var dsY = [];
var dsZ = [];
//Longitud de las barras
var L = [];
//Longitud de las barras con defectos constructivos
var LD = [];

var a = [];
var A = [];
var At = [];

var kd = [];
var kArray = [];
var K = [];
var Kt = [];

//Fuerzas aplicadas en nodos
var F = [];
var F1 = [];
var F2 = [];
var FSol = [];

var d = [];
var e = [];
var P = [];
var P1 = [];
var P2 = [];

var deltaX = [];
var deltaY = [];

var calculationType = 0;

var jNodes = [];
var jBars = [];

function calculate() {
	jNodes = [];
	jBars = [];
	for(var i = 0; i < parseInt($mNumberOfBars.val()); i++) {
		jBars.push(new Bar());
	}

	calculationType = $calculationType.val();
	getNodesCoordinates();
	getSupports();
	getAreas();
	getElasticity();
	getI();
	getG();
	getJ();
	getC();
	getBarsDefects();
	getSettlements();
	calculateL();

	//Armadura
	if (calculationType === '1' || calculationType === '2') {
		calculateA();
		calculatekd();
		calculateK();
		var forceType = getForceType();
		switch (forceType) {
			//Fuerzas aplicadas en nodos
			case 1:
				getNodesForces();
				calculated();
				calculatee();
				calculateP();
			break;
			//Defectos constructivos
			case 2:
				calculateP1ForBarsDefects();
				calculateF();
				calculated();
				calculatee();
				calculateP2();
				calculatePBySum();
			break;
			//Efectos térmicos
			case 3:
				calculateP1ForThermalEffects()();
				calculateF();
				calculated();
				calculatee();
				calculateP2();
				calculatePBySum();
			break;
			//Asentamientos diferenciales
			case 4:
				//Estado I
				calculateP1ForSettlements();
				//Estado II
				calculateF();
				calculated();
				calculatee();
				calculateP2();
				calculatePBySum();
			break;
		}
		createDisplacementTable();
		createElongationTable();
		createAxialForceTable();
	}
	//Retícula
	else if (calculationType === '3') {
		getNodesForces();
  		getBarDistributedForces();
		getBarPuntualForces();
  		calculatekdByBar();
  		calculatekdFromki();
  		calculateAByBar();
  		calculateAFromAi();
  		calculateK();
		if (calculateNodesForcesForReticula()) {
			updateF();
			calculated();
			calculatee();
			calculateP();
			calculateF2();
			calculateF1();
			calculateFSol();
			//Resultado
			createResReticulaTable();
		}
	}
	//Marco Plano
	else if (calculationType === '4') {
		getNodesForces();
		getBarDistributedForces();
		getBarPuntualForces();
		calculatekdByBar();
		calculatekdFromki();
		calculateAByBar();
		calculateAFromAi();
		calculateK();
		if (calculateNodesForcesForMarcoPlano()) {
			updateF();
			calculated();
			calculatee();
			calculateP();
			calculateF2();
			calculateF1();
			calculateFSol();
			//Resultado
			createResMarcoPlanoTable();
		}
	}
	//Marco 3D
	else if (calculationType === '5') {
		getNodesForces();
		getBarDistributedForces();
		getBarPuntualForces();
		calculatekdByBar();
		calculatekdFromki();
		calculateU();
		calculateAByBarForMarco3D();
		calculateAFromAi();
		calculateK();
		if (calculateNodesForcesForMarco3D()) {
			updateF();
			calculated();
			calculatee();
			calculateP();
			calculateF2();
			calculateF1();
			calculateFSol();
			//Resultado
			createResMarco3DTable();
		}
	}
}

function calculateAByBarForMarco3D() {
	var size = $numberOfBars.val();
	a = [];
	//Para cada barra
	for (var i = 0; i < size; i++) {
		//Forma una matriz de continuidad con ceros para la barra
		ai = [];
		for (var j = 0; j < 8; j++)
			ai.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

		ai[0][0] = round((-jBars[i].uZx / jBars[i].calculateL3D) * 100, 3);
		ai[0][1] = round((-jBars[i].uZy / jBars[i].calculateL3D) * 100, 3);
		ai[0][2] = round((-jBars[i].uZz / jBars[i].calculateL3D) * 100, 3);
		ai[0][3] = round(jBars[i].uYx, 3);
		ai[0][4] = round(jBars[i].uYy, 3);
		ai[0][5] = round(jBars[i].uYz, 3);
		ai[0][6] = round((jBars[i].uZx / jBars[i].calculateL3D) * 100, 3);
		ai[0][7] = round((jBars[i].uZy / jBars[i].calculateL3D) * 100, 3);
		ai[0][8] = round((jBars[i].uZz / jBars[i].calculateL3D) * 100, 3);
		ai[0][9] = 0;
		ai[0][10] = 0;
		ai[0][11] = 0;

		ai[1][0] = round(((-2 * jBars[i].uZx) / jBars[i].calculateL3D) * 100, 3);
		ai[1][1] = round(((-2 * jBars[i].uZy) / jBars[i].calculateL3D) * 100, 3);
		ai[1][2] = round(((-2 * jBars[i].uZz) / jBars[i].calculateL3D) * 100, 3);
		ai[1][3] = ai[0][3];
		ai[1][4] = ai[0][4];
		ai[1][5] = ai[0][5];
		ai[1][6] = round(((2 * jBars[i].uZx) / jBars[i].calculateL3D) * 100, 3);
		ai[1][7] = round(((2 * jBars[i].uZy) / jBars[i].calculateL3D) * 100, 3);
		ai[1][8] = round(((2 * jBars[i].uZz) / jBars[i].calculateL3D) * 100, 3);
		ai[1][9] = ai[0][3];
		ai[1][10] = ai[0][4];
		ai[1][11] = ai[0][5];

		ai[2][0] = ai[0][0];
		ai[2][1] = ai[0][1];
		ai[2][2] = ai[0][2];
		ai[2][3] = 0;
		ai[2][4] = 0;
		ai[2][5] = 0;
		ai[2][6] = ai[0][6];
		ai[2][7] = ai[0][7];
		ai[2][8] = ai[0][8];
		ai[2][9] = ai[0][3];
		ai[2][10] = ai[0][4];
		ai[2][11] = ai[0][5];

		ai[3][0] = round((jBars[i].uYx / jBars[i].calculateL3D) * 100, 3);
		ai[3][1] = round((jBars[i].uYy / jBars[i].calculateL3D) * 100, 3);
		ai[3][2] = round((jBars[i].uYz / jBars[i].calculateL3D) * 100, 3);
		ai[3][3] = round(jBars[i].uZx, 3);
		ai[3][4] = round(jBars[i].uZy, 3);
		ai[3][5] = round(jBars[i].uZz, 3);
		ai[3][6] = round(((-jBars[i].uYx) / jBars[i].calculateL3D) * 100, 3);
		ai[3][7] = round(((-jBars[i].uYy) / jBars[i].calculateL3D) * 100, 3);
		ai[3][8] = round(((-jBars[i].uYz) / jBars[i].calculateL3D) * 100, 3);
		ai[3][9] = 0;
		ai[3][10] = 0;
		ai[3][11] = 0;

		ai[4][0] = round(((2 * jBars[i].uYx) / jBars[i].calculateL3D) * 100, 3);
		ai[4][1] = round(((2 * jBars[i].uYy) / jBars[i].calculateL3D) * 100, 3);
		ai[4][2] = round(((2 * jBars[i].uYz) / jBars[i].calculateL3D) * 100, 3);
		ai[4][3] = ai[3][3];
		ai[4][4] = ai[3][4];
		ai[4][5] = ai[3][5];
		ai[4][6] = round(((-2 * jBars[i].uYx) / jBars[i].calculateL3D) * 100, 3);
		ai[4][7] = round(((-2 * jBars[i].uYy) / jBars[i].calculateL3D) * 100, 3);
		ai[4][8] = round(((-2 * jBars[i].uYz) / jBars[i].calculateL3D) * 100, 3);
		ai[4][9] = ai[3][3];
		ai[4][10] = ai[3][4];
		ai[4][11] = ai[3][5];

		ai[5][0] = ai[3][0];
		ai[5][1] = ai[3][1];
		ai[5][2] = ai[3][2];
		ai[5][3] = 0;
		ai[5][4] = 0;
		ai[5][5] = 0;
		ai[5][6] = ai[3][6];
		ai[5][7] = ai[3][7];
		ai[5][8] = ai[3][8];
		ai[5][9] = ai[3][3];
		ai[5][10] = ai[3][4];
		ai[5][11] = ai[3][5];

		ai[6][0] = round(-jBars[i].uXx, 3);
		ai[6][1] = round(-jBars[i].uXy, 3);
		ai[6][2] = round(-jBars[i].uXz, 3);
		ai[6][3] = 0; 
		ai[6][4] = 0; 
		ai[6][5] = 0; 
		ai[6][6] = round(jBars[i].uXx, 3);
		ai[6][7] = round(jBars[i].uXy, 3);
		ai[6][8] = round(jBars[i].uXz, 3);
		ai[6][9] = 0; 
		ai[6][10] = 0; 
		ai[6][11] = 0; 

		ai[7][0] = 0; 
		ai[7][1] = 0; 
		ai[7][2] = 0; 
		ai[7][3] = ai[6][0];
		ai[7][4] = ai[6][1];
		ai[7][5] = ai[6][2];
		ai[7][6] = 0; 
		ai[7][7] = 0; 
		ai[7][8] = 0;
		ai[7][9] = ai[6][6];
		ai[7][10] = ai[6][7];
		ai[7][11] = ai[6][8];

		a.push(ai);
	}
}

function calculateU() {
    jBars.forEach(jBar => {
        jBar.uXx = (jBar.deltaX / jBar.calculateL3D) * 100;
        jBar.uXy = (jBar.deltaY / jBar.calculateL3D) * 100;
        jBar.uXz = (jBar.deltaZ / jBar.calculateL3D) * 100;
        var v = Math.sqrt(Math.pow(jBar.uXy, 2) + Math.pow(jBar.uXx, 2)); 
        jBar.uYx = -jBar.uXy / v;
        jBar.uYy = -jBar.uXx / v;
        jBar.uYz = 0;
        jBar.uZx = (jBar.uXy * jBar.uYz) - (jBar.uYy * jBar.uXz);
        jBar.uZy = (jBar.uXz * jBar.uYx) - (jBar.uYz * jBar.uXx);
        jBar.uZz = (jBar.uXx * jBar.uYy) - (jBar.uYx * jBar.uXy);
    });
}

function updateF() {
	F = [];

	jNodes.forEach(jNode => {
		//Si el nodo no es un apoyo
		if (!jNode.isSupport) {
			switch (calculationType) {
				//Retícula
				case '3':
					F.push([jNode.mX]);
					F.push([jNode.mY]);
					F.push([jNode.fZ]);
				break;
				//Marco plano
				case '4':
					F.push([jNode.fX]);
					F.push([jNode.fY]);
					F.push([jNode.mZ]);
				break;
				case '5':
					F.push([jNode.fX]);
					F.push([jNode.fY]);
					F.push([jNode.fZ]);
					F.push([jNode.mX]);
					F.push([jNode.mY]);
					F.push([jNode.mZ]);
				break;
			}
		}
	});
}

function calculateF1() {
	F1 = [];
	//Para cada barra se analiza el nodo inicial y el nodo final
	jBars.forEach(jBar => {
		if (calculationType === '5') {
			F1.push([jBar.fX1]);
			F1.push([jBar.fY1]);
			F1.push([jBar.fZ1]);
			F1.push([jBar.mX1]);
			F1.push([jBar.mY1]);
			F1.push([jBar.mZ1]);
			F1.push([jBar.fX2]);
			F1.push([jBar.fY2]);
			F1.push([jBar.fZ2]);
			F1.push([jBar.mX2]);
			F1.push([jBar.mY2]);
			F1.push([jBar.mZ2]);
		}
		else {
			var t = calculateT(jBar);
			var f1 = math.multiply(t, [[jBar.fX1], [jBar.fY1], [jBar.mZ1]]);
			var f2 = math.multiply(t, [[jBar.fX2], [jBar.fY2], [jBar.mZ2]]);
			F1.push([f1[0][0]]);  
			F1.push([f1[1][0]]);  
			F1.push([f1[2][0]]);  
			F1.push([f2[0][0]]);  
			F1.push([f2[1][0]]);  
			F1.push([f2[2][0]]);  
		}
	});
}

function calculateT(jBar) {
	var T = []
	var beta = Math.atan(Math.abs(jBar.deltaY / jBar.deltaX));
	T.push([Math.cos(beta), Math.sin(beta), 0]);
	T.push([-Math.sin(beta), Math.cos(beta), 0]);
	T.push([0, 0, 1]);
	return T;
}

function calculateFSol() {
	FSol = math.add(F1, F2);
}

function calculateNodesForcesForMarcoPlano() {
	var cont = 1;
	//Para cada barra se analiza el nodo inicial y el nodo final
	jBars.forEach(jBar => {

		//console.log(jBar);
		var jD = jBar.dPx;
		var jDeltaX = jBar.deltaX;
		var jDeltaY = jBar.deltaY;
		var jL = jBar.calculateL;

		//I. Si ningún nodo es apoyo
		if (!jBar.startNode.isSupport && !jBar.endNode.isSupport) {

			//En la tabla del paso 4 (Fuerzas en nodos) se suman las fuerzas a los respectivos nodos (Por eso no se crean instancias)

			//1. A cualquier nodo se conecta sólo una barra
			if (jBar.startNode.barCount == 1 || jBar.endNode.barCount == 1) {

				//Nodo con una barra
				var lib = jBar.startNode.barCount == 1 ? jBar.startNode : jBar.endNode;

				//Nodo con más de una barra
				var emp = _.isEqual(lib, jBar.startNode) ? jBar.endNode : jBar.startNode;

				//Si el nodo inicial es el nodo empotrado, se utiliza D (Distancia ingresada en la tabla Paso 6), si no se calcula D'
				jD = _.isEqual(jBar.startNode, emp) ? jD : jL - jD;

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {
				  //Si la coordenada x del nodo empotrado es menor que la del nodo libre, wY y pPy no se alteran, si no, se multiplican por -1
				  var sign = (emp.x < lib.x) ? 1 : -1;
				  emp.fX += jBar.pPx;
				  emp.fY += jBar.pPy + (jBar.wY * jL);
				  emp.mZ += jBar.pMz + (jBar.pPy * sign * jD) + (jBar.wY * sign * (Math.pow(jL, 2) / 2));
				  //Para el nodo libre los valores son cero
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {
					//Si la coordenada y del nodo empotrado es mayor que la del nodo libre, wX y pPx no se alteran, si no, se multiplican por -1
					var sign = (emp.y > lib.y) ? 1 : -1;
					emp.fX += jBar.pPx + (jBar.wX * jL);
					emp.fY += jBar.pPy;
					emp.mZ += jBar.pMz + (jBar.pPx * sign * jD) + (jBar.wX * sign * (Math.pow(jL, 2) / 2));
				  	//Para el nodo libre los valores son cero
				}

				//C
				else {
					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);

					//Si la coordenada x del nodo empotrado es menor que la del nodo libre, wY y pPy no se alteran, si no, se multiplican por -1
					var sign1 = (emp.x < lib.x) ? 1 : -1;
					//Si la coordenada y del nodo empotrado es mayor que la del nodo libre, wX y pPx no se alteran, si no, se multiplican por -1
					var sign2 = (emp.y > lib.y) ? 1 : -1;

					emp.fX += jBar.pPx + (jBar.wX * jLy);
					emp.fY += jBar.pPy + (jBar.wY * jLx);
					emp.mZ += jBar.pMz
							+ (jBar.pPy * jDx * sign1)
							+ (jBar.pPx * jDy * sign2)
			 				+ (jBar.wY * (Math.pow(jLx, 2) / 2) * sign1)
							+ (jBar.wX * (Math.pow(jLy, 2) / 2) * sign2);
				  	//Para el nodo libre los valores son cero
				}
			}

			//2. Si se conectan más de una barra a los nodos
			else {

				//Se calcula D'
				var jDc = jL - jD; 

				var nodeA = jBar.startNode;
				var	nodeB = jBar.endNode;
				
				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 ? -1 : 1;

					var aux = 0;

					// Nodo A
					nodeA.fX += jBar.pPx / 2;

					aux = (jBar.pPy * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeA.fY += aux + (jBar.wY * jL) / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPy * jD * Math.pow(jDc, 2) ) / (jL * jL) ) * nodeASign ;
					nodeA.mZ += ( (jBar.wY * jL * jL) / 12 ) * nodeASign;

					// Nodo B
					nodeB.fX += jBar.pPx / 2;

					aux = (jBar.pPy * jD * jD) / Math.pow(jL, 3);
					aux *= (jL + (2 * jDc));
					nodeB.fY += aux + (jBar.wY * jL) / 2;

					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPy * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wY * jL * jL) / 12 ) * nodeBSign;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY > 0 ? -1 : 1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX < 0 ? -1 : 1;

					//Nodo A
					aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeA.fX += aux + ((jBar.wX * jL) / 2);

					nodeA.fY += jBar.pPy / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPx * jD * Math.pow(jDc, 2)) / (jL * jL) ) * nodeASign;
					nodeA.mZ += ( (jBar.wX * jL * jL) / 12 ) * nodeASign;

					//Nodo B
					aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeB.fX += aux + (jBar.wX * jL) / 2;

					nodeB.fY += jBar.pPy / 2;
					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPx * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wX * jL * jL) / 12 ) * nodeBSign;
				}

				//C
				else {
					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);
					var jDcx = jDc * Math.cos(alpha);
					var jDcy = jDc * Math.sin(alpha);

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final, si no se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 && jDeltaY > 0 ? 1 : -1;
					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial, si no se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 && jDeltaY < 0 ? 1 : -1;

					// Nodo A
					nodeA.fX += ((jBar.pPx * jDcy * jDcy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDy));
					nodeA.fX += (jBar.wX * jLy) / 2;

					nodeA.fY += ((jBar.pPy * jDcx * jDcx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDx);
					nodeA.fY += (jBar.wY * jLx) / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPx * jDy * jDcy * jDcy) / Math.pow(jLy, 2) ) * nodeASign;
					nodeA.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / 12 ) * nodeASign;
					nodeA.mZ += ( (jBar.pPy * jDx * jDcx * jDcx) / Math.pow(jLx, 2) ) * nodeASign;
					nodeA.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / 12 ) * nodeASign;

					// Nodo B
					nodeB.fX += ((jBar.pPx * jDy * jDy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDcy));
					nodeB.fX += (jBar.wX * jLy) / 2;

					nodeB.fY += ((jBar.pPy * jDx * jDx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDcx);
					nodeB.fY += (jBar.wY * jLx) / 2;

					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPx * jDy * jDy * jDcy) / Math.pow(jLy, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / 12 ) * nodeBSign;
					nodeB.mZ += ( (jBar.pPy * jDx * jDx * jDcx) / Math.pow(jLx, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / 12 ) * nodeBSign;
				}

			}

			//Se guardan las fuerzas de la barra
			jBar.fX1 = jBar.startNode.fX;
			jBar.fY1 = jBar.startNode.fY;
			jBar.mZ1 = jBar.startNode.mZ;
			jBar.fX2 = jBar.endNode.fX;
			jBar.fY2 = jBar.endNode.fY;
			jBar.mZ2 = jBar.endNode.mZ;
		}
		//II. Si un nodo es apoyo
		else {

			//Se calcula D'
			var jDc = jL - jD; 
			
			//Nodo que es apoyo
			var art;
			//Nodo que no es apoyo
			var emp;

			if (jBar.startNode.isSupport) {
				art = copyInstance(jBar.startNode);
				emp = jBar.endNode;
			} else {
				art = copyInstance(jBar.endNode);
				emp = jBar.startNode;
			}

			//1. Si el apoyo tiene restricciones en X, Y y Z se realiza el mismo procedimiento que en I.2
			if (art.lX && art.lY && art.rZ) {

				var nodeA = (jBar.startNode.isSupport) ? copyInstance(jBar.startNode) : jBar.startNode;
				var nodeB = (jBar.endNode.isSupport) ? copyInstance(jBar.endNode) : jBar.endNode;

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 ? -1 : 1;

					var aux = 0;

					// Nodo A
					nodeA.fX += jBar.pPx / 2;

					aux = (jBar.pPy * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeA.fY += aux + (jBar.wY * jL) / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPy * jD * Math.pow(jDc, 2) ) / (jL * jL) ) * nodeASign ;
					nodeA.mZ += ( (jBar.wY * jL * jL) / 12 ) * nodeASign;

					// Nodo B
					nodeB.fX += jBar.pPx / 2;

					aux = (jBar.pPy * jD * jD) / Math.pow(jL, 3);
					aux *= (jL + (2 * jDc));
					nodeB.fY += aux + (jBar.wY * jL) / 2;

					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPy * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wY * jL * jL) / 12 ) * nodeBSign;

				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY > 0 ? -1 : 1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX < 0 ? -1 : 1;

					//Nodo A
					aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeA.fX += aux + ((jBar.wX * jL) / 2);

					nodeA.fY += jBar.pPy / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPx * jD * Math.pow(jDc, 2)) / (jL * jL) ) * nodeASign;
					nodeA.mZ += ( (jBar.wX * jL * jL) / 12 ) * nodeASign;
					
					//Nodo B
					aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeB.fX += aux + (jBar.wX * jL) / 2;

					nodeB.fY += jBar.pPy / 2;
					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPx * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wX * jL * jL) / 12 ) * nodeBSign;

				}

				//C
				else {
					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);
					var jDcx = jDc * Math.cos(alpha);
					var jDcy = jDc * Math.sin(alpha);

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final, si no se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 && jDeltaY > 0 ? 1 : -1;
					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial, si no se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 && jDeltaY < 0 ? 1 : -1;

					// Nodo A
					nodeA.fX += ((jBar.pPx * jDcy * jDcy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDy));
					nodeA.fX += (jBar.wX * jLy) / 2;

					nodeA.fY += ((jBar.pPy * jDcx * jDcx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDx);
					nodeA.fY += (jBar.wY * jLx) / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPx * jDy * jDcy * jDcy) / Math.pow(jLy, 2) ) * nodeASign;
					nodeA.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / 12 ) * nodeASign;
					nodeA.mZ += ( (jBar.pPy * jDx * jDcx * jDcx) / Math.pow(jLx, 2) ) * nodeASign;
					nodeA.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / 12 ) * nodeASign;

					// Nodo B
					nodeB.fX += ((jBar.pPx * jDy * jDy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDcy));
					nodeB.fX += (jBar.wX * jLy) / 2;

					nodeB.fY += ((jBar.pPy * jDx * jDx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDcx);
					nodeB.fY += (jBar.wY * jLx) / 2;

					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPx * jDy * jDy * jDcy) / Math.pow(jLy, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / 12 ) * nodeBSign;
					nodeB.mZ += ( (jBar.pPy * jDx * jDx * jDcx) / Math.pow(jLx, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / 12 ) * nodeBSign;

				}

				//El nodo A es el nodo inicial y el nodo B el final
				//Se guardan las fuerzas de la barra
				jBar.fX1 = nodeA.fX;
				jBar.fY1 = nodeA.fY;
				jBar.mZ1 = nodeA.mZ;
				jBar.fX2 = nodeB.fX;
				jBar.fY2 = nodeB.fY;
				jBar.mZ2 = nodeB.mZ;
				
			}

			//2. Si el apoyo tiene restricciones en X y Y  
			else if (art.lX && art.lY && !art.rZ) {

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 ? -1 : 1;

					emp.fX += jBar.pPx / 2;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fY += ( (jBar.pPy * jD) / (2 * Math.pow(jL, 3)) ) * ((3 * jL * jL) - (jD * jD));
					else
						emp.fY += ( (jBar.pPy * jDc) / (2 * Math.pow(jL, 3)) ) * ((3 * jL * jL) - (jDc * jDc));
					emp.fY += 5 * jBar.wY * jL / 8;

					emp.mZ += jBar.pMz;
					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( ((jBar.pPy * jD) / (2 * jL * jL)) * ((jL * jL) - Math.pow(jD, 2)) ) * nodeBSign;
					else
						emp.mZ += ( ((jBar.pPy * jDc) / (2 * jL * jL)) * (jL * jL - Math.pow(jDc, 2)) ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ((jBar.wY * jL * jL) / 8) * nodeBSign;
					else
						emp.mZ += ((jBar.wY * jL * jL) / 8) * nodeASign;

					art.fX += jBar.pPx / 2;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fY += ( (jBar.pPy * jDc * jDc) / (2 * Math.pow(jL, 3)) ) * ((3 * jL * jL) - jDc);
					else
						art.fY += ( (jBar.pPy * jD * jD) / (2 * Math.pow(jL, 3)) ) * ((3 * jL * jL) - jD);
					art.fY += 3 * jBar.wY * jL / 8;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY < 0 ? -1 : 1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaY > 0 ? -1 : 1;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fX += ((jBar.pPx*jD)/(2*(Math.pow(jL,3))))*(3*jL*jL-jD*jD);
					else
						emp.fX += ((jBar.pPx*jDc)/(2*(Math.pow(jL,3))))*(3*jL*jL-jDc*jDc);
					emp.fX += (jBar.wX*jL*5)/8;

					emp.fY += jBar.pPy/2;

					emp.mZ += jBar.pMz;
					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( ((jBar.pPx*jD)/(2*(Math.pow(jL,2))))*(jL*jL-jD*jD) ) * nodeBSign;
					else
						emp.mZ += ( ((jBar.pPx*jDc)/(2*(Math.pow(jL,2))))*(jL*jL-jDc*jDc) ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( (jBar.wX*jL*jL)/8 ) * nodeBSign;
					else
						emp.mZ += ( (jBar.wX*jL*jL)/8 ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fX+=((jBar.pPx*jDc*jDc)/(2*(Math.pow(jL,3))))*(3*jL-jDc);
					else
						art.fX+=((jBar.pPx*jD*jD)/(2*(Math.pow(jL,3))))*(3*jL-jD);

					art.fX+=(jBar.wX*jL*3)/8;
					art.fY+=jBar.pPy/2;

				}

				//C
				else {

					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);
					var jDcx = jDc * Math.cos(alpha);
					var jDcy = jDc * Math.sin(alpha);

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final, si no se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 && jDeltaY > 0 ? 1 : -1;
					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial, si no se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 && jDeltaY < 0 ? 1 : -1;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fX += ((jBar.pPx*jDy)/(2*(Math.pow(jLy,3))))*(3*jLy*jLy-jDy*jDy);
					else
						emp.fX += ((jBar.pPx*jDcy)/(2*(Math.pow(jLy,3))))*(3*jLy*jLy-jDcy*jDcy);
					emp.fX += (jBar.wX*jLy*5)/8;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fY += ((jBar.pPy*jDx)/(2*(Math.pow(jLx,3))))*(3*jLx*jLx-jDx*jDx);
					else
						emp.fY += ((jBar.pPy*jDcx)/(2*(Math.pow(jLx,3))))*(3*jLx*jLx-jDcx*jDcx);
					emp.fY += (jBar.wY*jLx*5)/8;

					emp.mZ += jBar.pMz;


					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( ((jBar.pPy*jDx)/(2*(Math.pow(jLx,2))))*(jLx*jLx-jDx*jDx) ) * nodeBSign;
					else
						emp.mZ += ( ((jBar.pPy*jDcx)/(2*(Math.pow(jLx,2))))*(jLx*jLx-jDcx*jDcx) ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( (jBar.wY*jLx*jLx)/8 ) * nodeBSign;
					else
						emp.mZ += ( (jBar.wY*jLx*jLx)/8 ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( ((jBar.pPx*jDy)/(2*(Math.pow(jLy,2))))*(jLy*jLy-jDy*jDy) ) * nodeBSign;
					else
						emp.mZ += ( ((jBar.pPx*jDcy)/(2*(Math.pow(jLy,2))))*(jLy*jLy-jDcy*jDcy) ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( (jBar.wX*jLy*jLy)/8 ) * nodeBSign;
					else
						emp.mZ += ( (jBar.wX*jLy*jLy)/8 ) * nodeASign;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fX += ((jBar.pPx*jDcy*jDcy)/(2*(Math.pow(jLy,3))))*(3*jLy-jDcy);
					else
						art.fX += ((jBar.pPx*jDy*jDy)/(2*(Math.pow(jLy,3))))*(3*jLy-jDy);
					art.fX += (jBar.wX*jLy*3)/8;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fY += ((jBar.pPy*jDcx*jDcx)/(2*(Math.pow(jLx,3))))*(3*jLx-jDcx);
					else
						art.fY += ((jBar.pPy*jDx*jDx)/(2*(Math.pow(jLx,3))))*(3*jLx-jDx);

					art.fY += (jBar.wY*jLx*3)/8;

				}

				if (jBar.startNode.isSupport) {
					nodeA = art;
					nodeB = emp;
				}
				else {
					nodeA = emp;
					nodeB = art;
				}

				//Se guardan las fuerzas de la barra
				jBar.fX1 = nodeA.fX;
				jBar.fY1 = nodeA.fY;
				jBar.mZ1 = nodeA.mZ;
				jBar.fX2 = nodeB.fX;
				jBar.fY2 = nodeB.fY;
				jBar.mZ2 = nodeB.mZ;
			}

			//3. Si el apoyo tiene restricción lineal en Y
			else if (!art.lX && art.lY && !art.rZ) {

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 ? -1 : 1;

					emp.fX += jBar.pPx;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fY += ( ((jBar.pPy*jD)/(2*(Math.pow(jL,3))))*(3*jL*jL-jD*jD) ) * nodeBSign;
					else
						emp.fY += ( ((jBar.pPy*jDc)/(2*(Math.pow(jL,3))))*(3*jL*jL-jDc*jDc) ) * nodeASign;
					emp.fY += (jBar.wY*jL*5)/8;

					emp.mZ += jBar.pMz;
					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( ((jBar.pPy*jD)/(2*(Math.pow(jL,2))))*(jL*jL-jD*jD) ) * nodeBSign;
					else
						emp.mZ += ( ((jBar.pPy*jDc)/(2*(Math.pow(jL,2))))*(jL*jL-jDc*jDc) ) * nodeASign;
					emp.mZ += (jBar.wY*jL*jL)/8;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fY += ( ((jBar.pPy*jDc*jDc)/(2*(Math.pow(jL,3))))*(3*jL-jDc) ) * nodeBSign;
					else
						art.fY += ( ((jBar.pPy*jD*jD)/(2*(Math.pow(jL,3))))*(3*jL-jD) ) * nodeASign;
					art.fY += (jBar.wY*jL*3)/8;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY < 0 ? -1 : 1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaY > 0 ? -1 : 1;

					//Si el nodo inicial es art (si es el apoyo)
					emp.fX += jBar.pPx+(jBar.wX*jL);
					emp.fY+=jBar.pPy/2;

					emp.mZ += jBar.pMz;
					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ += ( jBar.pPx*jDc ) * nodeBSign;
					else
						emp.mZ += ( jBar.pPx*jD ) * nodeASign;
					emp.mZ += jBar.wX*jL*jL/2;

					art.fY+=jBar.pPy/2;

				}

				//C
				else {

					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);
					var jDcx = jDc * Math.cos(alpha);
					var jDcy = jDc * Math.sin(alpha);

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final, si no se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 && jDeltaY > 0 ? 1 : -1;
					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial, si no se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 && jDeltaY < 0 ? 1 : -1;

					enp.fX+=jBar.pPx;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fY+= ( ((jBar.pPy*jDx)/(2*(Math.pow(jLx,3))))*(3*jLx*jLx-jDx*jDx) ) * nodeBSign;
					else
						emp.fY+= ( ((jBar.pPy*jDcx)/(2*(Math.pow(jLx,3))))*(3*jLx*jLx-jDcx*jDcx) ) * nodeASign;
					emp.fY+=(jBar.wY*jLx*5)/8;

					emp.mZ += jBar.pMz;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ+=( ((jBar.pPy*jDx)/(2*(Math.pow(jLx,2))))*(jLx*jLx-jDx*jDx) ) * nodeBSign;
					else
						emp.mZ+=( ((jBar.pPy*jDcx)/(2*(Math.pow(jLx,2))))*(jLx*jLx-jDcx*jDcx) ) * nodeASign;

					emp.mZ+=(jBar.wY*jLx*jLx)/8;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ+= (jBar.pPx*jDy) * nodeBSign;
					else
						emp.mZ+= (jBar.pPx*jDy) * nodeASign;

					emp.mZ+=jBar.wX*jLy*jLy/2;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fY+= ( ((jBar.pPy*jDcx*jDcx)/(2*(Math.pow(jLx,3))))*(3*jLx-jDcx) ) * nodeBSign;
					else
						art.fY+= ( ((jBar.pPy*jDx*jDx)/(2*(Math.pow(jLx,3))))*(3*jLx-jDx) ) * nodeASign;

					art.fY+=(jBar.wY*jLx*3)/8;

				}

				if (jBar.startNode.isSupport) {
					nodeA = art;
					nodeB = emp;
				}
				else {
					nodeA = emp;
					nodeB = art;
				}

				//Se guardan las fuerzas de la barra
				jBar.fX1 = nodeA.fX;
				jBar.fY1 = nodeA.fY;
				jBar.mZ1 = nodeA.mZ;
				jBar.fX2 = nodeB.fX;
				jBar.fY2 = nodeB.fY;
				jBar.mZ2 = nodeB.mZ;
			}

			//4. Si el apoyo tiene restricción lineal en X
			else if (art.lX && !art.lY && !art.rZ) {

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 ? -1 : 1;

					emp.fX += jBar.pPx / 2;
					emp.fY+=jBar.pPy+(jBar.wY*jL);

					emp.mZ += jBar.pMz;
					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ+= ( jBar.pPy*jDc ) * nodeBSign;
					else
						emp.mZ+= ( jBar.pPy*jD ) * nodeASign;
					emp.mZ+=jBar.wY*jL*jL/2;

					art.fX += jBar.pPx / 2;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY < 0 ? -1 : 1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaY > 0 ? -1 : 1;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fX+= ( ((jBar.pPx*jD)/(2*(Math.pow(jL,3))))*(3*jL*jL-jD*jD) ) * nodeBSign;
					else
						emp.fX+= ( ((jBar.pPx*jDc)/(2*(Math.pow(jL,3))))*(3*jL*jL-jDc*jDc) ) * nodeASign;
					emp.fX+=(jBar.wX*jL*5)/8;

					emp.fY+=jBar.pPy;


					emp.mZ += jBar.pMz;
					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ+= ( ((jBar.pPx*jD)/(2*(Math.pow(jL,2))))*(jL*jL-jD*jD) ) * nodeBSign;
					else
						emp.mZ+= ( ((jBar.pPx*jDc)/(2*(Math.pow(jL,2))))*(jL*jL-jDc*jDc) ) * nodeASign;
					emp.mZ+=(jBar.wX*jL*jL)/8;


					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fX+= ( ((jBar.pPx*jDc*jDc)/(2*(Math.pow(jL,3))))*(3*jL-jDc) ) * nodeBSign;
					else
						art.fX+= ( ((jBar.pPx*jD*jD)/(2*(Math.pow(jL,3))))*(3*jL-jD) ) * nodeASign;

					art.fX+=(jBar.wX*jL*3)/8;
				}

				//C
				else {

					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);
					var jDcx = jDc * Math.cos(alpha);
					var jDcy = jDc * Math.sin(alpha);

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final, si no se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 && jDeltaY > 0 ? 1 : -1;
					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial, si no se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 && jDeltaY < 0 ? 1 : -1;

					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.fX+= ( ((jBar.pPx*jDy)/(2*(Math.pow(jLy,3))))*(3*jLy*jLy-jDy*jDy) ) * nodeBSign;
					else
						emp.fX+= ( ((jBar.pPx*jDcy)/(2*(Math.pow(jLy,3))))*(3*jLy*jLy-jDcy*jDcy) ) * nodeASign;
					emp.fX+=(jBar.wX*jLy*5)/8;

					emp.fY+=jBar.pPy;

					emp.mZ+=jBar.pMz;


					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ+= ( jBar.pPy*jDcx ) * nodeBSign;
					else
						emp.mZ+= ( jBar.pPy*jDx ) * nodeASign;

					emp.mZ+=jBar.wY*jLx*jLx/2;


					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						emp.mZ+= ( ((jBar.pPx*jDy)/(2*(Math.pow(jLy,2))))*(jLy*jLy-jDy*jDy) ) * nodeBSign;
					else
						emp.mZ+= ( ((jBar.pPx*jDcy)/(2*(Math.pow(jLy,2))))*(jLy*jLy-jDcy*jDcy) ) * nodeASign;

					emp.mZ+=(jBar.wX*jLy*jLy)/8;


					//Si el nodo inicial es art (si es el apoyo)
					if (jBar.startNode.isSupport)
						art.fX+= ( ((jBar.pPx*jDcy*jDcy)/(2*(Math.pow(jLy,3))))*(3*jLy-jDcy) ) * nodeBSign;
					else
						art.fX+= ( ((jBar.pPx*jDy*jDy)/(2*(Math.pow(jLy,3))))*(3*jLy-jDy) ) * nodeASign;

					art.fX+=(jBar.wX*jLy*3)/8;
				}

				if (jBar.startNode.isSupport) {
					nodeA = art;
					nodeB = emp;
				}
				else {
					nodeA = emp;
					nodeB = art;
				}

				//Se guardan las fuerzas de la barra
				jBar.fX1 = nodeA.fX;
				jBar.fY1 = nodeA.fY;
				jBar.mZ1 = nodeA.mZ;
				jBar.fX2 = nodeB.fX;
				jBar.fY2 = nodeB.fY;
				jBar.mZ2 = nodeB.mZ;
			}

			else {
				showErrorMessage($('#mp-res-table-container'), 'Fuera del alcance del programa. Barra ' + cont + ' con cargas intermedias y apoyo empotrado móvil.');
				return false;
			}
		}
		cont++;
	});

	return true;
}

function calculateNodesForcesForReticula() {
	var cont = 1;
	//Para cada barra se analiza el nodo inicial y el nodo final
	jBars.forEach(jBar => {

		//console.log(jBar);
		var jD = jBar.dPx;
		var jDeltaX = jBar.deltaX;
		var jDeltaY = jBar.deltaY;
		var jL = jBar.calculateL;

		//Se obtiene el valor de beta en grados
		if (jDeltaY > 0) {
			if (jDeltaX > 0)
				beta = radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
			else if (jDeltaX == 0)
				beta = 90;
			else if (jDeltaX < 0)
				beta = 180 + radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
		}
		else if (jDeltaY < 0) {
			if (jDeltaX > 0)
				beta = 360 + radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
			else if (jDeltaX == 0)
				beta = 270;
			else if (jDeltaX < 0)
				beta = 180 + radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
		}
		else if (jDeltaY == 0) {
			if (jDeltaX > 0)
				beta = 0;
			else if (jDeltaX < 0)
				beta = 180;
		}
		beta = degreesToRadians(beta);


		//I. Si ningún nodo es apoyo
		if (!jBar.startNode.isSupport && !jBar.endNode.isSupport) {

			//En la tabla del paso 4 (Fuerzas en nodos) se suman las fuerzas a los respectivos nodos (Por eso no se crean instancias)

			//1. A cualquier nodo se conecta sólo una barra
			if (jBar.startNode.barCount == 1 || jBar.endNode.barCount == 1) {

				//Nodo con una barra
				var lib = jBar.startNode.barCount == 1 ? jBar.startNode : jBar.endNode;

				//Nodo con más de una barra
				var emp = _.isEqual(lib, jBar.startNode) ? jBar.endNode : jBar.startNode;

				//Si el nodo inicial es el nodo empotrado, se utiliza D (Distancia ingresada en la tabla Paso 6), si no se calcula D'
				jD = _.isEqual(jBar.startNode, emp) ? jD : jL - jD;

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {
				  	var nodeASign = (emp.x < lib.x) ? -1 : 1;
					emp.fZ += jBar.pPz+(jBar.wZ*jL);
					emp.mX += jBar.pMx;
					emp.mY += jBar.pMy;
					emp.mY += jBar.pPz*jD*nodeASign;
					emp.mY += (jBar.wZ*jL*jL)/2*nodeASign;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {
					var nodeASign = (emp.y < lib.y) ? 1 : -1;
					emp.fZ += jBar.pPz+(jBar.wZ*jL);
					emp.mX += jBar.pMx;
					emp.mX += jBar.pPz*jD*nodeASign;
					emp.mX += (jBar.wZ*jL*jL)/2*nodeASign;
					emp.mY += jBar.pMy;
				}

				//C
				else {
					emp.fZ += jBar.pPz+(jBar.wZ*jL);
					emp.mX += jBar.pMx;
					emp.mX += jBar.pPz*jD*(1*Math.sin(beta));
					emp.mX += jBar.wZ*jL*jL/2*(1*Math.sin(beta));
					emp.mY += jBar.pMy;
					emp.mY += jBar.pPz*jD*(-1*Math.cos(beta));
					emp.mY += jBar.wZ*jL*jL/2*(-1*Math.cos(beta));
				}
			}

			//2. Si se conectan más de una barra a los nodos
			else {

				//Se calcula D'
				var jDc = jL - jD; 
				var	nodeA = jBar.startNode;
				var	nodeB = jBar.endNode;

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX < 0 ? -1 : 1;

					var aux = 0;

					// Nodo A
					nodeA.fZ+=((jBar.pPz*jDc*jDc)/(Math.pow(jL,3)))*(jL+2*jD);
					nodeA.fZ+=jBar.wZ*jL/2;
					nodeA.mX+=jBar.pMx/2;
					nodeA.mY+=jBar.pMy/2;
					nodeA.mY+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2))) * nodeASign;
					nodeA.mY+=(jBar.wZ*jL*jL)/12 * nodeASign;

					// Nodo B
					nodeB.fZ+=((jBar.pPz*jD*jD)/(Math.pow(jL,3)))*(jL+2*jDc);
					nodeB.fZ+=jBar.wZ*jL/2;
					nodeB.mX+=jBar.pMx/2;
					nodeB.mY+=jBar.pMy/2;
					nodeB.mY+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2))) * nodeBSign;
					nodeB.mY+=(jBar.wZ*jL*jL)/12 * nodeBSign; 
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY > 0 ? 1 : -1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaY < 0 ? 1 : -1;

					//Nodo A
					nodeA.fZ+=((jBar.pPz*jDc*jDc)/(Math.pow(jL,3)))*(jL+2*jD);
					nodeA.fZ+=jBar.wZ*jL/2;
					nodeA.mX+=jBar.pMx/2;
					nodeA.mX+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2))) * nodeASign;
					nodeA.mX+=(jBar.wZ*jL*jL)/12 * nodeASign;
					nodeA.mY+=jBar.pMy/2;

					//Nodo B
					nodeB.fZ+=((jBar.pPz*jD*jD)/(Math.pow(jL,3)))*(jL+2*jDc);
					nodeB.fZ+=jBar.wZ*jL/2;
					nodeB.mX+=jBar.pMx/2;
					nodeB.mX+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2))) * nodeBSign;
					nodeB.mX+=(jBar.wZ*jL*jL)/12 * nodeBSign;
					nodeB.mY+=jBar.pMy/2;
				}

				//C
				else {
					//El nodo final se multiplican por -1 para corregir las direcciones de las reacciones
					nodeSign = -1;
			
					// Nodo A
					nodeA.fZ+=((jBar.pPz*jDc*jDc)/(Math.pow(jL,3)))*(jL+2*jD);
					nodeA.fZ+=jBar.wZ*jL/2;
					nodeA.mX+=jBar.pMx/2;
					nodeA.mX+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2)))*(1*Math.sin(beta));
					nodeA.mX+=(jBar.wZ*jL*jL)/12*(1*Math.sin(beta));
					nodeA.mY+=jBar.pMy/2;
					nodeA.mY+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2)))*( -1*Math.cos(beta));
					nodeA.mY+=(jBar.wZ*jL*jL)/12*(-1*Math.cos(beta));

					// Nodo B
					nodeB.fZ+=((jBar.pPz*jD*jD)/(Math.pow(jL,3)))*(jL+2*jDc);
					nodeB.fZ+=jBar.wZ*jL/2;
					nodeB.mX+=jBar.pMx/2;
					nodeB.mX+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2)))*(1*Math.sin(beta)) * nodeSign;
					nodeB.mX+=(jBar.wZ*jL*jL)/12*(1*Math.sin(beta)) * nodeSign;
					nodeB.mY+=jBar.pMy/2;
					nodeB.mY+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2)))*( -1*Math.cos(beta)) * nodeSign;
					nodeB.mY+=(jBar.wZ*jL*jL)/12*(-1*Math.cos(beta)) * nodeSign;
				}

			}

			//Se guardan las fuerzas de la barra
			jBar.fX1 = jBar.startNode.fX;
			jBar.fY1 = jBar.startNode.fY;
			jBar.mZ1 = jBar.startNode.mZ;
			jBar.fX2 = jBar.endNode.fX;
			jBar.fY2 = jBar.endNode.fY;
			jBar.mZ2 = jBar.endNode.mZ;
		}
		//II. Si un nodo es apoyo
		else {

			//Se calcula D'
			var jDc = jL - jD; 
			
			//Nodo que es apoyo
			var art;
			//Nodo que no es apoyo
			var emp;

			if (jBar.startNode.isSupport) {
				art = copyInstance(jBar.startNode);
				emp = jBar.endNode;
			} else {
				art = copyInstance(jBar.endNode);
				emp = jBar.startNode;
			}

			//1. Si el apoyo tiene restricciones en X, Y y Z se realiza el mismo procedimiento que en I.2
			if (art.lX && art.lY && art.rZ) {

				var nodeA = jBar.startNode;
				var	nodeB = jBar.endNode;

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX < 0 ? -1 : 1;

					var aux = 0;

					// Nodo A
					nodeA.fZ+=((jBar.pPz*jDc*jDc)/(Math.pow(jL,3)))*(jL+2*jD);
					nodeA.fZ+=jBar.wZ*jL/2;
					nodeA.mX+=jBar.pMx/2;
					nodeA.mY+=jBar.pMy/2;
					nodeA.mY+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2))) * nodeASign;
					nodeA.mY+=(jBar.wZ*jL*jL)/12 * nodeASign;

					// Nodo B
					nodeB.fZ+=((jBar.pPz*jD*jD)/(Math.pow(jL,3)))*(jL+2*jDc);
					nodeB.fZ+=jBar.wZ*jL/2;
					nodeB.mX+=jBar.pMx/2;
					nodeB.mY+=jBar.pMy/2;
					nodeB.mY+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2))) * nodeBSign;
					nodeB.mY+=(jBar.wZ*jL*jL)/12 * nodeBSign;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {

					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY > 0 ? 1 : -1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaY < 0 ? 1 : -1;

					//Nodo A
					nodeA.fZ+=((jBar.pPz*jDc*jDc)/(Math.pow(jL,3)))*(jL+2*jD);
					nodeA.fZ+=jBar.wZ*jL/2;
					nodeA.mX+=jBar.pMx/2;
					nodeA.mX+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2))) * nodeASign;
					nodeA.mX+=(jBar.wZ*jL*jL)/12 * nodeASign;
					nodeA.mY+=jBar.pMy/2;

					//Nodo B
					nodeB.fZ+=((jBar.pPz*jD*jD)/(Math.pow(jL,3)))*(jL+2*jDc);
					nodeB.fZ+=jBar.wZ*jL/2;
					nodeB.mX+=jBar.pMx/2;
					nodeB.mX+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2))) * nodeBSign;
					nodeB.mX+=(jBar.wZ*jL*jL)/12 * nodeBSign;
					nodeB.mY+=jBar.pMy/2;
				}

				//C
				else {
					//El nodo final se multiplican por -1 para corregir las direcciones de las reacciones
					nodeSign = -1;
			
					// Nodo A
					nodeA.fZ+=((jBar.pPz*jDc*jDc)/(Math.pow(jL,3)))*(jL+2*jD);
					nodeA.fZ+=jBar.wZ*jL/2;
					nodeA.mX+=jBar.pMx/2;
					nodeA.mX+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2)))*(1*Math.sin(beta));
					nodeA.mX+=(jBar.wZ*jL*jL)/12*(1*Math.sin(beta));
					nodeA.mY+=jBar.pMy/2;
					nodeA.mY+=((jBar.pPz*jD*jDc*jDc)/(Math.pow(jL,2)))*( -1*Math.cos(beta));
					nodeA.mY+=(jBar.wZ*jL*jL)/12*(-1*Math.cos(beta));

					// Nodo B
					nodeB.fZ+=((jBar.pPz*jD*jD)/(Math.pow(jL,3)))*(jL+2*jDc);
					nodeB.fZ+=jBar.wZ*jL/2;
					nodeB.mX+=jBar.pMx/2;
					nodeB.mX+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2)))*(1*Math.sin(beta)) * nodeSign;
					nodeB.mX+=(jBar.wZ*jL*jL)/12*(1*Math.sin(beta)) * nodeSign;
					nodeB.mY+=jBar.pMy/2;
					nodeB.mY+=((jBar.pPz*jD*jD*jDc)/(Math.pow(jL,2)))*( -1*Math.cos(beta)) * nodeSign;
					nodeB.mY+=(jBar.wZ*jL*jL)/12*(-1*Math.cos(beta)) * nodeSign; 
				}

				//El nodo A es el nodo inicial y el nodo B el final
				//Se guardan las fuerzas de la barra
				jBar.fX1 = nodeA.fX;
				jBar.fY1 = nodeA.fY;
				jBar.mZ1 = nodeA.mZ;
				jBar.fX2 = nodeB.fX;
				jBar.fY2 = nodeB.fY;
				jBar.mZ2 = nodeB.mZ;
				
			}
			else {
				showErrorMessage($('#r-res-table-container'), 'Advertencia: Este programa sólo contempla apoyos totalmente empotrados para el cálculo de fuerzas intermedias en las barras.');
				return false;
			}
		}
		
		cont++;
	});

	return true;
}

function calculateNodesForcesForMarco3D() {
	var cont = 1;
	//Para cada barra se analiza el nodo inicial y el nodo final
	jBars.forEach(jBar => {
		var jD = jBar.dPx;
		var jDeltaX = jBar.deltaX;
		var jDeltaY = jBar.deltaY;
		var jDeltaZ = jBar.deltaZ;
		var jL = jBar.calculateL;

		//Se obtiene el valor de betaXY en grados
		if (jDeltaX > 0) {
			if (jDeltaZ > 0)
				betaXY = radiansToDegrees(Math.atan(jDeltaX / jDeltaZ));
			else if (jDeltaZ == 0)
				betaXY = 90;
			else if (jDeltaZ < 0)
				betaXY = 180 + radiansToDegrees(Math.atan(jDeltaX / jDeltaZ));
		}
		else if (jDeltaX < 0) {
			if (jDeltaZ > 0)
				betaXY = 360 + radiansToDegrees(Math.atan(jDeltaX / jDeltaZ));
			else if (jDeltaZ == 0)
				betaXY = 270;
			else if (jDeltaZ < 0)
				betaXY = 180 + radiansToDegrees(Math.atan(jDeltaX / jDeltaZ));
		}
		else if (jDeltaX == 0) {
			if (jDeltaZ > 0)
				betaXY = 0;
			else if (jDeltaZ < 0)
				betaXY = 180;
		}

		//Se obtiene el valor de betaXZ en grados
		if (jDeltaY > 0) {
			if (jDeltaX > 0)
				betaXZ = radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
			else if (jDeltaX == 0)
				betaXZ = 90;
			else if (jDeltaX < 0)
				betaXZ = 180 + radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
		}
		else if (jDeltaY < 0) {
			if (jDeltaX > 0)
				betaXZ = 360 + radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
			else if (jDeltaX == 0)
				betaXZ = 270;
			else if (jDeltaX < 0)
				betaXZ = 180 + radiansToDegrees(Math.atan(jDeltaY / jDeltaX));
		}
		else if (jDeltaY == 0) {
			if (jDeltaX > 0)
				betaXZ = 0;
			else if (jDeltaX < 0)
				betaXZ = 180;
		}

		//Se obtiene el valor de betaYZ en grados
		if (jDeltaZ > 0) {
			if (jDeltaY > 0)
				betaYZ = radiansToDegrees(Math.atan(jDeltaZ / jDeltaY));
			else if (jDeltaY == 0)
				betaYZ = 90;
			else if (jDeltaY < 0)
				betaYZ = 180 + radiansToDegrees(Math.atan(jDeltaZ / jDeltaY));
		}
		else if (jDeltaZ < 0) {
			if (jDeltaY > 0)
				betaYZ = 360 + radiansToDegrees(Math.atan(jDeltaZ / jDeltaY));
			else if (jDeltaY == 0)
				betaYZ = 270;
			else if (jDeltaY < 0)
				betaYZ = 180 + radiansToDegrees(Math.atan(jDeltaZ / jDeltaY));
		}
		else if (jDeltaZ == 0) {
			if (jDeltaY > 0)
				betaYZ = 0;
			else if (jDeltaY < 0)
				betaYZ = 180;
		}

		//I. Si ningún nodo es apoyo
		if (!jBar.startNode.isSupport && !jBar.endNode.isSupport) {

			//1. A cualquier nodo se conecta sólo una barra
			if (jBar.startNode.barCount == 1 || jBar.endNode.barCount == 1) {

				//Nodo con una barra
				var lib = jBar.startNode.barCount == 1 ? copyInstance(jBar.startNode) : copyInstance(jBar.endNode);
				//Nodo con más de una barra
				var emp = _.isEqual(lib, jBar.startNode) ? copyInstance(jBar.endNode) : copyInstance(jBar.startNode);
				//Si el nodo inicial es el nodo empotrado, se utiliza D (Distancia ingresada en la tabla Paso 6), si no se calcula D'
				jD = _.isEqual(jBar.startNode, emp) ? jD : jL - jD;

				//A
				if (jDeltaX != 0 && jDeltaY == 0 && jDeltaZ == 0) {
					var signZ = (emp.x < lib.x) ? -1 : 1;
					var signY = (emp.x < lib.x) ? 1 : -1;

					emp.fZ+=jBar.pPz+(jBar.wZ*jL);
					emp.mX+=jBar.pMx;
					emp.mY+=jBar.pMy;
					emp.mY+=jBar.pPz*jd*signZ;
					emp.mY+=jBar.wZ*jL*jL/2*signZ;
					emp.fY+=jBar.pPy+(jBar.wY*jL);
					emp.mZ+=jBar.pMz;
					emp.mZ+=jBar.pPy*jd*signY;
					emp.mZ+=jBar.wY*jL*jL/2*signY;
					emp.fX+=jBar.pPx;
				}

				//B
				else if (jDeltaX == 0 && jDeltaY != 0 && jDeltaZ == 0) {
					var signX = (emp.y < lib.y) ? -1 : 1;
					var signZ = (emp.y < lib.y) ? 1 : -1;

					emp.fZ+=jBar.pPz+(jBar.wZ*jL);
					emp.mX+=jBar.pMx;
					emp.mX+=jBar.pPz*jd*signZ;
					emp.mX+=jBar.wZ*jL*jL/2*signZ;
					emp.mY+=jBar.pMy;
					emp.fY+=jBar.pPy;
					emp.mZ+=jBar.pMz;
					emp.fX+=jBar.pPx+(jBar.wX*jL);
					emp.mZ+=jBar.pPx*jd*signX;
					emp.mZ+=jBar.wX*jL*jL/2*signX;
				}

				//C
				else if (jDeltaX == 0 && jDeltaY == 0 && jDeltaZ != 0) {
					var signY = (emp.z < lib.z) ? -1 : 1;
					var signX = (emp.z < lib.z) ? 1 : -1;

					emp.fZ+=jBar.pPz;
					emp.mX+=jBar.pMx;
					emp.mY+=jBar.pMy;
					emp.fY+=jBar.pPy+(jBar.wY*jL);
					emp.mZ+=jBar.pMz;
					emp.mX+=jBar.pPy*jd*signY;
					emp.mX+=jBar.wY*jL*jL/2*signY;
					emp.fX+=jBar.pPx+(jBar.wX*jL);
					emp.mY+=jBar.pPx*jd*signX;
					emp.mY+=jBar.wX*jL*jL/2*signX;
				}

				//D
				else if (jDeltaX != 0 && jDeltaY != 0 && jDeltaZ == 0) {

					var alphaXY = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alphaXY);
					var jDy = jD * Math.sin(alphaXY);
					var jLx = jL * Math.cos(alphaXY);
					var jLy = jL * Math.sin(alphaXY);

					var signX = (emp.y > lib.y) ? -1 : 1;
					var signY = (emp.x > lib.x) ? 1 : -1;

					emp.fZ+=jBar.pPz+(jBar.wZ*jL);
					emp.mX+=jBar.pMx;
					emp.mX+=jBar.pPz*jD*(1*Math.sen(betaXY));
					emp.mX+=jBar.wZ*jL*jL/2*(1*Math.sen(betaXY));
					emp.mY+=jBar.pMy;
					emp.mY+=jBar.pPz*jD*(-1*Math.cos(betaXY));
					emp.mY+=jBar.wZ*jL*jL/2*(-1*Math.cos(betaXY));
					emp.fX+=jBar.pPx+(jBar.wX*jLy);
					emp.fY+=jBar.pPy+(jBar.wY*jLx);
					emp.mZ+=jBar.pMz
					emp.mZ+=(jBar.pPy*jDx*signY);
					emp.mZ+=(jBar.wY*(Math.pow(jLx,2)/2)*signY);
					emp.mZ+=(jBar.pPx*jDy*signX);
					emp.mZ+=(jBar.wX*(Math.pow(jLy,2)/2)*signX);
				}
				//E
				else if (jDeltaX != 0 && jDeltaY == 0 && jDeltaZ != 0) {

					var alphaXZ = Math.atan(Math.abs(jDeltaX / jDeltaZ));
					var jDz = jD * Math.cos(alphaXZ);
					var jDx = jD * Math.sin(alphaXZ);
					var jLz = jL * Math.cos(alphaXZ);
					var jLx = jL * Math.sin(alphaXZ);

					var signZ = (emp.x > lib.x) ? -1 : 1;
					var signX = (emp.z > lib.z) ? 1 : -1;

					emp.mX+=jBar.pMx;
					emp.mY+=jBar.pMy;
					emp.fY+=jBar.pPy+(jBar.wY*jL);
					emp.mZ+=jBar.pMz;
					emp.mZ+=jBar.pPy*jD*(1*Math.sen(betaXZ));
					emp.mZ+=jBar.wY*jL*jL/2*(1*Math.sen(betaXZ));
					emp.mX+=jBar.pPy*jD*(-1*Math.cos(betaXZ));
					emp.mX+=jBar.wY*jL*jL/2*(-1*Math.cos(betaXZ));
					emp.fX+=jBar.pPx+(jBar.wX*jLz);
					emp.fZ+=jBar.pPz+(jBar.wZ*jLx);
					emp.mY+=(jBar.pPz*jDx*signZ);
					emp.mY+=(jBar.wZ*(Math.pow(jLx,2)/2)*signZ);
					emp.mY+=(jBar.pPx*jDz*signX);
					emp.mY+=(jBar.wX*(Math.pow(jLz,2)/2)*signX);

				}

				//F
				else if (jDeltaX == 0 && jDeltaY != 0 && jDeltaZ != 0) {

					var alphaYZ = Math.atan(Math.abs(jDeltaZ / jDeltaY));
					var jDy = jD * Math.cos(alphaYZ);
					var jDz = jD * Math.sin(alphaYZ);
					var jLy = jL * Math.cos(alphaYZ);
					var jLz = jL * Math.sin(alphaYZ);

					var signY = (emp.x > lib.x) ? -1 : 1;
					var signZ = (emp.z > lib.z) ? 1 : -1;

					emp.mX+=jBar.pMx;
					emp.mY+=jBar.pMy;
					emp.mZ+=jBar.pMz;
					emp.fY+=jBar.pPy+(jBar.wY*jLz);
					emp.fZ+=jBar.pPz+(jBar.wZ*jLy);
					emp.mX+=(jBar.pPy*jDz*signY);
					emp.mX+=(jBar.wY*(Math.pow(jLz,2)/2)*signY);
					emp.mX+=(jBar.pPz*jDy*signZ);
					emp.mX+=(jBar.wZ*(Math.pow(jLy,2)/2)*signZ);
					emp.fX+=jBar.pPx+(jBar.wX*jL);
					emp.mY+=jBar.pPx*jD*(1*Math.sen(betaYZ));
					emp.mY+=jBar.wX*jL*jL/2*(1*Math.sen(betaYZ));
					emp.mZ+=jBar.pPx*jD*(-1*Math.cos(betaYZ));
					emp.mZ+=jBar.wX*jL*jL/2*(-1*Math.cos(betaYZ));
				}

				//G
				else {
					var alpha = Math.atan(Math.abs(jDeltaY / jDeltaX));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);

					var nodeASign1 = (emp.x < lib.x) ? 1 : -1;
					var nodeASign2 = (emp.y > lib.y) ? 1 : -1;

					emp.fZ+=jBar.pPz+(jBar.wZ*jL);
					emp.mX+=jBar.pMx;
					emp.mX+=jBar.pPz*jD*(-1*Math.sen(betaXY));
					emp.mX+=jBar.wZ*jL*jL/2*(-1*Math.sen(betaXY));
					emp.mY+=jBar.pMy;
					emp.mY+=jBar.pPz*jD*(1*Math.cos(betaXY));
					emp.mY+=jBar.wZ*jL*jL/2*(1*Math.cos(betaXY));
					emp.fY+=jBar.pPy+(jBar.wY*jL);
					emp.mZ+=jBar.pMz;
					emp.mZ+=jBar.pPy*jD*(-1*Math.sen(betaXZ));
					emp.mZ+=jBar.wY*jL*jL/2*(-1*Math.sen(betaXZ));
					emp.mX+=jBar.pPy*jD*(1*Math.cos(betaXZ));
					emp.mX+=jBar.wY*jL*jL/2*(1*Math.cos(betaXZ));
					emp.fX+=jBar.pPx+(jBar.wX*jL);
					emp.mY+=jBar.pPx*jD*(-1*Math.sen(betaYZ));
					emp.mY+=jBar.wX*jL*jL/2*(-1*Math.sen(betaYZ));
					emp.mZ+=jBar.pPx*jD*(1*Math.cos(betaYZ));
					emp.mZ+=jBar.wX*jL*jL/2*(1*Math.cos(betaYZ));
				}

				//Se guardan las fuerzas de la barra
				jBar.fX1 = jBar.startNode.fX;
				jBar.fY1 = jBar.startNode.fY;
				jBar.fZ1 = jBar.startNode.fZ;
				jBar.mX1 = jBar.startNode.mX;
				jBar.mY1 = jBar.startNode.mY;
				jBar.mZ1 = jBar.startNode.mZ;

				jBar.fX2 = jBar.endNode.fX;
				jBar.fY2 = jBar.endNode.fY;
				jBar.fZ2 = jBar.endNode.fZ;
				jBar.mX2 = jBar.endNode.mX;
				jBar.mY2 = jBar.endNode.mY;
				jBar.mZ2 = jBar.endNode.mZ;

			}

			//2. Si se conectan más de una barra a los nodos
			else {
				showErrorMessage($('#m3d-res-table-container'), 'Fuera del alcance del programa.');
				return false;
			}
		}
		//II. Si 1 nodo es apoyo
		else {
			showErrorMessage($('#m3d-res-table-container'), 'Fuera del alcance del programa.');
			return false;
		}
		cont++;
	});

	return true;
}

/**
 * Obtiene las coordenadas de cada nodo de la estructura.
 */
function getNodesCoordinates() {
	var inputX = $('#nodes-table-container table input.x');
	var inputY = $('#nodes-table-container table input.y');
	var inputZ = $('#nodes-table-container table input.z');
	var inputSize = inputX.length;

	//Inicializa los arreglos de coordenadas
	nodeX = [];
	nodeY = [];
	nodeZ = [];

	for (var i = 0; i < inputSize; i++) {
		x = parseFloat($(inputX[i]).val());
		nodeX.push(x);
		y = parseFloat($(inputY[i]).val());
		nodeY.push(y);

		z = null;
		if (calculationType === '2' || calculationType === '5') {
			z = parseFloat($(inputZ[i]).val());
			nodeZ.push(z);
		}

		jNodes.push(new Node(x, y, z));
	}
}

/**
 * Obtiene los nodos que serán apoyos.
 */
function getSupports() {
	supports = [];
	restrictionsLx = [];
	restrictionsLy = [];
	restrictionsLz = [];
	restrictionsRx = [];
	restrictionsRy = [];
	restrictionsRz = [];

	var selectS = $('#supports-table-container table select.support');
	var inputLx = $('#supports-table-container table input.rlx');
	var inputLy = $('#supports-table-container table input.rly');
	var inputLz = $('#supports-table-container table input.rlz');
	var inputRx = $('#supports-table-container table input.rrx');
	var inputRy = $('#supports-table-container table input.rry');
	var inputRz = $('#supports-table-container table input.rrz');

	var size = selectS.length;
	for (i = 0; i < size; i++) {
		support = parseInt($(selectS[i]).val());
		supports.push(support);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].isSupport = true;
	}

	size = inputLx.length;
	for (i = 0; i < size; i++) {
		rx = ($(inputLx[i]).is(':checked')) ? 1 : 0;
		restrictionsLx.push(rx);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].lX = Boolean(rx);
	}

	size = inputLy.length;
	for (i = 0; i < size; i++) {
		ry = ($(inputLy[i]).is(':checked')) ? 1 : 0;
		restrictionsLy.push(ry);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].lY = Boolean(ry);
	}

	size = inputLz.length;
	for (i = 0; i < size; i++) {
		rz = ($(inputLz[i]).is(':checked')) ? 1 : 0;
		restrictionsLz.push(rz);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].lZ = Boolean(rz);
	}

	size = inputRx.length;
	for (i = 0; i < size; i++) {
		rx = ($(inputRx[i]).is(':checked')) ? 1 : 0;
		restrictionsRx.push(rx);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].rX = Boolean(rx);
	}

	size = inputRy.length;
	for (i = 0; i < size; i++) {
		ry = ($(inputRy[i]).is(':checked')) ? 1 : 0;
		restrictionsRy.push(ry);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].rY = Boolean(ry);
	}

	size = inputRz.length;
	for (i = 0; i < size; i++) {
		rz = ($(inputRz[i]).is(':checked')) ? 1 : 0;
		restrictionsRz.push(rz);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[indexNode].rZ = Boolean(rz);
	}

}

function getAreas() {
	var inputA = $('#bars-table-container table input.area');
	var size = inputA.length;
	areas = [];
	for (var i = 0; i < size; i++) {
		ar = parseFloat($(inputA[i]).val());
		areas.push(ar);
		jBars[i].area = ar;
	}
}

function getElasticity() {
	var inputE = $('#bars-table-container table input.elasticity');
	var size = inputE.length;
	elasticity = [];
	for (var i = 0; i < size; i++) {
		e = parseFloat($(inputE[i]).val());
		elasticity.push(e);
		jBars[i].elasticity = e;
	}
}

function getI() {
	var inputI = $('#bars-table-container table input.i');
	var size = inputI.length;
	barsI = [];
	for (var j = 0; j < size; j++) {
		i = parseFloat($(inputI[j]).val());
		barsI.push(i);
		jBars[j].I = i;
	}
}

function getG() {
	var inputG = $('#bars-table-container table input.g');
	var size = inputG.length;
	barsG = [];
	for (var i = 0; i < size; i++) {
		g = parseFloat($(inputG[i]).val());
		barsG.push(g);
		jBars[i].G = g;
	}
}

function getJ() {
	var inputJ = $('#bars-table-container table input.j');
	var size = inputJ.length;
	barsJ = [];
	for (var i = 0; i < size; i++) {
		j = parseFloat($(inputJ[i]).val());
		barsJ.push(j);
		jBars[i].J = j;
	}
}

function getC() {
	var inputC = $('#bars-table-container table input.c');
	var size = inputC.length;
	barsC = [];
	for (var i = 0; i < size; i++) {
		c = parseFloat($(inputC[i]).val());
		barsC.push(c);
		jBars[i].C = c;
	}
}

function getBarsDefects() {
	barsD = [];
	dc = [];
	var selectD = $('#bars-defects-table-container table select');
	var inputD = $('#bars-defects-table-container table input');
	var size = selectD.length;
	//Obtiene las barras y sus defectos constructivos
	for (var i = 0; i < size; i++) {
		bar = parseInt($(selectD[i]).val());
		barsD.push(bar);
		defect = parseFloat($(inputD[i]).val());
		dc.push(defect);
	}
}

/**
 * Obtiene los apoyos que tendrán asentamientos.
 */
function getSettlements() {
	settlements = [];
	dsX = [];
	dsY = [];
	dsZ = [];

	var selectS = $('#settlements-table-container table select');
	var inputX = $('#settlements-table-container table input.sx');
	var inputY = $('#settlements-table-container table input.sy');
	var inputZ = $('#settlements-table-container table input.sz');
	var size = selectS.length;
	var calculationType = $calculationType.val();

	for (var i = 0; i < size; i++) {
		settlement = parseInt($(selectS[i]).val());
		settlements.push(settlement);

		sx = $(inputX[i]).val();
		dsX.push(sx);

		sy = $(inputY[i]).val();
		dsY.push(sy);

		if (calculationType === '2') {
			sz = $(inputZ[i]).val();
			dsZ.push(sz);
		}
	}
}

function calculateL() {

	var nodesIni = $('#bars-table-container table select.ini');
	var nodesFin = $('#bars-table-container table select.fin');
	var barsSize = nodesIni.length;

	barsIni = [];
	barsFin = [];
	L = [];
	LD = [];

	for (var i = 0; i < barsSize; i++) {

		nodeIni = parseInt($(nodesIni[i]).val());
		barsIni.push(nodeIni);

		nodeFin = parseInt($(nodesFin[i]).val());
		barsFin.push(nodeFin);

		posIni = nodeIni - 1;
		posFin = nodeFin - 1;

		jBars[i].startNode = jNodes[posIni];
		jBars[i].startNode.barCount++;

		jBars[i].endNode = jNodes[posFin];
		jBars[i].endNode.barCount++;

		difX = parseFloat(nodeX[posFin]) - parseFloat(nodeX[posIni]);
		deltaX[i] = difX;
		difX2 = Math.pow(difX, 2);
		difY = parseFloat(nodeY[posFin]) - parseFloat(nodeY[posIni]);
		deltaY[i] = difY;
		difY2 = Math.pow(difY, 2);
		sum = difX2 + difY2;

		if (calculationType === '2' || calculationType === '5') {
			difZ = parseFloat(nodeZ[posFin]) - parseFloat(nodeZ[posIni]);
			difZ2 = Math.pow(difZ, 2);
			sum += difZ2;
		}

		//Se obtiene la raíz cuadrada
		sqrt = Math.sqrt(sum);
		//Se multiplica por 100 para convertir a cm
		length = sqrt * 100;

		//Defectos constructivos
		j = i + 1;
    	index = barsD.indexOf(j);
    	//Si la barra tiene defecto constructivo
    	lengthD = (getForceType() === 2 && index > -1) ? length + dc[index] : length;

		L.push(length);
		LD.push(lengthD);
	}
}

function calculateA() {
	var calculationType = $calculationType.val();
	var coordinates = (calculationType === '1') ? 2 : 3;
	//El número de filas es igual al número de barras
	var rows = parseInt($numberOfBars.val());
	//El número de columnas es igual al número de nodos por la cantidad de coordenadas (x, y, x)
	var cols = parseInt($numberOfNodes.val()) * coordinates;
	A = [];

	//Para cada barra
	for (var i = 0; i < rows; i++) {

		//Obtiene el nodo inicial de la barra
		nodeIni = barsIni[i];
		//Obtiene el nodo final de la barra
		nodeFin = barsFin[i];

		//Obtiene las posiciones de las coordenadas de los nodos de la barra
		posIni = nodeIni - 1;
		posFin = nodeFin - 1;

		//Obtiene la posición del nodo inicial en el arreglo de apoyos
		indexNodeIni = supports.indexOf(nodeIni);
		//Obtiene la posición del nodo final en el arreglo de apoyos
		indexNodeFin = supports.indexOf(nodeFin);

		//Obtiene los valores para las restricciones

		//El nodo inicial es un apoyo
		if (indexNodeIni != -1) {
			rxNodeIni = restrictionsLx[indexNodeIni];
			ryNodeIni = restrictionsLy[indexNodeIni];

			if (calculationType === '2')
				rzNodeIni = restrictionsLz[indexNodeIni];
		}
		else {	//No es un apoyo
			rxNodeIni = ryNodeIni = rzNodeIni = 0;
		}

		//El nodo final es un apoyo
		if (indexNodeFin != -1) {
			rxNodeFin = restrictionsLx[indexNodeFin];
			ryNodeFin = restrictionsLy[indexNodeFin];

			if (calculationType === '2')
				rzNodeFin = restrictionsLz[indexNodeFin];
		}
		else {	//No es un apoyo
			rxNodeFin = ryNodeFin = rzNodeFin = 0;
		}

		Ai = [];

		//Se forma la fila con 0
		for (var j = 0; j < cols; j++)
			Ai.push(0);

		//Calcula los cosenos directores del nodo inicial
		uxIni = (rxNodeIni === 1) ? 0 : ((nodeX[posFin] - nodeX[posIni]) * 100) / L[i];
		uyIni = (ryNodeIni === 1) ? 0 : ((nodeY[posFin] - nodeY[posIni]) * 100) / L[i];
		//Multiplica por -1 los cosenos directores del nodo inicial
		uxIni = (uxIni === 0) ? 0 : uxIni * -1;
		uyIni = (uyIni === 0) ? 0 : uyIni * -1;
		//Calcula los cosenos directores del nodo final
		uxFin = (rxNodeFin === 1) ? 0 : ((nodeX[posFin] - nodeX[posIni]) * 100) / L[i];
		uyFin = (ryNodeFin === 1) ? 0 : ((nodeY[posFin] - nodeY[posIni]) * 100) / L[i];

		//Asigna los valores en la fila
		Ai[posIni * coordinates] = uxIni;
		Ai[(posIni * coordinates) + 1] = uyIni;
		Ai[posFin * coordinates] = uxFin;
		Ai[(posFin * coordinates) + 1] = uyFin;

		//Si hay coordenada z
		if (calculationType === '2') {
			uzIni = (rzNodeIni === 1) ? 0 : ((nodeZ[posFin] - nodeZ[posIni]) * 100) / L[i];
			uzIni = (uzIni === 0) ? 0 : uzIni * -1;
			uzFin = (rzNodeFin === 1) ? 0 : ((nodeZ[posFin] - nodeZ[posIni]) * 100) / L[i];

			Ai[(posIni * coordinates) + 2] = uzIni;
			Ai[(posFin * coordinates) + 2] = uzFIn;
		}

		//Inserta la fila en la matriz A
		A.push(Ai);
	}

	//Remueve las columnas que se componen de sólo ceros
	for (var i = 0; i < cols; i++) {			//Columnas
		isZero = true;
		for (var j = 0; j < rows; j++) {		//Filas
			if (A[j][i] != 0) {
				isZero = false;
				break;
			}
		}
		//Si la columna se compone de sólo ceros
		if (isZero) {
			for (var j = 0; j < rows; j++) {		//Filas
				A[j].splice(i, 1);
			}
			i--;
			cols--;
		}
	}

	//Obtiene A Transpuesta
	At = math.transpose(A);
}

function calculateAFromAi() {

	//var coordinates = 3;
	var coordinates = (calculationType === '5') ? 6 : 3;
	
	var bars = parseInt($numberOfBars.val());
	
	//El número de filas es igual al número de barras por cuatro
	//var rows = bars * 4;

	var rowsByBar = (calculationType === '5') ? 8 : 4;
	var rows = bars * rowsByBar;

	//El número de columnas es igual al número de nodos por la cantidad de coordenadas (x, y, x)
	var cols = parseInt($numberOfNodes.val()) * coordinates;
	A = [];

	//Forma la matriz total de continuidad con ceros
	for (var i = 0; i < rows; i++) {
		Ai = [];
		for (var j = 0; j < cols; j++) {
			Ai.push(0);
		}
		A.push(Ai);
	}

	//Sustituye valores en A
	for (var i = 0; i < bars; i++) {

		//Obtiene el nodo inicial de la barra
		nodeIni = barsIni[i];
		//Obtiene el nodo final de la barra
		nodeFin = barsFin[i];

		//Obtiene las posiciones de las coordenadas de los nodos de la barra
		posIni = nodeIni - 1;
		posFin = nodeFin - 1;

		//Obtiene la posición del nodo inicial en el arreglo de apoyos
		indexNodeIni = supports.indexOf(nodeIni);
		//Obtiene la posición del nodo final en el arreglo de apoyos
		indexNodeFin = supports.indexOf(nodeFin);

		//Obtiene los valores para las restricciones

		//El nodo inicial es un apoyo, puede tener restricción en x,y,z
		if (indexNodeIni != -1) {
			//Retícula
			if (calculationType === '3') {
				rxNodeIni = restrictionsRx[indexNodeIni];
				ryNodeIni = restrictionsRy[indexNodeIni];
				rzNodeIni = restrictionsLz[indexNodeIni];
			}
			//Marco plano
			else if (calculationType === '4') {
				rxNodeIni = restrictionsLx[indexNodeIni];
				ryNodeIni = restrictionsLy[indexNodeIni];
				rzNodeIni = restrictionsRz[indexNodeIni];
			}
			//Marco 3D
			else if (calculationType === '5') {
				lrxNodeIni = restrictionsLx[indexNodeIni];
				lryNodeIni = restrictionsLy[indexNodeIni];
				lrzNodeIni = restrictionsLz[indexNodeIni];
				rrxNodeIni = restrictionsRx[indexNodeIni];
				rryNodeIni = restrictionsRy[indexNodeIni];
				rrzNodeIni = restrictionsRz[indexNodeIni];
			}
		}
		else {	//No es un apoyo
			if (calculationType === '5')
				lrxNodeIni = lryNodeIni = lrzNodeIni = rrxNodeIni = rryNodeIni = rrzNodeIni = 0;
			else
				rxNodeIni = ryNodeIni = rzNodeIni = 0;
		}

		//El nodo final es un apoyo
		if (indexNodeFin != -1) {
			//Retícula
			if (calculationType === '3') {
				rxNodeFin = restrictionsRx[indexNodeFin];
				ryNodeFin = restrictionsRy[indexNodeFin];
				rzNodeFin = restrictionsLz[indexNodeFin];
			}
			//Marco plano
			else if (calculationType === '4') {
				rxNodeFin = restrictionsLx[indexNodeFin];
				ryNodeFin = restrictionsLy[indexNodeFin];
				rzNodeFin = restrictionsRz[indexNodeFin];
			}
			//Marco 3D
			else if (calculationType === '5') {
				lrxNodeFin = restrictionsLx[indexNodeFin];
				lryNodeFin = restrictionsLy[indexNodeFin];
				lrzNodeFin = restrictionsLz[indexNodeFin];
				rrxNodeFin = restrictionsRx[indexNodeFin];
				rryNodeFin = restrictionsRy[indexNodeFin];
				rrzNodeFin = restrictionsRz[indexNodeFin];
			}
		}
		else {	//No es un apoyo
			
			if (calculationType === '5')
				lrxNodeFin = lryNodeFin = lrzNodeFin = rrxNodeFin = rryNodeFin = rrzNodeFin = 0;
			else
				rxNodeFin = ryNodeFin = rzNodeFin = 0;
		}

		//El nodo inicial no tiene alguna restricción
		if ( (calculationType === '5' && (lrxNodeIni === 0 || lryNodeIni === 0 || lrzNodeIni === 0 || rrxNodeIni === 0 || rryNodeIni === 0 || rrzNodeIni === 0)) 
			|| ((calculationType != '5' && (rxNodeIni === 0 || ryNodeIni === 0 || rzNodeIni === 0))) ) {
			rowIniA = i * rowsByBar;			//i es el índice de la barra y rowsByBar el númeor de filas por barra
			colIniA = posIni * coordinates;		//posIni es el índice del nodo y coordinates las coordenadas
			rowIniAi = 0;				//En la matriz A de la barra siempre se toma desde la fila 0
			colIniAi = 0;				//Para el nodo inicial se toma la primera parte de la matriz A de la barra
			copyMatrixA(rowIniA, colIniA, rowIniAi, colIniAi, a[i], rowsByBar, coordinates);
		}

		//El nodo final no tiene alguna restricción
		//if (rxNodeFin === 0 || ryNodeFin === 0 || rzNodeFin === 0) {
		if ( (calculationType === '5' && (lrxNodeFin === 0 || lryNodeFin === 0 || lrzNodeFin === 0 || rrxNodeFin === 0 || rryNodeFin === 0 || rrzNodeFin === 0)) 
			|| ((calculationType != '5' && (rxNodeFin === 0 || ryNodeFin === 0 || rzNodeFin === 0))) ) {
			rowIniA = i * rowsByBar;			//i es el índice de la barra y rowsByBar el númeor de filas por barra
			colIniA = posFin * coordinates;		//posIni es el índice del nodo y coordinates las coordenadas
			rowIniAi = 0;				//En la matriz A de la barra siempre se toma desde la fila 0
			colIniAi = coordinates;				//Para el nodo final se toma la segunda parte de la matriz A de la barra
			copyMatrixA(rowIniA, colIniA, rowIniAi, colIniAi, a[i], rowsByBar, coordinates);
		}
	}

	//Remueve las columnas que se componen de sólo ceros
	for (var i = 0; i < cols; i++) {			//Columnas
		isZero = true;
		for (var j = 0; j < rows; j++) {		//Filas
			if (A[j][i] != 0) {
				isZero = false;
				break;
			}
		}
		//Si la columna se compone de sólo ceros
		if (isZero) {
			for (var j = 0; j < rows; j++) {		//Filas
				A[j].splice(i, 1);
			}
			i--;
			cols--;
		}
	}

	//Obtiene A Transpuesta
	At = math.transpose(A);
}

function copyMatrixA(rowIniA, colIniA, rowIniAi, colIniAi, Ai, rows, cols) {

	for (var i = 0; i < rows; i++) {		//4 filas por barra
		for (var j = 0; j < cols; j++) {	//3 dx por nodo
			rowA = rowIniA + i;
			colA = colIniA + j;
			rowAi = rowIniAi + i;
			colAi = colIniAi + j;
			A[rowA][colA] = Ai[rowAi][colAi];
		}
	}
}

function calculateAByBar() {
	var size = $numberOfBars.val();
	a = [];
	//Para cada barra
	for (var i = 0; i < size; i++) {
		//Se obtiene el valor de beta en grados
		if (deltaY[i] > 0) {
			if (deltaX[i] > 0)
				beta = radiansToDegrees(Math.atan(deltaY[i] / deltaX[i]));
			else if (deltaX[i] == 0)
				beta = 90;
			else if (deltaX[i] < 0)
				beta = 180 + radiansToDegrees(Math.atan(deltaY[i] / deltaX[i]));
		}

		else if (deltaY[i] < 0) {
			if (deltaX[i] > 0)
				beta = 360 + radiansToDegrees(Math.atan(deltaY[i] / deltaX[i]));
			else if (deltaX[i] == 0)
				beta = 270;
			else if (deltaX[i] < 0)
				beta = 180 + radiansToDegrees(Math.atan(deltaY[i] / deltaX[i]));
		}

		else if (deltaY[i] == 0) {
			if (deltaX[i] > 0)
				beta = 0;
			else if (deltaX[i] < 0)
				beta = 180;
		}
		//Forma una matriz de continuidad con ceros para la barra
		ai = [];
		for (var j = 0; j < 4; j++)
			ai.push([0, 0, 0, 0, 0, 0]);

		ai[0][0] = (Math.sin(degreesToRadians(beta)) / L[i] == 0) ? Math.sin(degreesToRadians(beta)) / L[i] : -(Math.sin(degreesToRadians(beta)) / L[i]);
		ai[0][0] = round(ai[0][0] * 100, 3);
		ai[0][1] = Math.cos(degreesToRadians(beta)) / L[i];
		ai[0][1] = round(ai[0][1] * 100, 3);
		ai[0][2] = 1;
		ai[0][3] = Math.sin(degreesToRadians(beta)) / L[i];
		ai[0][3] = round(ai[0][3] * 100, 3);
		ai[0][4] = (Math.cos(degreesToRadians(beta)) / L[i] == 0) ? Math.cos(degreesToRadians(beta)) / L[i] : -(Math.cos(degreesToRadians(beta)) / L[i]);
		ai[0][4] = round(ai[0][4] * 100, 3);
		ai[0][5] = 0;

		ai[1][0] = 2 * ai[0][0];
		ai[1][1] = 2 * ai[0][1];
		ai[1][2] = 1;
		ai[1][3] = 2 * ai[0][3];
		ai[1][4] = 2 * ai[0][4];
		ai[1][5] = 1;

		ai[2][0] = ai[0][0];
		ai[2][1] = ai[0][1];
		ai[2][2] = 0;
		ai[2][3] = ai[0][3];
		ai[2][4] = ai[0][4];
		ai[2][5] = 1;

		ai[3][0] = (Math.cos(degreesToRadians(beta)) == 0) ? Math.cos(degreesToRadians(beta)) : - Math.cos(degreesToRadians(beta));
		ai[3][0] = round(ai[3][0], 3);
		ai[3][1] = (Math.sin(degreesToRadians(beta)) == 0) ? Math.sin(degreesToRadians(beta)) : - Math.sin(degreesToRadians(beta));
		ai[3][1] = round(ai[3][1], 3);
		ai[3][2] = 0;
		ai[3][3] = round(Math.cos(degreesToRadians(beta)), 3);
		ai[3][4] = round(Math.sin(degreesToRadians(beta)), 3);
		ai[3][5] = 0;

		a.push(ai);
	}
}

function calculatekd() {
	var rows = LD.length;
	var cols = LD.length;
	kd = [];

	for (var i = 0; i < rows; i++) {
		ki = [];
		for (var j = 0; j < cols; j++) {
			val = (i === j) ? (elasticity[i] * areas[i]) / LD[i]  : 0;
			ki.push(val);
		}
		kd.push(ki);
	}
}

function calculatekdByBar() {
	var size = $numberOfBars.val();
	//Arreglo de matrices
	kArray = [];
	//Para cada barra
	for (var i = 0; i < size; i++) {
		ki = [];
		//Calcula la diagonal
		switch (calculationType) {
			//Retícula
			case '3':
				for (var j = 0; j < 4; j++) 
					ki.push([0, 0, 0, 0]);
				ki[0][0] = ( (2 * barsI[i]) / LD[i] ) * 100;
				ki[1][1] = ( (2 * barsI[i]) / LD[i] ) * 100;
				ki[2][2] = ( (2 * barsI[i]) / LD[i] ) * 100;
				ki[3][3] = ( (barsG[i] * barsJ[i]) / LD[i] ) * 100;
				ki[0][0] = round(ki[0][0], 3);
				ki[1][1] = round(ki[1][1], 3);
				ki[2][2] = round(ki[2][2], 3);
				ki[3][3] = round(ki[3][3], 3);
			break;
			//Marco plano
			case '4':
				for (var j = 0; j < 4; j++) 
					ki.push([0, 0, 0, 0]);
				ki[0][0] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[1][1] = ( ((2 * elasticity[i] * barsI[i]) * (1 - (2 * barsC[i]))) / (LD[i] * (1 + (4 * barsC[i]))) ) * 100;
				ki[2][2] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[3][3] = ( (elasticity[i] * areas[i]) / LD[i] ) * 100;
				ki[0][0] = round(ki[0][0], 3);
				ki[1][1] = round(ki[1][1], 3);
				ki[2][2] = round(ki[2][2], 3);
				ki[3][3] = round(ki[3][3], 3);
			break;
			//Marco 3D
			case '5':
				for (var j = 0; j < 8; j++) 
					ki.push([0, 0, 0, 0, 0, 0, 0, 0]);
				ki[0][0] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[1][1] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[2][2] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[3][3] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[4][4] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[5][5] = ( (2 * elasticity[i] * barsI[i]) / LD[i] ) * 100;
				ki[6][6] = ( (areas[i] * elasticity[i]) / LD[i] ) * 100;
				ki[7][7] = ( (barsG[i] * barsJ[i]) / LD[i] ) * 100;
				ki[0][0] = round(ki[0][0], 3);
				ki[1][1] = round(ki[1][1], 3);
				ki[2][2] = round(ki[2][2], 3);
				ki[3][3] = round(ki[3][3], 3);
				ki[4][4] = round(ki[4][4], 3);
				ki[5][5] = round(ki[5][5], 3);
				ki[6][6] = round(ki[6][6], 3);
				ki[7][7] = round(ki[7][7], 3);
			break;
		}
		kArray.push(ki);
	}
}

function calculatekdFromki() {
	
	var bars = parseInt($numberOfBars.val());
	var sizeByBar = (calculationType === '5') ? 8 : 4;
	var size = bars * sizeByBar;
	
	kd = [];
	//Forma la matriz cuadrada con ceros
	for (var i = 0; i < size; i++) {
		ki = [];
		for (var j = 0; j < size; j++)
			ki.push(0);
		kd.push(ki);
	}
	
	//Calcula la diagonal
	var pos = 0;
	for (i = 0; i < bars; i++) {
		for (var j = 0; j < sizeByBar; j++) {
			for (var l = 0; l < sizeByBar; l++) {
				if (j === l) {
					kd[pos][pos] = kArray[i][j][l];
					pos++;
				}
			}
		}
	}
}

function calculateK() {
	mAux = math.multiply(At, kd);
	K = math.multiply(mAux, A);
	roundMatrix(K);
	Kt = math.transpose(K);
}

function getBarPuntualForces() {
	var selectF = $('#bars-punctual-forces-table-container table select');
	var inputPPx = $('#bars-punctual-forces-table-container table input.ppx');
	var inputPPy = $('#bars-punctual-forces-table-container table input.ppy');
	var inputPPz = $('#bars-punctual-forces-table-container table input.ppz');
	var inputPMx = $('#bars-punctual-forces-table-container table input.pmx');
	var inputPMy = $('#bars-punctual-forces-table-container table input.pmy');
	var inputPMz = $('#bars-punctual-forces-table-container table input.pmz');

	//Obtiene los nodos que tienen fuerzas aplicadas
	var size = selectF.length;

	size = inputPPx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputPPx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].pPx = wx;
	}

	size = inputPPy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputPPy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].pPy = wy;
	}

	size = inputPPz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputPPz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].pPz = wz;
	}

	size = inputPMx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputPMx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].pMx = wx;
	}

	size = inputPMy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputPMy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].pMy = wy;
	}

	size = inputPMz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputPMz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].pMz = wz;
	}

	var inputDPx = $('#bars-punctual-forces-table-container table input.dpx');
	var inputDPy = $('#bars-punctual-forces-table-container table input.dpy');
	var inputDPz = $('#bars-punctual-forces-table-container table input.dpz');
	var inputDMx = $('#bars-punctual-forces-table-container table input.dmx');
	var inputDMy = $('#bars-punctual-forces-table-container table input.dmy');
	var inputDMz = $('#bars-punctual-forces-table-container table input.dmz');

	//Obtiene los nodos que tienen fuerzas aplicadas
	var size = selectF.length;

	size = inputDPx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputDPx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].dPx = wx;
	}

	size = inputDPy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputDPy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].dPy = wy;
	}

	size = inputDPz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputDPz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].dPz = wz;
	}

	size = inputDMx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputDMx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].dMx = wx;
	}

	size = inputDMy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputDMy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].dMy = wy;
	}

	size = inputDMz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputDMz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].dMz = wz;
	}
}

function getBarDistributedForces() {
	var selectF = $('#bars-distributed-forces-table-container table select');
	var inputWx = $('#bars-distributed-forces-table-container table input.wx');
	var inputWy = $('#bars-distributed-forces-table-container table input.wy');
	var inputWz = $('#bars-distributed-forces-table-container table input.wz');

	//Obtiene los nodos que tienen fuerzas aplicadas
	var size = selectF.length;

	size = inputWx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputWx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].wX = wx;
	}

	size = inputWy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputWy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].wY = wy;
	}

	size = inputWz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputWz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[indexBar].wZ = wz;
	}
}

function getNodesForces() {

	var nodesForces = [];
	var fX = [];
	var fY = [];
	var fZ = [];
	var mX = [];
	var mY = [];
	var mZ = [];

	var selectF = $('#nodes-forces-table-container table select');
	var inputFx = $('#nodes-forces-table-container table input.fx');
	var inputFy = $('#nodes-forces-table-container table input.fy');
	var inputFz = $('#nodes-forces-table-container table input.fz');
	var inputMx = $('#nodes-forces-table-container table input.mx');
	var inputMy = $('#nodes-forces-table-container table input.my');
	var inputMz = $('#nodes-forces-table-container table input.mz');

	//Obtiene los nodos que tienen fuerzas aplicadas
	var size = selectF.length;
	for (var i = 0; i < size; i++) {
		nodeF = parseInt($(selectF[i]).val());
		nodesForces.push(nodeF);
	}

	size = inputFx.length;
	for (i = 0; i < size; i++) {
		fx = parseFloat($(inputFx[i]).val());
		fX.push(fx);
		indexNode = parseInt($(selectF[i]).val()) - 1;
		jNodes[indexNode].fX = fx;
	}

	size = inputFy.length;
	for (i = 0; i < size; i++) {
		fy = parseFloat($(inputFy[i]).val());
		fY.push(fy);
		indexNode = parseInt($(selectF[i]).val()) - 1;
		jNodes[indexNode].fY = fy;
	}

	size = inputFz.length;
	for (i = 0; i < size; i++) {
		fz = parseFloat($(inputFz[i]).val());
		fZ.push(fz);
		indexNode = parseInt($(selectF[i]).val()) - 1;
		jNodes[indexNode].fZ = fz;
	}

	size = inputMx.length;
	for (i = 0; i < size; i++) {
		mx = parseFloat($(inputMx[i]).val());
		mX.push(mx);
		indexNode = parseInt($(selectF[i]).val()) - 1;
		jNodes[indexNode].mX = mx;
	}

	size = inputMy.length;
	for (i = 0; i < size; i++) {
		my = parseFloat($(inputMy[i]).val());
		mY.push(my);
		indexNode = parseInt($(selectF[i]).val()) - 1;
		jNodes[indexNode].mY = my;
	}

	size = inputMz.length;
	for (i = 0; i < size; i++) {
		mz = parseFloat($(inputMz[i]).val());
		mZ.push(mz);
		indexNode = parseInt($(selectF[i]).val()) - 1;
		jNodes[indexNode].mZ = mz;
	}

	F = [];
	//Se agregó 10/01/2018
	size = parseInt($numberOfNodes.val());
	for (i = 1; i <= size; i++) {

		index = supports.indexOf(i);
		fx = [];
		fy = [];
		fz = [];
		mx = [];
		my = [];
		mz = [];

		//Si el nodo no es un apoyo
		if (index === -1) {

			indexF = nodesForces.indexOf(i);
			//Si se aplica fuerza en este nodo
			if (indexF != -1) {
				switch (calculationType) {
					case '1':
						valfx = (fX[indexF] === '') ? 0 : fX[indexF];
						valfy = (fY[indexF] === '') ? 0 : fY[indexF];
						fx = [valfx];
						fy = [valfy];
						F.push(fx);
						F.push(fy);
					break;
					case '2':
						valfx = (fX[indexF] === '') ? 0 : fX[indexF];
						valfy = (fY[indexF] === '') ? 0 : fY[indexF];
						valfz = (fZ[indexF] === '') ? 0 : fZ[indexF];
						fx = [valfx];
						fy = [valfy];
						fz = [valfz];
						F.push(fx);
						F.push(fy);
						F.push(fz);
					break;
					//Retícula
					case '3':
						valmx = (mX[indexF] === '') ? 0 : mX[indexF];
						valmy = (mY[indexF] === '') ? 0 : mY[indexF];
						valfz = (fZ[indexF] === '') ? 0 : fZ[indexF];
						mx = [valmx];
						my = [valmy];
						fz = [valfz];
						F.push(mx);
						F.push(my);
						F.push(fz);
					break;
					//Marco plano
					case '4':
						valfx = (fX[indexF] === '') ? 0 : fX[indexF];
						valfy = (fY[indexF] === '') ? 0 : fY[indexF];
						valmz = (mZ[indexF] === '') ? 0 : mZ[indexF];
						fx = [valfx];
						fy = [valfy];
						mz = [valmz];
						F.push(fx);
						F.push(fy);
						F.push(mz);
					break;
					case '5':
						valfx = (fX[indexF] === '') ? 0 : fX[indexF];
						valfy = (fY[indexF] === '') ? 0 : fY[indexF];
						valfz = (fZ[indexF] === '') ? 0 : fZ[indexF];
						valmx = (mX[indexF] === '') ? 0 : mX[indexF];
						valmy = (mY[indexF] === '') ? 0 : mY[indexF];
						valmz = (mZ[indexF] === '') ? 0 : mZ[indexF];
						fx = [valfx];
						fy = [valfy];
						fz = [valfz];
						mx = [valmx];
						my = [valmy];
						mz = [valmz];
						F.push(fx);
						F.push(fy);
						F.push(fz);
						F.push(mx);
						F.push(my);
						F.push(mz);
					break;
				}
			}
			//No se aplica fuerza
			else {
				force = [0];
				switch (calculationType) {
					case '1':
						F.push(force);
						F.push(force);
					break;
					case '2':
					case '3':
					case '4':
						F.push(force);
						F.push(force);
						F.push(force);
					break;
					case '5':
						F.push(force);
						F.push(force);
						F.push(force);
						F.push(force);
						F.push(force);
						F.push(force);
					break;
				}
			}
		}
	}
}

function calculateF() {
	F = math.multiply(negative(At), P1);
}

function calculateF2() {
	var bars = parseInt($numberOfBars.val());

	F2 = [];
	for (var i = 0; i < bars; i++) {
		posIniP = (calculationType === '5') ? i * 8 : i * 4;
		//Retícula
		if (calculationType === '3') {
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = [P[posIniP][0] + P[posIniP + 1][0]];
			F2.push(f2);
			f2 = [-(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i]];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = [P[posIniP + 1][0] + P[posIniP + 2][0]];
			F2.push(f2);
			f2 = [(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i]];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);
		}
		//Marco plano
		else if (calculationType === '4') {
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = (P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);
			f2 = [P[posIniP][0] + P[posIniP + 1][0]];
			F2.push(f2);
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = -(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);
			f2 = [P[posIniP + 1][0] + P[posIniP + 2][0]];
			F2.push(f2);
		}
		//Marco 3D
		else if (calculationType === '5') {
			
			f2 = [P[posIniP + 6][0]];
			F2.push(f2);

			f2 = (P[posIniP + 3][0] + (2 * P[posIniP + 4][0]) + P[posIniP + 5][0]) / L[i];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = (P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = [P[posIniP + 7][0]];
			F2.push(f2);

			f2 = P[posIniP][0] + P[posIniP + 1][0];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = P[posIniP + 3][0] + P[posIniP + 4][0];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = [P[posIniP + 6][0]];
			F2.push(f2);

			f2 = -( (P[posIniP + 3][0] + (2 * P[posIniP + 4][0]) + P[posIniP + 5][0]) / L[i] );
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = -( (P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i] );
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = [P[posIniP + 7][0]];
			F2.push(f2);

			f2 = P[posIniP + 1][0] + P[posIniP + 2][0];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

			f2 = P[posIniP + 4][0] + P[posIniP + 5][0];
			f2 = [round(f2 * 100, 3)];
			F2.push(f2);

		}
	}
}

function calculated() {
	d = math.multiply(math.inv(K), F);
}

/**
 * Principio de Continuidad
 */
function calculatee() {
	e = math.multiply(A, d);
}

/**
 * Ley de Hooke
 */
function calculateP() {
	P = math.multiply(kd, e);
}

function calculateP1ForBarsDefects() {
	P1 = [];
	size = $numberOfBars.val();
	for (i = 1; i <= size; i++) {
		index = barsD.indexOf(i);
		j = i - 1;
		val = (index === -1 ) ? 0 : ((areas[j] * elasticity[j]) / LD[j]) * dc[index] * -1;
		p1 = [];
		p1.push(val);
		P1.push(p1);
	}
}

function calculateP1ForThermalEffects() {

	P1 = [];
	var size = areas.length;
	var tg = parseFloat($('#temperature-gradient').val());
	var te = parseFloat($('#thermal-expansion').val());
	for (var i = 0; i < size; i++) {
		val = areas[i] * elasticity[i] * tg * te * -1;
		p1 = [];
		p1.push(val);
		P1.push(p1);
	}
}

/**
* Calcula P1 para asentamientos estructurales
*/
function calculateP1ForSettlements() {

	//Forma el vector columna e con ceros
	var numberOfBars = parseInt($numberOfBars.val());
	e = [];
	for (var i = 0; i < numberOfBars; i++) {
		ei = [0];
		e.push(ei);
	}

	var size = settlements.length;
	var calculationType = $calculationType.val();

	//Para cada asentamiento
	for (i = 0; i < size; i++) {

		//Obtiene las barras afectadas
		bars = getBarsSettlements(settlements[i]);

		//Para cada barra
		for (var j = 0; j < bars.length; j++) {
			//Obtiene ui
			ui = getUi(bars[j] - 1);
			//Si el asentamiento está en el nodo inicial
			if (settlements[i] === barsIni[bars[j] - 1]) {
				dA = (calculationType === '1') ? [parseFloat(dsX[i]), parseFloat(dsY[i])] : [parseFloat(dsX[i]), parseFloat(dsY[i]), parseFloat(dsZ[i])];
				dB = (calculationType === '1') ? [0, 0] : [0, 0, 0];
			}
			//Si el asentamiento está en el nodo final
			if (settlements[i] === barsFin[bars[j] - 1]) {
				dA = (calculationType === '1') ? [0, 0] : [0, 0, 0];
				dB = (calculationType === '1') ? [parseFloat(dsX[i]), parseFloat(dsY[i])] : [parseFloat(dsX[i]), parseFloat(dsY[i]), parseFloat(dsZ[i])];
			}

			resA = (calculationType === '1') ? (dA[0] * ui[0]) + (dA[1] * ui[1]) : (dA[0] * ui[0]) + (dA[1] * ui[1]) + (dA[2] * ui[2]);
			resB = (calculationType === '1') ? (dB[0] * ui[0]) + (dB[1] * ui[1]) : (dB[0] * ui[0]) + (dB[1] * ui[1]) + (dB[2] * ui[2]);
			res = resB - resA;
			e[bars[j] - 1][0] = res;
		}
	}

	P1 = math.multiply(kd, e);
}

function getBarsSettlements(node) {
	var numberOfBars = parseInt($numberOfBars.val());
	bars = [];

	for (var i = 0; i < numberOfBars; i++) {

		if (barsIni[i] === node && bars.indexOf(i) === -1)
			bars.push(i + 1);

		if (barsFin[i] === node && bars.indexOf(i) === -1)
			bars.push(i + 1);
	}

	return bars;
}

function getUi(i) {
	var calculationType = $calculationType.val();
	var coordinates = (calculationType === '1') ? 2 : 3;
	var size = A[i].length;
	var ui = [];

	for (var j = 0; j < size; j += coordinates) {
		if (A[i][j] != 0 || A[i][j + 1] != 0) {
			if (calculationType === '1' || (calculationType === '2' && A[i][j + 2] != 0)) {
				ui.push(A[i][j]);
				ui.push(A[i][j + 1]);
				if (calculationType === '2') ui.push(A[i][j + 2]);
				return ui;
			}
		}
	}

	return ui;
}

function calculateP2() {
	P2 = math.multiply(kd, e);
}

function calculatePBySum() {
	P = math.add(P1, P2);
}

function negative(m) {
	rows = m.length;
	for (var i = 0; i < rows; i++) {
		cols = m[i].length;
		for (var j = 0; j < cols; j++) {
			m[i][j] = m[i][j] * -1;
		}
	}

	return m;
}

function roundMatrix(matrix) {
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++)
			matrix[i][j] = round(matrix[i][j], 3); 
	}
}

function round(number, decimals) {
	var nfloat = parseFloat(number);
	var res = Math.round(nfloat * Math.pow(10, decimals)) / Math.pow(10, decimals);
	return res;
}

function radiansToDegrees(radians)
{
	var pi = Math.PI;
	return radians * (180/pi);
}

function degreesToRadians(degrees)
{
	var pi = Math.PI;
	return degrees * (pi/180);
}

function copyInstance (original) {
  var copied = Object.assign(
    Object.create(
      Object.getPrototypeOf(original)
    ),
    original
  );
  return copied;
}