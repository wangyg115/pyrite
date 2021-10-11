export default [
    {
        admin:false,
        groups:{
            op: ["pyrite","staff","teaching/graphics","teaching/networking"],
            other: ["pyrite","staff","teaching/graphics","teaching/networking"],
            presenter: ["pyrite","staff","teaching/graphics","teaching/networking"],
        },
        id: 1,
        name:"alice",
        password: "alice",

    },
    {
        admin: true,
        groups: {
            op:["pyrite"],
            other:["pyrite"],
            presenter:[],
        },
        id: 2,
        name: "pyrite",
        password: "pyrite",
    },
]

