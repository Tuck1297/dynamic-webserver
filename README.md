# DynamicServerProject
Project worked on in participation of a Web Development course at the University of St. Thomas. 
The goal of this project is to build a dynamic server that serves data about a specific 
sustainability topic chosen by the students working on this project. 


## Directory Structure
```
/home
    /total
        /annual/:year
        /monthly/:month_id/:year
    /sector
        /annual/:year
        /monthly/:month_id/:year
    /state/:state
```
Navigation is currently only populated in the homepage path. Tucker is currently working on pulling 
that code out into its own method and have it be called in all the dynamic paths. 

Added some basic foundation code to the error client response webpage.