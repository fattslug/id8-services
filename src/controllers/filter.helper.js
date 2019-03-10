const ObjectID = require('mongodb').ObjectID

exports.buildQuery = buildQuery;

/**
 * Builds the full idea query
 * @param {object} queryParams All query params passed through from client query
 * @returns {object} Full query object to be used in aggregation pipeline
 */
function buildQuery(queryParams) {
  let query = {};
  Object.keys(queryParams).forEach((queryField, index) => {
    const queryValue = queryParams[queryField]
    if (queryValue !== '') {

      if (queryField === 'businessAreas') {
        query.$or = buildBusinessQuery(queryValue);
      }
      if (queryField === 'quickDate' && queryValue !== 'all') {
        const startDate = queryParams['startDate'] || null;
        const endDate = queryParams['endDate'] || null;
        query.dateSubmitted = buildDateQuery(queryValue, startDate, endDate);
      }

    }
  });
  query.deleted = { $ne: true };
  return query;
}

/**
 * Builds the query which filters for business areas
 * @param {string} businessAreaString Comma-delimited string of businessArea ObjectIDs
 * @returns {array} Array of $or queries
 */
function buildBusinessQuery(businessAreaString) {
  const businessAreas = businessAreaString.split(',');
  const orQuery = [];

  if (businessAreas) {
    businessAreas.forEach((businessArea) => {
      orQuery.push({
        'businessAreas': {
          $elemMatch: { _id: new ObjectID(businessArea) }
        }
      })
    });
  }

  return orQuery;
}

/**
 * Builds the query which filters for date submitted
 * @param {string} quickDate Quick-select text (past 24 hours, past month, etc)
 * @param {date} startDate Optional start date (required for 'custom' quickDate)
 * @param {date} endDate Optional end date(required for 'custom' quickDate)
 * @returns {array} Greater than/less than range of dates
 */
function buildDateQuery(quickDate, startDate, endDate) {
  switch (quickDate) {

    case '24hours':
      startDate = new Date();
      endDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
    break;

    case 'week':
      startDate = new Date();
      endDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    break;

    case 'month':
      startDate = new Date();
      endDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    break;

    case 'year':
      startDate = new Date();
      endDate = new Date();
      startDate.setYear(startDate.getYear() - 1);
    break;

    case 'custom':
    break;

  }

  return {
    $gte: startDate,
    $lte: endDate
  };
}