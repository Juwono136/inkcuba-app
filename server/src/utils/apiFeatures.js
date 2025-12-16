class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (this.queryString.search) {
      this.query = this.query.find({ $text: { $search: this.queryString.search } });
    } else {
      // Jika tidak ada search text, gunakan filter biasa
      this.query = this.query.find(queryObj);
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    // Dynamic Limit: Default 10, User bisa minta beda, tapi MAX 100 agar server aman
    let limit = this.queryString.limit * 1 || 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
