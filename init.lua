if not _VERSION:find('5.4') then
    error('Lua 5.4 must be enabled in the resource manifest!', 2)
end

local bridgeName = 'txz-bridge'
local resourceName = GetCurrentResourceName()

if resourceName == bridgeName then
    return
end

if txz ~= nil then
    error(("Cannot load txz-bridge more than once.\n\tRemove any duplicate entries from '@%s/fxmanifest.lua'"):format(resourceName), 2)
end

if GetResourceState(bridgeName) ~= 'started' then
    error('txz-bridge must be started before this resource.', 0)
end

if not IsDuplicityVersion() then
    txz = nil
    while true do
        local ok = pcall(function()
            txz = exports[bridgeName]:getBridge()
        end)

        if ok and txz then
            break
        end

        Wait(0)
    end
end
