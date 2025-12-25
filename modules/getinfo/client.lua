ESX = exports['es_extended']:getSharedObject()
txz = txz or {}

local Cache = { metadata = {} }

local function DeepCopy(t)
    if type(t) ~= "table" then return t end
    local c = {}
    for k, v in pairs(t) do
        c[k] = DeepCopy(v)
    end
    return c
end

function txz.refreshPlayerData(cb)
    ESX.TriggerServerCallback("txz-benzinjob:getMeta", function(meta)
        if type(meta) ~= "table" then meta = {} end
        Cache.metadata.benzinjob_exp = tonumber(meta.benzinjob_exp) or 0
        Cache.metadata.benzinjob_money = tonumber(meta.benzinjob_money) or 0
        if cb then cb(DeepCopy(Cache)) end
    end)
end

function txz.getPlayerData()
    return Cache
end

CreateThread(function()
    while not ESX do Wait(100) end
    Wait(1000)
    txz.refreshPlayerData()
end)