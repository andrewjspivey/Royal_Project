
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

let startSubDaysAgo = subDays(new Date(), 1)
let yesterday = format(new Date(startSubDaysAgo), 'MM/dd/yyyy')

let endSubDaysAgo = subDays(new Date(), 0)
let today = format(new Date(endSubDaysAgo), 'MM/dd/yyyy')

console.log(yesterday)

const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetPunches?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`
const params = new url.URLSearchParams({ starttime: yesterday, endtime: today});


const config = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    database: process.env.DATABASE_NAME,
    accept_eula: process.env.ACCEPT_EULA
};


const pullAndInsertPunches = async () => {

    try {
        const response = await axios.get(esoUrl, {params, headers: {Accept: 'application/json'}})
                
        var data = await response.data.Punches
    
        //console.log(data[15])
                
        await sql.connect(config)

        console.log("connected")
        
        const table = new sql.Table("PunchesPunchId");
        table.create = true;
        
        table.columns.add('EmployeeId', sql.VarChar(20), { nullable: false });
        table.columns.add('FirstName', sql.VarChar(30), { nullable: true });
        table.columns.add('LastName', sql.VarChar(40), { nullable: true });
        table.columns.add('InPunchTime', sql.DateTime, { nullable: true });
        table.columns.add('OutPunchTime', sql.DateTime, { nullable: true });
        table.columns.add('PunchId', sql.Int, { nullable: false, primary: true });
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
                console.log("success" + result)
                sql.close()
            }
        })

        
                        
        }
        catch (error) {
            console.log(error)
        }

            
    }
    
    pullAndInsertPunches()
    