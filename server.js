// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'Energy.sqlite3');
let js_dir = path.join(__dirname, 'public/js');

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
    // Retrieve homepage template
    fs.readFile(path.join(template_dir, 'index.html'), (err, template) => {
        if (err) {
            // Retrieve error client notice template
            fs.readFile(path.join(template_dir, 'file_not_found.html'), (err, template) => {
                if (err) {
                    // In case client notice template cannot be accessed
                    res.status(404).type('text').send('Please check your request and try again...')
                    return
                }
                res.status(404).type('html').send(template)
                return
            })
        }
        // Callback to navigation population function
        populateNavigation(template, (response) => {
            // Get request for javascript graph template
            app.get('/javascript', (req, res) => {
                // add error code if js file does not load
                fs.readFile(path.join(js_dir, 'script.js'), 'utf-8', (err, template) => {
                    let response2 = template.toString();
                    // Javascript altering happens here
                    let query = "SELECT sector.sector_name, sum(total) as sum FROM AnnualSectorEnergy join Sector WHERE \
                    Sector.sector_id=AnnualSectorEnergy.sector_id AND year=2021 group by Sector.sector_name; "
                    db.all(query, [], (err, rows) => {
                        // add error code here
                        let format = formatJavascriptData(rows, (rows) => ` y: ${rows.sum}, label: "${rows.sector_name}"`)
                        format = format.slice(0, -1)
                        response2 = response2.replace('%%replace_sector_data%%', format)
                        res.status(200).type('js').send(response2)
                    })
                })
            })

            res.status(200).type('html').send(response)
        })
    })
})

/* Wraps all data from list in {}, and returns all concatenated together */
function formatJavascriptData(list, transform) {
    return list
        .map((element) => `{${transform(element)}},`)
        .join('')
}

// Dynamic path for Sector Annual Data

app.get('/:sector/annual/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year
    // previous and next buttons will be based on sector and year that are requested
    // --> do next sector year 
    // --> do previous sector year
    // --> if sector year is prior or after defined years then have button disappear
    fs.readFile(path.join(template_dir, 'sector.html'), 'utf-8', (err, template) => {
        populateNavigation(template, (response) => {
            // todo write query
            response = response.replace('%%Sector_Title:Date%%', `${sector}:${year}`)
            let query =
                ``

            db.all(query, [], (err, rows) => {
                // todo replace placeholders

                res.status(200).type('html').send(response)
            })
        })

    })
})

// Dynamic path for Sector Monthly Data

app.get('/:sector/monthly/:month/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year
    let month = req.params.month

    // same with annual but need to also include monthly in the logic
    fs.readFile(path.join(template_dir, 'sector.html'), 'utf-8', (err, template) => {

        populateNavigation(template, (response) => {
            // todo write query
            response = response.replace('%%Sector_Title:Date%%', `${sector}:${month}-${year}`)
            let query =
                ``

            db.all(query, [], (err, rows) => {
                // todo replace placeholders

                res.status(200).type('html').send(response)
            })
        })

    })
})

// Dynamic path for State Data

app.get('/state/:state', (req, res) => {
    let state = req.params.state

    // todo add html template
    fs.readFile(path.join(template_dir, 'state.html'), 'utf-8', (err, template) => {

        populateNavigation(template, (response) => {
            response = response.replace('%%State%%', `${state}`)
            // todo write query
            let query ='SELECT State,Coal,Natural Gas excluding Supplemental Gaseous Fuels,Distillate \
                    Fuel Oil excluding Biodiesel,HGL,Jet Fuel,Petroleum Motor Gasoline excluding Fuel Ethanol , \
                    Residual Fuel Oil,Other,total fossil,supplemental_gaseous_fuel,biodiesel,ethanol'

            db.all(query, [state], (err, rows) => {
                // todo replace placeholders
                let response = template.toString()
                // response = response.replace('%%CEREAL_INFO%%', rows[1].cereal);
                let data = '';
                console.log(rows)
                // for(let i = 0; i < rows.length; i++){
                //     data = data + '<tr>'
                //     data = data + '<tb>' + rows[i].state + rows[i].coal + '</tb>'
                //     data = data + '<td>' + rows[i].state + '<td>'
                //     data = data + '<tr>'
                // }
                response = response.replace('%%INFO%%', data);
                console.log("this is working as intended")
                res.status(200).type('html').send(response)
            })
        console.log("We are inside the file")
        })
    console.log("We are outside of the file.")
    })
})

// Dynamic path for Total Annual Data

app.get('/total/annual/:year', (req, res) => {
    let year = req.params.year

    // todo add html template
    fs.readFile(path.join(template_dir, 'date.html'), 'utf-8', (err, template) => {

        populateNavigation(template, (response) => {
            response = response.replace('%%Total-Date%%', `Total:${year}`)
            // todo write query
            let query =
                ``

            db.all(query, [], (err, rows) => {
                // todo replace placeholders

                res.status(200).type('html').send(response)
            })

        })

    })
})

// Dynamic path for Total Monthly Data

app.get('/total/monthly/:month_id/:year', (req, res) => {
    let monthID = req.params.month_id
    let year = req.params.year

    // todo add html template
    fs.readFile(path.join(template_dir, 'date.html'), 'utf-8', (err, template) => {

        populateNavigation(template, (response) => {
            response = response.replace('%%Total-Date%%', `Total:${monthID}-${year}`)
            // todo write query
            let query =
                ``

            db.all(query, [], (err, rows) => {
                // todo replace placeholders

                res.status(200).type('html').send(response)
            })
        })

    })
})

let states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California'
    , 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii'
    , 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana'
    , 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi'
    , 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey'
    , 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma'
    , 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota'
    , 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington'
    , 'West Virginia', 'Wisconsin', 'Wyoming']

let months_array = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December']

/* Builds the navigation path for all dynamic pages */
function populateNavigation(template, callback) {
    let query = 'SELECT Year FROM AnnualSectorEnergy WHERE sector_id=1;'
    db.all(query, [], (err, query_1_rows) => {
        // If database error occurs
        if (err) {
            // Retrieve error client notice template
            fs.readFile(path.join(template_dir, 'file_not_found.html'), (err, template) => {
                if (err) {
                    // In case client notice template cannot be accessed
                    res.status(404).type('text').send('Please check your request and try again...')
                }
                res.status(404).type('html').send(template)
                return
            })
            res.status(404).type('html').send(template)
            return
        }
        query = 'SELECT sector_name FROM Sector;'
        db.all(query, [], (err, query_2_rows) => {
            // Populate Client Navigation
            let response = template.toString()
            // Add navigation links for Sector Monthly
            let sectorMonthlyPlaceholder = addSectorMonthlyLinks(query_1_rows, query_2_rows)
            // Add navigation links for Sector Annual 
            let sectorAnnualPlaceholder = addSectorAnnualLinks(query_1_rows, query_2_rows)
            // Add navigation links for Annual Total
            let annualPlaceholder = addTotalAnnualLinks(query_1_rows)
            // Add navigation links for Monthly Total
            let monthPlaceholder = addTotalMonthlyLinks(query_1_rows)
            // Add navigation links for State
            let statePlaceholder = addStateLinks()
            // Replace string placeholders
            response = response.replace('%%List_Placeholder_Total_Year%%', annualPlaceholder)
            response = response.replace('%%List_Placeholder_Sector_Annual%%', sectorAnnualPlaceholder)
            response = response.replace('%%List_Placeholder_Total_Month%%', monthPlaceholder)
            response = response.replace('%%List_Placeholder_Sector_Monthly%%', sectorMonthlyPlaceholder)
            response = response.replace('%%List_Placeholder_State%%', statePlaceholder)
            callback(response)
        })

    })

}

/* Creates and returns navigation links for Sector Montly Sub */
function addSectorMonthlyLinks(query_1_rows, query_2_rows) {
    //Sector
        // Month
            // Year
    return createHtmlListElements(query_2_rows, (query_2_rows) =>
            `<a>${query_2_rows.sector_name}</a><ul class="menu" style="max-height: 300px; overflow-y:scroll;">` +
            createHtmlListElements(months_array, (month) =>
                `<a>${month}</a><ul class="menu" style="max-height: 300px; overflow-y:scroll;">` +
                createHtmlListElements(query_1_rows, (query_1_rows) =>
                    `<a href=/${query_2_rows.sector_name}/monthly/${month}/${query_1_rows.year}>${query_1_rows.year}</a>`) +
                    `</ul>`) + `</ul><div class="sidebar_buffer"></div>`);
}

/* Creates and returns navigation links for Sector Annual Sub */
function addSectorAnnualLinks(query_1_rows, query_2_rows) {
    // Sector
        // Year
    return createHtmlListElements(query_2_rows, (query_2_rows) =>
            `<a>${query_2_rows.sector_name}</a><ul class="menu" style="max-height: 300px; overflow-y:scroll;">` +
            createHtmlListElements(query_1_rows, (query_1_rows) =>
                `<a href="/${query_2_rows.sector_name}/annual/${query_1_rows.year}">${query_1_rows.year}</a>`) +
                `</ul><div class="sidebar_buffer"></div>`)
}

/* Creates and returns navigation links for Total Annual Sub */
function addTotalAnnualLinks(query_1_rows) {
    // Year
    return createHtmlListElements(query_1_rows, (query_1_rows) => `<a href="/total/annual/${query_1_rows.year}">
    ${query_1_rows.year}</a>`)
}
/* Creates and returns navigation links for Total Montly Sub */
function addTotalMonthlyLinks(query_1_rows) {
    // Month
        // Year
    return createHtmlListElements(months_array, (month) =>
        `<a>${month}</a><ul class="menu" style="max-height: 300px; overflow-y:scroll;">` +
        createHtmlListElements(query_1_rows, (query_1_rows) =>
            `<a href="/total/monthly/${month}/${query_1_rows.year}">${query_1_rows.year}</a>`) +
            `</ul><div class="sidebar_buffer"></div>`)
}
/* Creates and returns navigation links for State Sub */
function addStateLinks() {
    // State
    return createHtmlListElements(states, (state) => `<a href="/state/${state}">${state}</a>`)
}

/* Wraps <li> tags around all input list elements and returns all concatnated together */
function createHtmlListElements(list, transform) {
    return list
        .map((element) => `<li>${transform(element)}</li>`)
        .join('')
}

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

// //TODO: Specify where dataIndex comes from
// let dataIndex = 1;
// showCurrentData(dataIndex)

// // Next/previous controls
// function nextData(n) {
//     showCurrentData(dataIndex += n)
// }

// Should update the page with data from the database
// TODO: Should grab data from database
// function showCurrentData(n) {
//   let i;
//   let data = document.getElementsByClassName("data");
//   if (n > data.length) {dataIndex = 1}
//   if (n < 1) {dataIndex = data.length}
//   for (i = 0; i < data.length; i++) {
//     data[i].style.display = "none"
//   }
//   data[dataIndex-1].style.display = "block"
// }

