fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'TXZ Scripts - Taxzyyy'

shared_scripts {
  '@ox_lib/init.lua',
}

client_scripts {
  'modules/*.lua',
  'modules/vehicle/*.lua',
  'modules/ped/*.lua',
  'modules/locales/client.lua',
  'modules/networkedscences/*.lua',
}

server_scripts {
  'server.lua',    
  'modules/getinfo/*.lua',  
  'modules/locales/server.lua',
  '@oxmysql/lib/MySQL.lua',
}

exports { 'LocaleForResource', 'L', 'SetLocale' }
server_exports { 'LocaleForResource', 'L', 'SetLocale' }