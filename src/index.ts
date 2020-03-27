import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
import { latLongCommunities } from "./communities";
import { stats, new_stats, ResultEntry } from "./stats";
const d3Composite = require("d3-composite-projections");


// set the affected color scale
var color = d3
  .scaleThreshold<number, string>()
  .domain([0, 40, 100, 500, 1000, 3000,10000])
  .range([
    "#FFE8E5",
    "#F88F70",
    "#CD6A4E",
    "#A4472D",
    "#7B240E",
    "#540000",
    "#1F0303"
  ]);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");


const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);


const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(
  spainjson,
  spainjson.objects.ESP_adm1
);

const radiusDependingCVCases = (comunidad: string, data: ResultEntry[]) => {
  console.log("test");
  const entry = data.find(item => item.name === comunidad);
  const maxAffected = 5000;


  const affectedRadiusScale = d3
    .scaleLinear()
    .domain([0, maxAffected])
    .range([5, 40])
    .clamp(true);
    

  return entry ? affectedRadiusScale(entry.value) : 0;
};



document
  .getElementById("stats")
  .addEventListener("click", function handleStats() {
    updateStats(stats);
    updateColor(stats);
  });

document
  .getElementById("new_stats")
  .addEventListener("click", function handleNewStats() {
    updateStats(new_stats);
    updateColor(new_stats);
  });


const updateColor = (data: ResultEntry[]) => {
  const assignCountryBackgroundColor = (community: string) => {
    console.log(community);

    const item = data.find(

      item => item.name === community
    );

    return item ? color(item.value) : color(0);
  };

  const countriesPath = svg
  .selectAll("path");

  countriesPath
    .data(geojson["features"])
    .enter()
    .append("path")
    .attr("class","country")
    .attr("fill", d => assignCountryBackgroundColor(d["properties"]["NAME_1"]))
    .attr("d", geoPath as any)
    .merge(countriesPath as any)
    .transition()
    .duration(500)
    .attr("fill", d => {
      console.log(`merge: ${d}`);
      return assignCountryBackgroundColor(d["properties"]["NAME_1"]);
    });
};

updateColor(stats);

svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", d => radiusDependingCVCases(d.name, stats))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1]);


const updateStats = (data: ResultEntry[]) => {
  const circles = svg.selectAll("circle");
    circles
    .data(latLongCommunities)
    .enter()
    .merge(circles as any)
    /*.attr("cx", d => aProjection([d.long, d.lat])[0])
    .attr("cy", d => aProjection([d.long, d.lat])[1])*/
    .transition()
    .duration(500)
    .attr("r", d => radiusDependingCVCases(d.name, data))
};

updateStats(stats);









