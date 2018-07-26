const suctionTemperature = document.getElementById("suction-temperature");
const suctionPressure = document.getElementById("suction-pressure");
const liquidTemperature = document.getElementById("liquid-temperature");
const liquidPressure = document.getElementById("liquid-pressure");

const mobileView = window.innerWidth < 768 ? true : false;

let currentData = {
  current: [
    {
      name: "Liquid Line",
      temperature: 1,
      pressure: 2
    },
    {
      name: "Suction Line",
      temperature: 3,
      pressure: 4
    }
  ]
};

const now = new Date();

let graphData = {};

const currentDiv = document.querySelector(".current-data");

//<div class="tooltip">Select data to remove</div>

currentDiv.template = `<div class="card">
      <div class="card-title">{{name}}</div>
      <div class="data-header">Temperature</div>
      <div class="data-header">Pressure</div>
      <div class="data-header">{{calculated}}</div>
      <div onclick="activeDataSets.toggleDataSet('{{idName}}Temperature', this)" 
      class="data-display selected" 
      id="{{idName}}-temperature">
        <div>
        {{temperature}}
        <span class="data-affix">°F</span>
        </div>
        <span class="check-box far fa-check-square fa-lg" />
      </div>
      <div onclick="activeDataSets.toggleDataSet('{{idName}}Pressure', this)" 
      class="data-display selected" 
      id="{{idName}}-pressure">
        <div>{{pressure}} <span class="data-affix">PSI</span></div>
        <span class="check-box far fa-check-square fa-lg" />
      </div>
      <div class="data-display"><div>?? <span class="data-affix">°{{calculated}}</span></div></div>
    </div>`;
currentDiv.render = function render(data) {
  const testArr = data.map(data => {
    data.idName = data.name.split(" ")[0].toLowerCase();
    data.calculated = data.idName === "suction" ? "Superheat" : "Subcooling";
    return this.template.replace(/\{\{\s?(\w+)\s?\}\}/g, (match, variable) => {
      return data[variable] || "??";
    });
  });

  // this.innerHTML = testArr.toString();
  this.innerHTML = "";
  testArr.forEach(data => {
    this.innerHTML += data;
  });
};

const displayCurrent = new Proxy(currentData, {
  set: (target, property, value) => {
    target[property] = value;
    currentDiv.render(currentData.current);
    return true;
  }
});

fetch("/api/current")
  .then(res => res.json())
  .then(json => {
    const formatData = [
      {
        name: "Suction Line",
        temperature: Math.round(json.suction.temperature * 10) / 10,
        pressure: Math.round(json.suction.pressure)
      },
      {
        name: "Liquid Line",
        temperature: Math.round(json.liquid.temperature * 10) / 10,
        pressure: Math.round(json.liquid.pressure)
      }
    ];
    displayCurrent.current = formatData;
  });

/////////////////
// DISPLAY GRAPH
////////////////

let timeScale = {
  dateRange: 1,
  maxDate: new Date(),
  initialize: function(date) {
    timeScale.maxDate = new Date(date);
    timeScale.update();
  },
  shiftDown: function() {
    timeScale.maxDate.setHours(timeScale.maxDate.getHours() - 1);
    timeScale.update();
  },
  shiftUp: function() {
    timeScale.maxDate.setHours(timeScale.maxDate.getHours() + 1);
    timeScale.update();
  },
  rangeDown: function() {
    timeScale.dateRange > 1 && timeScale.dateRange--;
    timeScale.update();
  },
  rangeUp: function() {
    timeScale.dateRange++;
    timeScale.update();
  },
  update: function() {
    updateGraphScale(timeScale.maxDate, timeScale.dateRange);
  }
};

const updateGraphScale = (max, range) => {
  myChart.options.scales.xAxes[0].time.max = new Date(max);

  let min = new Date(max);
  myChart.options.scales.xAxes[0].time.min = min;
  min.setHours(max.getHours() - range);

  myChart.update();
};

let activeDataSets = {
  suctionTemperature: true,
  suctionPressure: true,
  liquidTemperature: true,
  liquidPressure: true,

  toggleDataSet: (name, element) => {
    activeDataSets[name] = !activeDataSets[name];
    activeDataSets.updateActiveSets();

    const check = element.getElementsByClassName("check-box")[0];

    if (activeDataSets[name]) {
      element.classList.add("selected");
      check.classList.add("fa-check-square");
      check.classList.remove("fa-square");
    } else {
      element.classList.remove("selected");
      check.classList.remove("fa-check-square");
      check.classList.add("fa-square");
    }
  },
  updateActiveSets: () => {
    myChart.data.datasets.forEach(dataSet => {
      let labelString = dataSet.label.replace(/\s/g, "");
      labelString = labelString.charAt(0).toLowerCase() + labelString.slice(1);
      dataSet.hidden = !activeDataSets[labelString];
    });
    myChart.update();
  }
};

fetch("/api/get-data")
  .then(res => res.json())
  .then(json => {
    let testDate = new Date(json[json.length - 1].timeStamp);
    // testDate.setDate(testDate.getDate());
    // testDate = json[json.length - 1].timeStamp;
    timeScale.initialize(testDate);
    graphData = {
      suctionTemperature: formatDataLog(json, "suction", "temperature"),
      suctionPressure: formatDataLog(json, "suction", "pressure"),
      liquidTemperature: formatDataLog(json, "liquid", "temperature"),
      liquidPressure: formatDataLog(json, "liquid", "pressure")
    };
    // setTimeout(() => timeScale.shiftDown(), 5000);
    updateGraph(graphData, testDate);
  });

var timeFormat = "MM/DD/YYYY HH:mm";

function newDate(days) {
  return moment()
    .add(days, "d")
    .toDate();
}

function newDateString(days) {
  return moment()
    .add(days, "d")
    .format(timeFormat);
}

formatDataLog = (dataLog, line, type) => {
  const dataArr = dataLog.map(data => {
    return {
      x: moment(data.timeStamp).format("MM/DD/YYYY HH:mm"),
      y: data[line][type]
    };
  });
  return dataArr;
  // return dataArr.filter(data => {
  //   if (type == "temperature") {
  //     return data.y < 100;
  //   } else {
  //     return data.y < 1000;
  //   }
  // });
};

const updateGraph = (data, date) => {
  myChart.data.datasets.forEach(dataSet => {
    let labelString = dataSet.label.replace(/\s/g, "");
    labelString = labelString.charAt(0).toLowerCase() + labelString.slice(1);
    dataSet.data = data[labelString];
    dataSet.hidden = !activeDataSets[labelString];
  });
  myChart.update();
};

const lightThemeLines = "rgba(0, 0, 0, .1)";
const darkThemeLines = "rgba(255, 255, 255, .1)";
const ctx = document.getElementById("myChart");
let myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [
      // Date Objects
      // newDate(6)
    ],
    datasets: [
      {
        label: "Suction Temperature",
        lineTension: 0,
        fill: false,
        data: graphData.suctionTemperature,
        backgroundColor: ["rgba(66,134,244, 0.2)"],
        borderColor: ["rgba(66,134,244,1)"],
        borderWidth: 1,
        // borderDash: [5, 5],
        yAxisID: "temperature",
        pointRadius: 1
      },
      {
        label: "Liquid Temperature",
        lineTension: 0,
        fill: false,
        data: graphData.liquidTemperature,
        backgroundColor: ["rgba(214,8,46, 0.2)"],
        borderColor: ["rgba(214,8,46,1)"],
        borderWidth: 1,
        // borderDash: [5, 5],
        yAxisID: "temperature",
        pointRadius: 1
      },
      {
        label: "Suction Pressure",
        lineTension: 0,
        fill: false,
        data: graphData.suctionPressure,
        backgroundColor: ["rgba(66,244,223, 0.2)"],
        borderColor: ["rgba(66,244,223,1)"],
        borderWidth: 1,
        // borderDash: [5, 5],
        yAxisID: "pressure",
        pointRadius: 1
      },
      {
        label: "Liquid Pressure",
        lineTension: 0,
        fill: false,
        data: graphData.liquidPressure,
        backgroundColor: ["rgba(244, 152, 66, 0.2)"],
        borderColor: ["rgba(244, 152, 66,1)"],
        borderWidth: 1,
        // borderDash: [5, 5],
        yAxisID: "pressure",
        pointRadius: 1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    title: {
      text: "Chart.js Time Scale"
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            color: mobileView ? darkThemeLines : lightThemeLines
          },
          type: "time",
          time: {
            max: new Date(),
            // displayFormats: {
            //   hour: "M/D hA"
            // },
            // format: timeFormat,
            // round: "day",
            tooltipFormat: "ll HH:mm"
          },
          bounds: {
            ticks: {
              max: 5
            }
          },
          scaleLabel: {
            display: true,
            labelString: "Date"
          }
        }
      ],
      yAxes: [
        {
          gridLines: {
            color: mobileView ? darkThemeLines : lightThemeLines
          },
          id: "temperature",
          type: "linear",
          position: "left",
          scaleLabel: {
            display: true,
            labelString: "Degrees F"
          }
        },
        {
          gridLines: {
            color: mobileView ? darkThemeLines : lightThemeLines
          },
          id: "pressure",
          type: "linear",
          scaleLabel: {
            display: true,
            labelString: "PSI"
          },
          position: "right"
        }
      ]
    }
  }
});
