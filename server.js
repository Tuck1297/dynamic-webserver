// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { debug } = require('console');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'Energy.sqlite3');
let js_dir = path.join(__dirname, 'public/js');

let app = express();
let port = 8000;

let homeGlobalData = []
let canvasQueryParams = []
let canvasQuery = `SELECT * from AnnualSectorEnergy`

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
                display404Page(res, `Error: Internal problem!`)
                return
            }
            else
                resolve(template)
        })
    })
}
/* Executes the input query -- redirects to 404 error page if not found */
function callDatabase(query, params, res) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            // Send error page as response if there is a SQL error
            if (err) {
                display404Page(res, `Error: no data for the following paramaters: ${params}`)
                console.log('check-1')
                console.error(err)
                reject(err)
                return
            }
            if (rows === undefined || rows.length === 0) {
                display404Page(res, `Error: no data for the following parameters: ${params}`)
                console.error(err)
                reject(`DB result is empty for query ${query}, ${params}`)
                return
            }
            resolve(rows)
        })
    })
}
// dbType will either be AnnualEnergy or MonthlyEnergy
//AnnualEnergy or MonthlyEnergy
function checkBounds(year, month, dbType) {
    return new Promise((resolve, reject) => {
        console.log(Number.isInteger(parseInt(year)))
        if (Number.isInteger(parseInt(year)) == false) {
            resolve(true)
        }
        db.all(`SELECT DISTINCT year from ${dbType}`, [], (err, rows) => {
            if (err) {
                console.log(err)
                reject(err)
                return
            }
            console.log(rows[0])
            let [min_year, max_year] = [rows[0], rows[rows.length - 1]]
            //need to get first and last index here
            console.log(min_year.year, max_year.year, year)

            if (year < min_year.year || year > max_year.year || year < min_year.Year || year > max_year.Year) {
                console.log(month)
                if (months.includes(month) == false) {
                    resolve(true)
                }
                resolve(true)
            } else if (months.includes(month) == false && month != null) {
                resolve(true)
            }
            resolve(false)
        })
    })
}

function capitalize(value) {
    return `${value.slice(0,1).toUpperCase()}${value.slice(1, value.length)}`
}

// Dynamic File path for homepage --> index.html
app.get('/homepage', (req, res) => {

    let query_1 = `SELECT sector.sector_name, sum(total) as sum FROM AnnualSectorEnergy JOIN Sector WHERE 
        Sector.sector_id=AnnualSectorEnergy.sector_id AND year=2021 GROUP BY Sector.sector_name`
    let query_2 = `SELECT year, total_primary from AnnualEnergy`
    let query_3 = `SELECT State, ethenol FROM StateEnergy2020 WHERE State != "United States"`
    const promises = [
        callDatabase(query_1, [], res),
        callDatabase(query_2, [], res),
        callDatabase(query_3, [], res),
        readFile(path.join(js_dir, 'script.js'), res),
    ]

    createPageFromDynamicTemplate('index.html', res, (page) => {
        // If there was an retrieval error -- redirect to 404 error page
        if (page.toString().slice(0, 5) == 'Error') {
            display404Page(res, `Error: Internal problem!`)
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
        callDatabase(query_1, [], js_res),
        callDatabase(query_2, [], js_res),
        callDatabase(query_3, [], js_res),
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

app.get('/sector/:sector/annual/:year', (req, res) => {
    let sector = req.params.sector
    let year = req.params.year

    sector = capitalize(sector)

    checkBounds(year, null, "AnnualSectorEnergy")
        .then((result) => {
            if (result == true) {
                display404Page(res, `Error: no data for ${sector}/${year}`)
                return
            }


            canvasQuery =
                `SELECT total, biomass, waste, ethenol, wood, hydro_electric, geothermal, solar, wind,  
        biodiesel, renewable_diesel, other_biodiesel FROM AnnualSectorEnergy join Sector on AnnualSectorEnergy.sector_id=
        Sector.sector_id WHERE Sector.sector_name = ? AND AnnualSectorEnergy.year = ?`
            canvasQueryParams = [sector, year]

            createPageFromDynamicTemplate('sector.html', res, (page) => {
                let query = `SELECT Image_1_ALT AS Img1, Image_2_ALT AS Img2, Image_3_ALT AS Img3 
        FROM Sector WHERE sector_name = ?`
                callDatabase(query, [sector], res)
                    .then((rows) => {
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
                        res.status(200).type('html').send(response)
                    }).catch((err) => {
                        // display404Page function is called in callDatabase
                        console.log(err)
                    })
            })
        })
})

app.get('/javascript/sector', (req, js_res) => {
    fs.readFile(path.join(js_dir, 'sector.js'), 'utf-8', (err, js_page) => {
        if (err) {
            js_res.status(404).type('js').send(`Error: ${err}`)
            return
        }
        db.all(canvasQuery, canvasQueryParams, (err, rows) => {
            if (err) {
                js_res.status(404).type('js').send(`Error: ${err}`)
                return
            }
            if (rows.length === 0 || rows[0].total == '') {
                // id="chartContainer"
                // id="pie"
                let JavaErrorRes = `
                let graph_1 = document.getElementById('chartContainer')
                let graph_2 = document.getElementById('pie')
                let node = document.createElement("h2")
                let textnode = document.createTextNode("Sorry there is currently no data available...")
                node.appendChild(textnode)
                graph_1.appendChild(node)
                graph_2.appendChild(node)`

                js_res.status(200).type('js').send(JavaErrorRes)
                return
            }
            let header = ``
            let row1data = ``
            for (let data in rows[0]) {
                header += `<th>${capitalize(data)}</th>`
                let data_temp = rows[0][data]
                if (data_temp == '') {
                    data_temp = 0
                }
                row1data += `<td>${data_temp}</td>`;
            }
            let table = `<tr>${header}</tr><tr>${row1data}</tr>`

            let format_data = ``
            let format_data_2 = ``
            for (let data in rows[0]) {
                let label_name = capitalize(data)
                if (rows[0][data] != '') {
                    if (label_name !== 'Biomass' & label_name !== 'Total') {
                        format_data_2 += `{ y: ${rows[0][data]}, label: "${label_name}"},`
                    }
                    format_data += `{ y: ${rows[0][data]}, label: "${label_name}"},`
                }
            }
            let js_response = js_page
                .toString()
                .replace('%%Data_Placeholder%%', format_data.slice(0, -1))
                .replace('%%Data_Placeholder_2%%', format_data_2.slice(0, -1))
                .replace('%%Sector%%', `${canvasQueryParams[0]} Sector`)
                .replace('%%table_data%%', table)
            js_res.status(200).type('js').send(js_response)
        })
    })
})

// Dynamic path for Sector Monthly Data

app.get('/sector/:sector/monthly/:month/:year', (req, res) => {

    let sector = req.params.sector
    let year = parseInt(req.params.year)
    let month = req.params.month

    month = capitalize(month)
    sector = capitalize(sector)

    checkBounds(year, month, "MonthlySectorEnergy")
        .then((result) => {
            if (result == true) {
                display404Page(res, `Error: no data for ${month}/${year}`)
                return
            }

            canvasQuery =
                `SELECT total, biomass, waste, ethenol, wood, hydro_electric, geothermal, solar, wind,
           biodiesel, renewable_diesel, other_biodiesel FROM MonthlySectorEnergy JOIN Sector ON MonthlySectorEnergy.sector_id=
           Sector.sector_id JOIN Month ON Month.month_id=MonthlySectorEnergy.month_id
           WHERE Sector.sector_name = ? AND MonthlySectorEnergy.year = ? AND Month.month = ?`
            canvasQueryParams = [sector, year, month]

            createPageFromDynamicTemplate('sector.html', res, (page) => {
                // If there was an retrieval error -- redirect to 404 error page

                let query = `SELECT Image_1_ALT AS Img1, Image_2_ALT AS Img2, Image_3_ALT AS Img3 
        FROM Sector WHERE sector_name = ?`
                db.all(query, [sector], (err, rows) => {
                    if (err) {
                        display404Page(res, `Error: no data for ${sector}/${month}/${year}`)
                        return
                    }
                    if (rows.length == 0) {
                        display404Page(res, `Error: no data for ${sector}/${month}/${year}`)
                        return
                    }
                    let response = page
                        .toString()
                        .replace('%%Title_Placeholder%%', `${sector}:${month}:${year}`)
                        .replace('%%route%%', '/javascript/sector')
                        .replace('%%Sector_Title_Placeholder%%', `${sector}:${month}:${year}`)
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
                    res.status(200).type('html').send(response)
                })
            })
        })
})

// Dynamic path for State Data

app.get('/state/:state', (req, res) => {
    let state = req.params.state

    state = capitalize(state)

    canvasQuery = `SELECT * FROM StateEnergy2020 WHERE state = ?`
    canvasQueryParams = [state]

    //add Javascript to head
    // let graphData = ''
    // let data = ''
    // //creating headers
    // data = data + '<tr>'
    // data = data + '<th>State</th>'
    // data = data + '<th>Coal</th>'
    // data = data + '<th>Natural Gas</th>'
    // data = data + '<th>Distillate Fuel</th>'
    // data = data + '<th>HGL</th>'
    // data = data + '<th>Jet Fuel</th>'
    // data = data + '<th>Petroleum Gasoline</th>'
    // data = data + '<th>Residual Fuel</th>'
    // data = data + '<th>Other</th>'
    // data = data + '<th>Total Fossil Fuel</th>'
    // data = data + '<th>Supplemental Gaseous Fuel</th>'
    // data = data + '<th>Biodiesel</th>'
    // data = data + '<th>Ethenol</th>'
    // data = data + '</tr>'
    createPageFromDynamicTemplate('state.html', res, (page) => {
        if (page.toString().slice(0, 5) == 'Error') {
            display404Page(res, `Error: no data for ${state}`)
            return
        }
        let query = `SELECT * FROM StateEnergy2020 WHERE state = ?`
        db.all(query, [state], (err, rows) => {
            if (err) {
                display404Page(res, `Error: no data for ${state}`)
                return
            }
            if (rows.length === 0) {
                display404Page(res, `Error: no data for ${state}`)
                return
            }
            let header = ``
            let row1data = ``
            for (let data in rows[0]) {
                header += `<th>${capitalize(data)}</th>`
                row1data += `<td>${rows[0][data]}</td>`;
            }
            let table = `<tr>${header}</tr>
                         <tr>${row1data}</tr>`
            // //Initializing
            // let state = rows.map((row) => row.state)
            // let coal = rows.map((row) => row.coal)
            // let naturalGas = rows.map((row) => row.natural_gas)
            // let distillateFuel = rows.map((row) => row.distillate_fuel)
            // let hgl = rows.map((row) => row.hgl)
            // let jetFuel = rows.map((row) => row.jet_fuel)
            // let petroleumGasoline = rows.map((row) => row.petroleum_gasoline)
            // let residualFuel = rows.map((row) => row.residual_fuel)
            // let other = rows.map((row) => row.other)
            // let totalFossilFuel = rows.map((row) => row.total_fossil_fuel)
            // let supplementalGaseousFuel = rows.map((row) => row.supplemental_gaseous_fuel)
            // let biodiesel = rows.map((row) => row.biodiesel)
            // let ethenol = rows.map((row) => row.ethenol)
            // //creating row
            // data = data + '<tr>'
            // data = data + '<td>' + state + '</td>'
            // data = data + '<td>' + coal + '</td>'
            // data = data + '<td>' + naturalGas + '</td>'
            // data = data + '<td>' + distillateFuel + '</td>'
            // data = data + '<td>' + hgl + '</td>'
            // data = data + '<td>' + jetFuel + '</td>'
            // data = data + '<td>' + petroleumGasoline + '</td>'
            // data = data + '<td>' + residualFuel + '</td>'
            // data = data + '<td>' + other + '</td>'
            // data = data + '<td>' + totalFossilFuel + '</td>'
            // data = data + '<td>' + supplementalGaseousFuel + '</td>'
            // data = data + '<td>' + biodiesel + '</td>'
            // data = data + '<td>' + ethenol + '</td>'
            // data = data + '</tr>'
            let finalPage = page
                .replace('%%Placeholder_Content%%', table)
                .replace('%%route%%', `/javascript/state`)
                .replace('%%Title_Placeholder%%', state)
            // .replace('%%link_prev%%', `/state/${prev_state}`)
            // .replace('%%link_next%%', `/state/${next_state}`)
            res.status(200).type('html').send(finalPage)
        })
    })
})

app.get('/javascript/state', (req, js_res) => {
    fs.readFile(path.join(js_dir, 'state.js'), 'utf-8', (err, js_page) => {
        if (err) {
            js_res.status(404).type('js').send(`Error: ${err}`)
            return
        }

        db.all(canvasQuery, canvasQueryParams, (err, rows) => {
            if (err) {
                js_res.status(404).type('js').send(`Error: ${err}`)
                return
            }
            let format_data = ``
            let largest_val = 0
            for (let data in rows[0]) {
                let label_name = capitalize(data)
                let current_val = parseFloat(rows[0][data])
                if (current_val != 0 & label_name != 'State') {
                    if (current_val > largest_val) {
                        largest_val = current_val
                    }
                    format_data += `{ y: ${current_val}, label: "${label_name}"},`
                }
            }
            // console.log(rows[0])

            //let largest_val = Math.max(rows[0].slice(1, rows[0].length))
            // console.log(largest_val)
            let state = rows[0].state

            let js_response = js_page
                .toString()
                .replace('%%Data_Placeholder%%', format_data.slice(0, -1))
                .replace('%%State%%', rows[0].state)
                .replace('%%Total_Placeholder%%', parseFloat(largest_val + 100))
                .replace('%%abrev_placeholder%%', state)
            // // console.log(js_response)
            js_res.status(200).type('js').send(js_response)
        })
        // create table that displays data

    })
})



// Dynamic path for Total Annual Data
app.get('/total_annual/:year', (req, res) => {
    let year = parseInt(req.params.year)
   
    canvasQuery = `SELECT * FROM AnnualEnergy WHERE year = ?` // Query to retrieve data that will populate javascript graph
    canvasQueryParams = [year]

    checkBounds(year, null, "AnnualEnergy")
    .then((result) => {
        if (result == true) {
            display404Page(res, `Error: no data for total_monthly/${year}`)
            return
        }

        createPageFromDynamicTemplate('total.html', res, (page) => {        
            res.status(200).type('html').send(
                page.replace('%%route%%', `/javascript/total`)
                    .replace('%%Title%%', `${year}`)
                    .replace('%%Title_Placeholder%%', `Total: ${year}`)
            )
        })
    })
    .catch((err) => {
        console.error(err)
    })
})

// Dynamic path for Total Monthly Data
app.get('/total_monthly/:month/:year', (req, res) => {
    let month = capitalize(req.params.month)
    let monthID = getMonthID(month)
    let year = parseInt(req.params.year)
    canvasQuery = `SELECT * from MonthlyEnergy WHERE year = ? AND month_id = ?`
    canvasQueryParams = [year, monthID]

    checkBounds(year, month, "MonthlyEnergy")
    .then((result) => {
        if (result == true) {
            display404Page(res, `Error: no data for total_monthly/${month}/${year}`)
            return
        }

        createPageFromDynamicTemplate('total.html', res, (page) => {        
            res.status(200).type('html').send(
                page.replace('%%route%%', `/javascript/total`)
                    .replace('%%Title%%', `${month} ${year}`)
                    .replace('%%Title_Placeholder%%', `Total: ${month}/${year}`)
            )
        })
    })
    .catch((err) => {
        console.error(err)
    })
})

app.get('/javascript/total', (req, js_res) => {
    console.log('check')
    fs.readFile(path.join(js_dir, 'total.js'), 'utf-8', (err, js_file) => {
        if (err) {
            js_res.status(404).type('js').send(`Error: ${err}`)
            return
        }

        db.all(canvasQuery, canvasQueryParams, (err, rows) => {
            if (err) {
                js_res.status(404).type('js').send(`Error: ${err}`)
                return
            }
            if (rows.length === 0) {
                let error = `Empty result for query ${canvasQuery}`
                console.log(error);
                js_res.status(404).type('js').send(`Error: ${err}`)
                return
            }

            for(let property in rows[0]) {
                if (rows[0][property] == '') {
                    rows[0][property] = 0
                }
            }
            
            let [year, monthID] = canvasQueryParams
            let month = getMonthFromID(monthID) || ''
            let rowEntries = Object.entries(rows[0])
                  
            let tableHeaders = rowEntries
                .map( ([key, value]) => `<th>${capitalize(key)}</th>` )
                .join('')

            let tableRows = rowEntries
                .map( ([key, value]) => `<td>${value}</td>` )
                .join('')

            let table = `<tr>${tableHeaders}</tr><tr>${tableRows}</tr>`

            let dataPoints = rowEntries
                .filter( ([key, value]) => key != 'year' && key != 'month_id' )
                .map( ([key, value]) => `{ y: ${parseFloat(value)}, label: "${capitalize(key)}" }` )
                .join(', ')
            
                
            js_res.status(200).type('js').send(
                js_file
                    .toString()
                    .replace('%%Graph_Data%%', dataPoints)
                    .replace('%%Type_Data%%', table)
                    .replace('%%Chart_Title%%', `Energy Consumption in ${month} ${year}`)
                    .replace('%%Table_Html%%', table)
            )
        })
    })
})

function createPageFromDynamicTemplate(contentFileName, res, onContentInserted) {
    let contentPath = path.join(template_dir, contentFileName)
    let templatePath = path.join(template_dir, 'dynamic_route_template.html')

    fs.readFile(contentPath, (err, content) => {
        if (err) {
            display404Page(res, `Error: internal problem!`)
            console.error(err)
            return
        }
        fs.readFile(templatePath, 'utf-8', (err, template) => {
            if (err) {
                display404Page(res, `Error: internal problem!`)
                console.error(err)
                return
            }

            populateNavigation(template, res, (navigationTemplate) => {
                let page = navigationTemplate.replace('%%Placeholder_Content%%', content)
                onContentInserted(page)
            })
        })
    })
}

/* Builds the navigation path for all dynamic pages */
function populateNavigation(template, res, callback) {
    let annualYearsQuery = `SELECT DISTINCT year FROM AnnualSectorEnergy ORDER BY year`
    let monthlyYearsQuery = `SELECT DISTINCT year FROM MonthlyEnergy ORDER BY year`
    let sectorNamesQuery = `SELECT sector_name FROM Sector;`

    // callDatabase() will perform a 404 redirect, so no need to do that here.
    Promise.all([
        callDatabase(annualYearsQuery, [], res),
        callDatabase(monthlyYearsQuery, [], res),
        callDatabase(sectorNamesQuery, [], res)
    ]).then((results) => {
        let [annualYears, monthlyYears, sectorNames] = results
        monthlyYears = monthlyYears.map((r) => r.year)
        annualYears = annualYears.map((r) => r.year)
        sectorNames = sectorNames.map((r) => r.sector_name)

        // Populate Client Navigation
        let sectorMonthlyPlaceholder =
            createDoublyNestedListElements(sectorNames, months, monthlyYears, (sn, m, y) =>
                `<a href=/sector/${sn}/monthly/${m}/${y}>${y}</a>`
            )
        let sectorAnnualPlaceholder =
            createNestedListElements(sectorNames, annualYears, (sn, y) =>
                `<a href="/sector/${sn}/annual/${y}">${y}</a>`
            )
        let annualPlaceholder =
            createListElements(annualYears, (y) =>
                `<a href="/total_annual/${y}">${y}</a>`
            )
        let monthPlaceholder =
            createNestedListElements(months, monthlyYears, (m, y) =>
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
        .catch((err) => {
            console.error(err)
        })
}

function display404Page(res, message) {
    fs.readFile(path.join(template_dir, 'file_not_found.html'), (err, template) => {
        if (err) {
            res.status(404).type('text').send(`${message} ~ Please check your request and try again...`)
        } else {
            let response = template
                .toString()
                .replace('%%err_page_placeholder%%', message)
            res.status(404).type('html').send(response)
        }
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

function getMonthID(month) {
    return months
        .map((m) => m.toLowerCase())
        .indexOf(month.toLowerCase()) + 1
}

function getMonthFromID(monthID) {
    return months[monthID - 1] 
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
})