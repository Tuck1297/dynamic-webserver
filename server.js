// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'Energy.sqlite3');

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
        let query = 'SELECT Year FROM AnnualSectorEnergy WHERE sector_id=1;'
        db.all(query, [], (err, rows) => {
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
            // Populate Client Navigation
            // Navigation for Total Annual
            let response = template.toString() 
            let total_years = ""
            let sector_years = ""
            for (let i = 0; i < rows.length; i++) {
                total_years = total_years + `<li><a href="/total/annual/${rows[i].year}" \
                target="_self">${rows[i].year}</a></li>`
                sector_years = sector_years + `<li><a href="/sector/annual/${rows[i].year}" \
                target="_self">${rows[i].year}</a></li>`
            }
            // Navigation for Total and Sector Monthly
            let total_months = ""
            let sector_months = ""
            let months_array = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July',
                                'August', 'September', 'October', 'November', 'December']
            let ul_head_tag = `<ul class="menu" style="max-height: 300px; overflow-y:scroll;">`  
            let ul_li_end_tag = `</ul></li> <div class="sidebar_buffer"></div>`          
            for (let i = 0; i < 12; i++) {
                let li_head_tag = `<li><a>${months_array[i]}</a>`
                total_months = total_months + li_head_tag + ul_head_tag
                sector_months = sector_months + li_head_tag + ul_head_tag 
                for (let x  = 0; x < rows.length; x++) {
                    total_months = total_months + `<li><a href="/total/monthly/${months_array[i]}/${rows[x].year}" \
                    target="_self">${rows[x].year}</a></li>`
                    sector_months = sector_months + `<li><a href="/sector/monthly/${months_array[i]}/${rows[x].year}" \
                    target="_self">${rows[x].year}</a></li>`
                }
                
                total_months = total_months + ul_li_end_tag
                sector_months = sector_months + ul_li_end_tag
            }
            // Navigation for State
            let state_array = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California'
            , 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii'
            , 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana'
            , 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi'
            , 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey'
            , 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma'
            , 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota'
            , 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington'
            , 'West Virginia', 'Wisconsin', 'Wyoming']
            let state = ""
            for (let i = 0; i < state_array.length; i++) {
                state = state + `<li><a href="/state/${state_array[i]}" \
                target="_self">${state_array[i]}</a></li>`
            }

            // queries to fill homepage with overview diagrams and tables will be executed here

            response = response.replace('%%List_Placeholder_Total_Year%%', total_years)
            response = response.replace('%%List_Placeholder_Sector_Annual%%', sector_years)
            response = response.replace('%%List_Placeholder_Total_Month%%', total_months)
            response = response.replace('%%List_Placeholder_Sector_Monthly%%', sector_months)
            response = response.replace('%%List_Placeholder_State%%', state)
            res.status(200).type('html').send(response)
        })
    })
})

// Dynamic path for Sector Annual Data

app.get('/:sector/annual/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year

    // todo add html template
    fs.readFile(path.join(template_dir, 'file_not_found.html'), 'utf-8', (err, template) => {
        // todo write query
        let query = 
            ``
            
        db.all(query, [], (err, rows) => {
            let response = template.toString()
            // todo replace placeholders
            
            res.status(200).type('html').send(response)
        })
    })
})

// Dynamic path for Sector Monthly Data

app.get('/:sector/monthly/:month/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year
    let month = req.params.month

    // todo add html template
    fs.readFile(path.join(template_dir, 'file_not_found.html'), 'utf-8', (err, template) => {
        // todo write query
        let query = 
            ``
            
        db.all(query, [], (err, rows) => {
            let response = template.toString()
            // todo replace placeholders
            
            res.status(200).type('html').send(response)
        })
    })
})

// Dynamic path for State Data

app.get('/state/:state', (req, res) => {
    let state = req.params.state

    // todo add html template
    fs.readFile(path.join(template_dir, 'file_not_found.html'), 'utf-8', (err, template) => {
        // todo write query
        let query = 
            ``
            
        db.all(query, [], (err, rows) => {
            let response = template.toString()
            // todo replace placeholders
            
            res.status(200).type('html').send(response)
        })
    })
})

// Dynamic path for Total Annual Data

app.get('/total/annual/:year', (req, res) => {
    let year = req.params.year

    // todo add html template
    fs.readFile(path.join(template_dir, 'file_not_found.html'), 'utf-8', (err, template) => {
        // todo write query
        let query = 
            ``
            
        db.all(query, [], (err, rows) => {
            let response = template.toString()
            // todo replace placeholders

            res.status(200).type('html').send(response)
        })
    })
})

// Dynamic path for Total Monthly Data

app.get('/total/monthly/:month_id/:year', (req, res) => {
    let monthID = req.params.month_id
    let year = req.params.year

    // todo add html template
    fs.readFile(path.join(template_dir, 'file_not_found.html'), 'utf-8', (err, template) => {
        // todo write query
        let query = 
            ``
            
        db.all(query, [], (err, rows) => {
            let response = template.toString()
            // todo replace placeholders
            
            res.status(200).type('html').send(response)
        })
    })
})

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
