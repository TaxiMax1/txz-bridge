local MetadataCache = {}

local function GetLicense(src)
    local identifiers = GetPlayerIdentifiers(src)
    for _, id in ipairs(identifiers) do
        if id:sub(1, 8) == "license:" then
            return id
        end
    end
    return nil
end

local function EnsureRowExists(license, cb)
    MySQL.Async.fetchScalar("SELECT 1 FROM txz_metadata WHERE license = @license LIMIT 1", {
        ['@license'] = license
    }, function(exists)
        if exists then
            if cb then cb(true) end
            return
        end

        MySQL.Async.execute("INSERT INTO txz_metadata (license, metadata) VALUES (@license, @metadata)", {
            ['@license'] = license,
            ['@metadata'] = json.encode({})
        }, function()
            if cb then cb(true) end
        end)
    end)
end

local function LoadMetadata(license, cb)
    if not license then
        if cb then cb({}) end
        return
    end

    MySQL.Async.fetchScalar("SELECT metadata FROM txz_metadata WHERE license = @license LIMIT 1", {
        ['@license'] = license
    }, function(raw)
        if not raw or raw == "" then
            MetadataCache[license] = {}
            if cb then cb(MetadataCache[license]) end
            return
        end

        local ok, decoded = pcall(json.decode, raw)
        if not ok or type(decoded) ~= "table" then
            decoded = {}
        end

        MetadataCache[license] = decoded
        if cb then cb(decoded) end
    end)
end

ESX.RegisterServerCallback('txz:getPlayerData', function(src, cb)
    local license = GetLicense(src)
    if not license then
        cb({ metadata = {} })
        return
    end

    if MetadataCache[license] then
        cb({ metadata = MetadataCache[license] })
        return
    end

    EnsureRowExists(license, function()
        LoadMetadata(license, function(meta)
            cb({ metadata = meta or {} })
        end)
    end)
end)

RegisterNetEvent('txz:setMetadata', function(key, value)
    local src = source
    local license = GetLicense(src)
    if not license then return end

    EnsureRowExists(license, function()
        LoadMetadata(license, function(meta)
            meta = meta or {}
            meta[key] = value
            MetadataCache[license] = meta

            MySQL.Async.execute([[
                UPDATE txz_metadata
                SET metadata = @metadata
                WHERE license = @license
            ]], {
                ['@license'] = license,
                ['@metadata'] = json.encode(meta)
            })

            TriggerClientEvent('txz:playerDataUpdated', src, { metadata = meta })
        end)
    end)
end)

AddEventHandler('playerDropped', function()
    local src = source
    local license = GetLicense(src)
    if license then
        MetadataCache[license] = nil
    end
end)