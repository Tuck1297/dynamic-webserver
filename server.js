// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'sector.db'); // <-- change this

let app = express();
let port = 8000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to desired route)
app.get('/', (req, res) => {
    // desired route is homepage --> allows us to hide template file storage
    let home = '/homepage';
    res.redirect(home);
});

// Dynamic File path for homepage --> index.html

app.get('/homepage', (req, res) => {
    // 1. Still need to add error handle
    // 2. If there is any data from database add here
    fs.readFile(path.join(template_dir, 'index.html'), (err, template) => {
        let query = 'SELECT Year FROM sector_annual_data';
        db.all(query, [], (err, rows) => {
            // have an embedded one for state name population
            let response = template.toString(); 
            let years = ""; 
            for (let i = 0; i < rows.length; i++) {
                years = years + '<li><a href="/year/'+rows[i].Year+'" target="_self">'+ rows[i].Year + '</a></li>';
            }
            response = response.replace('%%List_Placeholder_Total_Year%%', years);
            res.status(200).type('html').send(response);
        });
         
    });
});

app.get('/sector/:selected_sector', (req, res) => {
    console.log('request 2');
    // console.log(req.params.selected_sector);
    let annual_query ="";
    let month_query = ""; // with month query need to join with month table
    if (req.params.selected_sector == "Residential") {
        annual_query = 'SELECT ID, Year, Geothermal_Res, Solar_Res, \
        Wood_Res, Total_Consumed_Res  FROM sector_annual_data';
        month_query = 'SELECT ID, Year, Month, Geothermal_Res, Solar_Res, \
        Wood_Res, Total_Consumed_Res  FROM sector_month_data';
    } else if (req.params.selected_sector == "Industrial") {
        annual_query = 'SELECT ID, Year, Hydroelectric_Ind, Geothermal_Ind, Solar_Ind, \
        Wind_Ind, Wood_Ind, Waste_Ind, Fuel_Ethanol_Ind, \
        Biomass_Total_Ind, Total_Consumed_Ind FROM sector_annual_data';
        month_query = 'SELECT ID, Year, Month, Hydroelectric_Ind, Geothermal_Ind, Solar_Ind, \
        Wind_Ind, Wood_Ind, Waste_Ind, Fuel_Ethanol_Ind, \
        Biomass_Total_Ind, Total_Consumed_Ind FROM sector_month_data';
    } else if (req.params.selected_sector == "Commercial") {
        annual_query = 'SELECT ID, Year, Month, Hydroelectric_Comm, Geothermal_Comm, Solar_Comm, \
        Wind_Comm, Wood_Comm, Waste_Comm, Fuel_Ethanol_Comm, \
        Biomass_Total_Comm, Total_Consumed_Comm FROM sector_annual_data';
        month_query = 'SELECT ID, Year, Month, Hydroelectric_Comm, Geothermal_Comm, Solar_Comm, \
        Wind_Comm, Wood_Comm, Waste_Comm, Fuel_Ethanol_Comm, \
        Biomass_Total_Comm, Total_Consumed_Comm FROM sector_month_data';
    } else if (req.params.selected_sector == "Transportation") {
        annual_query = 'SELECT ID, Year, Biodisel_Trans, Renew_Diesel_Trans, \
        Other_Biofuels_Trans, Total_Consumed_Trans FROM sector_annual_data';
        month_query = 'SELECT ID, Year, Month, Biodisel_Trans, Renew_Diesel_Trans, \
        Other_Biofuels_Trans, Total_Consumed_Trans FROM sector_month_data';
    } else if (req.params.selected_sector == "Electric") {
         annual_query = 'SELECT ID, Year, Hydroelectric_Electric, Geothermal_Electric, \
         Solar_Electric, Wind_Electric, Wood_Electric, Waste_Electric, \
         Biomass_Total_Electric, Total_Consumed_Electric FROM sector_annual_data';
         month_query = 'SELECT ID, Year, Month, Hydroelectric_Electric, Geothermal_Electric, \
         Solar_Electric, Wind_Electric, Wood_Electric, Waste_Electric, \
         Biomass_Total_Electric, Total_Consumed_Electric FROM sector_month_data';
    } else {
        let string = '<h1>File Not Found<h1>';
        res.status(404).type('html').send(string);
        return;
    }
    fs.readFile(path.join(template_dir, 'sector.html'), (err, data) => {
        if (err) {
            res.status(404).type('html').send(err);
            // send error client -- 404
        }
        db.all(annual_query,[], (err, annual_data) => {
            console.log(err, annual_data);

            db.all(month_query, [], (err, monthly_data ) => {
                console.log(err, monthly_data);

                // here is where I will add the data to the javascript representations-- 
                // how to do this????
            });
        });

        // Convert Template from Binary to String
        let response = data.toString();
        // Replace necessary placeholders in HTML Template
        response = response.replace('%%Sector_Type%%', req.params.selected_sector);
        // Retrieve data from database

        res.status(200).type('html').send(response);
    });
});

/*
// Example GET request handler for data about a specific year
app.get('/year/:selected_year', (req, res) => {
    console.log(req.params.selected_year);
    fs.readFile(path.join(template_dir, 'year.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});
*/

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
