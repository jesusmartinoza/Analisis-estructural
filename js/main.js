
var $calculationType = $('#calculation-type');

var $mNumberOfNodes = $('#m-number-of-nodes');
var $numberOfNodes = $('#number-of-nodes');
var $mNumberOfBars = $('#m-number-of-bars');
var $numberOfBars = $('#number-of-bars');
var $mNumberOfSupports = $('#m-number-of-supports');
var $numberOfSupports = $('#number-of-supports');
var $mNumberOfNodesForces = $('#m-number-of-nodes-forces');
var $numberOfNodesForces = $('#number-of-nodes-forces');
var $mNumberOfBarsDefects = $('#m-number-of-bars-defects');
var $numberOfBarsDefects = $('#number-of-bars-defects');
var $mNumberOfSettlements = $('#m-number-of-settlements');
var $numberOfSettlements = $('#number-of-settlements');
var $mNumberOfBarsDistributedForces = $('#m-number-of-bars-distributed-forces');
var $numberOfBarsDistributedForces = $('#number-of-bars-distributed-forces');
var $mNumberOfBarsPunctualForces = $('#m-number-of-bars-punctual-forces');
var $numberOfBarsPunctualForces = $('#number-of-bars-punctual-forces');

var $nodesTableContainer = $('#nodes-table-container');
var $barsTableContainer = $('#bars-table-container');
var $supportsTableContainer = $('#supports-table-container');
var $nodesForcesTableContainer = $('#nodes-forces-table-container');
var $barsDefectsTableContainer = $('#bars-defects-table-container');
var $settlementsTableContainer = $('#settlements-table-container');
var $displacementTableContainer = $('#displacement-table-container');
var $elongationTableContainer = $('#elongation-table-container');
var $axialForceTableContainer = $('#axial-force-table-container');
var $barsDistributedForcesTableContainer = $('#bars-distributed-forces-table-container');
var $barsPunctualForcesTableContainer = $('#bars-punctual-forces-table-container');

var $footerContainer = $('#footer-container');
var $forcesContainer1 = $('#forces-container-1');
var $forcesContainer2 = $('#forces-container-2');
var $forcesContainer3 = $('#forces-container-3');
var $forcesContainer4 = $('#forces-container-4');
var $forcesContainer5 = $('#forces-container-5');
var $forcesContainer6 = $('#forces-container-6');

$(document).ready(function() {
  $('#process-container').hide();
  $footerContainer.hide();
});

function initCalculation(op) {

  $calculationType.val(op);
  $('#selection-container').hide();
  $('#process-container').show();
  $('#text-heading').html('');
  $footerContainer.show();

  $('#armadura').hide();
  $('#reticula').hide();
  $('#marco-plano').hide();
  $('#marco-3d').hide();

  $('#a-paso-1').html('');
  $('#a-paso-2').html('');
  $('#a-paso-3').html('');
  $('#a-paso-4').html('');
  $('#a-paso-5').html('');
  $('#a-paso-6').html('');

  $('#r-paso-1').html('');
  $('#r-paso-2').html('');
  $('#r-paso-3').html('');
  $('#r-paso-4').html('');
  $('#r-paso-5').html('');
  $('#r-paso-6').html('');
  $('#r-paso-7').html('');

  $('#mp-paso-1').html('');
  $('#mp-paso-2').html('');
  $('#mp-paso-3').html('');
  $('#mp-paso-4').html('');
  $('#mp-paso-5').html('');

  $('#m3d-paso-1').html('');
  $('#m3d-paso-2').html('');
  $('#m3d-paso-3').html('');
  $('#m3d-paso-4').html('');
  $('#m3d-paso-5').html('');
  $('#m3d-paso-7').html('');

  switch (op) {
    case 1:
    case 2:
      window.location.replace("index.html#a-paso-1");
      addNodesContainer($('#a-paso-1'));
      addBarsContainer($('#a-paso-2'));
      addSupportsContainer($('#a-paso-3'));
      addForcesOptions($('#a-paso-4'));
      addForcesContainer($('#a-paso-5'));
      $('#a-paso-6').html(
        '<div class="row">' +
        '<div class="col-md-12" id="displacement-table-container">' +
        '</div>' +
        '<div class="col-md-6" id="elongation-table-container">' +
        '</div>' +
        '<div class="col-md-6" id="axial-force-table-container">' +
        '</div>' +
        '</div>'
      );
      $displacementTableContainer = $('#displacement-table-container');
      $elongationTableContainer = $('#elongation-table-container');
      $axialForceTableContainer = $('#axial-force-table-container');
      $('#armadura').show();
      $('#armadura').smartWizard();
      setArmaduraEvents();
    break;
    case 3:
      window.location.replace("index.html#r-paso-1");
      addNodesContainer($('#r-paso-1'));
      addBarsContainer($('#r-paso-2'));
      addSupportsContainer($('#r-paso-3'));
      addForcesContainer($('#r-paso-4'));
      addDistributedForcesContainer($('#r-paso-5'));
      addPunctualForcesContainer($('#r-paso-6'));
      $('#r-paso-7').html(
        '<div class="row">' +
        '<div class="col-md-12" id="r-res-table-container"></div>' +
        '</div>'
      );
      $('#reticula').show();
      $('#reticula').smartWizard();
      setReticulaEvents();
    break;
    case 4:
      window.location.replace("index.html#mp-paso-1");
      addNodesContainer($('#mp-paso-1'));
      addBarsContainer($('#mp-paso-2'));
      addSupportsContainer($('#mp-paso-3'));
      addForcesContainer($('#mp-paso-4'));
      addDistributedForcesContainer($('#mp-paso-5'));
      addPunctualForcesContainer($('#mp-paso-6'));
      $('#mp-paso7').html(
        '<div class="row">' +
        '<div class="col-md-12" id="mp-res-table-container"></div>' +
        '</div>'
      );
      $('#marco-plano').show();
      $('#marco-plano').smartWizard();
      setMarcoPlanoEvents();
    break;
    case 5:
      window.location.replace("index.html#m3d-paso-1");
      addNodesContainer($('#m3d-paso-1'));
      addBarsContainer($('#m3d-paso-2'));
      addSupportsContainer($('#m3d-paso-3'));
      addForcesContainer($('#m3d-paso-4'));
      addDistributedForcesContainer($('#m3d-paso-5'));
      addPunctualForcesContainer($('#m3d-paso-6'));
      $('#marco-3d').show();
      $('#marco-3d').smartWizard();
      setMarco3dEvents();
    break;
  }
}

function addNodesContainer(element) {
  element.html(
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(1)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(1)">Agregar nodo</button>' +
    '<button type="button" class="btn btn-outline-secondary" onclick="clearTable(1)">Limpiar campos</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="nodes-table-container">' +
    '</div>' +
    '</div>'
  );
  $nodesTableContainer = $('#nodes-table-container');
}

function addBarsContainer(element) {
  element.html(
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(2)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(2)">Agregar barra</button>' +
    '<button type="button" class="btn btn-outline-secondary" onclick="clearTable(2)">Limpiar campos</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="bars-table-container">' +
    '</div>' +
    '</div>'
  );
  $barsTableContainer = $('#bars-table-container');
}

function addSupportsContainer(element) {
  element.html(
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(3)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(3)">Agregar apoyo</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="supports-table-container">' +
    '</div>' +
    '</div>'
  );
  $supportsTableContainer = $('#supports-table-container');
}

function addForcesOptions(element) {
  element.html(
    '<h5>Fuerzas aplicadas a la estrucura</h5>' +
    '<p class="text-muted">Seleccione el paso a tratar:</p>' +
    '<div class="form-check">' +
    '<input class="form-check-input" type="radio" name="force-type" id="force-type-1" value="1" checked>' +
    '<label class="form-check-label" for="force-type-1">' +
    'Fuerzas externas aplicadas en nodos' +
    '</label>' +
    '</div>' +
    '<div class="form-check">' +
    '<input class="form-check-input" type="radio" name="force-type" id="force-type-2" value="2">' +
    '<label class="form-check-label" for="force-type-2">' +
    'Fuerzas debido a defectos constructivos' +
    '</label>' +
    '</div>' +
    '<div class="form-check">' +
    '<input class="form-check-input" type="radio" name="force-type" id="force-type-3" value="3">' +
    '<label class="form-check-label" for="force-type-3">' +
    'Fuerzas debidas a efectos térmicos' +
    '</label>' +
    '</div>' +
    '<div class="form-check">' +
    '<input class="form-check-input" type="radio" name="force-type" id="force-type-4" value="4">' +
    '<label class="form-check-label" for="force-type-4">' +
    'Fuerzas debidas a asentamientos diferenciales' +
    '</label>' +
    '</div>'
  );
}

function addForcesContainer(element) {

  var calculationType = $calculationType.val();

  element.html(
    '<!--Fuerzas externas aplicadas en nodos-->' +
    '<div id="forces-container-1">' +
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(4)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(4)">Agregar nodo</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="nodes-forces-table-container">' +
    '</div>' +
    '</div>' +
    '</div>'
  );

  if (calculationType === '1' || calculationType === '2') {
    element.append(
    '<!--Fuerzas debido a defectos estructurales-->' +
    '<div id="forces-container-2">' +
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(5)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(5)">Agregar barra</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="bars-defects-table-container">' +
    '</div>' +
    '</div>' +
    '</div>' +

    '<!--Fuerzas debidas a efectos térmicos-->' +
    '<div id="forces-container-3">' +
    '<div class="col-sm-12 form-group">' +
    '<label for="temperature-gradient">¿Cuál es el gradiente de temperatura ΔT(°C)?</label>' +
    '<input type="text" class="form-control" id="temperature-gradient">' +
    '</div>' +
    '<div class="col-sm-12 form-group">' +
    '<label for="thermal-expansion">¿Cuál es el coeficiente de expansión térmica α(1/°C)?</label>' +
    '<input type="text" class="form-control" id="thermal-expansion">' +
    '</div>' +
    '</div>' +

    '<!--Fuerzas debidas a asentamientos diferenciales-->' +
    '<div id="forces-container-4">' +
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(6)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(6)">Agregar apoyo</button>' +
    '<!--<button type="button" class="btn btn-outline-secondary" onclick="clearTable(3)">Limpiar campos</button>-->' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="settlements-table-container">' +
    '</div>' +
    '</div>' +
    '</div>'
    );
  }

  $forcesContainer1 = $('#forces-container-1');
  $forcesContainer2 = $('#forces-container-2');
  $forcesContainer3 = $('#forces-container-3');
  $forcesContainer4 = $('#forces-container-4');
  $nodesForcesTableContainer = $('#nodes-forces-table-container');
  $barsDefectsTableContainer = $('#bars-defects-table-container');
  $settlementsTableContainer = $('#settlements-table-container');
}

function addDistributedForcesContainer(element) {
  element.html(
    '<!--Fuerzas repartidas en barras-->' +
    '<div id="forces-container-5">' +
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(7)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(7)">Agregar barra</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="bars-distributed-forces-table-container">' +
    '</div>' +
    '</div>' +
    '</div>'
  );

  $forcesContainer5 = $('#forces-container-5');
  $barsDistributedForcesTableContainer = $('#bars-distributed-forces-table-container');
}

function addPunctualForcesContainer(element) {
  element.html(
    '<!--Fuerzas puntuales en barras-->' +
    '<div id="forces-container-6">' +
    '<div class="col-md-12 m-bottom-40">' +
    '<button type="button" class="btn btn-primary" onclick="showElementsModal(8)">Iniciar</button>' +
    '<button type="button" class="btn btn-secondary" onclick="addRow(8)">Agregar barra</button>' +
    '</div>' +
    '<div class="col-md-12">' +
    '<div id="bars-punctual-forces-table-container">' +
    '</div>' +
    '</div>' +
    '</div>'
  );

  $forcesContainer6 = $('#forces-container-6');
  $barsPunctualForcesTableContainer = $('#bars-punctual-forces-table-container');
}

function setArmaduraEvents() {

  // Initialize the leaveStep event
  $("#armadura").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {

    //return confirm("Do you want to leave the step "+stepNumber+"?");
    var inputs = [];
    var validationType = 0;
    var validateEmpty = true;

    if (stepDirection != 'backward') {
      switch (stepNumber) {
        case 0:
          inputs = $('#nodes-table-container table input');
          validationType = 2;
          if (inputs.length === 0) {
            alert('Ingrese datos para continuar.');
            return false;
          }
        break;
        case 1:
          inputs = $('#bars-table-container table input');
          validationType = 1;
          if (inputs.length === 0) {
            alert('Ingrese datos para continuar.');
            return false;
          }
        break;
        case 2:
          return true;
        break;
        case 3:
          return true;
        break;
        case 4:
          //Validar según el caso seleccionado
          var forceType = getForceType();

          if (forceType === 1) {
            inputs = $('#nodes-forces-table-container table input');
            validationType = 2;
            validateEmpty = false;
          }

        break;
      }

      return validateInputs(validateEmpty, inputs, validationType);
    }

    return true;

  });

  // Initialize the showStep event
  $("#armadura").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {

    //alert("You are on step "+stepNumber+" now");
    if (parseInt(stepNumber) === 4) {

      $forcesContainer1.hide();
      $forcesContainer2.hide();
      $forcesContainer3.hide();
      $forcesContainer4.hide();

      var forceType = getForceType();
      switch (forceType) {
        case 1:
          $forcesContainer1.show();
        break;
        case 2:
          $forcesContainer2.show();
        break;
        case 3:
          $forcesContainer3.show();
        break;
        case 4:
          $forcesContainer4.show();
        break;

      }
    }

    else if (parseInt(stepNumber) === 5) {
      calculate();
    }

  });
}

function setMarcoPlanoEvents() {
  // Initialize the leaveStep event
  $("#marco-plano").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {

    //return confirm("Do you want to leave the step "+stepNumber+"?");
    var inputs = [];
    var validationType = 0;
    var validateEmpty = true;

    if (stepDirection != 'backward') {
      switch (stepNumber) {
        case 0:
          inputs = $('#nodes-table-container table input');
          validationType = 2;
          if (inputs.length === 0) {
            alert('Ingrese datos para continuar.');
            return false;
          }
        break;
        case 1:
          inputs = $('#bars-table-container table input');
          validationType = 1;
          if (inputs.length === 0) {
            alert('Ingrese datos para continuar.');
            return false;
          }
        break;
        case 2:
          return true;
        break;
        case 3:
          return true;
        break;
      }

      return validateInputs(validateEmpty, inputs, validationType);
    }

    return true;

  });

  // Initialize the showStep event
  $("#marco-plano").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {

    //alert("You are on step "+stepNumber+" now");
    if (parseInt(stepNumber) === 7) {
      calculate();
    }

  });
}

function setMarco3dEvents() {

}

function setReticulaEvents() {
  // Initialize the showStep event
  $("#reticula").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {

    //alert("You are on step "+stepNumber+" now");
    if (parseInt(stepNumber) === 6) {
      calculate();
    }

  });
}

function validateInputs(validateEmpty, inputs, validationType) {

  for (var i = 0; i < inputs.length; i++) {

    value = $(inputs[i]).val();

    if (!validateEmpty && value === '')
      return true;

    if (validateEmpty && value === '') {
      alert('Falta llenar algunos campos.');
      return false;
    }

    if (validationType === 1 && !isDecimalPositive(value)) {
      alert('Introduzca sólo números decimales positivos.');
      return false;
    }

    if (validationType === 2 && !isDecimal(value)) {
      alert('Introduzca sólo números decimales.');
      return false;
    }

  }

  return true;
}

function getForceType() {
  type = 0;

  if ($('#force-type-1').is(':checked'))
    type = 1;
  else if ($('#force-type-2').is(':checked'))
    type = 2;
  else if ($('#force-type-3').is(':checked'))
    type = 3;
  else if ($('#force-type-4').is(':checked'))
    type = 4;

  return type;
}

function showElementsModal(type) {
  $('#number-of-bars-container').hide();
  $('#bars-button').hide();
  $('#number-of-nodes-container').hide();
  $('#nodes-button').hide();
  $('#number-of-supports-container').hide();
  $('#supports-button').hide();
  $('#number-of-nodes-forces-container').hide();
  $('#nodes-forces-button').hide();
  $('#number-of-bars-defects-container').hide();
  $('#bars-defects-button').hide();
  $('#number-of-settlements-container').hide();
  $('#settlements-button').hide();
  $('#number-of-bars-distributed-forces-container').hide();
  $('#bars-distributed-forces-button').hide();
  $('#number-of-bars-punctual-forces-container').hide();
  $('#bars-punctual-forces-button').hide();

  $modalTitle = $('#modal-title');

  switch (type) {
    case 1:
      $('#number-of-nodes-container').show();
      $('#nodes-button').show();
      $mNumberOfNodes.val('');
      $modalTitle.html('Nodos');
    break;
    case 2:
      $('#number-of-bars-container').show();
      $('#bars-button').show();
      $mNumberOfBars.val('');
      $modalTitle.html('Barras');
    break;
    case 3:
      $('#number-of-supports-container').show();
      $('#supports-button').show();
      $mNumberOfSupports.val('');
      $modalTitle.html('Apoyos');
    break;
    case 4:
      $('#number-of-nodes-forces-container').show();
      $('#nodes-forces-button').show();
      $mNumberOfNodesForces.val('');
      $modalTitle.html('Fuerzas en nodos');
    break;
    case 5:
      $('#number-of-bars-defects-container').show();
      $('#bars-defects-button').show();
      $mNumberOfBarsDefects.val('');
      $modalTitle.html('Defectos constructivos');
    break;
    case 6:
      $('#number-of-settlements-container').show();
      $('#settlements-button').show();
      $mNumberOfSettlements.val('');
      $modalTitle.html('Asentamientos');
    break;
    case 7:
      $('#number-of-bars-distributed-forces-container').show();
      $('#bars-distributed-forces-button').show();
      $mNumberOfBarsDistributedForces.val('');
      $modalTitle.html('Fuerzas repartidas');
    break;
    case 8:
      $('#number-of-bars-punctual-forces-container').show();
      $('#bars-punctual-forces-button').show();
      $mNumberOfBarsPunctualForces.val('');
      $modalTitle.html('Fuerzas puntuales');
    break;
  }

  $('#main-modal').modal('show');
}

/*************************************************************************************************
 *                                     TABLAS
 *************************************************************************************************/

function createTable(type) {

  var html = '';

  switch (type) {
    case 1:
      var nodes = $mNumberOfNodes.val();
      if (nodes != '' && isInteger(nodes)) {
        $('#main-modal').modal('hide');
        $numberOfNodes.val(nodes);
        html = createNodesTable(nodes);
        $nodesTableContainer.html(html);
      }
      else
        alert('Introduzca un valor numérico.');
    break;

    case 2:
      var bars = $mNumberOfBars.val();
      if (bars != '' && isInteger(bars)) {
        $('#main-modal').modal('hide');
        $numberOfBars.val(bars);
        html = createBarsTable(bars);
        $barsTableContainer.html(html);
      }
      else
        alert('Introduzca un valor numérico.');
    break;

    case 3:
      var supports = $mNumberOfSupports.val();
      var calculationType = $calculationType.val();

      if (supports != '' && isInteger(supports)) {
        $('#main-modal').modal('hide');
        $numberOfSupports.val(supports);
        if (calculationType === '3') {
          html = '<p>Seleccione el número de nodo donde se encuentra el apoyo y marque el tipo de restricción de desplazamiento lineal y rotacional que posee.</p>';
          html += createReticulaSupportsTable(supports);
        }
        else if (calculationType === '4') {
          html = '<p>Seleccione el número de nodo donde se encuentra el apoyo y marque el tipo de restricción de desplazamiento lineal y rotacional que posee.</p>';
          html += createMarcoPlanoSupportsTable(supports);
        }
        else if (calculationType === '5') {
          html = '<p>Seleccione el número de nodo donde se encuentra el apoyo y marque el tipo de restricción de desplazamiento lineal y rotacional que posee.</p>';
          html += createMarco3dSupportsTable(supports);
        }
        else {
          html = '<p>Seleccione el número de nodo donde se encuentra el apoyo y marque el tipo de restricción de desplazamiento lineal que posee.</p>';
          html += createSupportsTable(supports);
        }
        $supportsTableContainer.html(html);
      }
      else
        alert('Introduzca un valor válido.');
    break;

    case 4:
      var nodesForces = $mNumberOfNodesForces.val();
      var calculationType = $calculationType.val();
      if (nodesForces != '' && isInteger(nodesForces)) {
        $('#main-modal').modal('hide');
        $numberOfNodesForces.val(nodesForces);
        if (calculationType === '3')
          html = createReticulaNodesForcesTable(nodesForces);
        else if (calculationType === '4')
          html = createMarcoPlanoNodesForcesTable(nodesForces);
        else if (calculationType === '5')
          html = createMarco3dNodesForcesTable(nodesForces);
        else
          html = createNodesForcesTable(nodesForces);
        $nodesForcesTableContainer.html(html);
      }
      else
        alert('Introduzca un valor válido.');
    break;

    case 5:
      var barsDefects = $mNumberOfBarsDefects.val();
      if (barsDefects != '' && isInteger(barsDefects)) {
        $('#main-modal').modal('hide');
        $numberOfBarsDefects.val(barsDefects);
        html = '<p>Seleccione el número de barra e introduzca el alargamiento (+) o acortamiento (-) que presenta.</p>';
        html += createBarsDefectsTable(barsDefects);
        $barsDefectsTableContainer.html(html);
      }
      else
        alert('Introduzca un valor válido.');
    break;
    //Asentamientos
    case 6:
      var settlements = $mNumberOfSettlements.val();
      var supports = $numberOfSupports.val();
      if (settlements != '' && isInteger(settlements)) {
        if (settlements <= supports) {
          $('#main-modal').modal('hide');
          $numberOfSettlements.val(settlements);
          html += createSettlementsTable(settlements);
          $settlementsTableContainer.html(html);
        }
        else
          alert('El valor dado es mayor que el número de apoyos existentes.');
      }
      else
        alert('Introduzca un valor válido.');
    break;
    //Fuerzas repartidas en barras
    case 7:
      var barsForces = $mNumberOfBarsDistributedForces.val();
      if (barsForces != '' && isInteger(barsForces)) {
        $('#main-modal').modal('hide');
        $numberOfBarsDistributedForces.val(barsForces);
        html = createBarsDistributedForcesTable(barsForces);
        $barsDistributedForcesTableContainer.html(html);
      }
      else
        alert('Introduzca un valor válido.');
    break;
    //Fuerzas puntuales en barras
    case 8:
      var barsForces = $mNumberOfBarsPunctualForces.val();
      if (barsForces != '' && isInteger(barsForces)) {
        $('#main-modal').modal('hide');
        $numberOfBarsPunctualForces.val(barsForces);
        html = '<p>D es la distancia del punto inicial de la barra al punto de aplicación de la fuerza.</p>';
        html += createBarsPunctualForcesTable(barsForces);
        $barsPunctualForcesTableContainer.html(html);
      }
      else
        alert('Introduzca un valor válido.');
    break;

    default:
      $('#main-modal').modal('hide');

  }
}

function createRowNodestable(index, calculationType) {
  html = '<tr>' +
            '<th scope="row">' + index + '</th>' +
            '<td><input type="text" class="x"></td>' +
            '<td><input type="text" class="y"></td>';

  if (calculationType === '2' || calculationType === '3' || calculationType === '5')
    html += '<td><input type="text" class="z"></td>';

  html += '</tr>';

  return html;
}

function createNodesTable(nodes) {

  var calculationType = $calculationType.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '2' || calculationType === '3' || calculationType === '5')
    html += '<th scope="col" colspan="3" class="text-center">Coordenadas</th>';
  else
    html += '<th scope="col" colspan="2" class="text-center">Coordenadas</th>';

  html += '</tr>' +
  '<tr>' +
  '<th scope="col"># Nodo</th>' +
  '<th scope="col">X</th>' +
  '<th scope="col">Y</th>';

  if (calculationType === '2' || calculationType === '3' || calculationType === '5')
    html += '<th scope="col">Z</th>';

  html += '</tr>' +
        '</thead>' +
        '<tbody>';

  for (var i = 1; i <= nodes; i++)
    html += createRowNodestable(i, calculationType);

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createRowBarsTable(index, calculationType, sHtmlIni, sHtmlFin) {

  html = '<tr>' +
            '<th scope="row">' + index + '</th>' +
            '<td>' + sHtmlIni + '</td>' +
            '<td>' + sHtmlFin + '</td>';

  if (index === 1) {

    html += '<td>' +
          '<input type="text" class="area">' +
          '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(1)">Aplicar a todo</button>' +
          '</td>' +
          '<td>' +
          '<input type="text" class="elasticity">' +
          '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(2)">Aplicar a todo</button>' +
          '</td>';

    if (calculationType === '4')
      html += '<td>' +
            '<input type="text" class="i">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(3)">Aplicar a todo</button>' +
            '</td>' +
            '<td>' +
            '<input type="text" class="c">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(4)">Aplicar a todo</button>' +
            '</td>';

    if (calculationType === '3' || calculationType === '5')
      html += '<td>' +
            '<input type="text" class="i">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(3)">Aplicar a todo</button>' +
            '</td>' +
            '<td>' +
            '<input type="text" class="g">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(5)">Aplicar a todo</button>' +
            '</td>' +
            '<td>' +
            '<input type="text" class="j">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(6)">Aplicar a todo</button>' +
            '</td>' +
            '<td>' +
            '<input type="text" class="c">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(4)">Aplicar a todo</button>' +
            '</td>';
  }
  else {

    html += '<td><input type="text" class="area"></td>' +
          '<td><input type="text" class="elasticity"></td>';

    if (calculationType === '4')
      html += '<td><input type="text" class="i"></td>' +
            '<td><input type="text" class="c"></td>';

    if (calculationType === '3' || calculationType === '5')
      html += '<td><input type="text" class="i"></td>' +
            '<td><input type="text" class="g"></td>' +
            '<td><input type="text" class="j"></td>' +
            '<td><input type="text" class="c"></td>';
  }

  html += '</tr>';

  return html;
}

function createBarsTable(bars) {

  var calculationType = $calculationType.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="2" class="text-center">Dirección</th>' +
            '<th scope="col"></th>' +
            '<th scope="col"></th>';

  //Marco plano
  if (calculationType === '4')
    html += '<th scope="col"></th>' +
            '<th scope="col"></th>';

  //Retícula y Marco 3d
  if (calculationType === '3' || calculationType === '5')
    html += '<th scope="col"></th>' +
            '<th scope="col"></th>' +
            '<th scope="col"></th>' +
            '<th scope="col"></th>';

  html += '</tr>' +
          '<tr>' +
          '<th scope="col"># Barra</th>' +
          '<th scope="col">Nodo inicial</th>' +
          '<th scope="col">Nodo final</th>' +
          '<th scope="col">Área (cm<sup>2</sup>)</th>' +
          '<th scope="col">Elasticidad (ton/cm<sup>2</sup>)</th>';

  //Marco plano
  if (calculationType === '4')
    html += '<th scope="col">I (cm<sup>4</sup>)</th>' +
      '<th scope="col">C</th>';

  //Retícula y Marco 3d
  if (calculationType === '3' || calculationType === '5')
    html += '<th scope="col">I (cm<sup>4</sup>)</th>' +
      '<th scope="col">G (ton/cm<sup>2</sup>)</th>' +
      '<th scope="col">J (cm<sup>4</sup>)</th>' +
      '<th scope="col">C</th>';

  html += '</tr>' +
          '</thead>' +
          '<tbody>';

  var sHtmlIni = getSelectNodesHtml('ini', true);
  var sHtmlFin = getSelectNodesHtml('fin', true);

  for (var i = 1; i <= bars; i++)
    html += createRowBarsTable(i, calculationType, sHtmlIni, sHtmlFin);

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createRowSupportsTable(shtml, calculationType) {

  var html = '<tr>' +
        '<th scope="row">' + shtml + '</th>';

  if (calculationType === '1' || calculationType === '2' || calculationType === '4' || calculationType === '5')
    html += '<td>' +
            '<div class="form-check">' +
            '<input class="form-check-input rlx" type="checkbox">' +
            '</div>' +
            '</td>' +
            '<td>' +
            '<div class="form-check">' +
            '<input class="form-check-input rly" type="checkbox">' +
            '</div>' +
            '</td>';

  if (calculationType === '2' || calculationType === '3' || calculationType === '5')
    html += '<td>' +
          '<div class="form-check">' +
          '<input class="form-check-input rlz" type="checkbox">' +
          '</div>' +
          '</td>';

  if (calculationType === '4')
    html += '<td>' +
          '<div class="form-check">' +
          '<input class="form-check-input rrz" type="checkbox">' +
          '</div>' +
          '</td>';

  if (calculationType === '3' || calculationType === '5')
    html += '<td>' +
          '<div class="form-check">' +
          '<input class="form-check-input rrx" type="checkbox">' +
          '</div>' +
          '</td>' +
          '<td>' +
          '<div class="form-check">' +
          '<input class="form-check-input rry" type="checkbox">' +
          '</div>' +
          '</td>';

  if (calculationType === '5')
    html += '<td>' +
    '<div class="form-check">' +
    '<input class="form-check-input rrz" type="checkbox">' +
    '</div>' +
    '</td>';

  html += '</tr>';

  return html;
}

function createSupportsTable(supports) {

  var calculationType = $calculationType.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '2')
    html += '<th scope="col" colspan="3" class="text-center">Tipos de restricción</th>';
  else
    html += '<th scope="col" colspan="2" class="text-center">Tipos de restricción</th>';

  html += '</tr>' +
        '<tr>' +
        '<th scope="col"># Nodo</th>' +
        '<th scope="col">En X (Δx=0)</th>' +
        '<th scope="col">En Y (Δy=0)</th>';

  if (calculationType === '2')
    html += '<th scope="col">En Z (Δz=0)</th>';

  html += '</tr>' +
        '</thead>' +
        '<tbody>';

  var shtml = getSelectNodesHtml('support', true);

  for (var i = 1; i <= supports; i++)
    html += createRowSupportsTable(shtml, calculationType);

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createReticulaSupportsTable(supports) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="3" class="text-center">Tipos de restricción</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col">Desplazamiento lineal</th>' +
            '<th scope="col" colspan="2">Desplazamientos rotacionales</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"># Nodo</th>' +
            '<th scope="col">En Z (Δz=0)</th>' +
            '<th scope="col">En X (Θx=0)</th>' +
            '<th scope="col">En Y (Θy=0)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectNodesHtml('support', true);

  for (var i = 1; i <= supports; i++)
    html += createRowSupportsTable(shtml, '3');

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createMarcoPlanoSupportsTable(supports) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="3" class="text-center">Tipos de restricción</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="2">Desplazamientos lineales</th>' +
            '<th scope="col">Desplazamientos rotacionales</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"># Nodo</th>' +
            '<th scope="col">En X (Δx=0)</th>' +
            '<th scope="col">En Y (Δy=0)</th>' +
            '<th scope="col">En Z (Θz=0)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectNodesHtml('support', true);

  for (var i = 1; i <= supports; i++)
    html += createRowSupportsTable(shtml, '4');

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createMarco3dSupportsTable(supports) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="6" class="text-center">Tipos de restricción</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="3">Desplazamientos lineales</th>' +
            '<th scope="col" colspan="3">Desplazamientos rotacionales</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"># Nodo</th>' +
            '<th scope="col">En X (Δx=0)</th>' +
            '<th scope="col">En Y (Δy=0)</th>' +
            '<th scope="col">En Z (Δz=0)</th>' +
            '<th scope="col">En X (Θx=0)</th>' +
            '<th scope="col">En Y (Θy=0)</th>' +
            '<th scope="col">En Z (Θz=0)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectNodesHtml('support', true);

  for (var i = 1; i <= supports; i++)
    html += createRowSupportsTable(shtml, '5');

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createNodesForcesTable(nodesForces) {

  var calculationType = $calculationType.val();
  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '2')
    html += '<th scope="col" colspan="3" class="text-center">Dirección de las fuerzas</th>';
  else
    html += '<th scope="col" colspan="2" class="text-center">Dirección de las fuerzas</th>';

  html += '</tr>' +
        '<tr>' +
        '<th scope="col"># Nodo</th>' +
        '<th scope="col">Fx (ton)</th>' +
        '<th scope="col">Fy (ton)</th>';

  if (calculationType === '2')
    html += '<th scope="col">Fz (ton)</th>';

  html += '</tr>' +
        '</thead>' +
        '<tbody>';

  var shtml = getSelectNodesHtml('', true);

  for (var i = 1; i <= nodesForces; i++)
    html += createRowNodesForcesTable(shtml, calculationType);

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createReticulaNodesForcesTable(nodesForces) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="3" class="text-center">Dirección de las fuerzas</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col">' +
            '</th>' +
            '<th scope="col">Fuerzas lineales (Puntuales)</th>' +
            '<th scope="col" colspan="2">Fuerzas rotacionales (Momentos)</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"># Nodo</th>' +
            '<th scope="col">Fz (ton)</th>' +
            '<th scope="col">Mx (ton-m)</th>' +
            '<th scope="col">My (ton-m)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectNodesHtml('', true);

  for (var i = 1; i <= nodesForces; i++)
    html += createRowNodesForcesTable(shtml, '3');

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createMarcoPlanoNodesForcesTable(nodesForces) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="3" class="text-center">Dirección de las fuerzas</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col">' +
            '</th>' +
            '<th scope="col" colspan="2">Fuerzas lineales (Puntuales)</th>' +
            '<th scope="col">Fuerzas rotacionales (Momentos)</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"># Nodo</th>' +
            '<th scope="col">Fx (ton)</th>' +
            '<th scope="col">Fy (ton)</th>' +
            '<th scope="col">Mz (ton-m)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectNodesHtml('', true);

  for (var i = 1; i <= nodesForces; i++)
    html += createRowNodesForcesTable(shtml, '4');

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createRowNodesForcesTable(shtml, calculationType) {

  html = '<tr>' +
        '<th scope="row">' + shtml + '</th>';

  if (calculationType === '1' || calculationType === '2' || calculationType === '4' || calculationType === '5')
      html +='<td><input type="text" class="fx"></td>' +
        '<td><input type="text" class="fy"></td>';

  if (calculationType === '2' || calculationType === '3' || calculationType === '5')
    html += '<td><input type="text" class="fz"></td>';

  if (calculationType === '4')
    html += '<td><input type="text" class="mz"></td>';

  if (calculationType === '3' || calculationType === '5')
    html += '<td><input type="text" class="mx"></td>' +
        '<td><input type="text" class="my"></td>';

  if (calculationType === '5')
    html += '<td><input type="text" class="mz"></td>';

  html += '</tr>';

  return html;
}

function createMarco3dNodesForcesTable(nodesForces) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="6" class="text-center">Dirección de las fuerzas</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col">' +
            '</th>' +
            '<th scope="col" colspan="3">Fuerzas lineales (Puntuales)</th>' +
            '<th scope="col" colspan="3">Fuerzas rotacionales (Momentos)</th>' +
            '</tr>' +
            '<tr>' +
            '<th scope="col"># Nodo</th>' +
            '<th scope="col">Fx (ton)</th>' +
            '<th scope="col">Fy (ton)</th>' +
            '<th scope="col">Fz (ton)</th>' +
            '<th scope="col">Mx (ton/m)</th>' +
            '<th scope="col">My (ton/m)</th>' +
            '<th scope="col">Mz (ton/m)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectNodesHtml('', true);

  for (var i = 1; i <= nodesForces; i++)
    html += createRowNodesForcesTable(shtml, '5');

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createBarsDefectsTable(barsDefects) {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"># Barra</th>' +
            '<th scope="col">Alargamiento o acortamiento (cm)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var shtml = getSelectBarsHtml();

  for (var i = 1; i <= barsDefects; i++) {
    html += '<tr>' +
            '<th scope="row">' + shtml + '</th>' +
            '<td><input type="text"></td>' +
            '</tr>';
  }

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createSettlementsTable(settlements) {

  var calculationType = $calculationType.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '2')
    html += '<th scope="col" colspan="3" class="text-center">Asentamiento en</th>';
  else
    html += '<th scope="col" colspan="2" class="text-center">Asentamiento en</th>';

  html += '</tr>' +
        '<tr>' +
        '<th scope="col"># Apoyo</th>' +
        '<th scope="col">X (cm)</th>' +
        '<th scope="col">Y (cm)</th>';

  if (calculationType === '2')
    html += '<th scope="col">Z (cm)</th>';

  html += '</tr>' +
        '</thead>' +
        '<tbody>';

  var shtml = getSelectSupportsHtml();

  for (var i = 1; i <= settlements; i++) {
    html += '<tr>' +
            '<th scope="row">' + shtml + '</th>' +
            '<td><input type="text" class="sx"></td>' +
            '<td><input type="text" class="sy"></td>';

    if (calculationType === '2')
      html += '<td><input type="text" class="sz"></td>';

    html += '</tr>';
  }

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createRowBarDistributedForcesTable(shtml) {
  var calculationType = $calculationType.val();

  html = '<tr>' +
        '<th scope="row">' + shtml + '</th>';

  if (calculationType === '4' || calculationType === '5') {
      html += '<td><input type="text" class="wx"></td>' +
            '<td><input type="text" class="wy"></td>';
  }

  if (calculationType != '4') {
      html += '<td><input type="text" class="wz"></td>' +
            '</tr>';
  }

  return html;
}

function createBarsDistributedForcesTable(barsForces) {

  var calculationType = $calculationType.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '4' || calculationType === '5')
    html += '<th scope="col" colspan="3" class="text-center">Dirección de las fuerzas uniformemente repartidas</th>';
  else
    html += '<th scope="col" class="text-center">Fuerza uniformemente repartida</th>';

  html += '</tr>' +
        '<tr>' +
        '<th scope="col"># Barra</th>';

  if (calculationType === '4' || calculationType === '5')
  {
      html += '<th scope="col">Wx (ton/m)</th>' +
            '<th scope="col">Wy (ton/m)</th>';
  }

  if(calculationType != '4' )
  {
      html += '<th scope="col">Wz (ton/m)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';
  }

  var shtml = getSelectBarsHtml('', true);

  for (var i = 1; i <= barsForces; i++)
    html += createRowBarDistributedForcesTable(shtml);

  html += '</tbody>' +
          '</table> ';

  return html;
}

function createRowBarPunctualForcesTable(shtml, index) {
  var calculationType = $calculationType.val();
  index--;
  if (calculationType === '5') {
    html = '<tr>' +
        '<th scope="row">' + shtml + '</th>' +
        '<th scope="row">P</th>' +
        '<td><input type="text" class="ppx"></td>' +
        '<td><input type="text" class="ppy"></td>' +
        '<td><input type="text" class="ppz"></td>' +
        '<td><input type="text" class="pmx"></td>' +
        '<td><input type="text" class="pmy"></td>' +
        '<td><input type="text" class="pmz"></td>' +
        '</tr>' +
        '<tr>' +
        '<td></td>' +
        '<th scope="col">D (m)</th>' +
        '<td>' +
        '<input type="text" class="dpx">' +
        '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(7, ' + index +')">Aplicar a todo</button>' +
        '</td>' +
        '<td><input type="text" class="dpy"></td>' +
        '<td><input type="text" class="dpz"></td>' +
        '<td><input type="text" class="dmx"></td>' +
        '<td><input type="text" class="dmy"></td>' +
        '<td><input type="text" class="dmz"></td>' +
        '</tr>';
  }
  else {
    html = '<tr>' +
        '<th scope="row">' + shtml + '</th>' +
        '<th scope="row">P</th>' +
        '<td><input type="text" class="ppz"></td>' +
        '<td><input type="text" class="pmx"></td>' +
        '<td><input type="text" class="pmy"></td>' +
        '</tr>' +
        '<tr>' +
        '<td></td>' +
        '<th scope="col">D (m)</th>' +
        '<td>' +
        '<input type="text" class="dpz">' +
        '<button type="button" class="btn btn-sm btn-outline-secondary btn-table" onclick="applyValue(8, ' + index +')">Aplicar a todo</button>' +
        '</td>' +
        '<td><input type="text" class="dmx"></td>' +
        '<td><input type="text" class="dmy"></td>' +
        '</tr>';
  }

  return html;
}

function createBarsPunctualForcesTable(barsForces) {

  var calculationType = $calculationType.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '5')
    html += '<th scope="col" colspan="7" class="text-center">Dirección de las fuerzas puntuales</th>';
  else
    html += '<th scope="col" colspan="4" class="text-center">Dirección de las fuerzas puntuales</th>';

  html += '</tr>' +
          '<tr>' +
          '<th scope="col"># Barra</th>' +
          '<th scope="col" style="min-width: 66px;"></th>';

  if (calculationType === '5')
    html += '<th scope="col">Px (ton)</th>' +
            '<th scope="col">Py (ton)</th>';

  html += '<th scope="col">Pz (ton)</th>' +
            '<th scope="col">M\'x (ton-m)</th>' +
            '<th scope="col">M\'y (ton-m)</th>';

  if (calculationType === '5')
    html += '<th scope="col">M\'z (ton-m)</th>';

  html += '</tr>' +
          '</thead>' +
          '<tbody>';

  var shtml = getSelectBarsHtml('', true);

  for (var i = 1; i <= barsForces; i++)
    html += createRowBarPunctualForcesTable(shtml, i);

  html += '</tbody>' +
          '</table> ';

  return html;
}

function getSelectNodesHtml(sclass, withSupports) {
  var html = '<select class="form-control ' + sclass + '">';
  var nodes = $numberOfNodes.val();

  for (var i = 1; i <= nodes; i++) {

    index = supports.indexOf(i);
    if (withSupports || (!withSupports && index === -1))
      html += '<option val="' + i + '">' + i + '</option>';
  }
  html += '</select>';

  return html;
}

function getSelectBarsHtml() {
  var html = '<select class="form-control">';
  var bars = $numberOfBars.val();

  for (var i = 1; i <= bars; i++) {
    html += '<option val="' + i + '">' + i + '</option>';
  }
  html += '</select>';

  return html;
}

function getSelectSupportsHtml() {

  var html = '<select class="form-control">';
  var supports = $('select.support');

  for (var i = 0; i < supports.length; i++) {
    node = $(supports[i]).val();
    html += '<option val="' + node + '">' + node + '</option>';
  }
  html += '</select>';

  return html;
}

function addRow(type) {
  var html = '';
  var calculationType = $calculationType.val();

  switch (type) {
    //Nodos
    case 1:
      var nodes = parseInt($numberOfNodes.val());
      nodes++;
      $numberOfNodes.val(nodes);
      html = createRowNodestable(nodes, calculationType);
      $('#nodes-table-container table tbody').append(html);
    break;
    //Barras
    case 2:
      var bars = parseInt($numberOfBars.val());
      bars++;
      $numberOfBars.val(bars);
      var sHtmlIni = getSelectNodesHtml('ini', true);
      var sHtmlFin = getSelectNodesHtml('fin', true);
      html = createRowBarsTable(bars, calculationType, sHtmlIni, sHtmlFin);
      $('#bars-table-container table tbody').append(html);
    break;
    //Apoyos
    case 3:
      var supports = parseInt($numberOfSupports.val());
      supports++;
      $numberOfSupports.val(supports);
      var shtml = getSelectNodesHtml('support', true);
      html = createRowSupportsTable(shtml, calculationType);
      $('#supports-table-container table tbody').append(html);
    break;
    //Fuerzas en nodos
    case 4:
      var nodesForces = parseInt($numberOfNodesForces.val());
      nodesForces++;
      $numberOfNodesForces.val(nodesForces);
      var shtml = getSelectNodesHtml('', true);
      html = createRowNodesForcesTable(shtml, calculationType);
      $('#nodes-forces-table-container table tbody').append(html);
    break;
    //Defectos
    case 5:
      var barsDefects = parseInt($numberOfBarsDefects.val());
      barsDefects++;
      $numberOfBarsDefects.val(barsDefects);
      var shtml = getSelectBarsHtml();
      html = '<tr>' +
            '<th scope="row">' + shtml + '</th>' +
            '<td><input type="text"></td>' +
            '</tr>';
      $('#bars-defects-table-container table tbody').append(html);
    break;
    //Asentamientos
    case 6:
      var settlements = parseInt($numberOfSettlements.val());
      var supports = parseInt($numberOfSupports.val());

      settlements++;
      if (settlements <= supports) {

        $numberOfSettlements.val(settlements);

        var shtml = getSelectSupportsHtml();
        html = '<tr>' +
              '<th scope="row">' + shtml + '</th>' +
              '<td><input type="text" class="sx"></td>' +
              '<td><input type="text" class="sy"></td>';

        if (calculationType === '2')
          html += '<td><input type="text" class="sz"></td>';

        html += '</tr>';

        $('#settlements-table-container table tbody').append(html);
      }
      else {
        alert('El valor dado es mayor que el número de apoyos existentes.');
      }
    break;
    case 7:
      var barsForces = parseInt($numberOfBarsDistributedForces.val());
      barsForces++;
      $numberOfBarsDistributedForces.val(barsForces);
      var shtml = getSelectBarsHtml();
      html = createRowBarDistributedForcesTable(shtml, barsForces);
      $('#bars-distributed-forces-table-container table tbody').append(html);
    break;
    case 8:
      var barsForces = parseInt($numberOfBarsPunctualForces.val());
      barsForces++;
      $numberOfBarsPunctualForces.val(barsForces);
      html = createRowBarPunctualForcesTable(barsForces, barsForces);
      $('#bars-punctual-forces-table-container table tbody').append(html);
    break;
  }
}

function clearTable(type) {
  var inputs = [];
  var selects = [];

  switch (type) {
    case 1:
      inputs = $('#nodes-table-container input');
    break;
    case 2:
      inputs = $('#bars-table-container input');
      selects = $('#bars-table-container select');
    break;
    case 3:
      inputs = $('#supports-table-container input');
      selects = $('#supports-table-container select');
    break;

  }

  inputs.val('');
  if (selects.length > 0)
    selects.val('1');
}

function applyValue(type, index) {
  var inputs = [];

  switch (type) {
    case 1:
      inputs = $('input.area');
    break;
    case 2:
      inputs = $('input.elasticity');
    break;
    case 3:
      inputs = $('input.i');
    break;
    case 4:
      inputs = $('input.c');
    break;
    case 5:
      inputs = $('input.g');
    break;
    case 6:
      inputs = $('input.j');
    break;

    case 7:
      inputsdpx = $('input.dpx');
      inputsdpy = $('input.dpy');
      inputsdpz = $('input.dpz');
      inputsdmx = $('input.dmx');
      inputsdmy = $('input.dmy');
      inputsdmz = $('input.dmz');
      inputs.push(inputsdpx[index]);
      inputs.push(inputsdpy[index]);
      inputs.push(inputsdpz[index]);
      inputs.push(inputsdmx[index]);
      inputs.push(inputsdmy[index]);
      inputs.push(inputsdmz[index]);
    break;

    case 8:
      inputsdpz = $('input.dpz');
      inputsdmx = $('input.dmx');
      inputsdmy = $('input.dmy');
      inputs.push(inputsdpz[index]);
      inputs.push(inputsdmx[index]);
      inputs.push(inputsdmy[index]);
    break;
  }

  var val = $(inputs[0]).val();
  $(inputs).val(val);
}

/*************************************************************************************************
 *                                    VALIDACIONES
 *************************************************************************************************/

function isDecimalPositive(value) {
  return /^\d*\.?\d*$/.test(value);
}

function isDecimal(value) {
  var re = new RegExp('^-?\\d{1,9}(\\.\\d{1,3})?$');
  return re.test(value);
}

function isInteger(value) {
  return /^([0-9])*$/.test(value);
}

/*************************************************************************************************
 *                                   RESULTADOS
 *************************************************************************************************/

function createDisplacementTable() {
  var calculationType = $calculationType.val();
  var size = $numberOfNodes.val();

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"></th>';

  if (calculationType === '2')
    html += '<th scope="col" colspan="3" class="text-center">Desplazamientos en</th>';
  else
    html += '<th scope="col" colspan="2" class="text-center">Desplazamientos en</th>';

  html += '</tr>' +
        '<tr>' +
        '<th scope="col"># Nodo</th>' +
        '<th scope="col">X (cm)</th>' +
        '<th scope="col">Y (cm)</th>';

  if (calculationType === '2')
    html += '<th scope="col">Z (cm)</th>';

  html += '</tr>' +
        '</thead>' +
        '<tbody>';

  for (var i = 1; i <= size; i++) {

    index = supports.indexOf(i);
    //Si el nodo no es un apoyo
    if (index === -1) {
      j = i - 1;
      indexF = (calculationType === '2') ? j * 3 : j * 2;
      dx = round(d[indexF][0], 3);
      dy = round(d[indexF + 1][0], 3);
      if (calculationType === '2')
        dz = round(d[indexF + 2][0], 3);

      html += '<tr>' +
            '<th scope="row">' + i + '</th>' +
            '<td>' + dx + '</td>' +
            '<td>' + dy + '</td>';

      if (calculationType === '2')
        html += '<td>' + dz + '</td>';

      html += '</tr>';

    }
  }

  html += '</tbody>' +
          '</table> ';

  $displacementTableContainer.html(html);
}

function createElongationTable() {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"># Barra</th>' +
            '<th scope="col">Alargamiento (cm)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var size = $numberOfBars.val();

  for (var i = 1; i <= size; i++) {

    val = round(e[i - 1], 3);
    html += '<tr>' +
            '<th scope="row">' + i + '</th>' +
            '<td>' + val + '</td>'
            '</tr>';
  }

  html += '</tbody>' +
          '</table> ';

  $elongationTableContainer.html(html);
}

function createAxialForceTable() {

  var html = '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th scope="col"># Barra</th>' +
            '<th scope="col">Fuerza axial (ton)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  var size = $numberOfBars.val();

  for (var i = 1; i <= size; i++) {

    val = round(P[i - 1], 3);
    html += '<tr>' +
            '<th scope="row">' + i + '</th>' +
            '<td>' + val + '</td>'
            '</tr>';
  }

  html += '</tbody>' +
          '</table> ';

  $axialForceTableContainer.html(html);
}

function createResReticulaTable() {

  var bars = parseInt($numberOfBars.val());

  var html = '<table class="table table-bordered">' +
            '<thead>' +

            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="6" class="text-center">Tabla de Resultados</th>' +
            '</tr>' +

            '<tr>' +
            '<th scope="col">Barra</th>' +
            '<th scope="col">Momento Torsionante (Mt)</th>' +
            '<th scope="col">Momento Flector (Mf)</th>' +
            '<th scope="col">Fuerza Cortante (V)</th>' +
            '<th scope="col">Momento Torsionante (Mt)</th>' +
            '<th scope="col">Momento Flector (Mf)</th>' +
            '<th scope="col">Fuerza Cortante (V)</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

  for (var i = 0; i < bars; i++) {

    posIniF2 = i * 6;
    number = i + 1;

    html += '<tr>' +
            '<th scope="row">' + number + '</th>' +
            '<td>' + round(F2[posIniF2][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 1][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 2][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 3][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 4][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 5][0], 3) + '</td>' +
            '</tr>' +

            '<tr>' +
            '<th scope="row"></th>' +
            '<td colspan="3">Nodo ' + barsIni[i] + '</td>' +
            '<td colspan="3">Nodo ' + barsFin[i] + '</td>' +
            '</tr>'
            ;
  }

  html += '</tbody>' +
          '</table> ';

  $('#r-res-table-container').html(html);
}

function createResMarcoPlanoTable() {

  var bars = parseInt($numberOfBars.val());

  var html = '<table class="table table-bordered">' +
            '<thead>' +

            '<tr>' +
            '<th scope="col"></th>' +
            '<th scope="col" colspan="6" class="text-center">Tabla de Resultados</th>' +
            '</tr>' +

            '<tr>' +
            '<th scope="col">Barra</th>' +
            '<th scope="col">Fuerza Normal (N)</th>' +
            '<th scope="col">Fuerza Cortante (V)</th>' +
            '<th scope="col">Momento Flector (Mz)</th>' +
            '<th scope="col">Fuerza Normal (N)</th>' +
            '<th scope="col">Fuerza Cortante (V)</th>' +
            '<th scope="col">Momento Flector (Mz)</th>' +
            '</tr>' +

            '</thead>' +
            '<tbody>';

  for (var i = 0; i < bars; i++) {

    posIniF2 = i * 6;
    number = i + 1;

    html += '<tr>' +
            '<th scope="row">' + number + '</th>' +
            '<td>' + round(F2[posIniF2][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 1][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 2][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 3][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 4][0], 3) + '</td>' +
            '<td>' + round(F2[posIniF2 + 5][0], 3) + '</td>' +
            '</tr>' +

            '<tr>' +
            '<th scope="row"></th>' +
            '<td colspan="3">Nodo ' + barsIni[i] + '</td>' +
            '<td colspan="3">Nodo ' + barsFin[i] + '</td>' +
            '</tr>'
            ;
  }

  html += '</tbody>' +
          '</table> ';

  $('#mp-res-table-container').html(html);
}

/*************************************************************************************************
 *                                   NAVEGACIÓN
 *************************************************************************************************/

function goIndex() {
  window.location.replace("index.html");
}

