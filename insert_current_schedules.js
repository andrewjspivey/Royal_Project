
const axios = require('axios')
const url = require('url')
const sql = require('mssql'); 

const addDays = require('date-fns/addDays')
var format = require('date-fns/format')

const dotenv = require('dotenv')
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY


let startTime = addDays(new Date(), 0) 
let today = format(new Date(startTime), 'MM/dd/yyyy') // sets start time as today for eso request

let endTime = addDays(new Date(), 2)
let nextDays = format(new Date(endTime), 'MM/dd/yyyy') // sets end time as 2 days ahead for eso request

// sql config
const config = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    database: process.env.DATABASE_NAME
};

// clear table before insert so no duplicates PK
const clearTable = async () => {
    await sql.connect(config)
    try {
        let result1 = new sql.Request()
        sqlQuery = `drop table if exists SchedulesTomorrow`
        result1.query(sqlQuery, function (err, data) {
            if (err) console.log(err)
            sql.close()
        })
        
    } catch (err) {
        console.log(err)
        sql.close()
    }
}

// Eso request url and params
const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetSchedules?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`
const params = new url.URLSearchParams({ starttime: today, endtime: nextDays});

// makes eso call to return data, uses data for bulk insert into db
const pullAndInsertSchedules = async () => {
    try {
        const response = await axios.get(esoUrl, {params, headers: {Accept: 'application/json'}})
        var data = await response.data.Schedules

        await sql.connect(config)
        
        const table = new sql.Table("SchedulesTomorrow");
        table.create = true;
        
        table.columns.add('EmployeeId', sql.VarChar(15), { nullable: true});
        table.columns.add('CostCenter', sql.VarChar(40), { nullable: true });
        table.columns.add('StartTime', sql.DateTime, { nullable: true });
        table.columns.add('EndTime', sql.DateTime, { nullable: true });
        table.columns.add('Duration', sql.Decimal(4,2), { nullable: true });
        table.columns.add('EarningCode', sql.VarChar(30), { nullable: true });
        table.columns.add('itemID', sql.Int, { nullable: false, primary: true }); //PK
        table.columns.add('Qualification', sql.VarChar(50), { nullable: true });
        table.columns.add('ShiftId', sql.Int, { nullable: true });
        table.columns.add('UnitName', sql.VarChar(50), { nullable: true });
        table.columns.add('Comments', sql.VarChar(sql.MAX), { nullable: true });
        table.columns.add('inServiceTime', sql.DateTime, { nullable: true });
        table.columns.add('OutServiceTime', sql.DateTime, { nullable: true });
        table.columns.add('ResourceType', sql.VarChar(50), { nullable: true });
        table.columns.add('VehicleName', sql.VarChar(50), { nullable: true });

        var count = Object.keys(data).length;
        console.log(count);
        
        for (i = 0; i < count; i++) {
        table.rows.add(data[i].EmployeeId, data[i].CostCenter, data[i].StartTime, 
            data[i].EndTime, data[i].Duration, data[i].EarningCode, data[i].ItemId, 
            data[i].Qualification, data[i].ShiftId, data[i].UnitName, data[i].Comments, 
            data[i].InServiceTime, data[i].OutServiceTime, data[i].ResourceType, data[i].VehicleName);
        }
        
        const req = new sql.Request();
        req.bulk(table, (error, result) => {
            if (error) {
                console.log(error)
                sql.close()
            }
            else {
                console.log("success" + result)
                sql.close()
            }
        })
    }

    catch (error) {
        console.log(error)
}
}
    // waits to clear table then recreates and inserts current schedules
const clearAndBulkInsert = async () => {
    try {
        await clearTable()

        setTimeout(() => {
            pullAndInsertSchedules() 
        }, 3000);
        
    } catch (err) {
        console.log(err)
    }
}

clearAndBulkInsert()

    