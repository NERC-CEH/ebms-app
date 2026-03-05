console.log('groups:',
    groups.data.map(
        g => `${g.data.title}: [${g.locationCids.map(
            cid=>locations.cidMap.get(cid).data.name
        ).join('; ')}]`
    )
)

console.log('groups:',
    groups.data.map(
        g => `${g.data.title}: [${g.listCids.join('; ')}]`
    )
)

console.log(
    'locations:',
    locations.data.map(
        l => `${l.data.name}: [${l.listCids.map(
            cid=>speciesLists.cidMap.get(cid).data.title
        ).join('; ')}]`
    )
); 


// ----------------------------
// works only after run-time load:


console.log(
    'locations:',
    locations.data.map(
        l => `${l.data.name}: [${l.groupCids.map(
            cid=>groups.cidMap.get(cid).data.title
        ).join('; ')}]`
    )
); 


console.log('speciesLists:',
    speciesLists.data.map(
        sl => `${sl.data.title}: [${sl.locationCids.map(
            cid=>locations.cidMap.get(cid).data.name
        ).join('; ')}]`
    )
)