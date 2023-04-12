-- INSERT INTO aiuroom.apartment (ApartmentNo, BuildingNo, SID, StudentNum)
-- VALUES (4, 1, 1, 0);

-- INSERT INTO aiuroom.room (ApartmentNo, BuildingNo, NID, Resident, RoomNo, RoomStatus, SID)
-- VALUES (2, 1, 1, Null, 4, 0, Null);
-- ALTER TABLE aiuroom.room MODIFY BuildingNo int NOT NULL PRIMARY KEY;
-- ALTER TABLE aiuroom.room DROP PRIMARY KEY, ADD PRIMARY KEY(BuildingNo, ApartmentNo, RoomNo);
-- SELECT * FROM aiuroom.student;

-- INSERT INTO aiuroom.room (BuildingNo, ApartmentNo, RoomNo, Resident, SID, NID, RoomStatus)
-- VALUES (2, 1, 1, Null, Null, 1, 0);

SELECT * FROM aiuroom.room;

-- ALTER TABLE aiuroom.room MODIFY RoomNo int NOT NULL;
-- ALTER TABLE aiuroom.room ADD PRIMARY KEY (BuildingNo, RoomNo);


