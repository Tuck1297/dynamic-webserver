let graph_data = [%%Data_Placeholder%%]

// let solar_data = [%%Solar_Data_Placeholder%%]
// let wind_data = [%%Wind_Data_Placeholder%%]
// let hydro_data = [%%Hydro_Data_Placeholder%%]
// let bio_data = [%%Bio_Data_Placeholder%%]

var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    
    title:{
        text:"%%Sector%%"
    },
    axisX:{
        interval: 1
    },
    axisY2:{
        interlacedColor: "rgba(1,77,101,.2)",
        gridColor: "rgba(1,77,101,.1)",
        title: "Trillion (BTU)",
        maximum: %%total_Placeholder%%
    },
    data: [{
        type: "bar",
        name: "Sector Renewable Energy Consumed",
        axisYType: "secondary",
        color: "#014D65",
        dataPoints: 
            // { y: %%data%%, label: "%%Type of Gas%%"},
            graph_data
        
    }]
});
chart.render();

var solar = new CanvasJS.Chart("solar", {
	theme: "light2",
	animationEnabled: true,
	exportFileName: "Solar Energy Consumption 1949-2021",
	exportEnabled: true,
	title:{
		text: "Solar Energy Consumption 1949-2021"
	},
	data: [{
		type: "pie",
		showInLegend: false,
		legendText: "{label}",
		toolTipContent: "{label}: <strong>{y}</strong> Trillion (BTU)",
		indexLabel: "{label} {y}",
		dataPoints : graph_data
	}]
});
 
solar.render();
var wind = new CanvasJS.Chart("wind", {
	theme: "light2",
	animationEnabled: true,
	exportFileName: "Wind Energy Consumption 1949-2021",
	exportEnabled: true,
	title:{
		text: "Wind Energy Consumption 1949-2021"
	},
	data: [{
		type: "pie",
		showInLegend: false,
		legendText: "{label}",
		toolTipContent: "{label}: <strong>{y}</strong> Trillion (BTU)",
		indexLabel: "{label} {y}",
		dataPoints : graph_data
	}]
});
 
wind.render();
var hydro = new CanvasJS.Chart("hydro", {
	theme: "light2",
	animationEnabled: true,
	exportFileName: "Hydro Energy Consumption 1949-2021",
	exportEnabled: true,
	title:{
		text: "Hydro Energy Consumption 1949-2021"
	},
	data: [{
		type: "pie",
		showInLegend: false,
		legendText: "{label}",
		toolTipContent: "{label}: <strong>{y}</strong> Trillion (BTU)",
		indexLabel: "{label} {y}",
		dataPoints : graph_data
	}]
});
 
hydro.render();
var bio = new CanvasJS.Chart("bio", {
	theme: "light2",
	animationEnabled: true,
	exportFileName: "Biofuel Consumption 1949-2021",
	exportEnabled: true,
	title:{
		text: "Biofuel Consumption 1949-2021"
	},
	data: [{
		type: "pie",
		showInLegend: false,
		legendText: "{label}",
		toolTipContent: "{label}: <strong>{y}</strong> Trillion (BTU)",
		indexLabel: "{label} {y}",
		dataPoints : graph_data
	}]
});
 
bio.render();