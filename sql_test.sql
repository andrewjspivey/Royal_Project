
--select * from EmployeeRecords


-- CREATE TYPE EmployeeType AS TABLE ( EmployeeId VARCHAR(20),
--                                     FirstName VARCHAR(25),
--                                     LastName VARCHAR(40), 
--                                     Address VARCHAR(60), 
--                                     BirthDate VARCHAR(40), 
--                                     CellPhone VARCHAR(20), 
--                                     City VARCHAR(30), 
--                                     State VARCHAR(5), 
--                                     Zip VARCHAR(12), 
--                                     EmailAddress VARCHAR(40), 
--                                     FTHireDate VARCHAR(30), 
--                                     HomeCostCenter VARCHAR(10), 
--                                     PayRate Decimal(4,2), 
--                                     PayrollId VARCHAR(6), 
--                                     Status INT );

-- CREATE PROCEDURE EmployeeUpsert 
--     @Employeetvp EmployeeType READONLY
-- AS 
--     MERGE INTO EmployeeRecords AS Target
--             USING @Employeetvp AS Source
--             ON Target.EmployeeId = Source.EmployeeId
--             WHEN MATCHED THEN
--             UPDATE SET 
--                 Target.FirstName = Source.FirstName,
--                 Target.LastName = Source.LastName,
--                 Target.Address = Source.Address,
--                 Target.BirthDate = Source.BirthDate,
--                 Target.CellPhone = Source.CellPhone,
--                 Target.City = Source.City,
--                 Target.State = Source.State,
--                 Target.Zip = Source.Zip,
--                 Target.EmailAddress = Source.EmailAddress,
--                 Target.FTHireDate = Source.FTHireDate,
--                 Target.HomeCostCenter = Source.HomeCostCenter,
--                 Target.PayRate = Source.PayRate,
--                 Target.PayrollId = Source.PayrollId,
--                 Target.Status = Source.Status
--             WHEN NOT MATCHED THEN           
--                 INSERT (EmployeeId, FirstName, LastName, Address, BirthDate, CellPhone,
--                     City, State, Zip, EmailAddress, FTHireDate, HomeCostCenter, PayRate, PayrollId, Status)
--                 VALUES (Source.EmployeeId, Source.FirstName, Source.LastName, Source.Address, Source.BirthDate, Source.CellPhone, Source.City, Source.State,
--                     Source.Zip, Source.EmailAddress, Source.FTHireDate, Source.HomeCostCenter, Source.PayRate, Source.PayrollId, Source.Status);
--             GO

-- DECLARE @Employeetvp AS EmployeeType