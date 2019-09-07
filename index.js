var populationSize = 1;
var proteinLength = 10;

$(document).ready(function() {
  console.log('document loaded');

  coordinates = getRandomOrientation();
  plotGraph(coordinates);
  // var test = generateRandomPopulation(5);
  // console.log(test);
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
        flag = 1;
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
              flag = 1;
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
    }
    previousDirection = a[presentDirection];
    X[i] = X[i - 1] + Ax[presentDirection];
    Y[i] = Y[i - 1] + Ay[presentDirection];
  }
  return [X, Y];
}

function generateRandomNumber(limit) {
  return Math.floor(Math.random() * limit + 1);
}

function generateRandomPopulation(length) {
  var result = '';
  var characters = 'hp';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function plotGraph(coordinates) {
  var trace3 = {
    x: coordinates[0],
    y: coordinates[1],
    type: 'scatter',
    marker: {
      size: 14
    }
  };

  var data = [trace3];
  var layout = {};

  Plotly.newPlot('graphDiv', data, layout, { showSendToCloud: true });
}
