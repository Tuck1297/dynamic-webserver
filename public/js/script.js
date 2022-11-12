var sector_graph_data = [%%replace_sector_data%%]
var total_graph_data = [%%replace_total_data%%]
var state_graph_data = [%%replace_state_data%%]

var chart = new CanvasJS.Chart("graph_3", {
      animationEnabled: true,
      
      title:{
          text:"Total Renewable Resource Consumption by Sector for 2021"
      },
      axisX:{
          interval: 1
      },
      axisY2:{
          interlacedColor: "rgba(1,77,101,.2)",
          gridColor: "rgba(1,77,101,.1)",
          title: "Trillion(Btu)"
      },
      data: [{
          type: "bar",
          name: "%%Type of Gas Used%%",
          axisYType: "secondary",
          color: "#014D65",
          dataPoints: sector_graph_data
              // { y: %%data%%, label: "%%Type of Gas%%"},
              
          
      }]
  });
  chart.render();

  var chart2 = new CanvasJS.Chart("graph_2", {
    animationEnabled: true,
    title: {
		text: "Total United States Consumption"
	},
	axisX: {
		title: "Annual"
	},
	axisY: {
		title: "Trillion (BTU)",
		includeZero: true
	},
	data: [{
		type: "column",
		yValueFormatString: "#,###.## Trillion (BTU)",
		dataPoints: total_graph_data
	}]
});
chart2.render();

var chart3 = new CanvasJS.Chart("graph_1", {
	theme: "light2",
	animationEnabled: true,
	exportFileName: "Ethenol Consumption by State for 2020",
	exportEnabled: true,
	title:{
		text: "Ethenol Consumption by State for 2020"
	},
	data: [{
		type: "pie",
		showInLegend: false,
		legendText: "{label}",
		toolTipContent: "{label}: <strong>{y}</strong> Trillion (BTU)",
		indexLabel: "{label} {y}",
		dataPoints : state_graph_data
	}]
});
 
chart3.render();