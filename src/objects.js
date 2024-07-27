export const reservoirs = [
    {
        name: 'Lake Powell',
        position: [36.93649, -111.48396],
        capacity: 24.322000,
        rise: {
            catalog: 2362,
            elevation: 508,
            storage: 509
        },
        system: true,
    },
    {
        name: 'Lake Mead',
        position: [36.0163, -114.7374], // [lat, lon]
        capacity: 26.134000, // maf, total
        region: 'lb',
        rise: {
            elevation: 6123,
            storage: 6124
        },
        system: true,
    },
    {
        name: 'Flaming Gorge Reservoir',
        position: [40.91474, -109.42185],
        capacity: 3.7889,
        system: true,
        rise: {
            elevation: 341,
            storage: 337
        }
    },
    {
        name: 'Fontenelle Reservoir',
        position: [42.0276, -110.0660],
        capacity: 0.345360,
        system: true,
        rise: {
            elevation: 349,
            storage: 347
        }
    },

    {
        name: 'Navajo Reservoir',
        position: [36.80063, -107.61203],
        capacity: 1.708600,
        system: true,
        rise: {
            elevation: 612,
            storage: 613
        }
    },
    {
        name: 'Blue Mesa Reservoir',
        position: [38.453327, -107.334366],
        capacity: 0.940700,
        system: true,
        rise: {
            elevation: 78,
            storage: 76
        }
    },
    {
        name: 'Marrow Point Reservoir',
        position: [38.452014, -107.538056],
        capacity: 0.120132,
        system: true,
        rise: {
            elevation: 594,
            storage: 592
        }
    },
    {
        name: 'Crystal Reservoir',
        position: [38.453589, -107.335052],
        capacity: 0.025236,
        activeCapacity: 0.012891,
        system: true,
        rise: {
            elevation: 276,
            storage: 274
        }
    },
    {
        name: 'Lake Mohave',
        position: [35.1979, -114.5694],
        capacity: 1.995,
        rise: {
            elevation: 6133,
            storage: 6134
        }
    },
    {
        name: 'Lake Havasu',
        position: [34.2964, -114.1385],
        capacity: 0.800,
        rise: {
            elevation: 6128,
            storage: 6129
        }
    }
]

export const reaches = [
    ['Lake Powell', 'Lake Mead'],
    ['Lake Mead', 'Lake Mohave'],
    ['Lake Mohave', 'Lake Havasu']
]