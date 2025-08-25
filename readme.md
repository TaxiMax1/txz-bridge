## Taxzyyy Bridge

**SpawnVehicle**: local vehicle = exports['txz-bridge']:SpawnCar(vehicle, vec3(coords), heading)

**CreatePed** = {
    exports['txz-bridge']:SpawnPed("s_m_y_dealer_01", vector3(100.0, 200.0, 30.0), 90.0, true, "scenario", "WORLD_HUMAN_AA_SMOKE", function(ped)
        print("Dealer spawned with scenario:", ped)
    end)

    --

    exports['txz-bridge']:SpawnPed("s_m_m_security_01", vector3(300.0, -1000.0, 30.0), 0.0, false, "", "", function(ped)
        print("Security ped spawned:", ped)
    end)
}