
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
var T = []; // Matriz
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

// Variables Jesús
// NOTA: Variables tienen prefijo j para no causar conflictos con
// variables Gaby
var jNodes = [];
var jBars = [];

function calculate() {
	jNodes = [];
	jBars = [];
	for(var i = 0; i < parseInt($mNumberOfBars.val()); i++) {
		jBars.push(new Bar());
	}

	var calculationType = $calculationType.val();
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
				calculateFFromForcesTable();
				calculated();
				calculatee();
				calculateP();
			break;
			//Defectos constructivos
			case 2:
				calculateP11();
				calculateF();
				calculated();
				calculatee();
				calculateP2();
				calculatePBySum();
			break;
			//Efectos térmicos
			case 3:
				calculateP12();
				calculateF();
				calculated();
				calculatee();
				calculateP2();
				calculatePBySum();
			break;
			//Asentamientos diferenciales
			case 4:
				//Estado I
				calculateP13();
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
		
  		calculatekdByBar();
  		calculatekdFromki();
  		calculateAByBar();
  		calculateAFromAi();
  		calculateK();
  		calculateFFromForcesTable();
		calculated();
		calculatee();
		calculateP();
		//Estado II
		calculateF2();
		createResReticulaTable();
		
	}
	//Marco Plano
	else if (calculationType === '4') {
		calculatekdByBar();
		calculatekdFromki();
		calculateAByBar();
		calculateAFromAi();
		calculateK();
		calculateFFromForcesTable();

		//Estado I
		getBarForces();
		getBarPuntualForces();
		calculateF1();

		//Estado II
		calculated();
		calculatee();
		calculateP();
		calculateF2();

		calculateFSol();

		//Resultado
		createResMarcoPlanoTable();
	}
	// Marco 3D
	else if (calculationType === '5') {
		/*
		calculateFFromForcesTable();
		getBarForces();
		getBarPuntualForces();
		calculate3dFrame();
		*/
	}
}

function calculateFSol() {
	FSol = math.add(F1, F2);
}

function calculateF1 () {

	F1 = [];
	
	//Para cada barra se analiza el nodo inicial y el nodo final
	jBars.forEach(jBar => {
		
		console.log(jBar);
		var jD = jBar.dPx;
		var jDeltaX = jBar.deltaX;
		var jDeltaY = jBar.deltaY;
		var jL = jBar.calculateL;

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
				if (jDeltaX != 0 && jDeltaY == 0) {
				  //Si la coordenada x del nodo empotrado es menor que la del nodo libre, wY y pPy no se alteran, si no, se multiplican por -1
				  var nodeASign = (emp.x < lib.x) ? 1 : -1;
				  emp.fX += jBar.pPx;
				  emp.fY += jBar.pPy + (jBar.wY * jL);
				  emp.mZ += jBar.pMz + (jBar.pPy * jD * nodeASign) + (jBar.wY * (Math.pow(jL, 2) / 2) * nodeASign);
				  //Para el nodo libre los valores son cero
				}
				
				//B 
				else if (jDeltaX == 0 && jDeltaY != 0) {
					//Si la coordenada y del nodo empotrado es mayor que la del nodo libre, wX y pPx no se alteran, si no, se multiplican por -1
					var nodeASign = (emp.y > lib.y) ? 1 : -1;
					emp.fX += jBar.pPx + (jBar.wX * jL);
					emp.fY += jBar.pPy;
					emp.mZ += jBar.pMz + (jBar.pPx * jD * nodeASign) + (jBar.wX * (Math.pow(jL, 2) / 2) * nodeASign);
				  	//Para el nodo libre los valores son cero
				} 

				//C
				else {
					var alpha = Math.abs(Math.atan(jDeltaX / jDeltaY));
					var jDx = jD * Math.cos(alpha);
					var jDy = jD * Math.sin(alpha);
					var jLx = jL * Math.cos(alpha);
					var jLy = jL * Math.sin(alpha);

					//Si la coordenada x del nodo empotrado es menor que la del nodo libre, wY y pPy no se alteran, si no, se multiplican por -1
					var nodeASign1 = (emp.x < lib.x) ? 1 : -1;
					//Si la coordenada y del nodo empotrado es mayor que la del nodo libre, wX y pPx no se alteran, si no, se multiplican por -1
					var nodeASign2 = (emp.y > lib.y) ? 1 : -1;

					emp.fX += jBar.pPx + (jBar.wX * jLy);
					emp.fY += jBar.pPy + (jBar.wY * jLx);
					emp.mZ += jBar.pMz 
							+ (jBar.pPy * jDx * nodeASign1) 
							+ (jBar.pPx * jDy * nodeASign2)
			 				+ (jBar.wY * (Math.pow(jLx, 2) / 2) * nodeASign1)
							+ (jBar.wX * (Math.pow(jLy, 2) / 2) * nodeASign2);
				  	//Para el nodo libre los valores son cero
				}

				F1.push([lib.fX]);
				F1.push([lib.fY]);
				F1.push([lib.mZ]);
				F1.push([emp.fX]);
				F1.push([emp.fY]);
				F1.push([emp.mZ]);

			}

			//2. Si se conectan más de una barra a los nodos
			else {
				//Se calcula D'
				var jDc = jL - jD; // D cousin xD
				var nodeA = copyInstance(jBar.startNode);
				var nodeB = copyInstance(jBar.endNode);

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
					nodeA.mZ += ( (jBar.wY * jL * jL) / (jBar.I * jBar.I) ) * nodeASign;

					// Nodo B
					nodeB.fX += jBar.pPx / 2;
					
					aux = (jBar.pPy * jD * jD) / Math.pow(jL, 3);
					aux *= (jL + (2 * jDc));
					nodeB.fY += aux + (jBar.wY * jL) / 2;
					
					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPy * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wY * jL * jL) / (jBar.I * jBar.I) ) * nodeBSign;
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

					nodeA.fY += jBar.pPY / 2;

					nodeA.mZ += jBar.pMz / 2;
					nodeA.mZ += ( (jBar.pPx * jD * Math.pow(jDc, 2)) / (jL * jL) ) * nodeASign;
					nodeA.mZ += ( (jBar.wX * jL * jL) / (jBar.I * jBar.I) ) * nodeASign;

					//Nodo B
					aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
					aux *= (jL + (2 * jD));
					nodeB.fX += aux + (jBar.wX * jL) / 2;
					
					nodeB.fY += jBar.pPY / 2;
					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPx * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wX * jL * jL) / (jBar.I * jBar.I) ) * nodeBSign;
				} 

				//C
				else {
					var alpha = Math.abs(Math.atan(jDeltaX / jDeltaY));
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
					nodeA.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / Math.pow(jBar.I, 2) ) * nodeASign;
					nodeA.mZ += ( (jBar.pPy * jDx * jDcx * jDcx) / Math.pow(jLx, 2) ) * nodeASign;
					nodeA.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / Math.pow(jBar.I, 2) ) * nodeASign;

					// Nodo B
					nodeB.fX += ((jBar.pPx * jDy * jDy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDcy));
					nodeB.fX += (jBar.wX * jLy) / 2;

					nodeB.fY += ((jBar.pPy * jDx * jDx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDcx);
					nodeB.fY += (jBar.wY * jLx) / 2;

					nodeB.mZ += jBar.pMz / 2;
					nodeB.mZ += ( (jBar.pPx * jDy * jDy * jDcy) / Math.pow(jLy, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / Math.pow(jBar.I, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.pPy * jDx * jDx * jDcx) / Math.pow(jLx, 2) ) * nodeBSign;
					nodeB.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / Math.pow(jBar.I, 2) ) * nodeBSign;
				}

				F1.push([nodeA.fX]);
				F1.push([nodeA.fY]);
				F1.push([nodeA.mZ]);
				F1.push([nodeB.fX]);
				F1.push([nodeB.fY]);
				F1.push([nodeB.mZ]);
			}
		}
		//II. Si 1 nodo es apoyo - Aquí voy revisando
		else {
			
			//Se calcula D'
			var jDc = jL - jD; // D cousin xD
			//Nodo que es apoyo
			var art;
			//Nodo que no es apoyo
			var emp;

			if (jBar.startNode.isSupport) {
				art = copyInstance(jBar.startNode);
				emp = copyInstance(jBar.endNode);
			} else {
				art = copyInstance(jBar.endNode);
				emp = copyInstance(jBar.startNode);
			}

			//1. Si el apoyo tiene restricciones se realiza el mismo procedimiento que en I.2
			if (art.lX && art.lY && art.rZ) {

				var nodeA = copyInstance(jBar.startNode);
				var nodeB = copyInstance(jBar.endNode);

				//A
				if (jDeltaX != 0 && jDeltaY == 0) {

					//Si delta x es positivo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX > 0 ? -1 : 1;
					//Si delta x es negativo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaX < 0 ? -1 : 1;
					
					var aux = 0;

					//El nodo que es apoyo no aporta nada a la tabla del Paso 4
					if (!nodeA.isSupport) {
						// Nodo A
						nodeA.fX += jBar.pPx / 2;
						
						aux = (jBar.pPy * jDc * jDc) / Math.pow(jL, 3);
						aux *= (jL + (2 * jD));
						nodeA.fY += aux + (jBar.wY * jL) / 2;
						
						nodeA.mZ += jBar.pMz / 2;
						nodeA.mZ += ( (jBar.pPy * jD * Math.pow(jDc, 2) ) / (jL * jL) ) * nodeASign ;
						nodeA.mZ += ( (jBar.wY * jL * jL) / (jBar.I * jBar.I) ) * nodeASign;
					}

					//El nodo que es apoyo no aporta nada a la tabla del Paso 4
					if (!nodeB.isSupport) {
						// Nodo B
						nodeB.fX += jBar.pPx / 2;
						
						aux = (jBar.pPy * jD * jD) / Math.pow(jL, 3);
						aux *= (jL + (2 * jDc));
						nodeB.fY += aux + (jBar.wY * jL) / 2;
						
						nodeB.mZ += jBar.pMz / 2;
						nodeB.mZ += ( (jBar.pPy * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
						nodeB.mZ += ( (jBar.wY * jL * jL) / (jBar.I * jBar.I) ) * nodeBSign;
					}		
				} 

				//B
				else if (jDeltaX == 0 && jDeltaY != 0) {
					
					//Si delta y es positivo, las fórmulas con * se multiplican por -1 para el nodo inicial
					var nodeASign = jDeltaY > 0 ? -1 : 1;
					//Si delta y es negativo, las fórmulas con * se multiplican por -1 para el nodo final
					var nodeBSign = jDeltaX < 0 ? -1 : 1;

					//El nodo que es apoyo no aporta nada a la tabla del Paso 4
					if (!nodeA.isSupport) {
						//Nodo A
						aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
						aux *= (jL + (2 * jD));
						nodeA.fX += aux + ((jBar.wX * jL) / 2);

						nodeA.fY += jBar.pPY / 2;

						nodeA.mZ += jBar.pMz / 2;
						nodeA.mZ += ( (jBar.pPx * jD * Math.pow(jDc, 2)) / (jL * jL) ) * nodeASign;
						nodeA.mZ += ( (jBar.wX * jL * jL) / (jBar.I * jBar.I) ) * nodeASign;
					}

					//El nodo que es apoyo no aporta nada a la tabla del Paso 4
					if (!nodeB.isSupport) {
						//Nodo B
						aux = (jBar.pPx * jDc * jDc) / Math.pow(jL, 3);
						aux *= (jL + (2 * jD));
						nodeB.fX += aux + (jBar.wX * jL) / 2;
						
						nodeB.fY += jBar.pPY / 2;
						nodeB.mZ += jBar.pMz / 2;
						nodeB.mZ += ( (jBar.pPx * Math.pow(jD, 2) * jDc) / (jL * jL) ) * nodeBSign;
						nodeB.mZ += ( (jBar.wX * jL * jL) / (jBar.I * jBar.I) ) * nodeBSign;
					}
				} 

				//C
				else {
					var alpha = Math.abs(Math.atan(jDeltaX / jDeltaY));
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

					//El nodo que es apoyo no aporta nada a la tabla del Paso 4
					if (!nodeA.isSupport) {
						// Nodo A
						nodeA.fX += ((jBar.pPx * jDcy * jDcy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDy));
						nodeA.fX += (jBar.wX * jLy) / 2;

						nodeA.fY += ((jBar.pPy * jDcx * jDcx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDx);
						nodeA.fY += (jBar.wY * jLx) / 2;

						nodeA.mZ += jBar.pMz / 2;
						nodeA.mZ += ( (jBar.pPx * jDy * jDcy * jDcy) / Math.pow(jLy, 2) ) * nodeASign;
						nodeA.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / Math.pow(jBar.I, 2) ) * nodeASign;
						nodeA.mZ += ( (jBar.pPy * jDx * jDcx * jDcx) / Math.pow(jLx, 2) ) * nodeASign;
						nodeA.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / Math.pow(jBar.I, 2) ) * nodeASign;
					}

					//El nodo que es apoyo no aporta nada a la tabla del Paso 4
					if (!nodeB.isSupport) {
						// Nodo B
						nodeB.fX += ((jBar.pPx * jDy * jDy) / (Math.pow(jLy, 3))) * (jLy + (2 * jDcy));
						nodeB.fX += (jBar.wX * jLy) / 2;

						nodeB.fY += ((jBar.pPy * jDx * jDx) / (Math.pow(jLx, 3))) * (jLx + 2 * jDcx);
						nodeB.fY += (jBar.wY * jLx) / 2;

						nodeB.mZ += jBar.pMz / 2;
						nodeB.mZ += ( (jBar.pPx * jDy * jDy * jDcy) / Math.pow(jLy, 2) ) * nodeBSign;
						nodeB.mZ += ( (jBar.wX * Math.pow(jLy, 2) ) / Math.pow(jBar.I, 2) ) * nodeBSign;
						nodeB.mZ += ( (jBar.pPy * jDx * jDx * jDcx) / Math.pow(jLx, 2) ) * nodeBSign;
						nodeB.mZ += ( (jBar.wY * Math.pow(jLx, 2) ) / Math.pow(jBar.I, 2) ) * nodeBSign;
					}
				}

				F1.push([nodeA.fX]);
				F1.push([nodeA.fY]);
				F1.push([nodeA.mZ]);
				F1.push([nodeB.fX]);
				F1.push([nodeB.fY]);
				F1.push([nodeB.mZ]);
			}

			//2. Si el apoyo sólo tiene restricción rotacional en Z
			else if (!art.lX && !art.lY && art.rZ) {

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

					var alpha = Math.abs(Math.atan(jDeltaX / jDeltaY));
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
				
				F1.push([nodeA.fX]);
				F1.push([nodeA.fY]);
				F1.push([nodeA.mZ]);
				F1.push([nodeB.fX]);
				F1.push([nodeB.fY]);
				F1.push([nodeB.mZ]);
					
				}

			//3. Si el apoyo tiene restricción lineal en X y restricción rotacional en Z
			else if (art.lX && !art.lY && art.rZ) {

				
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

					var alpha = Math.abs(Math.atan(jDeltaX / jDeltaY));
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
				
				F1.push([nodeA.fX]);
				F1.push([nodeA.fY]);
				F1.push([nodeA.mZ]);
				F1.push([nodeB.fX]);
				F1.push([nodeB.fY]);
				F1.push([nodeB.mZ]);
				
			}

			//4. Si el apoyo tiene restricción lineal en Y y restricción rotacional en Z
			else if (!art.lX && art.lY && art.rZ) {

				
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

					var alpha = Math.abs(Math.atan(jDeltaX / jDeltaY));
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
				
				F1.push([nodeA.fX]);
				F1.push([nodeA.fY]);
				F1.push([nodeA.mZ]);
				F1.push([nodeB.fX]);
				F1.push([nodeB.fY]);
				F1.push([nodeB.mZ]);
			}

		}
	});
}

/**
 * Calcular marco 3d usando apuntes de Arnoldo.
 * Este método incluye todo los pasos de nuevo porque necesito
 * familiarizarme con el algoritmo.

 * NOTA: Variables tienen prefijo j para no causar conflictos con
 *			 variables Gaby
 */
function calculate3dFrame() {


}

/**
 * Obtiene las coordenadas de cada nodo de la estructura.
 */
function getNodesCoordinates() {
	var inputX = $('#nodes-table-container table input.x');
	var inputY = $('#nodes-table-container table input.y');
	var inputZ = $('#nodes-table-container table input.z');
	var inputSize = inputX.length;
	var calculationType = $calculationType.val();

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
		if (calculationType === '2' || calculationType === '3' || calculationType === '5') {
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
	//var calculationType = $calculationType.val();

	var size = selectS.length;
	for (i = 0; i < size; i++) {
		support = parseInt($(selectS[i]).val());
		supports.push(support);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].isSupport = true;
	}

	size = inputLx.length;
	for (i = 0; i < size; i++) {
		rx = ($(inputLx[i]).is(':checked')) ? 1 : 0;
		restrictionsLx.push(rx);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].lX = Boolean(rx);
	}

	size = inputLy.length;
	for (i = 0; i < size; i++) {
		ry = ($(inputLy[i]).is(':checked')) ? 1 : 0;
		restrictionsLy.push(ry);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].lY = Boolean(ry);
	}

	size = inputLz.length;
	for (i = 0; i < size; i++) {
		rz = ($(inputLz[i]).is(':checked')) ? 1 : 0;
		restrictionsLz.push(rz);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].lZ = Boolean(rz);
	}

	size = inputRx.length;
	for (i = 0; i < size; i++) {
		rx = ($(inputRx[i]).is(':checked')) ? 1 : 0;
		restrictionsRx.push(rx);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].rX = Boolean(rx);
	}

	size = inputRy.length;
	for (i = 0; i < size; i++) {
		ry = ($(inputRy[i]).is(':checked')) ? 1 : 0;
		restrictionsRy.push(ry);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].rY = Boolean(ry);
	}

	size = inputRz.length;
	for (i = 0; i < size; i++) {
		rz = ($(inputRz[i]).is(':checked')) ? 1 : 0;
		restrictionsRz.push(rz);
		indexNode = parseInt($(selectS[i]).val()) - 1;
		jNodes[i].rZ = Boolean(rz);
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
	var calculationType = $calculationType.val();

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

		if (calculationType === '2' || calculationType === '3' || calculationType === '5') {
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

	var calculationType = $calculationType.val();
	var coordinates = 3;
	var bars = parseInt($numberOfBars.val());
	//El número de filas es igual al número de barras por cuatro
	var rows = bars * 4;
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
			rxNodeIni = restrictionsLx[indexNodeIni];
			ryNodeIni = restrictionsLy[indexNodeIni];
			rzNodeIni = restrictionsLz[indexNodeIni];
		}
		else {	//No es un apoyo
			rxNodeIni = ryNodeIni = rzNodeIni = 0;
		}

		//El nodo final es un apoyo
		if (indexNodeFin != -1) {
			rxNodeFin = restrictionsLx[indexNodeFin];
			ryNodeFin = restrictionsLy[indexNodeFin];
			rzNodeFin = restrictionsLz[indexNodeFin];
		}
		else {	//No es un apoyo
			rxNodeFin = ryNodeFin = rzNodeFin = 0;
		}

		//El nodo inicial no tiene alguna restricción
		if (rxNodeIni === 0 || ryNodeIni === 0 || rzNodeIni === 0) {
			rowIniA = i * 4;			//i es el índice de la barra y 4 porque son 4 filas por barra
			colIniA = posIni * 3;		//posIni es el índice del nodo y 3 porque son 3 coordenadas
			rowIniAi = 0;				//En la matriz A de la barra siempre se toma desde la fila 0
			colIniAi = 0;				//Para el nodo inicial se toma la primera parte de la matriz A de la barra
			copyMatrixA(rowIniA, colIniA, rowIniAi, colIniAi, a[i]);
		}

		//El nodo final no tiene alguna restricción
		if (rxNodeFin === 0 || ryNodeFin === 0 || rzNodeFin === 0) {
			rowIniA = i * 4;			//i es el índice de la barra y 4 porque son 4 filas por barra
			colIniA = posFin * 3;		//posIni es el índice del nodo y 3 porque son 3 coordenadas
			rowIniAi = 0;				//En la matriz A de la barra siempre se toma desde la fila 0
			colIniAi = 3;				//Para el nodo final se toma la segunda parte de la matriz A de la barra
			copyMatrixA(rowIniA, colIniA, rowIniAi, colIniAi, a[i]);
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

function copyMatrixA(rowIniA, colIniA, rowIniAi, colIniAi, Ai) {

	for (var i = 0; i < 4; i++) {		//4 filas por barra
		for (var j = 0; j < 3; j++) {	//3 dx por nodo

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
		ai[0][1] = Math.cos(degreesToRadians(beta)) / L[i];
		ai[0][2] = 0.01;
		ai[0][3] = Math.sin(degreesToRadians(beta)) / L[i];
		ai[0][4] = (Math.cos(degreesToRadians(beta)) / L[i] == 0) ? Math.cos(degreesToRadians(beta)) / L[i] : -(Math.cos(degreesToRadians(beta)) / L[i]);
		ai[0][5] = 0;

		ai[1][0] = 2 * ai[0][0];
		ai[1][1] = 2 * ai[0][1];
		ai[1][2] = 0.01;
		ai[1][3] = 2 * ai[0][3];
		ai[1][4] = 2 * ai[0][4];
		ai[1][5] = 0.01;

		ai[2][0] = ai[0][0];
		ai[2][1] = ai[0][1];
		ai[2][2] = 0;
		ai[2][3] = ai[0][3];
		ai[2][4] = ai[0][4];
		ai[2][5] = 0.01;

		ai[3][0] = (Math.cos(degreesToRadians(beta)) == 0) ? Math.cos(degreesToRadians(beta)) / 100 : - Math.cos(degreesToRadians(beta)) / 100;
		ai[3][1] = (Math.sin(degreesToRadians(beta)) == 0) ? Math.sin(degreesToRadians(beta)) / 100 : - Math.sin(degreesToRadians(beta)) / 100;
		ai[3][2] = 0;
		ai[3][3] = Math.cos(degreesToRadians(beta)) / 100;
		ai[3][4] = Math.sin(degreesToRadians(beta)) / 100;
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
	var calculationType = $calculationType.val();
	var size = $numberOfBars.val();
	//Arreglo de matrices
	kArray = [];
	//Para cada barra
	for (var i = 0; i < size; i++) {
		ki = [];
		for (var j = 0; j < 4; j++) {
			ki.push([0, 0, 0, 0]);
		}

		//Calcula la diagonal
		switch (calculationType) {
			//Retícula
			case '3':
				ki[0][0] = (2 * elasticity[i] * barsI[i]) / LD[i];
				ki[1][1] = (2 * elasticity[i] * barsI[i]) / LD[i];
				ki[2][2] = (2 * elasticity[i] * barsI[i]) / LD[i];
				ki[3][3] = (barsG[i] * barsJ[i]) / LD[i];
			break;
			//Marco plano
			case '4':
				ki[0][0] = (2 * elasticity[i] * barsI[i]) / LD[i];
				ki[1][1] = ((2 * elasticity[i] * barsI[i]) * (1 - (2 * barsC[i]))) / (LD[i] * (1 + (4 * barsC[i])));
				ki[2][2] = (2 * elasticity[i] * barsI[i]) / LD[i];
				ki[3][3] = (elasticity[i] * areas[i]) / LD[i];
			break;
		}
		kArray.push(ki);
	}
}

function calculatekdFromki() {
	var bars = parseInt($numberOfBars.val());
	var size = bars * 4;
	kd = [];
	//Forma la matriz con ceros
	for (var i = 0; i < size; i++) {
		ki = [];
		for (var j = 0; j < size; j++)
			ki.push(0);
		kd.push(ki);
	}
	//Calcula la diagonal
	var pos = 0;
	for (i = 0; i < bars; i++) {
		for (var j = 0; j < 4; j++) {
			for (var l = 0; l < 4; l++) {
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
		jBars[i].pPx = wx;
	}

	size = inputPPy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputPPy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].pPy = wy;
	}

	size = inputPPz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputPPz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].pPz = wz;
	}

	size = inputPMx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputPMx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].pMx = wx;
	}

	size = inputPMy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputPMy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].pMy = wy;
	}

	size = inputPMz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputPMz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].pMz = wz;
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
		jBars[i].dPx = wx;
	}

	size = inputDPy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputDPy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].dPy = wy;
	}

	size = inputDPz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputDPz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].dPz = wz;
	}

	size = inputDMx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputDMx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].dMx = wx;
	}

	size = inputDMy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputDMy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].dMy = wy;
	}

	size = inputDMz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputDMz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].dMz = wz;
	}
}

function getBarForces() {
	var selectF = $('#bars-distributed-forces-table-container table select');

	var inputWx = $('#bars-distributed-forces-table-container table input.wx');
	var inputWy = $('#bars-distributed-forces-table-container table input.wy');
	var inputWz = $('#bars-distributed-forces-table-container table input.wz');

	var calculationType = $calculationType.val();

	//Obtiene los nodos que tienen fuerzas aplicadas
	var size = selectF.length;

	size = inputWx.length;
	for (i = 0; i < size; i++) {
		wx = parseFloat($(inputWx[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].wX = wx;
	}

	size = inputWy.length;
	for (i = 0; i < size; i++) {
		wy = parseFloat($(inputWy[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].wY = wy;
	}

	size = inputWz.length;
	for (i = 0; i < size; i++) {
		wz = parseFloat($(inputWz[i]).val());
		indexBar = parseInt($(selectF[i]).val()) - 1;
		jBars[i].wZ = wz;
	}
}

function calculateFFromForcesTable() {

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

	var calculationType = $calculationType.val();

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
					case '3':
						valfz = (fZ[indexF] === '') ? 0 : fZ[indexF];
						valmx = (mX[indexF] === '') ? 0 : mX[indexF];
						valmy = (mY[indexF] === '') ? 0 : mY[indexF];
						fz = [valfz];
						mx = [valmx];
						my = [valmy];
						F.push(fz);
						F.push(mx);
						F.push(my);
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
	var calculationType = $calculationType.val();
	var bars = parseInt($numberOfBars.val());

	F2 = [];
	for (var i = 0; i < bars; i++) {
		posIniP = i * 4;
		if (calculationType === '3') {
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = [P[posIniP][0] + P[posIniP + 1][0]];
			F2.push(f2);
			f2 = [-(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i]];
			F2.push(f2);
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = [P[posIniP + 1][0] + P[posIniP + 2][0]];
			F2.push(f2);
			f2 = [(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i]];
			F2.push(f2);
		}
		else if (calculationType === '4') {
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = [(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i]];
			F2.push(f2);
			f2 = [P[posIniP][0] + P[posIniP + 1][0]];
			F2.push(f2);
			f2 = [P[posIniP + 3][0]];
			F2.push(f2);
			f2 = [-(P[posIniP][0] + (2 * P[posIniP + 1][0]) + P[posIniP + 2][0]) / L[i]];
			F2.push(f2);
			f2 = [P[posIniP + 1][0] + P[posIniP + 2][0]];
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

function calculateP11() {
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

function calculateP12() {

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
function calculateP13() {

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