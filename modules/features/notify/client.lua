txz = txz or {}

function txz.notify(data)
    if type(data) ~= "table" then return end

    local title = data.title or ""
    local description = data.description or ""
    local notifType = data.type or "inform"
    local icon = data.icon or ""
    local duration = data.duration or 3000
    local position = data.position or "top-right"
    local animation = data.animation or "slide"
    local showDuration = data.showDuration
    local iconColor = data.iconColor

    SendNUIMessage({
        action = "notify",
        notify = {
            title = title,
            description = description,
            type = notifType,
            icon = icon,
            duration = duration,
            position = position,
            animation = animation,
            showDuration = showDuration,
            iconColor = iconColor
        }
    })
end

RegisterNetEvent("notify:show", function(data)
    if type(data) ~= "table" then return end
    txz.notify(data)
end)