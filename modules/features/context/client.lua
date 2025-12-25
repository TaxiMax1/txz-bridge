txz = txz or {}
txz.context = txz.context or {}

local MENUS = {}
local OPEN_ID = nil
local STACK = {}
local READY = false

local function focus(on)
  SetNuiFocus(on, on)
end

local function shallowMenuRef(id)
  if not id then return nil end
  return { _id = id }
end

local function normalizeOptionsForUi(opts)
  local out = {}
  if type(opts) ~= "table" then return out end

  local isArray = (#opts > 0)

  if isArray then
    for i = 1, #opts do
      local o = opts[i]
      if type(o) == "table" then
        local k = o.key or o._key or tostring(i)
        out[#out + 1] = {
          _key = k,
          key = k,
          title = o.title or "",
          description = o.description or "",
          icon = o.icon,
          iconColor = o.iconColor,
          iconAnimation = o.iconAnimation,
          disabled = o.disabled == true,
          readOnly = o.readOnly == true,
          menu = (type(o.menu) == "string") and shallowMenuRef(o.menu) or (type(o.menu) == "table" and o.menu or nil),
          arrow = o.arrow,
          progress = o.progress,
          colorScheme = o.colorScheme,
          image = o.image,
          metadata = o.metadata,
          label = o.label,
          _index = i
        }
      end
    end
    return out
  end

  local tmp = {}
  for k, o in pairs(opts) do
    if type(o) == "table" then
      local kk = o.key or o._key or tostring(k)
      tmp[#tmp + 1] = {
        _key = kk,
        key = kk,
        title = o.title or "",
        description = o.description or "",
        icon = o.icon,
        iconColor = o.iconColor,
        iconAnimation = o.iconAnimation,
        disabled = o.disabled == true,
        readOnly = o.readOnly == true,
        menu = (type(o.menu) == "string") and shallowMenuRef(o.menu) or (type(o.menu) == "table" and o.menu or nil),
        arrow = o.arrow,
        progress = o.progress,
        colorScheme = o.colorScheme,
        image = o.image,
        metadata = o.metadata,
        label = o.label,
        _index = 0
      }
    end
  end

  table.sort(tmp, function(a, b)
    return (a.key or "") < (b.key or "")
  end)

  for i = 1, #tmp do tmp[i]._index = i end
  return tmp
end

local function buildUiMenu(menu)
  return {
    title = menu.title or "",
    subtitle = menu.subtitle or "",
    canClose = menu.canClose ~= false,
    menu = shallowMenuRef(menu.menu),
    options = normalizeOptionsForUi(menu.options)
  }
end

local function openInternal(id, push)
  local menu = MENUS[id]
  if not menu then return false end

  OPEN_ID = id
  if push then STACK[#STACK + 1] = id end

  focus(true)
  SendNUIMessage({
    action = "context:open",
    menu = buildUiMenu(menu)
  })

  return true
end

function txz.context.registerContext(ctx)
  if type(ctx) == "table" and ctx[1] ~= nil then
    for i = 1, #ctx do txz.context.registerContext(ctx[i]) end
    return
  end

  if type(ctx) ~= "table" then return end
  if not ctx.id then return end

  MENUS[ctx.id] = {
    id = ctx.id,
    title = ctx.title,
    subtitle = ctx.subtitle,
    canClose = ctx.canClose,
    menu = ctx.menu,
    onExit = ctx.onExit,
    onBack = ctx.onBack,
    options = ctx.options or {}
  }
end

function txz.context.showContext(id)
  if not READY then
    CreateThread(function()
      local t = GetGameTimer()
      while not READY and (GetGameTimer() - t) < 5000 do Wait(50) end
      txz.context.showContext(id)
    end)
    return
  end

  STACK = {}
  openInternal(id, true)
end

function txz.context.hideContext(runExit)
  if not OPEN_ID then return end

  local menu = MENUS[OPEN_ID]
  OPEN_ID = nil
  STACK = {}

  focus(false)
  SendNUIMessage({ action = "context:close" })

  if runExit and menu and type(menu.onExit) == "function" then
    pcall(menu.onExit)
  end
end

function txz.context.getOpenContextMenu()
  return OPEN_ID
end

function txz.context.back()
  if not OPEN_ID then return end

  local current = MENUS[OPEN_ID]
  local parentId = current and current.menu or nil
  if not parentId then return end
  if not MENUS[parentId] then return end

  STACK[#STACK] = nil
  if STACK[#STACK] ~= parentId then STACK[#STACK + 1] = parentId end

  if type(current.onBack) == "function" then
    pcall(current.onBack)
  end

  openInternal(parentId, false)
end

local function resolveTargetMenu(opt)
  if opt.menu == nil then return nil end
  if type(opt.menu) == "string" then return opt.menu end
  if type(opt.menu) == "table" then return opt.menu._id or opt.menu.id end
  return nil
end

local function getOptionByIndex(menu, index)
  local opts = menu and menu.options or nil
  if type(opts) ~= "table" then return nil end
  if type(index) ~= "number" then return nil end
  if index < 1 then return nil end

  if (#opts > 0) then
    return opts[index], index
  end

  local tmp = {}
  for _, o in pairs(opts) do
    if type(o) == "table" then tmp[#tmp + 1] = o end
  end
  return tmp[index], index
end

RegisterNUICallback("context:ready", function(_, cb)
  READY = true
  cb({ ok = true })
end)

RegisterNUICallback("context:close", function(data, cb)
  local runExit = (type(data) == "table" and data.runExit == true) or false
  txz.context.hideContext(runExit)
  cb({ ok = true })
end)

RegisterNUICallback("context:back", function(_, cb)
  txz.context.back()
  cb({ ok = true })
end)

RegisterNUICallback("context:select", function(data, cb)
  if not OPEN_ID then cb({ ok = false }); return end

  local menu = MENUS[OPEN_ID]
  if not menu then cb({ ok = false }); return end

  local index = (type(data) == "table") and data.index or nil
  local opt = nil

  opt = select(1, getOptionByIndex(menu, index))

  if type(opt) ~= "table" then
    cb({ ok = false })
    return
  end

  if opt.disabled == true or opt.readOnly == true then
    cb({ ok = true })
    return
  end

  local targetMenu = resolveTargetMenu(opt)
  if targetMenu and MENUS[targetMenu] then
    openInternal(targetMenu, true)
    cb({ ok = true })
    return
  end

  CreateThread(function()
    if type(opt.onSelect) == "function" then
      pcall(opt.onSelect, opt.args)
      return
    end

    if opt.event then
      TriggerEvent(opt.event, opt.args)
      return
    end

    if opt.serverEvent then
      TriggerServerEvent(opt.serverEvent, opt.args)
      return
    end
  end)

  cb({ ok = true })
end)

exports("registerContext", txz.context.registerContext)
exports("showContext", txz.context.showContext)
exports("hideContext", txz.context.hideContext)
exports("getOpenContextMenu", txz.context.getOpenContextMenu)