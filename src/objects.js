export const reservoirs = [
    {
        name: 'Lake Powell',
        position: [36.93649, -111.48396],
        capacity: 24.322000,
        code: 919,
        system: true,
    },
    {
        name: 'Lake Mead',
        position: [36.0163, -114.7374], // [lat, lon]
        capacity: 26.134000, // maf, total
        region: 'lb',
        code: 921,
        system: true,
    },
    {
        name: 'Flaming Gorge Reservoir',
        position: [40.91474, -109.42185],
        capacity: 3.7889,
        system: true,
    },
    {
        name: 'Fontenelle Reservoir',
        position: [42.0276, -110.0660],
        capacity: 0.345360,
        system: true,
    },

    {
        name: 'Navajo Reservoir',
        position: [36.80063, -107.61203],
        capacity: 1.708600,
        system: true,
    },
    {
        name: 'Blue Mesa Reservoir',
        position: [38.453327, -107.334366],
        capacity: 0.940700,
        system: true,
    },
    {
        name: 'Marrow Point Reservoir',
        position: [38.452014, -107.538056],
        capacity: 0.120132,
        system: true,
    },
    {
        name: 'Crystal Reservoir',
        position: [38.453589, -107.335052],
        capacity: 0.025236,
        activeCapacity: 0.012891,
        system: true,
    },
    {
        name: 'Lake Mohave',
        position: [35.1979, -114.5694],
        capacity: 1.995,
    },
    {
        name: 'Lake Havasu',
        position: [34.2964, -114.1385],
        capacity: 0.800
    }
]

export const reaches = [
    ['Lake Powell', 'Lake Mead'],
    ['Lake Mead', 'Lake Mohave'],
    ['Lake Mohave', 'Lake Havasu']
]