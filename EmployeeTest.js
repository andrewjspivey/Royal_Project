const axios = require('axios')
const url = require('url')
const sql = require('mssql'); 
const { Sequelize } = require('sequelize');
var config = require('./config')

const dotenv = require('dotenv');
const { resolve } = require('path');
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY


const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: 'localhost',
    dialect: 'mssql',
    port: 1433,
});

const Upsert = async () => {
    //await sql.connect(config)
    try {
        const [results, metadata] = await sequelize.query("SELECT * FROM EmployeeRecords");

        console.log(results[0])
        sequelize.close()
        // let sqlRequest = new sql.Request()
        // sqlQuery = `select * from EmployeeRecords`
        // sqlRequest.query(sqlQuery, function (err, data) {
        //     if (err) console.log(err)
        //     var employeesInDb = data.recordset[0]
        //     console.log(employeesInDb)
        //     sql.close()
        //})
        
    } catch (err) {
        console.log(err)
        sequelize.close()
    }
}

//Upsert()



const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetEmployees?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`

const pullEmployees = async (callback) => {
    try {

        const response = await axios.get(esoUrl, {headers: {Accept: 'application/json'}})
                
        var data = await response.data.Employees

        setTimeout(() => {
            callback(data)
        }, 2000)

    }
    catch (error) {
        console.log(error)
    }

}

const parseEmployeeId = (data) => {
    var esoCount = Object.keys(data).length;

    for (let i = 0; i < esoCount; i ++) {
        data[i].EmployeeId = parseInt(data[i].EmployeeId, 10)
    }
    //console.log(data[10])
    return data
}

var parsedData = pullEmployees(parseEmployeeId)

const InsertEmployees = async (data) => {
    try {

        var stringifiedData = await JSON.stringify(data)

        console.log(stringifiedData)
        
        //await sql.connect(config)

        //let sqlRequest = new sql.Request()

        // await sequelize.query(
        //     `BEGIN
        //     DECLARE @json NVARCHAR(MAX);
        //     SET @json = :dataToBeUpserted
        //     MERGE INTO EmployeeRecords AS Target
        //     USING (SELECT * from OpenJson(@json) WITH (
        //         EmployeeId varchar(20),
        //         FirstName varchar(25),
        //         LastName varchar(40),
        //         Address varchar(60),
        //         BirthDate varchar(40),
        //         CellPhone varchar(20),
        //         City varchar(30),
        //         State varchar(5),
        //         Zip varchar(12),
        //         EmailAddress varchar(40),
        //         FTHireDate varchar(30),
        //         HomeCostCenter varchar(10),
        //         PayRate decimal(4,2),
        //         PayrollId varchar(6),
        //         Status int,
        //     )) AS Source
        //     ON (Target.EmployeeId = Source.EmployeeId)
        //     WHEN MATCHED THEN
        //     UPDATE SET 
        //         Target.FirstName = Source.FirstName,
        //         Target.LastName = Source.LastName,
        //         Target.Address = Source.Address,
        //         Target.BirthDate = Source.BirthDate,
        //         Target.CellPhone = Source.CellPhone,
        //         Target.City = Source.City,
        //         Target.State = Source.State,
        //         Target.Zip = Source.Zip,
        //         Target.EmailAddress = Source.EmailAddress,
        //         Target.FTHireDate = Source.FTHireDate,
        //         Target.HomeCostCenter = Source.HomeCostCenter,
        //         Target.PayRate = Source.PayRate,
        //         Target.PayrollId = Source.PayrollId,
        //         Target.Status = Source.Status
        //     WHEN NOT MATCHED THEN           
        //         INSERT (EmployeeId, FirstName, LastName, Address, BirthDate, CellPhone,
        //             City, State, Zip, EmailAddress, FTHireDate, HomeCostCenter, PayRate, PayrollId, Status)
        //         VALUES (Source.EmployeeId, Source.FirstName, Source.LastName, Source.Address, Source.BirthDate, Source.CellPhone, Source.City, Source.State,
        //             Source.Zip, Source.EmailAddress, Source.FTHireDate, Source.HomeCostCenter, Source.PayRate, Source.PayrollId, Source.Status)
        //     END`),
        //     {
        //     replacements: {
        //         dataToBeUpserted: JSON.stringify(data)
        //     },
        //     }

            // sqlRequest.query(sqlQuery, function (err, data) {
            //     if (err) console.log(err)
            //     console.log(data)
            //     sql.close()
            // })
        

        }
        catch (error) {
            console.log(error)
        }
}

InsertEmployees(parsedData)
//console.log(pullEmployees())

const clearAndBulkInsert = async () => {
    try {
        await clearTable()

        setTimeout(() => {
            pullAndInsertEmployees() 
        }, 3000);
        
    } catch (err) {
        console.log(err)
    }
}

//clearAndBulkInsert()