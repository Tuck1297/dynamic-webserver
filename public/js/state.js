let graph_data = [%%Data_Placeholder%%];
var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    title:{
        text:"%%State%%"
    },
    axisX:{
        interval: 1
    },
    axisY2:{
        interlacedColor: "rgba(1,77,101,.2)",
        gridColor: "rgba(1,77,101,.1)",
        title: "Trillion (BTU)",
        maximum: %%Total_Placeholder%%
    },
    data: [{
        type: "bar",
        name: "%%Type of Gas Used%%",
        axisYType: "secondary",
        color: "#014D65",
        dataPoints: 
            // { y: %%data%%, label: "%%Type of Gas%%"},
            graph_data
    }]
});
chart.render();

let state = document.getElementById('%%abrev_placeholder%%')
state.style.fill = 'rgb(100,190,100)'