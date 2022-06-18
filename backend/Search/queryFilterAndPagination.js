function search(q){
    const search = q ? {name : {
        $regex: q,
        $options: "i"
    }} : {};
    return search;
}

function filter (query){
    const removeFields = ['search','page','limit'];
    removeFields.forEach(key => delete query[key]);
    let qstr = JSON.stringify(query);
    qstr = qstr.replace(/\b(gt|gte|lt|lte)\b/g,(key) => `$$(key)`);
    console.log(query);
    return JSON.parse(qstr);
}

module.exports = {
    search,
    filter
};