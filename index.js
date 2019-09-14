// Global variables
var populationSize;
var eliteRate;
var crossOverRate;
var mutationRate;
var numberOfGeneration;
var sequence;
var label;
var proteinLength;
var seriesOfSequence;

// Gets the input from the frontend
function getInputsForGA() {
  populationSize = document.getElementById('populationSize').value;
  eliteRate = document.getElementById('eliteRate').value;
  crossOverRate = document.getElementById('crossOverRate').value;
  mutationRate = document.getElementById('mutationRate').value;
  numberOfGeneration = document.getElementById('numberOfGeneration').value;
  sequenceValue = document.getElementById('sequence').value;
  fileInput = document.getElementById('fileInput').files[0];
  if (fileInput) {
    var reader = new FileReader(); // we read the file here.
    reader.readAsText(fileInput, 'UTF-8');
    reader.onload = function(evt) {
      inputSequence = readFromFile(evt.target.result.split('\n')).then((s) => {
        window.seriesOfSequence = s;
      });
    };
    reader.onerror = function(evt) {
      alert('error reading file');
    };
  } else {
    window.seriesOfSequence = [[sequenceValue]];
  }
  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  sleep(800).then(() => {
    // had to time out due to computation issue. Stall the process for sometimes so the file is read and we the sequences
    main();
  });
}

// helper function that generates the array of fitness along with their sequences if the input is a file
function readFromFile(fileContents) {
  totalProtein = fileContents[0].split('= ')[1];
  fitness = [];
  seq = [];
  fitnessAndSequence = [];
  for (i = 1; i <= totalProtein * 2; i++) {
    fitnessOrSeq = fileContents[i].split('= ')[1];
    if (i % 2) {
      //if odd
      seq.push(fitnessOrSeq);
    } else {
      fitness.push(fitnessOrSeq);
    }
  }
  for (j = 0; j < fitness.length; j++) {
    fitnessAndSequence.push([seq[j].trim(), parseInt(fitness[j], 10)]);
  }
  return new Promise((resolve, reject) => {
    resolve(fitnessAndSequence);
  });
}

// main Genetic Algorithm starts here
function main() {
  for (series = 0; series < seriesOfSequence.length; series++) {
    label = seriesOfSequence[series][0].split(''); // split the string sequence to array
    proteinLength = label.length;
    population = getPopulation(populationSize, proteinLength, label); // gets the initial population

    for (iteration = 0; iteration < numberOfGeneration; iteration++) {
      sortedPopulation = population.sort(sortPopulation); // sort the population
      var population2;
      if (sortedPopulation) {
        crossedOverPop = generateSecondPopulationAfterCrossover(eliteRate, crossOverRate, populationSize, sortedPopulation, label, proteinLength); // cross over
        sortedCrossedOver = crossedOverPop.sort(sortPopulation);
        sortedCrossedElite = sortedCrossedOver.slice(0, (eliteRate / 100) * populationSize);
        mutatePopu = sortedCrossedOver.slice((eliteRate / 100) * populationSize); //except elite population from crossover
        shufflePop = shuffle(mutatePopu); //shuffle the population so that we don't need a random number to select the mutation populaton
        getRandomPopForMutation = shufflePop.slice(0, (mutationRate / 100) * populationSize);
        var mutateLength = 0;
        while (mutateLength != (mutationRate / 100) * populationSize) {
          mutatedPopulation = mutation(getRandomPopForMutation, mutationRate, label); // mutation
          mutateLength = mutatedPopulation.length;
        }
        for (x = 0; x < mutatedPopulation.length; x++) {
          mutatePopu[x] = mutatedPopulation[x];
        }
        population2 = addEliteAndMutatedPopulation(elitPopulation, mutatePopu); // elit population from population 2 and mutated population are added
        population = population2;
      }
      console.log('Generation ' + iteration + ' Fitness: -' + population[0].fitness + ' Sequence: ' + seriesOfSequence[series][0]); // log every generation infromation
    }
    // graph plot here.
    colors = getColorsForProtein(population[0].label);
    plotGraph([population[0].X, population[0].Y], colors, population[0].label);
    console.log('--------------------------------------------Completed Sequence--------------------------------------------------------------------');
    // show the alert once a sequence is complete
    if (!seriesOfSequence[series][1]) {
      alert('Maximum Iteration reached. Calculated Fitness: -' + population[0].fitness + ' Sequence: ' + seriesOfSequence[series][0]);
    } else {
      alert('Maximum Iteration reached. Calculated Fitness: -' + population[0].fitness + ' Sequence: ' + seriesOfSequence[series][0] + ' Targeted Fitness: ' + seriesOfSequence[series][1]);
    }
  }
}

// helper function to get the initial and random population.
function getPopulation(populationSize, proteinLength, label) {
  var population = [];
  for (pop = 0; pop < populationSize; pop++) {
    var collision = true;
    var coordinates;
    while (collision) {
      coordinates = getRandomOrientation(proteinLength); //generate random valid orientation of the population
      coordPair = getXYCoordinatesWithoutLabels(coordinates[0], coordinates[1]); // helper function for structuring the population data
      duplicate = findDuplicate(coordPair); // find duplicates of the coordinates
      if (typeof duplicate == 'undefined') {
        break;
      }
    }
    fitness = computeFitness(coordinates[0], coordinates[1], label); // gets teh fiteness of each individual structure
    individualPopulation = {}; // for data structuring
    individualPopulation['X'] = coordinates[0];
    individualPopulation['Y'] = coordinates[1];
    individualPopulation['label'] = label;
    individualPopulation['fitness'] = fitness;
    individualPopulation['XY'] = getXYCoordinatesWithLabels(coordinates[0], coordinates[1], label);
    population.push(individualPopulation);
  }
  return population;
}

// helps to shuffle the give array randomly.
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// function that generates the random orientation of the population. I mostly followed Dr. Hoques code but modified according to my need.
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
  //              3
  // direction 2 <*> 1
  //              4

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

// this function does the cross over by selecting the individuals using roulette wheel selection.
function generateSecondPopulationAfterCrossover(eliteRate, crossOverRate, populationSize, population1, label, proteinLength) {
  population2 = [];
  elitPopulation = getElitePopulation(eliteRate, populationSize, population1); // function helps to get the elite population from population1
  totalFitnessScore = getSumOfAllFitness(population1); // need the total fitness for rouletteWheel
  crossOverLoopLimit = (crossOverRate / 100) * populationSize;
  var newCrossedOverPopulation = [];
  for (cross = 0; cross < crossOverLoopLimit; cross++) {
    rouletteSelection1 = rouletteWheelSelection(population1, totalFitnessScore); // select the random pop using roulette wheel
    rouletteSelection2 = rouletteWheelSelection(population1, totalFitnessScore);
    crossedOverPopulation = doCrossOver(rouletteSelection1, rouletteSelection2);
    if (crossedOverPopulation.length > 0) {
      crossedOverPopulation.forEach((val, i) => {
        newCrossedOverPopulation.push(val);
      });
    }
  }
  newCrossedOverPopulation = newCrossedOverPopulation.map((value) => {
    //structuring the coordinates in more managable format
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
  crossedOverPopu = sortNewCrossedOverPopulation.slice(0, crossOverLoopLimit); //I get all possible combinations from the crossover so I choose the best ones here
  addRandomPopRate = 100 - eliteRate - crossOverRate;
  noOfRandomPop = (addRandomPopRate / 100) * populationSize;
  elitPopulation.forEach((elite) => {
    population2.push(elite); // add elite population to population2
  });
  crossedOverPopu.forEach((crossed) => {
    population2.push(crossed); // add crossed over population to population2
  });
  remainingRandomPopulation = getPopulation(noOfRandomPop, proteinLength, label); // generate random population
  remainingRandomPopulation.forEach((remains) => {
    population2.push(remains); // remaining random population to population2
  });
  return population2;
}

// function that does the crossover. Working with coordinates got very unmanagable so I took a different approach here using direction R, L , U, D
function doCrossOver(individual1, individual2) {
  randomPoint = generateRandomNumber(individual1.X.length - 1);
  XY1 = generateDirection(combineXYCoordinatesIntoArray(individual1.X, individual1.Y)); // This functions maps my coordinates to direction in R,L,U,D format
  XY2 = generateDirection(combineXYCoordinatesIntoArray(individual2.X, individual2.Y));
  XY1Left = XY1.slice(0, randomPoint); // get first part of the individual1 at random point
  XY1Right = XY1.slice(randomPoint); // get second part of the individual1 after that point
  XY2Left = XY2.slice(0, randomPoint); // same for second as above
  XY2Right = XY2.slice(randomPoint);
  angles = [90, 180, 270];
  rotation1 = [];
  rotation2 = [];
  angles.forEach((angle) => {
    // I rotate the second part for both individuals in all directions and check combinations later so my fitness will be better
    rotation1.push([rotateCoordinates(XY1Right, angle)]);
    rotation2.push([rotateCoordinates(XY2Right, angle)]);
  });
  children = [];
  crossOveredChromosomes = [];
  for (rotat = 0; rotat < rotation1.length; rotat++) {
    // add the generated structure to another childern array
    children.push(XY1Left.concat(rotation2[rotat]));
    children.push(XY2Left.concat(rotation1[rotat]));
  }

  for (child = 0; child < children.length; child++) {
    if (checkCollison(children[child])) {
      // check if the cross over for the individual was vaild
      continue;
    } else {
      crossOveredChromosomes.push(generateCoords(children[child])); // send only those that are valid
    }
  }
  return crossOveredChromosomes;
}

// this function does the mutation of the given population
function mutation(population, mutationRate, label) {
  var mutateRate = Math.ceil((mutationRate / 100) * populationSize);
  var mutatedPop = [];
  popAfterRotation = [];
  population.forEach((pop) => {
    direction = generateDirection(combineXYCoordinatesIntoArray(pop.X, pop.Y)); // similar to cross over I use the RLUD format here as well which is much more managable
    randomnum = generateRandomNumber(direction.length);
    directionAtRandomPt = direction.charAt(randomnum); // get a random point in the sequence
    nextDirection = getRandomDirection(directionAtRandomPt); // generate next direction for that point so if my point is L it can't go R so it has to take either U or D
    charsBefore = direction.slice(0, randomnum); // get the sequence before that random point
    charsAfter = direction.slice(randomnum + 1); // get the sequence after that random point
    rotatedCharAfter = [];
    angles = [90, 180, 270];
    angles.forEach((angle) => {
      rotate = rotateCoordinates(charsAfter, angle); // rotate the sequence after the point in all directions
      rotation = rotatedCharAfter.push([rotate]);
      popAfterRotation.push(charsBefore + nextDirection + rotate);
    });
  });
  for (mut = 0; mut < popAfterRotation.length; mut++) {
    if (!checkCollison(popAfterRotation[mut])) {
      // check collison here
      mutatedPop.push(popAfterRotation[mut]);
    }
  }

  mutatedPop = mutatedPop.map((val) => {
    // compose the structure
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
  mutatedPop = mutatedPop.sort(sortPopulation); // sort the mutated population based on fitness
  return mutatedPop.slice(0, mutateRate); // send only the needed
}

// function to compute the fitness
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

// used for rotation in mutation for going in random direction
function getRandomDirection(dir) {
  randDir = [];
  if (dir == 'R' || dir == 'L') {
    randDir = ['U', 'D'];
  } else if (dir == 'U' || dir == 'D') {
    randDir = ['R', 'L'];
  }
  num = Math.floor(Math.random() * 2);
  return randDir[num];
}

// checks if the coordinates in the structure are same. if yes return true i.e collision occured
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

// used for rotating the coordinates in R< L, U, D format
function rotateCoordinates(proteinSequence, angle = 90) {
  str = '';
  for (chr = 0; chr < proteinSequence.length; chr++) {
    if (angle == 90) {
      if (proteinSequence.charAt(chr) == 'R') {
        str += 'U';
      }
      if (proteinSequence.charAt(chr) == 'L') {
        str += 'D';
      }
      if (proteinSequence.charAt(chr) == 'U') {
        str += 'L';
      }
      if (proteinSequence.charAt(chr) == 'D') {
        str += 'R';
      }
    }
    if (angle == 180) {
      if (proteinSequence.charAt(chr) == 'R') {
        str += 'L';
      }
      if (proteinSequence.charAt(chr) == 'L') {
        str += 'R';
      }
      if (proteinSequence.charAt(chr) == 'U') {
        str += 'D';
      }
      if (proteinSequence.charAt(chr) == 'D') {
        str += 'U';
      }
    }
    if (angle == 270) {
      if (proteinSequence.charAt(chr) == 'R') {
        str += 'D';
      }
      if (proteinSequence.charAt(chr) == 'L') {
        str += 'U';
      }
      if (proteinSequence.charAt(chr) == 'U') {
        str += 'R';
      }
      if (proteinSequence.charAt(chr) == 'D') {
        str += 'L';
      }
    }
  }
  return str;
}

// maps the direction to coordinates system
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
    }
    coordinates.push([coord[0], coord[1]]);
  }
  return coordinates;
}

// maps the coordinates to R, L, U , D format
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

// function that helps to check the collision in coordinate system that I used for generating random population
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

// helper function for generating the a data structure
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

// function for roulette wheel selection
function rouletteWheelSelection(genomesArr, totalFitnessScore) {
  var total = 0;
  threshold = totalFitnessScore * Math.random();
  for (var i = 0; i < genomesArr.length; i++) {
    total += genomesArr[i].fitness;
    if (total >= threshold) break;
  }
  return genomesArr[i];
}

// get the sum of all fitness
function getSumOfAllFitness(pop) {
  sum = 0;
  pop.forEach((value) => {
    sum += value.fitness;
  });
  return sum;
}

// get the elite population
function getElitePopulation(rate, populationSize, population1) {
  var elitNumber = Math.ceil((rate / 100) * populationSize);
  return population1.slice(0, elitNumber);
}

// finds duplicates in an array
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

// sorts the population based on fitness
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

// helps to add the elite and muatated population and the return the sorted population
function addEliteAndMutatedPopulation(elit, mutate) {
  pop2 = elit.forEach((val) => {
    mutate.push(val);
  });
  return mutate.sort(sortPopulation);
}

// helper function to generate the random number
function generateRandomNumber(limit) {
  return Math.floor(Math.random() * limit + 1);
}

// helper function to generate a random sequence of protein
function generateRandomPopulation(length) {
  var result = [];
  var characters = 'hp';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result[i] = characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// helper function to get the colors of h and p protein
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

// get the individual with maximum fitness
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

// helper function for getting the coordinate in a [X , Y] array with the labels
function getXYCoordinatesWithLabels(X, Y, labels) {
  coordinatesXY = {};
  for (i = 0; i < labels.length; i++) {
    coordinatesXY[X[i] + ',' + Y[i]] = [labels[i], i];
  }
  return coordinatesXY;
}

// helper function for getting the coordinate in a [X , Y] array without the labels
function getXYCoordinatesWithoutLabels(X, Y) {
  coordinatesXY = [];
  for (i = 0; i < X.length; i++) {
    coordinatesXY[i] = X[i] + ',' + Y[i];
  }
  return coordinatesXY;
}

// helper function that combines the individual X, Y coordinates into [X,Y] array
function combineXYCoordinatesIntoArray(X, Y) {
  coordinatesXY = [];
  for (i = 0; i < X.length; i++) {
    coordinatesXY[i] = [X[i], Y[i]];
  }
  return coordinatesXY;
}

// helper function that is needed by the computeFitness function to find the possible all points
function getPossibleCoordinates(X, Y) {
  return [[X, Y + 1], [X + 1, Y], [X, Y - 1], [X - 1, Y]];
}

// function that plots the graph
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
