// Define the dimensions and margins for the chart
var width = 600,
  height = 600,
  outerRadius = Math.min(width, height) / 2 - 10,
  innerRadius = outerRadius - 24;

// Define color scale
var color = d3.scaleOrdinal(d3.schemeCategory10);

// Define the chord layout
var chord = d3.chord().padAngle(0.04).sortSubgroups(d3.descending);

// Define the arc and ribbon generators
var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

var ribbon = d3.ribbon().radius(innerRadius);

var names = ["USA", "Europe", "South America", "Asia"];

// Create the SVG container
var svg = d3
  .select("#chart")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Load data
d3.json("data.json", function (matrix) {
  // Compute chord layout
  var chords = chord(matrix);

  // Add groups for arcs
  var group = svg
    .append("g")
    .selectAll("g")
    .data(chords.groups)
    .enter()
    .append("g");

  // Add the arc
  group
    .append("path")
    .style("fill", (d) => color(d.index))
    .attr("d", arc)
    .attr("class", "forHover")
    .on("mouseover", console.log("hover"))
    .on("mouseout", fade(1));

  // Add labels
  group
    .append("text")
    .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
    .attr("dy", ".35em")
    .attr(
      "transform",
      (d) => `
            rotate(${(d.angle * 180) / Math.PI - 90})
            translate(${innerRadius + 26})
            ${d.angle > Math.PI ? "rotate(180)" : ""}
        `
    )
    .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
    .text((d) => names[d.index]);

  // Add the ribbons
  svg
    .append("g")
    .attr("fill-opacity", 0.67)
    .selectAll("path")
    .data(chords)
    .enter()
    .append("path")
    .attr("d", ribbon)
    .attr("class", "ribbon")
    .style("fill", (d) => color(d.target.index))
    .style("stroke", (d) => d3.rgb(color(d.target.index)).darker());

  var curvesDom = document.querySelectorAll(".forHover");
  let ribbons = document.querySelectorAll(".ribbon");
  console.log(ribbons);
  console.log(curvesDom);
  var filterOptions = document.getElementById("countries");
  var optionNames = [];
  filterOptions.addEventListener("change", function () {
    let options = filterOptions.querySelectorAll("option");
    options = options.forEach(function (option) {
      optionNames.push(option.value);
    });

    if (filterOptions.value === "usa") {
      console.log(ribbons[0]);
      filterFunc([ribbons[0]]);
    } else if (filterOptions.value === "all") {
      ribbons.forEach((ribbon) => {
        ribbon.style.opacity = 1;
      });
    } else if (filterOptions.value == "asia") {
      filterFunc([ribbons[3], ribbons[6], ribbons[8], ribbons[9]]);
    } else if (filterOptions.value == "europe") {
      filterFunc([ribbons[5], ribbons[4], ribbons[1]]);
    } else if (filterOptions.value == "samerica") {
      filterFunc([ribbons[2], ribbons[7]]);
    }
  });

  const filterFunc = (selectedRibbon) => {
    ribbons.forEach((ribbon) => {
      ribbon.style.opacity = 0;
    });
    selectedRibbon.forEach((ribbon) => {
      ribbon.style.opacity = 1;
    });
  };
  // Function to fade other chords when hovering over a specific one
  function fade(opacity) {
    return function (g, i) {
      svg
        .selectAll(".chord")
        .filter((d) => d.source.index !== i && d.target.index !== i)
        .transition()
        .style("opacity", opacity);
    };
  }
});
