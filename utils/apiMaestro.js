class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryObject = { ...this.queryString };

    const execludedFields = ['page', 'sort', 'limit', 'fields', 'address'];
    execludedFields.forEach((field) => {
      delete queryObject[field];
    });
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });
    // console.log(queryStr);
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortCriteria = this.queryString.sort.split(',').join(' ');
      console.log(sortCriteria);
      this.query = this.query.sort(sortCriteria);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitingFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page = 2 ,limit = 10 ,--> 1 to 10 for page 1 , and 11 to 20 for page 2 and so on
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  searching() {
    const { address } = this.queryString;
    if (address) {
      const filter = {
        'locations.address': { $regex: new RegExp(address, 'i') },
      };
      this.query = this.query.find(filter);
    }
    return this;
  }
}

module.exports = APIFeatures;
