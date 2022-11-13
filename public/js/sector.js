let graph_data = [%%Data_Placeholder%%]
let type_data = [%%Data_Placeholder_2%%]
let table = document.getElementById('table')
table.innerHTML = '%%table_data%%'

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

var pie = new CanvasJS.Chart("pie", {
	theme: "light2",
	animationEnabled: true,
	exportFileName: "Sector Energy Consumed",
	exportEnabled: true,
	title:{
		text: "Consumption by Energy Type"
	},
	data: [{
		type: "pie",
		showInLegend: false,
		legendText: "{label}",
		toolTipContent: "{label}: <strong>{y}</strong> Trillion (BTU)",
		indexLabel: "{label} {y}",
		dataPoints : type_data
	}]
});
pie.render();