const axios = require('axios')
const sql = require('mssql/msnodesqlv8'); 
var config = require('./config')

const dotenv = require('dotenv');
dotenv.config()

const custId = process.env.ESO_CUST_ID
const esoPassword = process.env.ESO_PASSWORD
const vendorKey = process.env.ESO_VENDOR_KEY


const esoUrl = `https://sched-api.esosuite.net/API_v1.7/EmployeeService.svc/GetEmployees?custId=${custId}&pass=${esoPassword}&vendorKey=${vendorKey}`

let conn = new sql.ConnectionPool(config)

const UpsertEmployees = async () => {
    try {
        const response = await axios.get(esoUrl, {headers: {Accept: 'application/json'}})
                
        var data = await response.data.Employees

        await conn.connect();

        let table = new sql.Table('#temp'); 
        table.create = true

        table.columns.add('EmployeeId', sql.VarChar(20), { nullable: false});
        table.columns.add('FirstName', sql.VarChar(25), { nullable: false });
        table.columns.add('LastName', sql.VarChar(40), { nullable: false });
        table.columns.add('Address', sql.VarChar(60), { nullable: true });
        table.columns.add('BirthDate', sql.VarChar(40), { nullable: true });
        table.columns.add('CellPhone', sql.VarChar(20), { nullable: true });
        table.columns.add('City', sql.VarChar(30), { nullable: true });
        table.columns.add('State', sql.VarChar(5), { nullable: true });
        table.columns.add('Zip', sql.VarChar(12), { nullable: true });
        table.columns.add('EmailAddress', sql.VarChar(40), { nullable: true });
        table.columns.add('FTHireDate', sql.VarChar(30), { nullable: true });
        table.columns.add('HomeCostCenter', sql.VarChar(10), { nullable: true });
        table.columns.add('PayRate', sql.Decimal(4,2), { nullable: true });
        table.columns.add('PayrollId', sql.VarChar(6), { nullable: true });
        table.columns.add('Status', sql.Int, { nullable: true });

        var count = Object.keys(data).length;
        console.log(count);
        
        for (i = 0; i < count; i++) {
        table.rows.add(data[i].EmployeeId, data[i].FirstName, data[i].LastName, 
            data[i].Address, data[i].BirthDate, data[i].CellPhone, data[i].City, 
            data[i].State, data[i].Zip, data[i].EmailAddress, data[i].FTHireDate,
            data[i].HomeCostCenter, data[i].PayRate, data[i].PayrollId, data[i].Status);
        };
        
        const req = new sql.Request(conn);

        //req.input('Employeetvp', Employeetvp)
        await req.bulk(table)

        await req.execute('EmployeeUpsert');

        await req.batch('drop table #temp')

        }
        catch (error) {
            console.log(error)
        }
        finally {
            await conn.close();
        }

}

UpsertEmployees()
