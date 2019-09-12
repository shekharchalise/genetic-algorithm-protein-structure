var populationSize = 10;
var proteinLength = 20;
var eliteRate = 10;
var crossOverRate = 80;

$(document).ready(function() {
  main();
});

function main() {
  getPopulation(populationSize, proteinLength).then((population) => {
    sortedPopulation = population.sort(sortPopulation);
    console.log(sortedPopulation);
    console.log(sortedPopulation[0].fitness);
    if (sortedPopulation) {
      generateSecondPopulation(eliteRate, crossOverRate, populationSize, sortedPopulation);
    }
    // Plot the graph
    colors = getColorsForProtein(sortedPopulation[0].label);
    plotGraph([sortedPopulation[0].X, sortedPopulation[0].Y], colors, sortedPopulation[0].label);
  });
}

function getPopulation(populationSize, proteinLength) {
  var population = [];
  for (pop = 0; pop < populationSize; pop++) {
    var collision = true;
    var coordinates;
    while (collision) {
      coordinates = getRandomOrientation();
      coordPair = getXYCoordinatesWithoutLabels(coordinates[0], coordinates[1]);
      duplicate = findDuplicate(coordPair);
      if (typeof duplicate == 'undefined') {
        break;
      }
    }
    label = generateRandomPopulation(proteinLength);
    fitness = computeFitness(coordinates[0], coordinates[1], label);
    individualPopulation = {};
    individualPopulation['X'] = coordinates[0];
    individualPopulation['Y'] = coordinates[1];
    individualPopulation['label'] = label;
    individualPopulation['fitness'] = fitness;
    individualPopulation['XY'] = getXYCoordinatesWithLabels(coordinates[0], coordinates[1], label);
    population.push(individualPopulation);
  }
  return new Promise((resolve, reject) => {
    resolve(population);
  });
}

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

function generateSecondPopulation(eliteRate, crossOverRate, populationSize, population1) {
  population2 = getElitePopulation(eliteRate, populationSize, population1);
  totalFitnessScore = getSumOfAllFitness(population1);
  crossOverLoopLimit = ((crossOverRate / 100) * populationSize) / 2;
  var newCrossedOverPopulation = [];
  for (cross = 0; cross < crossOverLoopLimit; cross++) {
    rouletteSelection1 = rouletteWheelSelection(population1, totalFitnessScore);
    rouletteSelection2 = rouletteWheelSelection(population1, totalFitnessScore);
    crossedOverPopulation = doCrossOver(rouletteSelection1, rouletteSelection2);
    newCrossedOverPopulation = newCrossedOverPopulation.concat(crossedOverPopulation);
  }
  test = population2.concat(newCrossedOverPopulation);
  console.log(test);
}

function doCrossOver(individual1, individual2) {
  collision = true;
  randomPoint = generateRandomNumber(individual1.X.length - 1);
  XY1 = combineXYCoordinatesIntoArray(individual1.X, individual1.Y);
  XY2 = combineXYCoordinatesIntoArray(individual2.X, individual2.Y);
  // console.log(randomPoint, XY1, XY2);
  XY1Left = XY1.slice(0, randomPoint);
  XY1Right = XY1.slice(randomPoint);
  XY2Left = XY2.slice(0, randomPoint);
  XY2Right = XY2.slice(randomPoint);
  LABEL1Left = individual1.label.slice(0, randomPoint);
  LABEL1Right = individual1.label.slice(randomPoint);
  LABEL2Left = individual2.label.slice(0, randomPoint);
  LABEL2Right = individual2.label.slice(randomPoint);

  difference1 = getDifferenceBetweenCoordinates(XY1Right[0][0], XY1Right[0][1], XY2Right[0][0], XY2Right[0][1]);
  difference2 = getDifferenceBetweenCoordinates(XY2Right[0][0], XY2Right[0][1], XY1Right[0][0], XY1Right[0][1]);
  // console.log(difference1, difference2);
  newXY2Right = XY2Right.map((value) => {
    return [value[0] + difference1[0], value[1] + difference1[1]];
  });
  newXY1Right = XY1Right.map((value) => {
    return [value[0] + difference2[0], value[1] + difference2[1]];
  });
  // console.log(newXY2Right, newXY1Right);

  newLabel1 = LABEL1Left.concat(LABEL2Right);
  newLabel2 = LABEL2Left.concat(LABEL1Right);

  newIndividual1 = XY1Left.concat(newXY2Right);
  newIndividual2 = XY2Left.concat(newXY1Right);

  var ind1;
  var ind2;
  X1 = [];
  Y1 = [];
  X2 = [];
  Y2 = [];
  for (ind = 0; ind < newIndividual1.length; ind++) {
    X1[ind] = newIndividual1[ind][0];
    Y1[ind] = newIndividual1[ind][1];
    X2[ind] = newIndividual2[ind][0];
    Y2[ind] = newIndividual2[ind][1];
  }
  coordPair1 = getXYCoordinatesWithoutLabels(X1, Y1);
  coordPair2 = getXYCoordinatesWithoutLabels(X2, Y2);
  console.log(findDuplicate(coordPair1), findDuplicate(coordPair2));
  if (typeof findDuplicate(coordPair1) == 'undefined') {
    ind1 = {
      X: X1,
      Y: Y1,
      label: newLabel1,
      fitness: computeFitness(X1, Y1, newLabel1),
      XY: getXYCoordinatesWithLabels(X1, Y1, newLabel1)
    };
  } else {
    rotatenewXY2Right90 = newXY2Right.map((val) => {
      console.log(newXY2Right[0][0], newXY2Right[0][1], val[0], val[1]);
      return rotate(newXY2Right[0][0], newXY2Right[0][1], val[0], val[1], 90);
    });
    checkForCollision(XY1Left, rotatenewXY2Right90);
    console.log('rotat', rotatenewXY2Right90);
    // rotatenewXY2Right180
    // rotatenewXY2Right270
  }
  if (typeof (findDuplicate(coordPair2) == 'undefined')) {
    ind2 = {
      X: X2,
      Y: Y2,
      label: newLabel2,
      fitness: computeFitness(X2, Y2, newLabel2),
      XY: getXYCoordinatesWithLabels(X2, Y2, newLabel2)
    };
  } else {
    // rotate:
  }
  return [ind1, ind2];
}

function checkForCollision(XYLeft, XYRight) {
  X1 = [];
  Y1 = [];
  concatinate = XYLeft.concat(XYRight);
  for (ind = 0; ind < concatinate.length; ind++) {
    X1[ind] = concatinate[ind][0];
    Y1[ind] = concatinate[ind][1];
  }
  coord = getXYCoordinatesWithoutLabels(X1, Y1);
  if (typeof findDuplicate(coord) == 'undefined') {
    return { X: X1, Y: Y1 };
  }
  return true;
}

function rotate(cx, cy, x, y, angle) {
  var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [Math.round(nx), Math.round(ny)];
}

function getDifferenceBetweenCoordinates(X1, Y1, X2, Y2) {
  return [X1 - X2, Y1 - Y2];
}

function rouletteWheelSelection(genomesArr, totalFitnessScore) {
  var total = 0;
  threshold = totalFitnessScore * Math.random();
  for (var i = 0; i < genomesArr.length; i++) {
    total += genomesArr[i].fitness;
    if (total >= threshold) break;
  }
  return genomesArr[i];
}

function getSumOfAllFitness(pop) {
  sum = 0;
  pop.forEach((value) => {
    sum += value.fitness;
  });
  return sum;
}

function getElitePopulation(rate, populationSize, population1) {
  var elitNumber = Math.ceil((rate / 100) * populationSize);
  return population1.slice(0, elitNumber);
}

function findDuplicate(array) {
  var duplicate, i, j;
  for (i = 0; i < array.length - 1; i++) {
    for (j = i + 1; j < array.length; j++) {
      if (array[i] == array[j]) {
        duplicate = array[i];
        return duplicate;
      }
    }
  }
}

function sortPopulation(a, b) {
  let comparison = 0;
  const fitnessA = a.fitness;
  const fitnessB = b.fitness;

  if (fitnessA > fitnessB) {
    comparison = 1;
  } else if (fitnessA < fitnessB) {
    comparison = -1;
  }
  return comparison * -1;
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
  individualProtein = getXYCoordinatesWithLabels(X, Y, labels);
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

function getXYCoordinatesWithLabels(X, Y, labels) {
  coordinatesXY = {};
  for (i = 0; i < labels.length; i++) {
    coordinatesXY[X[i] + ',' + Y[i]] = [labels[i], i];
  }
  return coordinatesXY;
}

function getXYCoordinatesWithoutLabels(X, Y) {
  coordinatesXY = [];
  for (i = 0; i < X.length; i++) {
    coordinatesXY[i] = X[i] + ',' + Y[i];
  }
  return coordinatesXY;
}

function combineXYCoordinatesIntoArray(X, Y) {
  coordinatesXY = [];
  for (i = 0; i < X.length; i++) {
    coordinatesXY[i] = [X[i], Y[i]];
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
    // x: coordinates[0],
    // y: coordinates[1],
    x: [0, 1, 2, 3, 3, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 4, 4, 5],
    y: [0, 0, 0, 0, -1, -1, -2, -3, -3, -2, -2, -1, 0, 0, -1, -2, -3, -3, -2, -2],
    text: ['p', 'p', 'h', 'p', 'p', 'h', 'p', 'h', 'h', 'h', 'p', 'p', 'h', 'p', 'h', 'p', 'h', 'p', 'p', 'p'],
    mode: 'lines+markers+text',
    type: 'scatter',
    marker: {
      size: 20,
      color: getColorsForProtein(['p', 'p', 'h', 'p', 'p', 'h', 'p', 'h', 'h', 'h', 'p', 'p', 'h', 'p', 'h', 'p', 'h', 'p', 'p', 'p'])
    }
  };

  var data = [trace3];
  var layout = {};

  Plotly.newPlot('graphDiv', data, layout, { showSendToCloud: true });
}
