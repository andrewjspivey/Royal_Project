const axios = require('axios')
const url = require('url')
const sql = require('mssql'); 
const { Sequelize, json } = require('sequelize');
var config = require('./config')

const dotenv = require('dotenv');
const { resolve } = require('path');
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY


const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetEmployees?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`

let conn = new sql.ConnectionPool(config)

const InsertEmployees = async () => {
    try {
        const response = await axios.get(esoUrl, {headers: {Accept: 'application/json'}})
                
        var data = await response.data.Employees

        await conn.connect();

        const Employeetvp = new sql.Table("EmployeeType"); 
        Employeetvp.create = true

        Employeetvp.columns.add('EmployeeId', sql.VarChar(20), { nullable: false});
        Employeetvp.columns.add('FirstName', sql.VarChar(25), { nullable: false });
        Employeetvp.columns.add('LastName', sql.VarChar(40), { nullable: false });
        Employeetvp.columns.add('Address', sql.VarChar(60), { nullable: true });
        Employeetvp.columns.add('BirthDate', sql.VarChar(40), { nullable: true });
        Employeetvp.columns.add('CellPhone', sql.VarChar(20), { nullable: true });
        Employeetvp.columns.add('City', sql.VarChar(30), { nullable: true });
        Employeetvp.columns.add('State', sql.VarChar(5), { nullable: true });
        Employeetvp.columns.add('Zip', sql.VarChar(12), { nullable: true });
        Employeetvp.columns.add('EmailAddress', sql.VarChar(40), { nullable: true });
        Employeetvp.columns.add('FTHireDate', sql.VarChar(30), { nullable: true });
        Employeetvp.columns.add('HomeCostCenter', sql.VarChar(10), { nullable: true });
        Employeetvp.columns.add('PayRate', sql.Decimal(4,2), { nullable: true });
        Employeetvp.columns.add('PayrollId', sql.VarChar(6), { nullable: true });
        Employeetvp.columns.add('Status', sql.Int, { nullable: true });

        var count = Object.keys(data).length;
        console.log(count);
        
        for (i = 0; i < count; i++) {
        Employeetvp.rows.add(data[i].EmployeeId, data[i].FirstName, data[i].LastName, 
            data[i].Address, data[i].BirthDate, data[i].CellPhone, data[i].City, 
            data[i].State, data[i].Zip, data[i].EmailAddress, data[i].FTHireDate,
            data[i].HomeCostCenter, data[i].PayRate, data[i].PayrollId, data[i].Status);
        };
        
        const req = new sql.Request(conn);

        await req.bulk(Employeetvp);

        req.input('Employeetvp', Employeetvp)

        await req.execute('EmployeeUpsert');
        
        }
        catch (error) {
            console.log(error)
        }
        finally {
            // shut down pool since we're no longer using it
            await conn.close();
        }

}

InsertEmployees()

// const pullEmployees = async (callback) => {
//     try {
//         const response = await axios.get(esoUrl, {headers: {Accept: 'application/json'}})
//         var data = await response.data.Employees
        
//         setTimeout(() => {
//             callback(data)
//         }, 2000)
//     }
//     catch (error) {
//         console.log(error)
//     }
// }

// const parseEmployeeId = (data) => {
//     var esoCount = Object.keys(data).length;
    
//     for (let i = 0; i < esoCount; i ++) {
//         data[i].EmployeeId = parseInt(data[i].EmployeeId, 10)
//     }
//     return data
// }

//var parsedData = pullEmployees(parseEmployeeId)