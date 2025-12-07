txz = txz or {}

function txz.showTextUI(text, options)
    options = options or {}

    local key, label = text:match("%[(.-)%]%s*%-%s*(.+)")

    local title = label or text
    local description = key and (("[%s] - Open"):format(key)) or ""

    local icon = options.icon
    if icon and not icon:find("^fa%-") then
        icon = "fa-" .. icon
    end

    SendNUIMessage({
        action = "textui",
        visible = true,

        title = title,
        description = description,

        position = options.position or "right-center",
        icon = icon or nil,
        iconColor = options.iconColor or nil,
        iconAnimation = options.iconAnimation or nil,
        style = options.style or nil,
        alignIcon = options.alignIcon or "center",
    })
end

function txz.hideTextUI()
    SendNUIMessage({
        action = "textui",
        visible = false
    })
end

exports("showTextUI", txz.showTextUI)
exports("hideTextUI", txz.hideTextUI)