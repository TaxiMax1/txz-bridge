local function SafeCrack(entity, locks, cb, createCam)
    if not DoesEntityExist(entity) then lib.print.error('SafeCrack: Entity does not exist') return end

    while NetworkGetEntityOwner(entity) ~= PlayerId() do
        NetworkRequestControlOfEntity(entity)
        Wait(100)
    end

    local ped = cache.ped
    local coords = GetEntityCoords(entity)
    local rotation = GetEntityRotation(entity)
    local dict = 'anim@scripted@heist@ig15_safe_crack@male@'
    local openedProp = GetHashKey('h4_prop_h4_safe_01b')
    local heading = GetEntityHeading(entity)
    
    lib.requestAnimDict(dict)

    local intro = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, intro, dict, "enter_player", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(entity, intro, dict, "enter_safe", 1.0, 1.0, 1)
    if createCam then NetworkAddSynchronisedSceneCamera(intro, dict, 'enter_cam') end
    NetworkStartSynchronisedScene(intro)
    Wait(766)

    local idle = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, idle, dict, "idle_player", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(entity, idle, dict, "idle_safe", 1.0, 1.0, 1)
    if createCam then NetworkAddSynchronisedSceneCamera(idle, dict, 'idle_cam') end
    NetworkStartSynchronisedScene(idle)

    local success = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, success, dict, "door_open_player", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(entity, success, dict, "door_open_safe", 1.0, 1.0, 1)
    if createCam then  NetworkAddSynchronisedSceneCamera(success, dict, 'door_open_cam') end

    exports['st_minigames']:SafeCrack(true, locks, function(hasWon)
        if hasWon then
            lib.requestModel(openedProp)
            NetworkStartSynchronisedScene(success)
            Wait(2533)
            NetworkStopSynchronisedScene(success)

            DeleteEntity(entity)
            local openedSafe = CreateObject(openedProp, coords.x, coords.y, coords.z, true, true, true)
            SetEntityHeading(openedSafe, heading)

            cb(true, openedSafe)
        else
            NetworkStopSynchronisedScene(idle)
            cb(false, nil)
        end
    end)

    RemoveAnimDict(dict)
end

exports('SafeCrack', SafeCrack)

local function EletricBox(entity, cb, time)
    if not DoesEntityExist(entity) then lib.print.error('EletricBox: Entity does not exist') return end

    while NetworkGetEntityOwner(entity) ~= PlayerId() do
        NetworkRequestControlOfEntity(entity)
        Wait(100)
    end

    local ped = cache.ped
    local coords = GetEntityCoords(entity)
    local rotation = GetEntityRotation(entity)
    local dict = 'anim@scripted@player@mission@tun_control_tower@male@'
    
    lib.requestAnimDict(dict)

    local intro = NetworkCreateSynchronisedScene(coords.xyz, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, intro, dict, "enter", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(entity, intro, dict, "enter_electric_box", 1.0, 1.0, 1)
    NetworkStartSynchronisedScene(intro)
    Wait(1566)

    local idle = NetworkCreateSynchronisedScene(coords.xyz, rotation, 2, false, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, idle, dict, "loop", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(entity, idle, dict, "loop_electric_box", 1.0, 1.0, 1)
    NetworkStartSynchronisedScene(idle)

    local exit = NetworkCreateSynchronisedScene(coords.xyz - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, exit, dict, "exit", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(entity, exit, dict, "exit_electric_box", 1.0, 1.0, 1)

    local hasWon = exports['elevate-minigames']:CircuitBreaker(1)
    if hasWon then
        NetworkStartSynchronisedScene(exit)
        Wait(2100)
        NetworkStopSynchronisedScene(exit)
        cb(true)
    else
        NetworkStartSynchronisedScene(exit)
        Wait(2100)
        NetworkStopSynchronisedScene(exit)
        cb(false)
    end

    RemoveAnimDict(dict)
end

exports('EletricBox', EletricBox)

local function OpenContainer(entity, cb)
    if not DoesEntityExist(entity) then lib.print.error('OpenContainer: Entity does not exist') return end

    while NetworkGetEntityOwner(entity) ~= PlayerId() do
        NetworkRequestControlOfEntity(entity)
        Wait(100)
    end

    local ped = cache.ped
    local coords = GetEntityCoords(entity)
    local rotation = GetEntityRotation(entity)
    local dict = 'anim@scripted@player@mission@tunf_train_ig1_container_p1@male@'
    local bagModel = GetHashKey('hei_p_m_bag_var22_arm_s')
    local grinderModel = GetHashKey('tr_prop_tr_grinder_01a')
    local lockModel = GetHashKey('tr_prop_tr_lock_01a')
    local heading = GetEntityHeading(entity)
    
    lib.requestAnimDict(dict)
    lib.requestModel(bagModel)
    lib.requestModel(grinderModel)
    lib.requestModel(lockModel)
    lib.requestNamedPtfxAsset('scr_tn_tr')

    local bagProp = CreateObject(bagModel, coords.x, coords.y, coords.z, true, true, true)
    local grinderProp = CreateObject(grinderModel, coords.x, coords.y, coords.z, true, true, true)
    local lockProp = CreateObject(lockModel, coords.x, coords.y, coords.z, true, true, true)

    SetEntityCollision(bagProp, false, true)
    SetEntityCollision(grinderProp, false, true)
    SetEntityCollision(lockProp, false, true)

    local scene = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, scene, dict, "action", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(bagProp, scene, dict, "action_bag", 1.0, 1.0, 1)
    NetworkAddEntityToSynchronisedScene(grinderProp, scene, dict, "action_angle_grinder", 1.0, 1.0, 1)
    NetworkAddEntityToSynchronisedScene(lockProp, scene, dict, "action_lock", 1.0, 1.0, 1)
    
    local propScene = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddEntityToSynchronisedScene(entity, propScene, dict, "action_container", 1.0, 1.0, 1)

    NetworkStartSynchronisedScene(scene)
    NetworkStartSynchronisedScene(propScene)

    Wait(4000)
    UseParticleFxAssetNextCall('scr_tn_tr')
    local particles = StartParticleFxLoopedOnEntity("scr_tn_tr_angle_grinder_sparks", grinderProp, 0.0, 0.25, 0.0, 0.0, 0.0, 0.0, 1.0, false, false, false, 1065353216, 1065353216, 1065353216, 1)
    Wait(1000)
    StopParticleFxLooped(particles, 1)

    Wait(2000)

    cb()

    Wait(3400)

    DeleteEntity(bagProp)
    DeleteEntity(grinderProp)
    DeleteEntity(lockProp)

    SetEntityCollision(entity, false, true)

    RemoveAnimDict(dict)
    SetModelAsNoLongerNeeded(bagModel)
    SetModelAsNoLongerNeeded(grinderModel)
    SetModelAsNoLongerNeeded(lockModel)
    RemoveNamedPtfxAsset('scr_tn_tr')
end

exports('OpenContainer', OpenContainer)

local function OpenCrate(entity, cb)
    if not DoesEntityExist(entity) then lib.print.error('OpenContainer: Entity does not exist') return end

    while NetworkGetEntityOwner(entity) ~= PlayerId() do
        NetworkRequestControlOfEntity(entity)
        Wait(100)
    end

    local ped = cache.ped
    local coords = GetEntityCoords(entity)
    local rotation = GetEntityRotation(entity)
    local dict = 'anim@scripted@player@mission@trn_ig2_empty@male@'
    local crowbarModel = GetHashKey('w_me_crowbar')
    local heading = GetEntityHeading(entity)
    
    lib.requestAnimDict(dict)
    lib.requestModel(crowbarModel)

    local crowbarProp = CreateObject(crowbarModel, coords.x, coords.y, coords.z, true, true, true)

    SetEntityCollision(crowbarProp, false, true)

    local scene = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, scene, dict, "empty", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(crowbarProp, scene, dict, "empty_crowbar", 1.0, 1.0, 1)
    
    local propScene = NetworkCreateSynchronisedScene(coords.xy, coords.z - 0.05, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddEntityToSynchronisedScene(entity, propScene, dict, "empty_crate", 1.0, 1.0, 1)

    NetworkStartSynchronisedScene(scene)
    NetworkStartSynchronisedScene(propScene)

    Wait(5000)

    cb()

    Wait(1000)

    DeleteEntity(crowbarProp)

    RemoveAnimDict(dict)
    SetModelAsNoLongerNeeded(crowbarModel)
end

exports('OpenCrate', OpenCrate)

local function HackUSB(minigame, cb)
    local ped = cache.ped
    local coords = GetOffsetFromEntityInWorldCoords(ped, 0.075, 0.84, 0.35)
    local rotation = GetEntityRotation(ped)
    local dict = 'anim@scripted@player@mission@tunf_hack_keypad@male@'
    local phoneModel = GetHashKey('prop_npc_phone')
    local usbModel = GetHashKey('tr_prop_tr_usb_drive_01a')
    local heading = GetEntityHeading(ped)

    lib.requestAnimDict(dict)
    lib.requestModel(phoneModel)
    lib.requestModel(usbModel)

    local phoneProp = CreateObject(phoneModel, coords.x, coords.y, coords.z, true, true, true)
    local usbProp = CreateObject(usbModel, coords.x, coords.y, coords.z, true, true, true)

    SetEntityCollision(phoneProp, false, true)
    SetEntityCollision(usbProp, false, true)

    local scene = NetworkCreateSynchronisedScene(coords.xy, coords.z, rotation, 2, true, false, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, scene, dict, "action", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(phoneProp, scene, dict, "action_phone", 1.0, 1.0, 1)
    NetworkAddEntityToSynchronisedScene(usbProp, scene, dict, "action_usb_drive", 1.0, 1.0, 1)

    NetworkStartSynchronisedScene(scene)

    Wait(4566)

    local loopScene = NetworkCreateSynchronisedScene(coords.xy, coords.z, rotation, 2, true, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, loopScene, dict, "hack_loop", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(phoneProp, loopScene, dict, "hack_loop_phone", 1.0, 1.0, 1)
    NetworkAddEntityToSynchronisedScene(usbProp, loopScene, dict, "hack_loop_usb_drive", 1.0, 1.0, 1)

    NetworkStartSynchronisedScene(loopScene)

    minigame(function(success)
        cb(success)
    end)

    local exitScene = NetworkCreateSynchronisedScene(coords.xy, coords.z, rotation, 2, true, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, exitScene, dict, "exit", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(phoneProp, exitScene, dict, "exit_phone", 1.0, 1.0, 1)
    NetworkAddEntityToSynchronisedScene(usbProp, exitScene, dict, "exit_usb_drive", 1.0, 1.0, 1)

    NetworkStartSynchronisedScene(exitScene)

    Wait(3600)

    DeleteEntity(phoneProp)
    DeleteEntity(usbProp)

    RemoveAnimDict(dict)
    SetModelAsNoLongerNeeded(phoneModel)
    SetModelAsNoLongerNeeded(usbModel)
end

exports('HackUSB', HackUSB)

local function HackPhone(minigame, cb)
    local ped = cache.ped
    local coords = GetOffsetFromEntityInWorldCoords(ped, 0.075, 0.84, 0.35)
    local rotation = GetEntityRotation(ped)
    local dict = 'anim_heist@hs3f@ig1_hack_keypad@arcade@male@'
    local phoneModel = GetHashKey('prop_phone_ing')
    local heading = GetEntityHeading(ped)

    lib.requestAnimDict(dict)
    lib.requestModel(phoneModel)

    local phoneProp = CreateObject(phoneModel, coords.x, coords.y, coords.z, true, true, true)

    SetEntityCollision(phoneProp, false, true)

    local loopScene = NetworkCreateSynchronisedScene(coords.xy, coords.z, rotation, 2, true, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, loopScene, dict, "hack_loop_var_01", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(phoneProp, loopScene, dict, "hack_loop_var_01_prop_phone_ing", 1.0, 1.0, 1)

    NetworkStartSynchronisedScene(loopScene)

    local successScene = NetworkCreateSynchronisedScene(coords.xy, coords.z, rotation, 2, true, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, successScene, dict, "success_react_exit_var_01", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(phoneProp, successScene, dict, "success_react_exit_var_01_prop_phone_ing", 1.0, 1.0, 1)

    local failScene = NetworkCreateSynchronisedScene(coords.xy, coords.z, rotation, 2, true, true, -1, 0, 1.0)
    NetworkAddPedToSynchronisedScene(ped, failScene, dict, "fail_react", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(phoneProp, failScene, dict, "fail_react_prop_phone_ing", 1.0, 1.0, 1)

    minigame(function(success)
        cb(success)
        if success then
            NetworkStartSynchronisedScene(successScene)
            Wait(4200)
            NetworkStopSynchronisedScene(successScene)
        else
            NetworkStartSynchronisedScene(failScene)
            Wait(3566)
            NetworkStopSynchronisedScene(failScene)
        end
    end)

    DeleteEntity(phoneProp)

    RemoveAnimDict(dict)
    SetModelAsNoLongerNeeded(phoneModel)
end

exports('HackPhone', HackPhone)