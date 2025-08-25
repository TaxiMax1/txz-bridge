---@param model string
---@param coords vector3
---@param heading number
---@param cb function | nil
---@return number | nil vehicle
function SpawnCar(model, coords, heading, cb)
    local hash = GetHashKey(model)
    RequestModel(hash)

    local timeout = 5000
    while not HasModelLoaded(hash) and timeout > 0 do
        Wait(50)
        timeout -= 50
    end

    if not HasModelLoaded(hash) then
        print("Køretøjsmodel kunne ikke loades: " .. model)
        if cb then cb(nil) end
        return nil
    end

    local vehicle = CreateVehicle(hash, coords.x, coords.y, coords.z, heading, true, false)
    SetEntityHeading(vehicle, heading)
    SetVehicleOnGroundProperly(vehicle)
    SetEntityAsMissionEntity(vehicle, true, true)
    SetVehicleNumberPlateText(vehicle, "CARGO")
    SetEntityInvincible(vehicle, false)
    SetVehicleDoorsLocked(vehicle, 1)

    SetModelAsNoLongerNeeded(hash)

    if cb then cb(vehicle) end
    return vehicle
end

exports('SpawnCar', SpawnCar)