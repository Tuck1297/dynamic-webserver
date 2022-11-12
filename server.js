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

let globalQueryConstraints = []
let homeGlobalData = []
let js_data_query = ``

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

/* Reads in a file from an input directory -- retirects to 404 error page if not found */
function readFile(file, res) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, template) => {
            if (err) {
                console.log(err)
                display404Page(res)
                return
            }
            else
                resolve(template)
        })
    })
}
/* Executes the input query -- redirects to 404 error page if not found */
function callDatabase(query, res) {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            // Send error page as response if there is a SQL error
            if (err) {
                display404Page(res)
                return
            }
            else
                resolve(rows)
        })
    })
}

// Dynamic File path for homepage --> index.html
app.get('/homepage', (req, res) => {



    createPageFromDynamicTemplate('index.html', (page) => {
        // If there was an retrieval error -- redirect to 404 error page
        if (page.toString().slice(0, 5) == 'Error') {
            display404Page(res)
            return
        }

        let response = page
            .toString()
            .replace('%%Title_Placeholder%%', 'Homepage')
            .replace('%%route%%', '/javascript/home')
        res.status(200).type('html').send(response)

    })
})

app.get('/javascript/home', (req, js_res) => {
    let query_1 = `SELECT sector.sector_name, sum(total) as sum FROM AnnualSectorEnergy JOIN Sector WHERE 
        Sector.sector_id=AnnualSectorEnergy.sector_id AND year=2021 GROUP BY Sector.sector_name`
    let query_2 = `SELECT year, total_primary from AnnualEnergy`
    let query_3 = `SELECT State, ethenol FROM StateEnergy2020 WHERE State != "United States"`
    const promises = [
        callDatabase(query_1, js_res),
        callDatabase(query_2, js_res),
        callDatabase(query_3, js_res),
        readFile(path.join(js_dir, 'script.js'), js_res)
    ]
    Promise.all(promises).then(result => {
        // Once at this level we have all database data and javascript template
        let [sector, total, state, js_page] = result;

        // console.log(page)
        let format_sector_data = formatJavascriptData(sector, (sector) => ` y: ${sector.sum}, label: "${sector.sector_name}"`)
        let format_total_data = formatJavascriptData(total, (total) => ` y: ${total.total_primary}, label: "${total.year}"`)
        let format_state_data = formatJavascriptData(state, (state) => ` y: parseFloat(${state.ethenol}), label: "${state.state}"`)
        let js_response = js_page
            .toString()
            .replace('%%replace_sector_data%%', format_sector_data)
            .replace('%%replace_total_data%%', format_total_data)
            .replace('%%replace_state_data%%', format_state_data)
        js_res.status(200).type('js').send(js_response)
    })
})

/* Wraps all data from list in {}, and returns all concatenated together */
function formatJavascriptData(list, transform) {
    return list
        .map((element) => `{${transform(element)}}`)
        .join(',')
}

// Dynamic path for Sector Annual Data

app.get('/:sector/annual/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year
    globalQueryConstraints = []
    globalQueryConstraints.push(sector)
    globalQueryConstraints.push(year)
    js_data_query =
        `SELECT total, biomass, waste, ethenol, wood, hydro_electric, geothermal, solar, wind,  
         biodiesel, renewable_diesel, other_biodiesel FROM AnnualSectorEnergy join Sector on AnnualSectorEnergy.sector_id=
        Sector.sector_id WHERE Sector.sector_name = ? AND AnnualSectorEnergy.year = ?`
    createPageFromDynamicTemplate('sector.html', (page) => {
        // If there was an retrieval error -- redirect to 404 error page
        if (page.toString().slice(0, 5) == 'Error') {
            display404Page(res)
            return
        }
        let query = `SELECT Image_1_ALT AS Img1, Image_2_ALT AS Img2, Image_3_ALT AS Img3 
        FROM Sector WHERE sector_name = ?`
        db.all(query, [sector], (err, rows) => {
            if (err) {
                display404Page(res)
                return
            }
            // console.log(rows[0].Img1, rows[0].Img2, rows[0].Img3)
            let response = page
                .toString()
                .replace('%%Title_Placeholder%%', `${sector}:${year}`)
                .replace('%%route%%', '/javascript/sector')
                .replace('%%Sector_Title_Placeholder%%', `${sector}:${year}`)
                .replace('%%Image_Placeholder_1%%', `/images/${sector}_1.jpg`)
                .replace('%%Image_Placeholder_2%%', `/images/${sector}_2.jpg`)
                .replace('%%Image_Placeholder_3%%', `/images/${sector}_3.jpg`)
                .replace('%%Image_Descriptor_1%%', `${rows[0].Img1}`)
                .replace('%%Image_Descriptor_1%%', `${rows[0].Img1}`)
                .replace('%%Image_Descriptor_2%%', `${rows[0].Img2}`)
                .replace('%%Image_Descriptor_2%%', `${rows[0].Img2}`)
                .replace('%%Image_Descriptor_3%%', `${rows[0].Img3}`)
                .replace('%%Image_Descriptor_3%%', `${rows[0].Img3}`)
                .replace('%%Sector_Type%%', `${sector}`)
                // console.log(response)
            res.status(200).type('html').send(response)
        })

        // need to add images to dynamic sector pages
        // need to work on centering graph



        // console.log(rows[0])

    })

})

app.get('/javascript/sector', (req, js_res) => {
    fs.readFile(path.join(js_dir, 'sector.js'), 'utf-8', (err, js_page) => {
        if (err) {
            js_res.status(404).type('js').send(`Error: ${err}`)
            return
        }
        db.all(js_data_query, globalQueryConstraints, (err, rows) => {
            if (err) {
                js_res.status(404).type('js').send(`Error: ${err}`)
                return
            }
            let format_data = ``
            for (let data in rows[0]) {
                if (rows[0][data] != '') {
                    // rows[0][data] = 0
                    format_data += `{ y: ${rows[0][data]}, label: "${data.charAt(0).toUpperCase() + data.slice(1)}"},`
                }

            }
            let js_response = js_page
                .toString()
                .replace('%%Data_Placeholder%%', format_data.slice(0, -1))
                .replace('%%Sector%%', `${globalQueryConstraints[0]} Sector`)
                .replace('%%total_Placeholder%%', rows[0].total + 100)
            // console.log(js_response)
            js_res.status(200).type('js').send(js_response)

        })

    })
})

// Dynamic path for Sector Monthly Data

app.get('/:sector/monthly/:month/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year
    let month = req.params.month

    fs.readFile(path.join(template_dir, 'sector.html'), 'utf-8', (err, template) => {

        populateNavigation(template, (response) => {

            response = response.replace('%%Sector_Title:Date%%', `${sector}:${month}-${year}`)
            let query =
                `SELECT * FROM MonthlySectorEnergy JOIN Sector ON MonthlySectorEnergy.sector_id=
                Sector.sector_id JOIN Month ON Month.month_id=MonthlySectorEnergy.month_id 
                WHERE Sector.sector_name = ? AND MonthlySectorEnergy.year = ? AND Month.month = ?`

            db.all(query, [sector, year, month], (err, rows) => {
                // todo replace placeholders
                console.log(rows)
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
            let query = 'SELECT State,Coal,Natural Gas excluding Supplemental Gaseous Fuels,Distillate \
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
app.get('/total_annual/:year', (req, res) => {
    let year = req.params.year

    createPageFromDynamicTemplate('total_annual.html', (page) => {
        res.status(200).type('html').send(page)
    })
})

// Dynamic path for Total Monthly Data
app.get('/total_monthly/:month_id/:year', (req, res) => {
    let monthID = req.params.month
    let year = req.params.year

    createPageFromDynamicTemplate('total_monthly.html', (page) => {
        let query = `SELECT coal FROM MonthlyEnergy WHERE year = ?`

        db.all(query, [year], (err, rows) => {
            let coalConsumption = rows.map((row) => row.coal)
            console.log(coalConsumption)
            let finalPage = page.replace('%%Placeholder_Test%%', coalConsumption)

            res.status(200).type('html').send(finalPage)
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

let months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December']

function createPageFromDynamicTemplate(contentFileName, onContentInserted) {
    let contentPath = path.join(template_dir, contentFileName)
    let templatePath = path.join(template_dir, 'dynamic_route_template.html')

    fs.readFile(contentPath, (err, content) => {
        if (err) {
            onContentInserted(err)
        }

        fs.readFile(templatePath, 'utf-8', (err, template) => {
            if (err) {
                onContentInserted(err)
            } else {
                populateNavigation(template, (navigationTemplate) => {
                    let page = navigationTemplate.replace('%%Placeholder_Content%%', content)
                    onContentInserted(page)
                })
            }
        })
    })
}

/* Builds the navigation path for all dynamic pages */
function populateNavigation(template, callback) {
    let query1 = `SELECT year FROM AnnualSectorEnergy WHERE sector_id=1;`
    let query2 = `SELECT sector_name FROM Sector;`

    db.all(query1, [], (dbError, query_1_rows) => {
        if (dbError) {
            display404Page()
            return
        }
        db.all(query2, [], (err, query_2_rows) => {
            let years = query_1_rows.map((row) => row.year)
            let sectorNames = query_2_rows.map((row) => row.sector_name)

            // Populate Client Navigation
            let sectorMonthlyPlaceholder =
                createDoublyNestedListElements(sectorNames, months, years, (sn, m, y) =>
                    `<a href=/${sn}/monthly/${m}/${y}>${y}</a>`
                )
            let sectorAnnualPlaceholder =
                createNestedListElements(sectorNames, years, (sn, y) =>
                    `<a href="/${sn}/annual/${y}">${y}</a>`
                )
            let annualPlaceholder =
                createListElements(years, (y) =>
                    `<a href="/total/annual/${y}">${y}</a>`
                )
            let monthPlaceholder =
                createNestedListElements(months, years, (m, y) =>
                    `<a href="/total_monthly/${m}/${y}">${y}</a>`
                )
            let statePlaceholder =
                createListElements(states, (s) =>
                    `<a href="/state/${s}">${s}</a>`
                )

            // Replace string placeholders
            let response = template
                .toString()
                .replace('%%List_Placeholder_Total_Year%%', annualPlaceholder)
                .replace('%%List_Placeholder_Sector_Annual%%', sectorAnnualPlaceholder)
                .replace('%%List_Placeholder_Total_Month%%', monthPlaceholder)
                .replace('%%List_Placeholder_Sector_Monthly%%', sectorMonthlyPlaceholder)
                .replace('%%List_Placeholder_State%%', statePlaceholder)

            callback(response)
        })
    })
}

function display404Page(res) {
    fs.readFile(path.join(template_dir, 'file_not_found.html'), (err, template) => {
        if (err) {
            res.status(404).type('text').send('Please check your request and try again...')
            return
        }
        res.status(404).type('html').send(template)
    })
}

function createDoublyNestedListElements(grandparentList, parentList, childList, childTransform) {
    let elements = []

    for (let g of grandparentList) {
        elements.push(`<li> <a>${g}</a> <ul class="menu navParent">`)

        for (let p of parentList) {
            elements.push(`<li> <a>${p}</a> <ul class="menu navParent">`)

            for (let c of childList) {
                elements.push(createListElement(childTransform(g, p, c)))
            }
            elements.push(`</ul></li>`)
        }
        elements.push(`</ul><div class="sidebar_buffer"></div></li>`)
    }

    return elements.join('')
}

function createNestedListElements(parentList, childList, childTransform) {
    let elements = []

    for (let p of parentList) {
        elements.push(`<li><a>${p}</a> <ul class="menu navParent">`)

        for (let c of childList) {
            elements.push(createListElement(childTransform(p, c)))
        }
        elements.push(`</ul><div class="sidebar_buffer"></div></li>`)
    }
    return elements.join('')
}

/* Wraps <li> tags around all input list elements and returns all concatnated together */
function createListElements(list, transform) {
    return list
        .map(transform)
        .map(createListElement)
        .join('')
}

function createListElement(content) {
    return `<li>${content}</li>`
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

