import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import $ from 'jquery'
import d3 from 'd3'
import embedHTML from './text/embed.html!text'

var dataset = null;
var selected = null;

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
    
    selected = getParameter("country");

    el.innerHTML = embedHTML;

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1bRz4W9fo4IFrdwq8gj44H77tdZtvyJ9k_LJt614scpg.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => setupApp( resp )
    });
};

function setupApp ( data ) {
    console.log(d3);
    dataset = data.sheets;
     
    console.log(dataset)
     
    buildView ( );
    
    addListeners();
}

// success: (resp) => el.querySelector('.test-msg').innerHTML = `Your IP address is ${resp.ip}`

function buildView ( ) {
    
     
     
     var i, countryData, countryName, html, bulletsHTML, tabsHTML, mapHTML, imageHTML, graphHTML, dataType, graphs = [], graphObject;
     
     html = "";
     tabsHTML = "<option selected disabled>Select country</option>";
     

for (var d in dataset) {
    
   html += '<div id="country-block_' + d + '" class="country-block" >';
   countryData = dataset[d];
   bulletsHTML = '<ul class="country-bullets-list">';
   mapHTML = "";
   graphHTML = "";
   imageHTML = "";
   graphObject = null;

 for ( i = 0; i < countryData.length; i++ ) {
        
       dataType = countryData[i]["Data type"];
       
       //console.log(countryData[i]["Data type"]);
       
       switch (dataType) {
           
           case "name" :
            countryName = '<h2 class="country-name">' + countryData[i]["Value"] + '</h2>';
            tabsHTML += '<option value="' + d + '">' + countryData[i]["Value"] + '</option>';
           break;
           
           case "bullet" :
           bulletsHTML += '<li class="country-bullet">' + countryData[i]["Value"] + '</li>';
           break;
           
            case "graph" :
                if (graphObject == null) {
                    graphObject = {};
                    graphObject.id = d;
                    graphObject.data = [];
                }
                graphObject.data.push( { value: countryData[i]["Value"], date: countryData[i]["Date"] });
           break;
           
           case "locator map" :
                mapHTML = '<div class="country-locator-map"></div>';
           break;
           
           case "image" :
                imageHTML = '<div class="country-image"></div>';
           break;
       }
        

    }
    
    
     if ( graphObject !== null ) {
           graphs.push( graphObject );
           graphHTML = '<div class="country-graph" id="graph-' + graphObject.id + '"></div>';
     }
     
     
    bulletsHTML+= "</ul>";
    html += '<div class="country-graphics">' + imageHTML + graphHTML + '</div>'  + mapHTML + countryName + bulletsHTML + "</div>";
}
    
   
   $("select").html(tabsHTML);
   $(".countries-container").html(html);
   
   buildGraphs( graphs );
   
   if ( selected !== null ) {
       $(".country-block").hide();
       $("#country-block_" + selected).show();
       //$("select option[value='" + selected + "']").attr("selected","selected");
   }

}

function buildGraphs( graphData ) {
    
    var i;
    
    for ( i = 0; i < graphData.length; i++ ) {
        buildGraph ( graphData[i] );
    }
    
}

function buildGraph ( graphData ) {
    
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//var parseDate = d3.time.format("%d-%b-%y").parse;

var data = graphData.data;



// var x = d3.time.scale()
//     .range([0, width]);
    
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// var xAxis = d3.svg.axis()
//     .scale(x)
//     .orient("bottom");

// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient("left");

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.value); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  data.forEach(function(d, i) {
    d.date = i; //parseDate(d.Date);
    d.close = +d.value;
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.close; })]);

  svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

//   svg.append("g")
//       .attr("class", "x axis")
//       .attr("transform", "translate(0," + height + ")")
//       .call(xAxis);

//   svg.append("g")
//       .attr("class", "y axis")
//       .call(yAxis)
//     .append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 6)
//       .attr("dy", ".71em")
//       .style("text-anchor", "end")
//       .text("Price ($)");

    
}

function addListeners() {
    $(".toggle-button").click( function (e) {
        $(".country-block").show();
    });
    
    $("#country-select").change(function() {
        selected = $(this).val();
    $(".country-block").hide();
    $("#country-block_" + selected).show();
});
}

function getParameter(paramName) {
  var searchString = window.location.search.substring(1),
      i, val, params = searchString.split("&");

  for (i=0;i<params.length;i++) {
    val = params[i].split("=");
    if (val[0] == paramName) {
      return val[1];
    }
  }
  return null;
}