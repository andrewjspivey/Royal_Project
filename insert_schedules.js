
const axios = require('axios')
const url = require('url')
const sql = require('mssql'); 

const subDays = require('date-fns/subDays')
var format = require('date-fns/format')

const dotenv = require('dotenv')
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY



let startSubDaysAgo = subDays(new Date(), 4)
let threeDaysAgo = format(new Date(startSubDaysAgo), 'MM/dd/yyyy')

let endSubDaysAgo = subDays(new Date(), 3)
let twoDaysAgo = format(new Date(endSubDaysAgo), 'MM/dd/yyyy')

console.log(threeDaysAgo)


const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetSchedules?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`
const params = new url.URLSearchParams({ starttime: threeDaysAgo, endtime: twoDaysAgo});


const config = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    database: process.env.DATABASE_NAME
};


const pullAndInsertSchedules = async () => {

    try {
        const response = await axios.get(esoUrl, {params, headers: {Accept: 'application/json'}})
                
        var data = await response.data.Schedules
    
        console.log(data)
                
        await sql.connect(config)

        console.log("connected")
        
        const table = new sql.Table("SchedulesTableclose");
        table.create = true;
        
        table.columns.add('EmployeeId', sql.VarChar(15), { nullable: true });
        table.columns.add('CostCenter', sql.VarChar(40), { nullable: true });
        table.columns.add('StartTime', sql.VarChar(30), { nullable: true });
        table.columns.add('EndTime', sql.VarChar(30), { nullable: true });
        table.columns.add('Duration', sql.Decimal(4,2), { nullable: true });
        table.columns.add('EarningCode', sql.VarChar(30), { nullable: true });
        table.columns.add('itemID', sql.Int, { nullable: true });
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
    
pullAndInsertSchedules()
    