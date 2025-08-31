local TABLE = 'txz_metadata'

local function now() return os.time() end

local function loadData(identifier)
    local row = MySQL.single.await(('SELECT metadata FROM %s WHERE license = ?'):format(TABLE), { identifier })
    if row and row.metadata then
        local ok, decoded = pcall(json.decode, row.metadata)
        if ok and type(decoded) == 'table' then return decoded end
    end
    return {}
end

local function saveData(identifier, data)
    local encoded = json.encode(data)
    MySQL.update.await(([[INSERT INTO %s (license, metadata)
                          VALUES (?, ?)
                          ON DUPLICATE KEY UPDATE metadata = VALUES(metadata)]]):format(TABLE), { identifier, encoded })
end

local function CooldownRemaining(resource, identifier)
    local data = loadData(identifier)
    local r = data[resource]
    if r and type(r.cooldown) == 'number' then
        return math.max(0, r.cooldown - now())
    end
    return 0
end

local function SetCooldown(resource, identifier, seconds)
    seconds = tonumber(seconds) or 0
    local data = loadData(identifier)
    data[resource] = data[resource] or {}
    data[resource].cooldown = now() + math.max(0, seconds)
    saveData(identifier, data)
    return true
end

local function ClearCooldown(resource, identifier)
    local data = loadData(identifier)
    if data[resource] then
        data[resource].cooldown = nil
        saveData(identifier, data)
    end
end

exports('CooldownRemaining', CooldownRemaining)
exports('SetCooldown', SetCooldown)
exports('ClearCooldown', ClearCooldown)