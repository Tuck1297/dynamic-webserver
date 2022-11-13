
let graph_data = [%%Data_Placeholder%%]
var chart = new CanvasJS.Chart("graph", {
    animationEnabled: true,
    
    title:{
        text:"Total"
    },
    axisX:{
        interval: 1
    },
    axisY2:{
        interlacedColor: "rgba(1,77,101,.2)",
        gridColor: "rgba(1,77,101,.1)",
        title: "Trillion (BTU)"
    },
    data: [{
        type: "bar",
        name: "Total",
        axisYType: "secondary",
        color: "#014D65",
        dataPoints: 
            // { y: %%data%%, label: "%%Type of Gas%%"},
            graph_data
    }]
});
chart.render();