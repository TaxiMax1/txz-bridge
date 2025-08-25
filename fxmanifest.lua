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
  'modules/networkedscences/*.lua',
}

server_scripts {
  'server.lua',    
  'modules/getinfo/*.lua',  
  '@oxmysql/lib/MySQL.lua',
}