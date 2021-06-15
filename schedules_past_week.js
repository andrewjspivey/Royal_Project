
const axios = require('axios')
const url = require('url')
const sql = require('mssql/msnodesqlv8'); 
var config = require('./config')

const subDays = require('date-fns/subDays')
const addDays = require('date-fns/addDays')
var format = require('date-fns/format')

const dotenv = require('dotenv')
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY


//for clearLastWeek query
let overAWeekOld = subDays(new Date(), 7) // sets start time to 1 week ago for delete rows query in cleartable
let weekAgo = format(new Date(overAWeekOld), 'yyyy/MM/dd') //format for sql date query

console.log(weekAgo)

const clearLastWeek = async () => {
    await sql.connect(config)
    try {
        let sqlRequest = new sql.Request()
        sqlQuery = `delete from SchedulesPast where StartTime > '${weekAgo}'`
        sqlRequest.query(sqlQuery, function (err, data) {
            if (err) console.log(err)
            sql.close()
        })
        
    } catch (err) {
        console.log(err)
        sql.close()
    }
} //  `delete from PastWeekSched where StartTime > '${weekAgo}'`

let startSubDaysAgo = subDays(new Date(), 7) // sets start time to 1 week ago for eso call
let oneWeekAgo = format(new Date(startSubDaysAgo), 'MM/dd/yyyy') // date format for eso api call

let endSubDaysAgo = addDays(new Date(), 1) // sets end time to today at midnight for eso call
let twoDaysAgo = format(new Date(endSubDaysAgo), 'MM/dd/yyyy') 

const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetSchedules?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`
const params = new url.URLSearchParams({ starttime: oneWeekAgo, endtime: twoDaysAgo});

const pullAndInsertSchedules = async () => {
    try {
        const response = await axios.get(esoUrl, {params, headers: {Accept: 'application/json'}})
                
        var data = await response.data.Schedules
                
        await sql.connect(config)
        
        const table = new sql.Table("SchedulesPast");
        table.create = true;
        
        table.columns.add('EmployeeId', sql.VarChar(15), { nullable: true});
        table.columns.add('CostCenter', sql.VarChar(40), { nullable: true });
        table.columns.add('StartTime', sql.DateTime, { nullable: false });
        table.columns.add('EndTime', sql.DateTime, { nullable: true });
        table.columns.add('Duration', sql.Decimal(4,2), { nullable: true });
        table.columns.add('EarningCode', sql.VarChar(30), { nullable: true });
        table.columns.add('itemID', sql.Int, { nullable: false });
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
                console.log("success. Rows Affected: " + result.rowsAffected)
                sql.close()
            }
        })
                
    }

    catch (error) {
        console.log(error)
    }

}

const clearAndBulkInsert = async () => {
    try {
        await clearLastWeek()

        setTimeout(() => {
            pullAndInsertSchedules() 
        }, 2000);
        
    } catch (err) {
        console.log(err)
    }
}

clearAndBulkInsert()
    
    