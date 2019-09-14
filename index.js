var populationSize = 10;
var proteinLength = 64;
var eliteRate = 10;
var crossOverRate = 80;
var mutationRate = 5;

$(document).ready(function() {
  main();
});

function main() {
  label = generateRandomPopulation(proteinLength);
  population = getPopulation(populationSize, proteinLength, label);
  sortedPopulation = population.sort(sortPopulation);

  if (sortedPopulation) {
    crossedOverPop = generateSecondPopulationAfterCrossover(eliteRate, crossOverRate, populationSize, sortedPopulation, label, proteinLength);
    sortedCrossedOver = crossedOverPop.sort(sortPopulation);
    mutatePopu = sortedPopulation.slice((mutationRate / 100) * populationSize);
    console.log(mutatePopu);
    mutatedPopulation = generateSecondPopulationAfterMutation(mutatePopu, mutationRate, label);
    // Plot the graph
    colors = getColorsForProtein(sortedCrossedOver[0].label);
    plotGraph([sortedCrossedOver[0].X, sortedCrossedOver[0].Y], colors, sortedCrossedOver[0].label);
  }
}

function getPopulation(populationSize, proteinLength, label) {
  var population = [];
  for (pop = 0; pop < populationSize; pop++) {
    var collision = true;
    var coordinates;
    while (collision) {
      coordinates = getRandomOrientation(proteinLength);
      coordPair = getXYCoordinatesWithoutLabels(coordinates[0], coordinates[1]);
      duplicate = findDuplicate(coordPair);
      if (typeof duplicate == 'undefined') {
        break;
      }
    }
    fitness = computeFitness(coordinates[0], coordinates[1], label);
    individualPopulation = {};
    individualPopulation['X'] = coordinates[0];
    individualPopulation['Y'] = coordinates[1];
    individualPopulation['label'] = label;
    individualPopulation['fitness'] = fitness;
    individualPopulation['XY'] = getXYCoordinatesWithLabels(coordinates[0], coordinates[1], label);
    population.push(individualPopulation);
  }
  return population;
  // return new Promise((resolve, reject) => {
  //   resolve(population);
  // });
}

function getRandomOrientation(proteinLength) {
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

function generateSecondPopulationAfterCrossover(eliteRate, crossOverRate, populationSize, population1, label, proteinLength) {
  population2 = [];
  elitPopulation = getElitePopulation(eliteRate, populationSize, population1);
  totalFitnessScore = getSumOfAllFitness(population1);
  crossOverLoopLimit = (crossOverRate / 100) * populationSize;
  var newCrossedOverPopulation = [];
  for (cross = 0; cross < crossOverLoopLimit; cross++) {
    rouletteSelection1 = rouletteWheelSelection(population1, totalFitnessScore);
    rouletteSelection2 = rouletteWheelSelection(population1, totalFitnessScore);
    crossedOverPopulation = doCrossOver(rouletteSelection1, rouletteSelection2);
    if (crossedOverPopulation.length > 0) {
      crossedOverPopulation.forEach((val, i) => {
        newCrossedOverPopulation.push(val);
      });
    }
  }
  newCrossedOverPopulation = newCrossedOverPopulation.map((value) => {
    X = [];
    Y = [];
    test = [];
    for (v = 0; v < value.length; v++) {
      X[v] = value[v][0];
      Y[v] = value[v][1];
    }
    return { X: X, Y: Y, label: label, fitness: computeFitness(X, Y, label), XY: getXYCoordinatesWithLabels(X, Y, label) };
  });
  sortNewCrossedOverPopulation = newCrossedOverPopulation.sort(sortPopulation);
  crossedOverPopu = sortNewCrossedOverPopulation.slice(0, crossOverLoopLimit);
  addRandomPopRate = 100 - eliteRate - crossOverRate;
  noOfRandomPop = (addRandomPopRate / 100) * populationSize;
  remainingRandomPopulation = getPopulation(noOfRandomPop, proteinLength, label);
  elitPopulation.forEach((elite) => {
    population2.push(elite);
  });
  crossedOverPopu.forEach((crossed) => {
    population2.push(crossed);
  });
  remainingRandomPopulation.forEach((remains) => {
    population2.push(remains);
  });
  return population2;
}

function doCrossOver(individual1, individual2) {
  randomPoint = generateRandomNumber(individual1.X.length - 1);
  XY1 = generateDirection(combineXYCoordinatesIntoArray(individual1.X, individual1.Y));
  XY2 = generateDirection(combineXYCoordinatesIntoArray(individual2.X, individual2.Y));
  XY1Left = XY1.slice(0, randomPoint);
  XY1Right = XY1.slice(randomPoint);
  XY2Left = XY2.slice(0, randomPoint);
  XY2Right = XY2.slice(randomPoint);
  angles = [90, 180, 270];
  rotation1 = [];
  rotation2 = [];
  angles.forEach((angle) => {
    rotation1.push([rotateCoordinates(XY1Right, angle)]);
    rotation2.push([rotateCoordinates(XY2Right, angle)]);
  });
  children = [];
  crossOveredChromosomes = [];
  for (rotat = 0; rotat < rotation1.length; rotat++) {
    children.push(XY1Left.concat(rotation2[rotat]));
    children.push(XY2Left.concat(rotation1[rotat]));
  }

  for (child = 0; child < children.length; child++) {
    if (checkCollison(children[child])) {
      continue;
    } else {
      crossOveredChromosomes.push(generateCoords(children[child]));
    }
  }
  return crossOveredChromosomes;
}

function generateSecondPopulationAfterMutation(population, mutationRate, label) {
  var mutateRate = Math.ceil((mutationRate / 100) * populationSize);
  var mutatedPop = [];
  popAfterRotation = [];
  population.forEach((pop) => {
    direction = generateDirection(combineXYCoordinatesIntoArray(pop.X, pop.Y));
    randomnum = generateRandomNumber(direction.length);
    directionAtRandomPt = direction.charAt(randomnum);
    nextDirection = getRandomDirection(directionAtRandomPt);
    charsBefore = direction.slice(0, randomnum);
    charsAfter = direction.slice(randomnum + 1);
    rotatedCharAfter = [];
    angles = [90, 180, 270];
    angles.forEach((angle) => {
      rotate = rotateCoordinates(charsAfter, angle);
      rotation = rotatedCharAfter.push([rotate]);
      popAfterRotation.push(charsBefore + nextDirection + rotate);
    });
  });
  for (mut = 0; mut < popAfterRotation.length; mut++) {
    if (!checkCollison(popAfterRotation[mut])) {
      mutatedPop.push(popAfterRotation[mut]);
    }
  }

  mutatedPop = mutatedPop.map((val) => {
    convertToCoord = generateCoords(val);
    X = [];
    Y = [];
    test = [];
    for (v = 0; v < convertToCoord.length; v++) {
      X[v] = convertToCoord[v][0];
      Y[v] = convertToCoord[v][1];
    }
    return { X: X, Y: Y, label: label, fitness: computeFitness(X, Y, label), XY: getXYCoordinatesWithLabels(X, Y, label) };
  });
  mutatedPop = mutatedPop.sort(sortPopulation);
  return mutatedPop.slice(0, mutateRate);
}

function getRandomDirection(dir) {
  randDir = [];
  if (dir == 'R' || dir == 'L') {
    randDir = ['U', 'D'];
  } else if (dir == 'U' || dir == 'D') {
    randDir = ['R', 'L'];
  } else {
    console.log('error');
  }
  num = Math.floor(Math.random() * 2);
  return randDir[num];
}

function checkCollison(sequence) {
  combination = generateCoords(sequence);
  XYCoordinates = [];
  for (i = 0; i < combination.length; i++) {
    XYCoordinates[i] = combination[i][0] + ',' + combination[i][1];
  }
  if (typeof findDuplicate(XYCoordinates) == 'undefined') {
    return false;
  }
  return true;
}

function rotateCoordinates(chromosomes, angle = 90) {
  str = '';
  for (chr = 0; chr < chromosomes.length; chr++) {
    if (angle == 90) {
      if (chromosomes.charAt(chr) == 'R') {
        str += 'U';
      }
      if (chromosomes.charAt(chr) == 'L') {
        str += 'D';
      }
      if (chromosomes.charAt(chr) == 'U') {
        str += 'L';
      }
      if (chromosomes.charAt(chr) == 'D') {
        str += 'R';
      }
    }
    if (angle == 180) {
      if (chromosomes.charAt(chr) == 'R') {
        str += 'L';
      }
      if (chromosomes.charAt(chr) == 'L') {
        str += 'R';
      }
      if (chromosomes.charAt(chr) == 'U') {
        str += 'D';
      }
      if (chromosomes.charAt(chr) == 'D') {
        str += 'U';
      }
    }
    if (angle == 270) {
      if (chromosomes.charAt(chr) == 'R') {
        str += 'D';
      }
      if (chromosomes.charAt(chr) == 'L') {
        str += 'U';
      }
      if (chromosomes.charAt(chr) == 'U') {
        str += 'R';
      }
      if (chromosomes.charAt(chr) == 'D') {
        str += 'L';
      }
    }
  }
  return str;
}

function generateCoords(sequence) {
  coordinates = [];
  coordinates[0] = [0, 0];
  coord = [0, 0];
  for (seq = 0; seq < sequence.length; seq++) {
    if (sequence.charAt(seq) == 'R') {
      coord[0] += 1;
    } else if (sequence.charAt(seq) == 'L') {
      coord[0] -= 1;
    } else if (sequence.charAt(seq) == 'U') {
      coord[1] += 1;
    } else if (sequence.charAt(seq) == 'D') {
      coord[1] -= 1;
    } else {
      console.log('error');
      break;
    }
    coordinates.push([coord[0], coord[1]]);
  }
  return coordinates;
}

function generateDirection(coordinates) {
  coord_0 = coordinates[0];
  sequences = '';
  for (seq = 1; seq < coordinates.length; seq++) {
    if (coordinates[seq][0] > coordinates[seq - 1][0]) {
      sequences += 'R';
    } else if (coordinates[seq][0] < coordinates[seq - 1][0]) {
      sequences += 'L';
    } else if (coordinates[seq][1] > coordinates[seq - 1][1]) {
      sequences += 'U';
    } else if (coordinates[seq][1] < coordinates[seq - 1][1]) {
      sequences += 'D';
    }
  }
  return sequences;
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
  console.log(findDuplicate(coord));
  if (typeof findDuplicate(coord) == 'undefined') {
    return { X: X1, Y: Y1 };
  }
  return true;
}

function composeCrossoverReturnStructure(X, Y, label) {
  structure = {
    X: X,
    Y: Y,
    label: label,
    fitness: computeFitness(X, Y, label),
    XY: getXYCoordinatesWithLabels(X, Y, label)
  };
  return [structure];
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
