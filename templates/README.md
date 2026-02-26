Use these CSV headers for both .csv and .xlsx imports (same column names).

Admissions:
name,mobile,email,course,state,city,branch,academicYear,gender,dob,address,parentName,parentPhone,status,notes

Library Books:
title,author,isbn,category

Transport Allocations:
studentId,registrationNumber,routeId,routeName,stop,feesStatus

Notes:
- Provide either studentId or registrationNumber for transport.
- Provide either routeId or routeName for transport.
- feesStatus: Paid or Pending.
- dob should be ISO date (YYYY-MM-DD).
