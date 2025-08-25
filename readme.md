# Taxzyyy Bridge

A utility bridge resource providing **exports** for spawning vehicles, spawning peds, and handling advanced **networked scenes** (safe cracking, hacking, crate/container interactions, etc.).

---

## 📦 Installation

1. Place the resource in your `resources` folder.
2. Ensure it in your `server.cfg`:

```cfg
ensure txz-bridge
🚗 Vehicle Spawning
SpawnCar
Spawn a vehicle at specific coordinates with heading.

Usage:

lua
Kopiér
Rediger
local vehicle = exports['txz-bridge']:SpawnCar("adder", vector3(100.0, 200.0, 30.0), 90.0, function(veh)
    print("Vehicle spawned: " .. veh)
end)
Parameters:

model: string → Vehicle model name

coords: vector3 → Spawn position

heading: number → Vehicle heading

cb: function | nil → Optional callback with vehicle ID

🧍 Ped Spawning
SpawnPed
Spawn a ped at specific coordinates with optional animation/scenario.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:SpawnPed("s_m_y_dealer_01", vector3(100.0, 200.0, 30.0), 90.0, true, "scenario", "WORLD_HUMAN_AA_SMOKE", function(ped)
    print("Dealer ped spawned: " .. ped)
end)

exports['txz-bridge']:SpawnPed("s_m_m_security_01", vector3(300.0, -1000.0, 30.0), 0.0, false, "", "", function(ped)
    print("Security ped spawned: " .. ped)
end)
Parameters:

model: string → Ped model name

coords: vector3 → Spawn position

heading: number → Ped heading

useAnimation: boolean → Enable animation/scenario

animType: "scenario" | "anim" → Type of animation

animData: table | string → Animation data (string for scenario, { dict, name } for anim)

cb: function | nil → Optional callback with ped ID

🎬 Networked Scenes
SafeCrack
Play a safe-cracking sequence with a minigame.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:SafeCrack(entity, 4, function(success, openedSafe)
    if success then
        print("Safe cracked! Entity: " .. openedSafe)
    else
        print("Safe crack failed!")
    end
end, true)
EletricBox
Play an electric box hacking sequence with circuit breaker minigame.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:EletricBox(entity, function(success)
    if success then
        print("Electric box hacked!")
    else
        print("Hack failed!")
    end
end, 10)
OpenContainer
Open a container with grinder animation.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:OpenContainer(entity, function()
    print("Container opened!")
end)
OpenCrate
Open a crate with crowbar animation.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:OpenCrate(entity, function()
    print("Crate opened!")
end)
HackUSB
Play a USB hacking scene with a custom minigame.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:HackUSB(function(cb)
    exports['elevate-minigames']:SomeUSBGame(function(success)
        cb(success)
    end)
end, function(success)
    if success then
        print("USB hack successful!")
    else
        print("USB hack failed!")
    end
end)
HackPhone
Play a phone hacking scene with a custom minigame.

Usage:

lua
Kopiér
Rediger
exports['txz-bridge']:HackPhone(function(cb)
    exports['elevate-minigames']:SomePhoneGame(function(success)
        cb(success)
    end)
end, function(success)
    if success then
        print("Phone hack successful!")
    else
        print("Phone hack failed!")
    end
end)
⚠️ Notes
All functions ensure models/animations are properly requested before usage.

Entities are protected (invincible, frozen, blocking events) to avoid accidental destruction.

Always clean up spawned entities (vehicles/peds/props) if no longer needed.

📜 Exports Overview
Export	Description
SpawnCar	Spawn a vehicle with heading + callback
SpawnPed	Spawn a ped with scenario/anim + callback
SafeCrack	Safe cracking sequence with minigame
EletricBox	Electric box hacking sequence
OpenContainer	Container opening with grinder
OpenCrate	Crate opening with crowbar
HackUSB	USB hacking animation + minigame
HackPhone	Phone hacking animation + minigame

✅ Example Resource Usage
lua
Kopiér
Rediger
local vehicle = exports['txz-bridge']:SpawnCar("sultan", vector3(215.0, -810.0, 30.0), 90.0)
local ped = exports['txz-bridge']:SpawnPed("s_m_y_dealer_01", vector3(220.0, -800.0, 30.0), 180.0, true, "scenario", "WORLD_HUMAN_SMOKING")
Made with ❤️ by Taxzyyy