
let graph_data = [%%Data_Placeholder%%]
let table = document.getElementById('table')
table.innerHTML = '%%table_data%%'

var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    
    title:{
        text:"%%Month_Year%%"
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
        name: "Energy Consumed",
        axisYType: "secondary",
        color: "#014D65",
        dataPoints: 
            // { y: %%data%%, label: "%%Type of Gas%%"},
            graph_data
        
    }]
});
chart.render();


