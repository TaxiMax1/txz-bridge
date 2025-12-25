fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'TXZ Scripts - Taxzyyy'
discord 'https://discord.gg/6SaC6nJktS'

shared_scripts {
  '@ox_lib/init.lua',
  '@es_extended/imports.lua',
  '@txz-bridge/init.lua',
}

client_scripts {
  'modules/getinfo/client.lua',
  'modules/*.lua',
  'modules/vehicle/*.lua',
  'modules/ped/*.lua',
  'modules/locales/client.lua',
  'modules/networkedscences/*.lua',
  'modules/zones/*.lua',
  'modules/features/client.lua',
  'modules/features/notify/client.lua',
  'modules/features/progress/client.lua',
  'modules/features/textui/client.lua',
  'modules/features/timeline/client.lua',
  'modules/features/context/client.lua',
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server.lua',
  'modules/getinfo/server.lua',
  'modules/locales/server.lua',
  'modules/cooldown/server.lua',
}

exports {
  'LocaleForResource',
  'L',
  'SetLocale',
  'SetSafeZones',
  'IsPlayerInSafeZone',
  'GetCurrentSafeZone',
  'IsPointInSafeZone',
  'getBridge',
}

server_exports {
  'LocaleForResource',
  'L',
  'SetLocale',
  'CooldownRemaining',
  'SetCooldown',
  'ClearCooldown'
}

ui_page 'web/build/index.html'

files {
  'web/build/**',
  'init.lua',
}