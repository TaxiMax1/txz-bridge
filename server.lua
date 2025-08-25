ESX = exports['es_extended']:getSharedObject()

CreateThread(function()
    Wait(1000) 

    local sql = [[
        CREATE TABLE IF NOT EXISTS `txz_metadata` (
            `license` varchar(50) NOT NULL,
            `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`metadata`)),
            PRIMARY KEY (`license`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ]]

    MySQL.Async.execute(sql, {}, function(affectedRows)
        print("^2[txz_metadata]^7 Table check completed. Created if not existing.")
    end)
end)