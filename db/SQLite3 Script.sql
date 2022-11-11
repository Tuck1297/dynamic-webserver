-- DO NOT RUN THIS FILE. IT IS FOR REFERENCE ONLY --

.mode csv

CREATE TABLE Month(
	month_id INTEGER,
	month TEXT
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\Month.csv" Month

CREATE TABLE MonthlyEnergy(
	year INTEGER,
	month_id INTEGER,
	coal REAL,
	natural_gas REAL,
	petroleum REAL,
	fossil_fuel REAL,
	nuclear REAL,
	hydro_electric REAL,
	geothermal REAL,
	solar REAL,
	wind REAL,
	biomass REAL,
	total_renewable REAL,
	total_primary REAL,
	PRIMARY KEY (year, month_id),
	FOREIGN KEY (month_id) REFERENCES Month
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\MonthlyEnergyConsumption.csv" MonthlyEnergy

CREATE TABLE AnnualEnergy(
	year INTEGER,
	coal REAL,
	natural_gas REAL,
	petroleum REAL,
	fossil_fuel REAL,
	nuclear REAL,
	hydro_electric REAL,
	geothermal REAL,
	solar REAL,
	wind REAL,
	biomass REAL,
	total_renewable REAL,
	total_primary REAL,
	PRIMARY KEY (year)
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\AnnualEnergyConsumption.csv" AnnualEnergy

CREATE TABLE Sector (
	sector_id INT,
	sector_name TEXT
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\Sector.csv" Sector


CREATE TABLE AnnualSectorEnergy(
	year INTEGER,
	sector_id INTEGER,
	hydro_electric REAL,
	geothermal REAL,
	solar REAL,
	wind REAL,
	wood REAL,
	waste REAL,
	ethenol REAL,
	biomass REAL,
	total REAL,
	biodiesel REAL,
	renewable_diesel REAL,
	other_biodiesel REAL,
	PRIMARY KEY (year, sector_id),
	FOREIGN KEY (sector_id) REFERENCES Sector
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\AnnualSectorEnergy.csv" AnnualSectorEnergy


CREATE TABLE MonthlySectorEnergy(
	year INTEGER,
	month_id INTEGER,
	sector_id INTEGER,
	hydro_electric REAL,
	geothermal REAL,
	solar REAL,
	wind REAL,
	wood REAL,
	waste REAL,
	ethenol REAL,
	biomass REAL,
	total REAL,
	biodiesel REAL,
	renewable_diesel REAL,
	other_biodiesel REAL,
	PRIMARY KEY (year, sector_id, month_id),
	FOREIGN KEY (sector_id) REFERENCES Sector,
	FOREIGN KEY (month_id) REFERENCES Month
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\MonthlySectorEnergy.csv" MonthlySectorEnergy

CREATE TABLE StateEnergy2020(
	state TEXT,
	coal REAL,
	natural_gas REAL,
	distillate_fuel REAL,
	hgl REAL,
	jet_fuel REAL,
	petroleum_gasoline REAL,
	residual_fuel REAL,
	other REAL,
	total_fossil_fuel REAL,
	supplemental_gaseous_fuel REAL,
	biodiesel REAL,
	ethenol REAL,
	PRIMARY KEY (state)
);

.import --skip 1 "C:\\Users\\Michael\\Desktop\\StateEnergy2020.csv" StateEnergy2020