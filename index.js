var populationSize = 100;
var proteinLength = 64;
var population = [];

$(document).ready(function() {
  for (pop = 0; pop < populationSize; pop++) {
    coordinates = getRandomOrientation();
    label = generateRandomPopulation(proteinLength);
    fitness = computeFitness(coordinates[0], coordinates[1], label);
    individualPopulation = {};
    individualPopulation['X'] = coordinates[0];
    individualPopulation['Y'] = coordinates[1];
    individualPopulation['label'] = label;
    individualPopulation['fitness'] = fitness;
    population.push(individualPopulation);
  }
  fitest = getPopulationWithMaxFitness(population);
  colors = getColorsForProtein(fitest.label);
  plotGraph([fitest.X, fitest.Y], colors, fitest.label);
  console.log(fitest.fitness);
});

function getRandomOrientation() {
  var X = [];
  var Y = [];
  var newX = 0;
  var newY = 0;
  var flag = 0;

  var previousDirection = 0;
  var presentDirection = 0;
  a = [];
  Ax = [];
  Ay = [];

  validFolding = 1;
  previousDirection = 1;

  temp1 = 0;
  temp2 = 0;
  temp3 = 0;

  X[0] = 0;
  Y[0] = 0;
  X[1] = 1;
  Y[1] = 0;
  for (i = 2; i < proteinLength; i++) {
    switch (previousDirection) {
      case 1:
        a[1] = 1;
        Ax[1] = 1;
        Ay[1] = 0;
        a[2] = 3;
        Ax[2] = 0;
        Ay[2] = 1;
        a[3] = 4;
        Ax[3] = 0;
        Ay[3] = -1;
        break;
      case 2:
        a[1] = 2;
        Ax[1] = -1;
        Ay[1] = 0;
        a[2] = 3;
        Ax[2] = 0;
        Ay[2] = 1;
        a[3] = 4;
        Ax[3] = 0;
        Ay[3] = -1;
        break;
      case 3:
        a[1] = 1;
        Ax[1] = 1;
        Ay[1] = 0;
        a[2] = 2;
        Ax[2] = -1;
        Ay[2] = 0;
        a[3] = 3;
        Ax[3] = 0;
        Ay[3] = 1;
        break;
      case 4:
        a[1] = 1;
        Ax[1] = 1;
        Ay[1] = 0;
        a[2] = 2;
        Ax[2] = -1;
        Ay[2] = 0;
        a[3] = 4;
        Ax[3] = 0;
        Ay[3] = -1;
        break;
      default:
    }
    temp1 = generateRandomNumber(3);
    presentDirection = temp1;
    temp2 = 0;
    temp3 = 0;
    newX = X[i - 1] + Ax[temp1];
    newY = Y[i - 1] + Ay[temp1];
    flag = 0;

    for (j = 1; j <= i - 1; j++) {
      if (newX == X[j] && newY == Y[j]) {
        flag = 1; // goto first jump
        if (flag == 1) {
          flag = 0;
          step2 = 6 - temp1;
          switch (step2) {
            case 3:
              if (generateRandomNumber(2) == 1) {
                temp2 = 1;
              } else {
                temp2 = 2;
              }
              break;
            case 4:
              if (generateRandomNumber(2) == 1) {
                temp2 = 1;
              } else {
                temp2 = 3;
              }
              break;
            case 5:
              if (generateRandomNumber(2) == 1) {
                temp2 = 2;
              } else {
                temp2 = 3;
              }
              break;
            default:
          }
          presentDirection = temp2;
          temp3 = 6 - (temp1 + temp2);
          newX = X[i - 1] + Ax[temp2];
          newY = Y[i - 1] + Ay[temp2];

          for (j = 1; j <= i - 1; j++) {
            if (newX == X[j] && newY == Y[j]) {
              flag = 1; // goto second jump
              if (flag == 1) {
                flag = 0;
                presentDirection = temp3;
                newX = X[i - 1] + Ax[temp3];
                newY = Y[i - 1] + Ay[temp3];
                for (j = 1; j <= i - 1; j++) {
                  if (newX == X[j] && newY == Y[j]) {
                    flag = 1;
                    validFolding = 0;
                  }
                }
              }
            }
          }
        }
      }
      previousDirection = a[presentDirection];
      X[i] = X[i - 1] + Ax[presentDirection];
      Y[i] = Y[i - 1] + Ay[presentDirection];
    }
  }
  return [X, Y];
}

function generateRandomNumber(limit) {
  return Math.floor(Math.random() * limit + 1);
}

function generateRandomPopulation(length) {
  var result = [];
  var characters = 'hp';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result[i] = characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getColorsForProtein(labels) {
  colors = [];
  for (i = 0; i <= labels.length; i++) {
    if (labels[i] == 'h') {
      colors[i] = 5;
    } else {
      colors[i] = 4;
    }
  }
  return colors;
}

function computeFitness(X, Y, labels) {
  individualProtein = getXYCoordinates(X, Y, labels);
  backTraverse = {};
  counter = 0;
  for (i = 0; i < labels.length; i++) {
    if (labels[i] == 'h') {
      x = X[i];
      y = Y[i];
      cord = x + ',' + y;
      possibleNeighbors = getPossibleCoordinates(X[i], Y[i]);
      for (j = 0; j < possibleNeighbors.length; j++) {
        nx = possibleNeighbors[j][0];
        ny = possibleNeighbors[j][1];
        ncord = nx + ',' + ny;
        if (!individualProtein[ncord]) {
          continue;
        }
        if (backTraverse[ncord]) {
          continue;
        }
        if (Math.abs(individualProtein[cord][1] - individualProtein[ncord][1]) == 1) {
          continue;
        }
        if (individualProtein[ncord][0] != 'h') {
          continue;
        }
        counter++;
      }
      backTraverse[cord] = true;
    }
  }
  return counter;
}

function getPopulationWithMaxFitness(population) {
  var max = 0;
  var index = 0;
  population.forEach((value, i) => {
    if (value.fitness > max) {
      max = value.fitness;
      index = i;
    }
  });
  return population[index];
}

function getXYCoordinates(X, Y, labels) {
  coordinatesXY = {};
  for (i = 0; i < labels.length; i++) {
    coordinatesXY[X[i] + ',' + Y[i]] = [labels[i], i];
  }
  return coordinatesXY;
}

function getHydrophobicProteinCoordinates(X, Y, labels) {
  HX = [];
  HY = [];
  for (i = 0; i < labels.length; i++) {
    if (labels[i] == 'h') {
      HX.push(X[i]);
      HY.push(Y[i]);
    }
  }
  return [HX, HY];
}

function getPossibleCoordinates(X, Y) {
  return [[X, Y + 1], [X + 1, Y], [X, Y - 1], [X - 1, Y]];
}

function plotGraph(coordinates, colors, label) {
  var trace3 = {
    x: coordinates[0],
    y: coordinates[1],
    text: label,
    mode: 'lines+markers+text',
    type: 'scatter',
    marker: {
      size: 20,
      color: colors
    }
  };

  var data = [trace3];
  var layout = {};

  Plotly.newPlot('graphDiv', data, layout, { showSendToCloud: true });
}
