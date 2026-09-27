// World-space layout of the stall, measured from the baked model (see raycast probes during development).
// Counter runs along z; customers sit on the -x side, the chef works on the +x side, facing -x.
// Screen-right for the seat camera is +z; the chef's left hand (organic) is on +z, his right hand (chrome) on -z.
export const FLOOR_Y = -2.9
export const COUNTER_Y = -1.71 // visible top of the counter (a patch in shop.js sits just above the baked surface)
export const FACING_CUSTOMER = -Math.PI / 2 // chef yaw that faces -x

export const CHEF_HOME = { x: -1.15, z: -1.18 } // behind the counter, centered

// Everything is cooked on the counter, in front of the customer, within arm's reach of where the chef stands.
export const PREP = { x: -1.9, z: -1.18 }        // where a bowl is assembled
export const SERVE = { x: -2.6, z: -1.18 }       // where it ends up: directly in front of the customer
export const NOODLE_POT = { x: -1.76, z: -1.86 } // screen-left: the chrome hand's job
export const STOCK_POT = { x: -1.76, z: -0.5 }   // screen-right: the organic hand's job
export const MENU_REST = { x: -2.45, z: -0.48 }  // the menu card lives here once handed over (clear of the served bowl)

// Camera shots [position, lookAt]
export const SHOTS = {
    hub: { pos: [-9.4, -0.2, -8.6], look: [-3.9, -1.25, -3.9], fov: 48 }, // the signpost in front, the shop behind it
    seat: { pos: [-5.0, -0.62, -1.18], look: [-1.6, -1.7, -1.18], fov: 44 },
    cook: { pos: [-4.7, -0.7, -1.18], look: [-1.75, -1.62, -1.18], fov: 42 }, // same height as `seat`: any higher and the awning hides the chef
}
