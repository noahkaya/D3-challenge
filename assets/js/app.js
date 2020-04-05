// my code--vk
var svgWidth = 960;
var svgHeight = 650;

var margin = {
  top: 25,
  right: 45,
  bottom: 200,
  left: 100
};
//calling margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

//appending an svg element to the chart 
var svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

//appending an svg group
var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);


var chosenXAxis = 'poverty';
var chosenYAxis = 'healthCare';

function xScale(journalData, chosenXAxis) {
    // create scale for it
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(journalData, d => d[chosenXAxis]) * 0.8,
        d3.max(journalData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}

function yScale(journalData, chosenYAxis) {
    // create scales similar
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(journalData, d => d[chosenYAxis]) * 0.8,
        d3.max(journalData, d => d[chosenYAxis]) * 1.2
      ])
      .range([0, width]);
  
    return yLinearScale;
}
// check out x line
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}
//check out y line
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisBottom(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}
//functioning circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[chosenXAxis]))
      .attr('cy', data => newYScale(data[chosenYAxis]))
    return circlesGroup;
}
//functioning texts
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));
    return textGroup
}
//little bit of style
function getstyle(value, chosenXAxis) {
  
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
  
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}
// designing it
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {
    // poverty line
      if (chosenXAxis === "poverty") { 
        var xLabel = "Poverty:";
    // income line    
      }
      else  { 
        var xLabel = "Median Income:";
    }
    //healthcare line
      if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare:";
    //obesity line    
      }
      else  { 
        var yLabel = "Obesity:";
    }
    var toolTip = d3.tip() 
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
          return (`${d.state}<br>${xLabel} ${getstyle(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
      });
    circlesGroup.call(toolTip);
    circlesGroup.on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide);
      return circlesGroup;
  }

//data connection  
d3.csv('./assets/data/data.csv').then(function(journalData) {
    console.log(journalData);

    journalData.forEach(function(data){
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });     

    var xLinearScale = xScale(journalData, chosenXAxis);
    var yLinearScale = yScale(journalData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)

        .call(leftAxis);
 
    var circlesGroup = chartGroup.selectAll('circle')
        .data(journalData)
        .enter()
        .append('circle')
        .classed('stateCircle', true)
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 14)
        .attr('opacity', '.5');

    var textGroup = chartGroup.selectAll('.stateText') 
        .data(journalData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function(d){return d.abbr});

    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);
    
    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');
 
    var incomeLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')

    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Lacks Healthcare (%)');

    var obesityLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')
        .text('Obese (%)');

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
// x label while looping 
    xLabelsGroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');

            if (value != chosenXAxis) {
                chosenXAxis = value; 
                xLinearScale = xScale(journalData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            if (chosenXAxis === 'poverty') {
                povertyLabel.classed('active', true).classed('inactive', false);
                incomeLabel.classed('active', false).classed('inactive', true);
            }

            else if (chosenXAxis === 'age') {
                povertyLabel.classed('active', false).classed('inactive', true);
                incomeLabel.classed('active', false).classed('inactive', true);
            }
            else {
                povertyLabel.classed('active', false).classed('inactive', true);
                incomeLabel.classed('active', true).classed('inactive', false);
            }
     }
   });
//y label while looping
    yLabelsGroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');

            if(value !=chosenYAxis) {
                chosenYAxis = value;
                yLinearScale = yScale(journalData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            if (chosenYAxis === 'obesity') {
                obesityLabel.classed('active', true).classed('inactive', false);
                healthcareLabel.classed('active', false).classed('inactive', true);
            }

            else if (chosenYAxis === 'smokes') {
                obesityLabel.classed('active', false).classed('inactive', true);
                healthcareLabel.classed('active', false).classed('inactive', true);
            }

            else {
                obesityLabel.classed('active', false).classed('inactive', true);
                healthcareLabel.classed('active', true).classed('inactive', false);
            }
       }
     });
});