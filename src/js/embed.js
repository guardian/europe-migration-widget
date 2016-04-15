import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import $ from 'jquery'
import d3 from 'd3'
import topojson from 'topojson'
import europeJSON from './data/europe.json!json'
import embedHTML from './text/embed.html!text'

var dataset = null;
var selected = null;
var expanded = false;

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
    
    selected = getParameter("country");

    el.innerHTML = embedHTML;
    $(".toggle-button").hide();
    if (selected == null) {
        $(".toggle-button").hide();
         //$(".widget-footer").addClass("no-button");
    }

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1bRz4W9fo4IFrdwq8gj44H77tdZtvyJ9k_LJt614scpg.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => setupApp( resp )
    });
};

function setupApp ( data ) {
   
    dataset = data.sheets;
     
    console.log(dataset)
    
    buildView ( );
    
    addListeners();
}

// success: (resp) => el.querySelector('.test-msg').innerHTML = `Your IP address is ${resp.ip}`

function buildView ( ) {
    
     
     
     var i, countryData, countryName, html, introHTML, bulletsHTML, tabsHTML, mapHTML, imageHTML, sourceHTML, updatedHTML,img, graphHTML, dataType, graphs = [], maps = [], graphObject, mapObject, graphTitle, bulletsTitle, countryCode;
     
     html = "";
     //tabsHTML = "<option selected disabled>Select a country</option>";
     tabsHTML = "";
     

for (var d in dataset) {
    
   html += '<div id="country-block_' + d + '" class="country-block" >';
   countryData = dataset[d];
   introHTML = "";
   bulletsHTML = '<ul class="country-bullets-list right-col">';
   mapHTML = "";
   graphHTML = "";
   imageHTML = "";
   graphObject = null;
   mapObject = null;
   graphTitle = "";
   bulletsTitle = "";
   countryCode = null;

 for ( i = 0; i < countryData.length; i++ ) {
        
       dataType = countryData[i]["Data type"];
       
       //console.log(countryData[i]["Data type"]);
       
       switch (dataType) {
           
           case "name" :
            countryName = '<h2 class="country-name mid-col">' + countryData[i]["Value1"] + '</h2>';
            //tabsHTML += '<option value="' + d + '">' + countryData[i]["Value1"] + '</option>';
            tabsHTML += '<button class="tab-button" id="tab-button-' + d + '" data-name="' + d + '">' + countryData[i]["Value1"] + '</button>';
           break;
           
           case "bullet" :
           bulletsHTML += '<li class="country-bullet">' + countryData[i]["Value1"] + '</li>';
           break;
           
            case "graph" :
                if (graphObject == null) {
                    graphObject = {};
                    graphObject.id = d;
                    graphObject.data = [];
                    graphObject.countryCode = countryCode;
                }
                graphObject.data.push( { value: countryData[i]["Value1"], date: countryData[i]["Value2"] });
           break;
           
            case "graph title" :
                graphTitle = countryData[i]["Value1"];
           break;
           
           case "bullets title" :
                bulletsTitle = '<h5 class="graph-title">' + countryData[i]["Value1"] + '</h5>';
           break;
           
            case "countrycode" :
                countryCode = countryData[i]["Value1"];
           break;
           
            case "source" :
                sourceHTML = countryData[i]["Value1"];
           break;
           
           case "updated" :
                updatedHTML = countryData[i]["Value1"];
           break;
           
           case "intro" :
               
               introHTML  = "<h3 class='mid-col'>" + countryData[i]["Value1"] + "</h3>";
                   
               
           break;
           
           case "image" :
                //var arr = countryData[i]["Value1"].split("\t");
                var stem = countryData[i]["Value1"];
                var params = countryData[i]["Value2"];
               img = getOptimalImage( 500, stem, params );
              
              imageHTML = '<div class="country-image"><div class="country-image-inner"><img src="' + img + '" alt=""/><div class="fade"></div><div class="tint"></div></div></div>';
           break;
       }
        

    }
    
    
     if ( graphObject !== null ) {
           graphs.push( graphObject );
           graphHTML = '<div class="country-graph" id="graph-' + graphObject.id + '"><div class="graph-readout"></div><h5 class="graph-title">' + graphTitle + '<span></span></h5><div class="graph-inner narrow-view"></div><div class="graph-inner wide-view"></div></div>';
     }
     
      mapObject = {};
      mapObject.id = d;
      mapObject.countryCode = countryCode;
      maps.push( mapObject );
      mapHTML = '<div class="country-locator-map"></div>';
    
     
    bulletsHTML= bulletsTitle + bulletsHTML;
    bulletsHTML+= "</ul>";
    html += mapHTML + countryName + '<div class="country-graphics">' + imageHTML + graphHTML + '</div>' + introHTML + bulletsHTML + '<div class="source-dummy" style="display:none;"><span>Source: ' + sourceHTML + '</span><span class="pipes"> | </span><span>Last update: ' + updatedHTML + '</span></div></div>';
}
    
   
   //$("select").html(tabsHTML);
   $(".tab-buttons").html(tabsHTML);
   $(".countries-container").html(html);
   
   buildGraphs( graphs );
   buildMaps( maps );
   
   if ( selected !== null ) {
       showCountry( selected );
       //var selectedText = $("#country-select option[value='" + selected + "']").text();
       //$(".filter .label").html(selectedText);
       //$("select option[value='" + selected + "']").attr("selected","selected");
       $(".tab-button").removeClass("highlighted");
       $("#tab-button-" + selected ).addClass("highlighted");
   } else {
        //$(".filter .label").html("Select a country");
   }

}

function getOptimalImage( elW, stem, params ) {
    
        var sizeStr = "", imgSize; //, elW = $el.width();
    
        var attr = getImageAttributes( params );
        
         if (attr["size"] != undefined ) {
        var  imgSizes = attr["size"];
    
       
        
        //var windowWidth = $(window).width();
        
       // if(windowWidth <= 500){
				//load smallest image to fit small screen
				//imgSize = imgSizes[1];
			//} else if( windowWidth <= 1050 ) {
				//load medium image to fit vertical iPad layout 
				//imgSize = imgSizes[1];
			//} else {
				//load determine image to load by size of position for desktop layout
				var elWidth = elW;
				if((elWidth <= (parseInt(imgSizes[0]) + 40)) ) {
					imgSize = imgSizes[0];
                    
				} else if (elW <= parseInt(imgSizes[1]) || imgSizes.length <= 2 ) {
					imgSize = imgSizes[1];
          
				} else {
					imgSize = imgSizes[2];
				}
			//};

       sizeStr += "/" + imgSize + ".jpg";
       
         }
       
       return stem + sizeStr;
}

function getImageAttributes( attr ) {
    
    var i, ii, arr, arr, key, values, obj = {}; //obj = { cropRatio: [500, 500], size: [ 140, 140, 140 ] };
    
    attr = attr.split("&");
    
    if (attr.length > 1) {
    
    for ( i = 0; i < attr.length; i++ ) {
        arr = attr[i].split("=");       
        key = arr[0];
        values = arr[1].split(",");
        obj[key] = values;      
    }
    
    }
     
    return obj;
    
}

function buildGraphs( graphData ) {
    
    var i, el;
    
    for ( i = 0; i < graphData.length; i++ ) {
        el ='#graph-' + graphData[i].id + ' .graph-inner.narrow-view';
        buildGraph ( graphData[i], el );
        el ='#graph-' + graphData[i].id + ' .graph-inner.wide-view';
        buildGraph ( graphData[i], el );
    }
    
}

function buildMaps( mapData ) {
   
    var i, el;
    
    for ( i = 0; i < mapData.length; i++ ) {
        buildMap ( mapData[i].id, mapData[i].countryCode );
    }
    
}

function buildGraph ( graphData, el ) {
    
    
//var margin = {top: 20, right: 20, bottom: 30, left: 50}

//var parseDate = d3.time.format("%d-%b-%y").parse;

var data = graphData.data;

var parentEl ='#graph-' + graphData.id;


var wP = 100;
var wH = $(el).innerHeight() / $(el).innerWidth() * 100;

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    // width = $(el).outerWidth() - margin.left - margin.right,
    // height = $(el).outerHeight() - margin.top - margin.bottom;
    width = wP - margin.left - margin.right,
    height = wH - margin.top - margin.bottom;

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

// y.domain(d3.extent(data, function(d) { return d.close; }));

data.forEach(function(d, i) {
    d.date = d.date; //parseDate(d.Date);
    d.dateIndex = i;
    d.value = +d.value;
  });
  
  //console.log(data);

var area = d3.svg.area()
    .x(function(d) { return x(d.dateIndex); })
    .y0(height)
    .y1(function(d) { return y(d.value); });

var line = d3.svg.line()
    .x(function(d) { return x(d.dateIndex); })
    .y(function(d) { return y(d.value); });

var svg = d3.select(el).append("svg")
    .attr("version", "1.2")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "none")
    //.attr("preserveAspectRatio", "xMinYMin meet")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  

  x.domain(d3.extent(data, function(d) { return d.dateIndex; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area)
      
      .on("mousemove", mMove)
      .on("mouseleave", mLeave)
    //.append("title");

function mMove(){

     var m = d3.mouse(this);
     
     updateReadout( data, el, m[0], y, width, height, parentEl );
     
     //d3.select(this).select("title").text(m[0]);
}

function mLeave(){

     
     updateReadout( data, el, 100, y, width, height, parentEl );
     
     //d3.select(this).select("title").text(m[0]);
}
      
  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
      
      
var lineMarker = d3.select(el).append("div")
.attr("class", "line-marker");

var cursor = d3.select(el).append("div")
.attr("class", "circle-marker circle-other");

var endCursor = d3.select(el).append("div")
.attr("class", "circle-marker circle-end");

updateReadout( data, el, 100, y, width, height, parentEl )



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

function updateReadout( data, el, mX, scaleY, w, h, parent ) {
    
    var index = Math.round(mX / 100 * data.length );
    if ( index < 0 ) {
        index = 0;
    }
    
    if ( index > data.length-1 ) {
        index = data.length-1;
    }
    
    var oneDay = 100 / (data.length-1);
    var x = index * oneDay;
   var y = (h - scaleY(data[index].value)) / (h) * 100; // h+1 to accout for border;
    
    $(el).find(".circle-other").css("left", x + "%").css("bottom", y + "%");
    y = (h - scaleY(data[data.length-1].value)) / (h) * 100; // h+1 to accout for border;
    $(el).find(".circle-end").css("left", "100%").css("bottom", y + "%");
    y = 100-y;
    var $lineMarker = $(el).find(".line-marker").css("left", "100%").css("height", y + "%");
    var $readout = $(parent).find(".graph-readout").html(addCommas(data[index].value));
    
    if (index == data.length-1) {
        $readout.removeClass("readout-other");
        $lineMarker.show();
    } else {
        $readout.addClass("readout-other");
        $lineMarker.hide();
    }
    $(parent).find(".graph-title span").html(", " + String(data[index].date).toLowerCase());
}

function addListeners() {
    // $(".toggle-button").on( "click", function (e) {
  
    //     if (!expanded) {
    //     $(".country-block").show();
    //     $(".toggle-button").hide();
    //     $(".widget-footer").addClass("no-button");
    //     expanded = true;
    //     $('#country-select').prop('selectedIndex',0);
    //     $(".filter .label").html("Select a country");
    //     } else {
    //      expanded = false;
    //      $(".country-block").hide();
    //      $("#country-block_" + selected).show();
    //      $(".filter .label").html("All countries"); 
    //     $(".toggle-button .button-text").html("Show more countries");   
    //     }
    // });
    
    $(".tab-button").on( "click", function (e) {
        var $this = $(this);
        selected = $this.data("name");
        $(".tab-button").removeClass("highlighted");
        $this.addClass("highlighted");
        
        showCountry( selected );
  
        // 
        // $(".country-block").removeClass("block-selected").hide();
        // $(".tab-button").removeClass("highlighted");
        // $this.addClass("highlighted");
        // selected = $(this).data("name");
        // $("#country-block_" + selected).show().addClass("block-selected");
        
       
    });
    
//     $("#country-select").change(function() {
//         selected = $(this).val();
//         var selectedText = $("#country-select option[value='" + selected + "']").text();
//     $(".country-block").hide();
//     $("#country-block_" + selected).show();
//     $(".filter .label").html(selectedText);
//      $(".toggle-button").show();
//      $(".widget-footer").removeClass("no-button");
//      expanded = false;
// });
}

function buildMap ( id, countryCode ) {
    var center, countries, height, path, projection, scale, svg, width, p, features;
  width = 300;
  height = 300;
  center = [16, 53];
  scale = 1000;
  projection = d3.geo.mercator().scale(scale).translate([width, height]).center(center);
  path = d3.geo.path().projection(projection);
  svg = d3.select("#country-block_" + id + " .country-locator-map").append("svg")
  .attr("version", "1.2")
  .attr("viewBox", "0 0 600 600")
  .attr("preserveAspectRatio", "xMinYMin meet");
//   .attr("height", height)
//   .attr("width", width);

  countries = svg.append("g");
  //d3.json(europeJSON, function(data) {
      console.log(europeJSON);
      var data = europeJSON;
      console.log(data.objects)
      features = topojson.feature(data, data.objects.europe).features;
    countries.selectAll('.country')
    .data(features)
    .enter()
    .append('path')
    .attr('class', function(d, i) {
        
        if (d.id == countryCode) {
             p = i;
            return "country highlighted"; 
            
        } else {
            return "country";
        }
        
    })
    .attr('id', function (d) {
        return d.id;
    })
    .attr('d', path);
   
    var centroid = d3.geo.centroid(features[p]);
     
     projection.center(centroid);
     countries.selectAll('.country')
      .attr("d", path);
      
      var blk = document.getElementById("country-block_" + id);
      
      
      
       var bbox = blk.querySelector("#" + countryCode).getBBox();
      var rectangle = svg.append("rect")
                         .attr("x", bbox.x - 30)
                         .attr("y", bbox.y - 30)
                           .attr("width", bbox.width + 60)
                          .attr("height", bbox.height + 60)
                          .attr("stroke", "#000")
                          .attr("fill", "none")
                          .attr("stroke-width", "10");
                          
    //div.text("x: " + bbox.x + ", y: " + bbox.y + ", h: " + bbox.height + ", w: " + bbox.width);


    return;
  //});
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

function addCommas(nStr) {
    nStr += '';
    
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function showCountry( country ) {
    
    var $block = $("#country-block_" + country), sourceHTML;
        
        $(".country-block").removeClass("block-selected").hide();
        $block.show().addClass("block-selected");
        sourceHTML = $block.find(".source-dummy").html();
        $(".widget-footer p").html(sourceHTML);
}