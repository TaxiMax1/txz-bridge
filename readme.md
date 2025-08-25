# Taxzyyy Bridge (`txz-bridge`)

A lightweight FiveM utility bridge that exposes **exports** for:

- Vehicle spawning (`SpawnCar`)
- Ped spawning with optional animations/scenarios (`SpawnPed`)
- Network-synchronised interaction scenes (safe cracking, electric box, container/crate opening, USB/phone hacking)

---

## Quick Reference

**SpawnVehicle**

```lua
local vehicle = exports['txz-bridge']:SpawnCar('adder', vector3(100.0, 200.0, 30.0), 90.0)
```

**CreatePed**

```lua
-- Scenario (world) animation
exports['txz-bridge']:SpawnPed(
  "s_m_y_dealer_01",
  vector3(100.0, 200.0, 30.0),
  90.0,
  true,
  "scenario",
  "WORLD_HUMAN_AA_SMOKE",
  function(ped) print("Dealer ped:", ped) end
)

-- Idle ped (no animation)
exports['txz-bridge']:SpawnPed(
  "s_m_m_security_01",
  vector3(300.0, -1000.0, 30.0),
  0.0,
  false,
  "",
  "",
  function(ped) print("Guard ped:", ped) end
)
```

---

## Installation

1. Drop the resource into your `resources/` folder as `txz-bridge`.
2. Ensure it in your `server.cfg`:
   ```cfg
   ensure txz-bridge
   ```
3. Dependencies (recommended/used by scenes):
   - `ox_lib` (for `lib.requestModel`, `lib.requestAnimDict`, etc.)
   - A minigame resource for scenes (you can swap to your own):
     - `st_minigames` (used by **SafeCrack**)
     - `elevate-minigames` (used by **EletricBox**)

> You can replace the minigame exports in the scene functions with your own implementations.

---

## API: Vehicles

### `SpawnCar(model, coords, heading, cb?) -> number|nil`
Spawn a vehicle and return its entity handle.

**Params**
- `model` (`string`) – Vehicle model name (e.g., `"adder"`)
- `coords` (`vector3`) – Spawn position
- `heading` (`number`) – Heading
- `cb` (`function|nil`) – Optional callback (`function(vehicle|nil)`)

**Returns**
- `vehicle` (`number|nil`)

**Notes**
- Requests the model with a 5s timeout.
- Sets plate to `CARGO`, unlocks doors, sets on ground, marks mission entity.

**Example**
```lua
local veh = exports['txz-bridge']:SpawnCar('sultan', vector3(450.0, -990.0, 30.0), 180.0, function(v)
  if v then print('Spawned vehicle id:', v) end
end)
```

---

## API: Peds

### `SpawnPed(model, coords, heading, useAnimation, animType, animData, cb?) -> number|nil`
Spawn a ped, optionally play a scenario or animation.

**Params**
- `model` (`string`) – Ped model (e.g., `"s_m_m_security_01"`)
- `coords` (`vector3`) – Spawn position
- `heading` (`number`)
- `useAnimation` (`boolean`) – Enable animation
- `animType` (`"scenario" | "anim" | ""`)
- `animData` (`string | table`)  
  - If `animType == "scenario"` ⇒ `animData` is a scenario name (`"WORLD_HUMAN_AA_SMOKE"`)
  - If `animType == "anim"` ⇒ `animData = { dict = 'anim@...', name = 'clip_name' }`
- `cb` (`function|nil`) – Optional callback (`function(ped|nil)`)

**Returns**
- `ped` (`number|nil`)

**Behaviour**
- Freezes position, invincible, blocks non-temporary events.
- For scenario: `TaskStartScenarioAtPosition`.
- For anims: requests dict and plays clip loop.

**Example (anim dict)**
```lua
exports['txz-bridge']:SpawnPed(
  's_m_m_security_01',
  vector3(450.0, -980.0, 30.0),
  90.0,
  true,
  'anim',
  { dict = 'amb@world_human_leaning@male@wall@back@hands_together@idle_a', name = 'idle_a' }
)
```

---

## API: Networked Scenes

> All scene helpers request network control of the target entity and run synchronised scenes for smooth multiplayer playback. Most use `lib.requestAnimDict/model` (ox_lib) and clean up after themselves.

### `SafeCrack(entity, locks, cb, createCam)`
Runs a full safe-crack interaction with intro/idle/success scenes, then invokes a safe-crack minigame.

**Params**
- `entity` (`number`) – The safe object entity
- `locks` (`number`) – Difficulty/locks count passed to minigame
- `cb` (`function(success:boolean, openedSafeEntity:number|nil)`)
- `createCam` (`boolean`) – Also attach scene camera tracks if `true`

**Minigame**
- Uses `exports['st_minigames']:SafeCrack(true, locks, function(hasWon) ... end)`

**On success**
- Replaces the closed safe with `h4_prop_h4_safe_01b` (opened), preserves heading.

---

### `EletricBox(entity, cb, time?)`
Electric panel interaction with enter/loop/exit scenes, then a circuit-breaker minigame.

**Params**
- `entity` (`number`) – Electric box object
- `cb` (`function(success:boolean)`)
- `time` (unused in sample; keep for your extension)

**Minigame**
- Uses `exports['elevate-minigames']:CircuitBreaker(1)` (returns `boolean`)

---

### `OpenContainer(entity, cb)`
Angle-grinder container opening with bag/grinder/lock props and sparks PTX FX.

**Params**
- `entity` (`number`)
- `cb` (`function()`)

**Workflow**
- Spawns props: `hei_p_m_bag_var22_arm_s`, `tr_prop_tr_grinder_01a`, `tr_prop_tr_lock_01a`
- Plays synced action, triggers particle sparks, invokes `cb`, then cleans up and disables collision on the container.

---

### `OpenCrate(entity, cb)`
Crowbar crate prying sequence.

**Params**
- `entity` (`number`)
- `cb` (`function()`)

**Workflow**
- Spawns `w_me_crowbar`, plays synced action, calls `cb`, deletes prop, cleans up.

---

### `HackUSB(minigame, cb)`
USB hacking scene with phone + USB props, loop while an external minigame runs.

**Params**
- `minigame` (`function(done:function(boolean))`) – Call with `true/false` when finished
- `cb` (`function(success:boolean)`)

**Workflow**
- Plays enter, then loop; your `minigame` calls `done(true|false)`. Scene exits and props are removed.

**Example**
```lua
exports['txz-bridge']:HackUSB(function(done)
  -- Plug your UI/game here, then:
  SetTimeout(3000, function() done(true) end)
end, function(success)
  print('USB hack success?', success)
end)
```

---

### `HackPhone(minigame, cb)`
Phone keypad hacking with success/fail branch scenes.

**Params**
- `minigame` (`function(done:function(boolean))`)
- `cb` (`function(success:boolean)`)

**Workflow**
- Plays loop; when your `minigame` completes, runs success or fail scene, cleans up.

---

## Example: Using with ox_target

```lua
exports.ox_target:addLocalEntity(safeEntity, {
  {
    icon = 'fa-solid fa-vault',
    label = 'Crack Safe',
    onSelect = function()
      exports['txz-bridge']:SafeCrack(safeEntity, 3, function(success, openedSafe)
        if success then
          lib.notify({ title = 'Safe', description = 'Opened!', type = 'success' })
        else
          lib.notify({ title = 'Safe', description = 'Failed!', type = 'error' })
        end
      end, true)
    end
  }
})
```

---

## Implementation Notes & Tips

- Network Control: Each scene waits until the local player owns the entity (`NetworkGetEntityOwner(entity) == PlayerId()`), requesting control if needed.
- Vectors: Code sometimes uses `coords.xy` / `coords.xyz` shortcuts from FiveM vector types. Keep `vector3(...)` inputs.
- Timeouts/Loads: Model loads have a ~5s timeout. Handle `nil` returns in your code.
- Customization: Replace minigame exports with your own to avoid hard deps on `st_minigames` / `elevate-minigames`.
- Ped Safety: Spawned peds are frozen, invincible, and block non-temporary events by default—adjust for your gameplay.

---

## Troubleshooting

- Model failed to load: Ensure the model name is correct and not restricted by your streaming setup.
- Entity doesn’t animate: Verify you have control of the entity; some map props require requesting temps/mission entity flags.
- Minigame export missing: Swap the minigame calls with your custom UI/game and keep the `cb(...)` signatures.