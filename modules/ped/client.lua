txz = txz or {}

---@param model string
---@param coords vector3
---@param heading number
---@param useAnimation boolean
---@param animType "scenario" | "anim"
---@param animData table | string
---@param cb function | nil
---@return number | nil ped
function txz.spawnped(model, coords, heading, useAnimation, animType, animData, cb)
    local hash = GetHashKey(model)
    RequestModel(hash)

    local timeout = 5000
    while not HasModelLoaded(hash) and timeout > 0 do
        Wait(50)
        timeout -= 50
    end

    if not HasModelLoaded(hash) then
        print("Model kunne ikke loades: " .. model)
        if cb then cb(nil) end
        return nil
    end

    local ped = CreatePed(
        4,
        hash,
        coords.x,
        coords.y,
        coords.z,
        heading,
        false,
        true
    )

    SetEntityHeading(ped, heading)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)

    if useAnimation then
        if animType == "scenario" and type(animData) == "string" then
            TaskStartScenarioAtPosition(
                ped,
                animData,
                coords.x,
                coords.y,
                coords.z,
                heading,
                false,
                true,
                true
            )
        elseif animType == "anim" and type(animData) == "table" then
            RequestAnimDict(animData.dict)
            while not HasAnimDictLoaded(animData.dict) do
                Wait(10)
            end

            TaskPlayAnim(
                ped,
                animData.dict,
                animData.name,
                8.0,
                -8.0,
                -1,
                1,
                0,
                false,
                false,
                false
            )
        end
    end

    SetModelAsNoLongerNeeded(hash)

    if cb then cb(ped) end
    return ped
end

exports("spawnped", function(...)
    return txz.spawnped(...)
end)