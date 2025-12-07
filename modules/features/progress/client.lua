txz = txz or {}

local function playAnim(data)
    local ped = PlayerPedId()

    if not data.anim then return end

    local anim = data.anim
    local dict = anim.dict
    local clip = anim.clip
    local scenario = anim.scenario

    if (not scenario) and (not dict or not clip) then
        print("^1[txz-progress] ERROR: Must specify scenario OR dict+clip.^7")
        return
    end

    local flag = anim.flag or 49
    local blendIn = anim.blendIn or 3.0
    local blendOut = anim.blendOut or 1.0
    local duration = anim.duration or -1
    local playbackRate = anim.playbackRate or 0.0
    local lockX = anim.lockX or false
    local lockY = anim.lockY or false
    local lockZ = anim.lockZ or false
    local playEnter = anim.playEnter ~= false

    if scenario then
        TaskStartScenarioInPlace(ped, scenario, 0, true)
        return
    end

    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(0)
    end

    TaskPlayAnim(
        ped,
        dict,
        clip,
        blendIn,
        blendOut,
        duration,
        flag,
        playbackRate,
        lockX,
        lockY,
        lockZ
    )
end


local function attachProps(data)
    local ped = PlayerPedId()
    local props = data.prop

    if not props then return {} end
    if type(props) == "table" and props.model then
        props = { props }
    end

    local created = {}

    for _, cfg in ipairs(props) do
        local model = cfg.model
        local bone = cfg.bone or 60309
        local pos = cfg.pos or { x = 0.0, y = 0.0, z = 0.0 }
        local rot = cfg.rot or { x = 0.0, y = 0.0, z = 0.0 }

        RequestModel(model)
        while not HasModelLoaded(model) do Wait(0) end

        local obj = CreateObject(model, 0, 0, 0, true, true, false)
        AttachEntityToEntity(
            obj,
            ped,
            GetPedBoneIndex(ped, bone),
            pos.x, pos.y, pos.z,
            rot.x, rot.y, rot.z,
            false, false, false,
            false, 2, true
        )

        table.insert(created, obj)
    end

    return created
end


local function applyDisableControls(data)
    local disable = data.disable
    if not disable then return end

    CreateThread(function()
        while data._active do
            if disable.move then DisableControlAction(0, 30, true); DisableControlAction(0, 31, true) end
            if disable.car then DisableControlAction(0, 71, true); DisableControlAction(0, 72, true) end
            if disable.combat then DisablePlayerFiring(PlayerPedId(), true) end
            if disable.mouse then DisableControlAction(0, 1, true); DisableControlAction(0, 2, true) end
            if disable.sprint then DisableControlAction(0, 21, true) end

            Wait(0)
        end
    end)
end


function txz.progressBar(data)
    if type(data) ~= "table" then return false end

    local label = data.label or "Processing..."
    local duration = data.duration or (data.anim and data.anim.duration) or 2000

    data._active = true
    playAnim(data)
    applyDisableControls(data)
    local props = attachProps(data)

    SendNUIMessage({
        action = "progress",
        label = label,
        duration = duration
    })

    local p = promise.new()
    SetTimeout(duration, function()
        p:resolve(true)
    end)

    local result = Citizen.Await(p)

    data._active = false
    ClearPedTasks(PlayerPedId())

    for _, obj in ipairs(props) do
        DeleteEntity(obj)
    end

    return result
end


RegisterNetEvent("progress:show", function(data)
    txz.progressBar(data)
end)