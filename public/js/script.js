anychart.onDocumentLoad(function () {
    // create an instance of a pie chart
    var chart = anychart.pie();
    // set the data
    chart.data(%%replace%%);
    // set chart title
    chart.title("Total Sector Consumption for 2021");
    // set the container element 
    chart.container("graph_1");
    // initiate chart display
    chart.draw();
  });

  anychart.onDocumentLoad(function () {
    // create an instance of a pie chart
    var chart = anychart.pie();
    // set the data
    chart.data([
      ["Chocolate", 5],
      ["Rhubarb compote", 2],
      ["Crêpe Suzette", 2],
      ["American blueberry", 2],
      ["Buttermilk", 1]
    ]);
    // set chart title
    chart.title("Top 5 pancake fillings");
    // set the container element 
    chart.container("graph_2");
    // initiate chart display
    chart.draw();
  });

  anychart.onDocumentLoad(function () {
    // create an instance of a pie chart
    var chart = anychart.pie();
    // set the data
    chart.data([
      ["Chocolate", 5],
      ["Rhubarb compote", 2],
      ["Crêpe Suzette", 2],
      ["American blueberry", 2],
      ["Buttermilk", 1]
    ]);
    // set chart title
    chart.title("Top 5 pancake fillings");
    // set the container element 
    chart.container("graph_3");
    // initiate chart display
    chart.draw();
  });