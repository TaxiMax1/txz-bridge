txz = txz or {}

local CURRENT = nil

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

    if scenario then
        TaskStartScenarioInPlace(ped, scenario, 0, true)
        return
    end

    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do Wait(0) end

    TaskPlayAnim(ped, dict, clip, blendIn, blendOut, duration, flag, playbackRate, lockX, lockY, lockZ)
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

local function cleanupProgress(state)
    if not state then return end
    state.data._active = false

    ClearPedTasks(PlayerPedId())

    if state.props then
        for _, obj in ipairs(state.props) do
            DeleteEntity(obj)
        end
    end

    SendNUIMessage({ action = "progress:stop" })
    CURRENT = nil
end

RegisterNUICallback("progress:cancel", function(_, cb)
    if CURRENT and CURRENT.promise then
        CURRENT.cancelled = true
        CURRENT.promise:resolve(false)
        cleanupProgress(CURRENT)
    end
    cb({ ok = true })
end)

function txz.progressBar(data)
    if type(data) ~= "table" then return false end

    local duration = data.duration or (data.anim and data.anim.duration) or 2000

    data._active = true
    playAnim(data)
    applyDisableControls(data)
    local props = attachProps(data)

    local p = promise.new()
    CURRENT = {
        promise = p,
        cancelled = false,
        props = props,
        data = data
    }

    SendNUIMessage({
        action = "progress",
        duration = duration,
        title = data.title,
        subtitle = data.subtitle,
        percent = data.percent,
        icon = data.icon,
        iconColor = data.iconColor,
        canCancel = (data.canCancel ~= false)
    })

    CreateThread(function()
        local start = GetGameTimer()
        while data._active do
            if CURRENT and CURRENT.cancelled then
                return
            end
            if (GetGameTimer() - start) >= duration then
                p:resolve(true)
                cleanupProgress(CURRENT)
                return
            end
            Wait(10)
        end
    end)

    local result = Citizen.Await(p)
    data._active = false

    if CURRENT then
        cleanupProgress(CURRENT)
    end

    return result == true
end

RegisterNetEvent("progress:show", function(data)
    txz.progressBar(data)
end)

exports("progressBar", txz.progressBar)