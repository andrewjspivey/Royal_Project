
CREATE PROCEDURE EmployeeUpsert 
   
AS 
    MERGE INTO EmployeeRecords AS Target
            USING #temp AS Source
            ON Target.EmployeeId = Source.EmployeeId
            WHEN MATCHED THEN
            UPDATE SET 
                Target.FirstName = Source.FirstName,
                Target.LastName = Source.LastName,
                Target.Address = Source.Address,
                Target.BirthDate = Source.BirthDate,
                Target.CellPhone = Source.CellPhone,
                Target.City = Source.City,
                Target.State = Source.State,
                Target.Zip = Source.Zip,
                Target.EmailAddress = Source.EmailAddress,
                Target.FTHireDate = Source.FTHireDate,
                Target.HomeCostCenter = Source.HomeCostCenter,
                Target.PayRate = Source.PayRate,
                Target.PayrollId = Source.PayrollId,
                Target.Status = Source.Status
            WHEN NOT MATCHED THEN           
                INSERT (EmployeeId, FirstName, LastName, Address, BirthDate, CellPhone,
                    City, State, Zip, EmailAddress, FTHireDate, HomeCostCenter, PayRate, PayrollId, Status)
                VALUES (Source.EmployeeId, Source.FirstName, Source.LastName, Source.Address, Source.BirthDate, Source.CellPhone, Source.City, Source.State,
                    Source.Zip, Source.EmailAddress, Source.FTHireDate, Source.HomeCostCenter, Source.PayRate, Source.PayrollId, Source.Status);
            GO

