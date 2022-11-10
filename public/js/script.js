var sector_graph_data = [%%replace_sector_data%%]

var chart = new CanvasJS.Chart("graph_3", {
      animationEnabled: true,
      
      title:{
          text:"Consumption by Sector for Year 2021"
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