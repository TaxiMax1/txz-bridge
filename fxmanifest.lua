fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'TXZ Scripts - Taxzyyy'
discord 'https://discord.gg/6SaC6nJktS'

shared_scripts {
  '@ox_lib/init.lua',
  '@es_extended/imports.lua',
}

client_scripts {
  'modules/*.lua',
  'modules/vehicle/*.lua',
  'modules/ped/*.lua',
  'modules/locales/client.lua',
  'modules/networkedscences/*.lua',
  'modules/zones/*.lua',
  'modules/features/notify/client.lua',
}

server_scripts {
  'server.lua',
  'modules/getinfo/*.lua',
  'modules/locales/server.lua',
  'modules/cooldown/server.lua',
  '@oxmysql/lib/MySQL.lua',
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