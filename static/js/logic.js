//set up colors association to range object
let colors = {
    "lte10": {
        "color": "#4d9221",
        "tag": "-10 - 10"
    },
    "lte30": {
        "color": "#a1d76a",
        "tag": "10 - 30"
    },
    "lte50": {
        "color": "#e6f5d0",
        "tag": "30 - 50"
    },
    "lte70": {
        "color": "#fde0ef",
        "tag": "50 - 70"
    },
    "lte90": {
        "color": "#e9a3c9",
        "tag": "70 - 90"
    },
    "gt90": {
        "color": "#c51b7d",
        "tag": "90+"
    }
}

//fucntion pulled from choropleth example https://leafletjs.com/examples/choropleth/
function getColor(depth) {
    return depth <= 10 ? colors.lte10.color :
        depth <= 30 ? colors.lte30.color :
            depth <= 50 ? colors.lte50.color :
                depth <= 70 ? colors.lte70.color :
                    depth <= 90 ? colors.lte90.color :
                        colors.gt90.color;
}

function updateLegend(colors){
    //open html table and set spacing
    let HTMLlist = ["<table cellspacing='0'>"];
    Object.keys(colors).forEach(key => {
        //declare color rectangle html to put in the legend 
        let color_box =  `<svg height=16 width=16> <rect width="16" height="16" fill="${colors[key].color}"/> </svg>`
        // declare table data, and fill second column with depth range 
        //push to html list
        HTMLlist.push("<tr>" + `<td>${color_box}</td>` + `<td style="vertical-align:top">${colors[key].tag}</td>` + "<tr>")
    });
    // close table tag in html list
    HTMLlist.push("</table>");

    // Pulled from citibike assignment
    legend_div = document.querySelector(".legend")
    //join htmllist insto a single string and assign it inside legend div
    legend_div.innerHTML = HTMLlist.join("");
    //set styling, options pulled from citibike assignment
    legend_div.style.backgroundColor = 'white';
    legend_div.style.padding = "10px"
}

// adapted from citibike in class assignment
function createMap(quakeMarkerGroup) {
    let quakemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let baseMaps = {
        "Street Map": quakemap
    };
    let overlayMaps = {
        "Earthquakes": quakeMarkerGroup
    };

    let map = L.map("map", {
        //center on NA
        center: [25, -103.46],
        zoom: 3,
        layers: [quakemap, quakeMarkerGroup]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // Create a legend to display information about our map.
    let legend = L.control({ position: "bottomright" });

    // When the layer control is added, insert a div with the class of "legend".
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "legend");
        return div;
        
        // https://d3-graph-gallery.com/graph/custom_legend.html
        //bject.keys(colors).forEach(key => {
            //svg.append('rect').attr('x', 100).attr('y', function (d, i) { return 100 + i * (size * 5) }).attr('width', size).attr('height', size).style('fill', colors[`${key}`].color);
    };
    // Add the info legend to the map.
    legend.addTo(map);
    updateLegend(colors);
};

function createMarkers(geoData) {
    console.log(geoData);
    let quakeMarkers = [];

    geoData.features.forEach(feature => {

        // pull information about earthquake
        let magnitude = feature.properties.mag;
        let place = feature.properties.place;
        let time_detected = new Date(feature.properties.time);
        let time_updated = new Date(feature.properties.updated);

        // pull location data from each point
        let coords = feature.geometry.coordinates;
        let latlon = [coords['1'], coords['0']];
        let depth = feature.geometry.coordinates['2'];

        let geoJsonMarkerOptions = {
            //scale radius up so it's 10km to 1 magnitude.
            radius: magnitude * 10000,
            color: getColor(depth),
            fillColor: getColor(depth),
            fillOpacity: 0.6
        };

        let quakeMarker = quakemarker = L.circle(L.latLng(latlon), geoJsonMarkerOptions)
            .bindPopup("<h2>" + place + "</h2><h3> Magnitude: " + magnitude.toPrecision(2) + "  |  Depth: " + depth + "</h3><p> <strong>Detected:</strong> " + time_detected + "</p><p> <strong>Last Updated:</strong> " + time_updated + "</p>");
        quakeMarkers.push(quakeMarker);

    });

    createMap(L.layerGroup(quakeMarkers));
}

let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(geoData).then(createMarkers); 
