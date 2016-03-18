import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import $ from 'jquery'
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
        success: (resp) => buildView( resp )
    });
};

// success: (resp) => el.querySelector('.test-msg').innerHTML = `Your IP address is ${resp.ip}`

function buildView ( data ) {
    
     dataset = data.sheets;
     
     console.log(dataset)
     
     var i, countryData, countryName, html= "", bulletsHTML, tabsHTML = "", graphHTML, dataType;
     

for (var d in dataset) {
    
    countryData = dataset[d];
   bulletsHTML = "<ul>";
   graphHTML = "";


 for ( i = 0; i < countryData.length; i++ ) {
        
       dataType = countryData[i]["Data type"];
       
       //console.log(countryData[i]["Data type"]);
       
       switch (dataType) {
           
           case "name" :
            countryName = "<h2>" + countryData[i]["Value"] + "</h2>";
            tabsHTML += '<option value="' + d + '">' + countryData[i]["Value"] + '</option>';
           break;
           
           case "bullet" :
           bulletsHTML += "<li>" + countryData[i]["Value"] + "</li>";
           break;
           
            case "graph" :
           
           break;
       }
        

    }
    
    bulletsHTML+= "</ul>";
    html += countryName + bulletsHTML;



}
    
   
   $("select").html(tabsHTML);
   $(".countries-container").html(html);
    
    
    

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