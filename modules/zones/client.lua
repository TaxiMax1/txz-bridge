txz = txz or {}
local BR = {}
local inside = false
local current = nil
local zones = {}

local function txz.pointInAnyZone(pCoords)
    for _, z in ipairs(zones) do
        local r = z.radius or 0.0
        if r > 0.0 and #(pCoords - z.coords) <= r then
            return true, z
        end
    end
    return false, nil
end

local function txz.SetSafeZones(newZones)
    zones = newZones or {}
    inside = false
    current = nil
end

CreateThread(function()
    while true do
        local sleep = 350
        if #zones > 0 then
            local ped = PlayerPedId()
            local pCoords = GetEntityCoords(ped)
            local inZone, zone = pointInAnyZone(pCoords)

            if inZone and not inside then
                inside = true
                current = zone
                TriggerEvent('txz-bridge:zones:entered', current)
            elseif not inZone and inside then
                local last = current
                inside = false
                current = nil
                TriggerEvent('txz-bridge:zones:exited', last)
            end

            if inZone then sleep = 0 end
        end
        Wait(sleep)
    end
end)

local function txz.IsPlayerInSafeZone()
    return inside, current
end

local function txz.GetCurrentSafeZone()
    return current
end

local function txz.IsPointInSafeZone(pCoords)
    return pointInAnyZone(pCoords)
end

exports("SetSafeZones", function(...)
    return txz.SetSafeZones(...)
end)

exports("IsPlayerInSafeZone", function(...)
    return txz.IsPlayerInSafeZone(...)
end)

exports("GetCurrentSafeZone", function(...)
    return txz.GetCurrentSafeZone(...)
end)

exports("IsPointInSafeZone", function(...)
    return txz.IsPointInSafeZone(...)
end)