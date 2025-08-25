ESX = exports['es_extended']:getSharedObject()

CreateThread(function()
    print("[txz_metadata] Starting metadata scan...")

    MySQL.Async.fetchAll("SELECT license, metadata FROM txz_metadata", {}, function(result)
        local updated = 0

        for _, row in ipairs(result) do
            local license = row.license
            local fixed = false
            local decoded = nil

            local success, parsed = pcall(json.decode, row.metadata)

            if not success or type(parsed) ~= "table" then
                print(("[txz_metadata] Fixer LICENSE %s - metadata er ugyldig JSON"):format(license))
                decoded = {}
                fixed = true
            else
                decoded = parsed
            end

            if not decoded.taxijob or type(decoded.taxijob) ~= "table" then
                print(("[txz_metadata] Tilføjer manglende taxijob metadata for %s"):format(license))
                decoded.taxijob = {
                    xp = 0,
                    profit = 0,
                    total = 0
                }
                fixed = true
            else
                local tj = decoded.taxijob
                if type(tj.xp) ~= "number" or type(tj.profit) ~= "number" or type(tj.total) ~= "number" then
                    print(("[txz_metadata] Nulstiller ugyldige taxijob felter for %s"):format(license))
                    decoded.taxijob = {
                        xp = tonumber(tj.xp) or 0,
                        profit = tonumber(tj.profit) or 0,
                        total = tonumber(tj.total) or 0
                    }
                    fixed = true
                end
            end

            if fixed then
                MySQL.Async.execute([[
                    UPDATE txz_metadata
                    SET metadata = @metadata
                    WHERE license = @license
                ]], {
                    ['@license'] = license,
                    ['@metadata'] = json.encode(decoded)
                }, function(rowsChanged)
                    if rowsChanged > 0 then
                        updated += 1
                    end
                end)
            end
        end

        Wait(1000)
        print(("[txz_metadata] Færdig! Rettede %d rækker."):format(updated))
    end)
end)