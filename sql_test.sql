

-- Insert rows into table 'dbo.TestTable'
INSERT INTO dbo.TestTable
( -- columns to insert data into
 [TableNameId], [Column1], [Column2]
)
VALUES
( -- first row: values for the columns in the list above
 1, 'some name', 'some date'
),
( -- second row: values for the columns in the list above
 2, 'something else', 'another thing'
)
-- add more rows here
GO