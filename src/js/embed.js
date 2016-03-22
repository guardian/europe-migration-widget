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
    
     
     
     var i, countryData, countryName, html, bulletsHTML, tabsHTML, mapHTML, imageHTML, graphHTML, dataType;
     
     html = "";
     tabsHTML = "<option selected disabled>Select country</option>";
     

for (var d in dataset) {
    
   html += '<div id="country-block_' + d + '" class="country-block" >';
   countryData = dataset[d];
   bulletsHTML = '<ul class="country-bullets-list">';
   mapHTML = "";
   graphHTML = "";
   imageHTML = "";

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
                graphHTML = "";
           break;
           
           case "locator map" :
                mapHTML = '<div class="country-locator-map"></div>';
           break;
           
           case "image" :
                imageHTML = '<div class="country-image"></div>';
           break;
       }
        

    }
    graphHTML = '<div class="country-graph"></div>';
    bulletsHTML+= "</ul>";
    html += '<div class="country-graphics">' + imageHTML + graphHTML + '</div>'  + mapHTML + countryName + bulletsHTML + "</div>";

}
    
   
   $("select").html(tabsHTML);
   $(".countries-container").html(html);
   
   if ( selected !== null ) {
       $(".country-block").hide();
       $("#country-block_" + selected).show();
       //$("select option[value='" + selected + "']").attr("selected","selected");
   }

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