
const axios = require('axios')
const url = require('url')
const sql = require('mssql/msnodesqlv8'); 
var config = require('./config')

const subDays = require('date-fns/subDays')
var format = require('date-fns/format')

const dotenv = require('dotenv')
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY


let startSubDaysAgo = subDays(new Date(), 1) // sets start time for eso call to yesterday at 12 AM
let yesterday = format(new Date(startSubDaysAgo), 'MM/dd/yyyy')

let endSubDaysAgo = subDays(new Date(), 0) // sets end time for eso call to today at 12 AM
let today = format(new Date(endSubDaysAgo), 'MM/dd/yyyy')

const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetPunches?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`
const params = new url.URLSearchParams({ starttime: yesterday, endtime: today});

// inserts all of yesterdays punches
const pullAndInsertPunches = async () => {
    try {
        const response = await axios.get(esoUrl, {params, headers: {Accept: 'application/json'}})
        var data = await response.data.Punches

        await sql.connect(config)
        
        const table = new sql.Table("Punches");
        table.create = true;
        
        table.columns.add('EmployeeId', sql.VarChar(20), { nullable: true });
        table.columns.add('FirstName', sql.VarChar(35), { nullable: true });
        table.columns.add('LastName', sql.VarChar(40), { nullable: true });
        table.columns.add('InPunchTime', sql.DateTime, { nullable: true });
        table.columns.add('OutPunchTime', sql.DateTime, { nullable: true });
        table.columns.add('PunchId', sql.Int, { nullable: true });
        table.columns.add('StartComment', sql.VarChar(sql.MAX), { nullable: true });
        table.columns.add('EndComment', sql.VarChar(sql.MAX), { nullable: true });
        table.columns.add('EHomeCostCenter', sql.VarChar(50), { nullable: true });
        
        var count = Object.keys(data).length;
        console.log(count);
        
        for (i = 0; i < count; i++) {
        table.rows.add(data[i].EmployeeId, data[i].FirstName, data[i].LastName, 
            data[i].InPunchTime, data[i].OutPunchTime, data[i].PunchId, data[i].StartComment, 
            data[i].EndComment, data[i].eHomeCostCenter);
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
    
pullAndInsertPunches()
    