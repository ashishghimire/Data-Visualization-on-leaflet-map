/******map section*******/

function generateMapNepal()
{
  L.TopoJSON = L.GeoJSON.extend({
		addData: function(jsonData) {    
		  if (jsonData.type === "Topology") {
		    for (key in jsonData.objects) {
		      geojson = topojson.feature(jsonData, jsonData.objects[key]);
		      L.GeoJSON.prototype.addData.call(this, geojson);
		    }
		  }    
		  else {
		    L.GeoJSON.prototype.addData.call(this, jsonData);
		  }
		}  
	});

  var tiles = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
	var latlng = new L.LatLng(28.40, 84.15);
	var mapOptions={
    dragging: true,
    zoomControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    trackResize: false,
    attributionControl: false,
    center: latlng,
    zoom: 7,
    layers: [tiles]
  };
	
	var map = L.map('map-nepal', mapOptions); //initialize map
 
  addDistricts(map); //add district layer

  addRegions(map); // add region layer above district layer


/************************************ADDING DISTRICT LAYER*****************************************************/
  
  function addDistricts(map)
  { 
    var districtLayer = new L.TopoJSON();
    $.getJSON('js/districts.topo.json').done(addDistrictData);
    
    function addDistrictData(topoData) 
    {
      districtLayer.addData(topoData);
      districtLayer.addTo(map);
      districtLayer.eachLayer(handleLayer);
    }

    function handleLayer(layer) 
    {  
      layer.setStyle({
      fillColor : '#ccc',
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 1,
    });
    
      layer.on({
        mouseover : enterLayer,
        mouseout: leaveLayer,
      });
    }
    
    function enterLayer() 
    { //show tooltip with district name
      var district = this.feature.properties.name;
      showTip = true;
      $('#map-tooltip').html(distTooltipHtml(district));
      $('#map-tooltip').addClass('active');
      $('#map-nepal').mousemove(function(e) {
        if (showTip) {
          $('#map-tooltip').css({'top': e.pageY, 'left': e.pageX + 15, 'position': 'absolute'}).show();
        }
      });
    }
        
    var distTooltipHtml = function(districtName) 
    {
      return "<div class='html-wrapper'><div>" + districtName +  "</div></div>";
    }
    
    function leaveLayer() 
    {
      showTip = false;
      $('#map-tooltip').hide();
    }

  }


/***************************************ADDING REGION LAYER***************************************************/


  var labels_array=[];
  var unique_property_array=[];
  var labelIndexToRemove=-1;
  
  function addRegions(map)
  {
    var regionLayer = new L.TopoJSON();
    $.getJSON('js/development-regions.topo.json').done(addRegionData);
  
    function addRegionData(topoData) 
    {
      regionLayer.addData(topoData);
      regionLayer.addTo(map);
      regionLayer.eachLayer(addLabel);
      regionLayer.eachLayer(handleLayer);
    }

    function handleLayer(layer){  
      layer.setStyle({
        fillColor : '#005F66',
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 1,
      });
      layer.on({
        mouseover : enterLayer,
        mouseout: leaveLayer,
        click: clickAction,
      });
    }

    function addLabel(layer) 
    {
      var label = new L.Label();  
      label.setContent('Info');
      label.setLatLng(layer.getBounds().getCenter());
      map.showLabel(label);
      labels_array.push(label);
      unique_property_array.push(layer.feature.properties.REGION);
    }

    map.on('zoomend', onZoomend);
    
    function onZoomend() 
    { //retrieving all layers on zoomout
      if(map.getZoom()<7) {
        regionLayer.eachLayer(function(layer)
        {
          map.addLayer(layer);
          // also retrieve all the labels here
        });
        if(labelIndexToRemove>=0) {
            console.log(labels_array[labelIndexToRemove]);
            map.addLayer(labels_array[labelIndexToRemove]);
        }
      }
    }
  
    function enterLayer() 
    { //just showing tooltip with region name in this function
      var region = this.feature.properties.REGION;
      showTip = true;
      $('#map-tooltip').html(regionTooltipHtml(region));
      $('#map-tooltip').addClass('active');
      $('#map-nepal').mousemove(function(e) 
      {
        if (showTip) {
          $('#map-tooltip').css({'top': e.pageY, 'left': e.pageX + 15, 'position': 'absolute'}).show();
        }
      });
    }
    
    var regionTooltipHtml = function(regionName) 
    {
      return "<div class='html-wrapper'><div>" + regionName + " Development Region" +  "</div></div>";
    }
    
    function leaveLayer() 
    {
      showTip = false;
      $('#map-tooltip').hide();
    }
   
    function clickAction(e) 
    {
      //show districts in that region
      regionLayer.eachLayer(function(layer) 
      {
        map.addLayer(layer);
      });
      var layer = e.target;
      map.removeLayer(layer);
      if(labelIndexToRemove>=0) {
        console.log(labels_array[labelIndexToRemove]);
        map.addLayer(labels_array[labelIndexToRemove]);
      }
      labelIndexToRemove= unique_property_array.indexOf(e.target.feature.properties.REGION);
      map.removeLayer(labels_array[labelIndexToRemove]);
    }
  }
}
/*********END**********/
