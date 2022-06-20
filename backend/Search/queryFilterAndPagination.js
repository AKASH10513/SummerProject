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

function pagination(query){
    const currpage = query ? (query.limit ? query.limit: 1) : 1;
    const skip = process.env.ITEMS*(currpage - 1);
    return skip;
}

module.exports = {
    search,
    filter,
    pagination
};