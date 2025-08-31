local cache = {}
local currentLocale = (Config and Config.Locale) or "en"

local function loadLocale(resource, locale)
    local path = ("locales/%s.lua"):format(locale)
    local code = LoadResourceFile(resource, path)
    if not code then
        code = LoadResourceFile(resource, "locales/en.lua")
        if not code then
            print(("[txz-bridge] Missing locale files in resource '%s' (looked for locales/%s.lua and locales/en.lua)"):format(resource, locale))
            return {}
        end
    end
    local chunk, err = load(code, ("@%s/%s"):format(resource, path), "t", {})
    if not chunk then
        print(("[txz-bridge] load() error for %s: %s"):format(resource, err))
        return {}
    end
    local ok, result = pcall(chunk)
    if not ok or type(result) ~= "table" then
        print(("[txz-bridge] locale chunk error in %s: %s"):format(resource, ok and "did not return table" or result))
        return {}
    end
    return result
end

local function translate(resource, key, ...)
    cache[resource] = cache[resource] or {}
    local entry = cache[resource]
    if entry.__locale ~= currentLocale then
        entry = loadLocale(resource, currentLocale)
        entry.__locale = currentLocale
        cache[resource] = entry
    end
    local s = entry[key] or key
    if select('#', ...) > 0 then return s:format(...) end
    return s
end

local function resolveResource(name)
    return name or (GetInvokingResource and GetInvokingResource()) 
           or (GetCurrentResourceName and GetCurrentResourceName()) 
           or "unknown"
end

local function LocaleForResource(resource)
    local res = resolveResource(resource)
    return function(key, ...)
        return translate(res, key, ...)
    end
end

local function SetLocale(locale)
    if type(locale) == "string" and locale ~= "" then
        currentLocale = locale
        for _, t in pairs(cache) do
            if type(t) == "table" then t.__locale = nil end
        end
    end
end

exports('LocaleForResource', LocaleForResource)
exports('L', function(resource, key, ...)
    return translate(resolveResource(resource), key, ...)
end)
exports('SetLocale', SetLocale)