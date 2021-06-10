const { analytics } = require('@googleapis/analytics')
const { jwt } = require('../utils/googleAuthentication')
require("dotenv").config();
const { GA_VIEW_ID } = process.env

async function authenticate() {
  await jwt.authorize()
  const client = analytics({
    auth: jwt,
    version: 'v3'
  })
  return client
}
async function getActiveUsers() {
  try {
    const client = await authenticate()
    const { data } = await client.data.realtime.get({
      ids: `ga:${GA_VIEW_ID}`,
      metrics: 'rt:activeUsers'
    })
    const activeUsers = data.totalsForAllResults['rt:activeUsers']
    return Number(activeUsers)
  } catch (error) {
    console.log(error.message)
  }
}

async function getActiveUserLocaltions() {
  const client = await authenticate()
  try {
    const { data } = await client.data.realtime.get({
      ids: `ga:${GA_VIEW_ID}`,
      metrics: 'rt:activeUsers',
      dimensions: 'rt:country'
    })
    const rows = data.rows || []
    return rows.map(location => [location[0], Number(location[1])])
  } catch (error) {
    console.log(error.message)
  }
}

async function getActiveUserPageTrackingData() {
  const client = await authenticate()
  try {
    const { data } = await client.data.realtime.get({
      ids: `ga:${GA_VIEW_ID}`,
      metrics: 'rt:activeUsers',
      dimensions: 'rt:pagePath'
    })
    const rows = data.rows || []
    return rows.map(path => [path[0], Number(path[1])])
  } catch (error) {
    console.log(error.message)
  }
}

async function getActiveUserDeviceCategory() {
  const client = await authenticate()
  try {
    const { data } = await client.data.realtime.get({
      ids: `ga:${GA_VIEW_ID}`,
      metrics: 'rt:activeUsers',
      dimensions: 'rt:deviceCategory'
    })
    const rows = data.rows || []
    return rows.map(deviceCategory => [
      deviceCategory[0],
      Number(deviceCategory[1])
    ])
  } catch (error) {
    console.log(error.message)
  }
}

async function getVisitors(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: `ga:${GA_VIEW_ID}`,
      'start-date': startDate,
      'end-date': endDate,
      metrics: 'ga:sessions'
    })
    const sessions = data.totalsForAllResults['ga:sessions']
    return Number(sessions)
  } catch (error) {
    console.log(error.message)
  }
}

async function getUniqueVisitors(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: `ga:${GA_VIEW_ID}`,
      'start-date': startDate,
      'end-date': 'today',
      metrics: 'ga:users'
    })
    const sessions = data.totalsForAllResults['ga:users']
    return Number(sessions)
  } catch (error) {
    console.log(error.message)
  }
}

async function getVisitorLocation(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: `ga:${GA_VIEW_ID}`,
      'start-date': startDate,
      'end-date': endDate,
      dimensions: 'ga:country',
      metrics: 'ga:sessions'
    })
    const rows = data.rows || []
    return rows.map(location => {
      return { country: location[0], number: Number(location[1]) }
    })
  } catch (error) {
    console.log(error.message)
  }
}

async function getUniqueVisitorLocation(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: `ga:${GA_VIEW_ID}`,
      'start-date': startDate,
      'end-date': endDate,
      dimensions: 'ga:country',
      metrics: 'ga:users'
    })
    const rows = data.rows || []
    return rows.map(location => {
      return { country: location[0], number: Number(location[1]) }
    })
  } catch (error) {
    console.log(error.message)
  }
}

async function getVisitorTrafficSource(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: 'ga:' + GA_VIEW_ID,
      'start-date': startDate,
      'end-date': endDate,
      dimensions: 'ga:source',
      metrics: 'ga:sessions'
    })
    const rows = data.rows || []
    return rows.map(trafficSource => [
      trafficSource[0],
      Number(trafficSource[1])
    ])
  } catch (error) {
    console.log(error.message)
  }
}

async function getUsedBrowser(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: 'ga:' + GA_VIEW_ID,
      'start-date': startDate,
      'end-date': endDate,
      dimensions: 'ga:browser',
      metrics: 'ga:sessions'
    })
    const rows = data.rows || 0
    return rows.map(browser => [browser[0], Number(browser[1])])
  } catch (error) {
    console.log(error.message)
  }
}

async function getAvrEngagementTime(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: 'ga:' + GA_VIEW_ID,
      'start-date': startDate,
      'end-date': endDate,
      metrics: 'ga:avgSessionDuration'
    })
    const avrEngagementTime = data.totalsForAllResults['ga:avgSessionDuration']
    return Number(avrEngagementTime)
  } catch (error) {
    console.log(error.message)
  }
}

async function getPageTrackingData(startDate, endDate) {
  const client = await authenticate()
  try {
    const { data } = await client.data.ga.get({
      ids: `ga:${GA_VIEW_ID}`,
      'start-date': startDate,
      'end-date': endDate,
      metrics: 'ga:pageviews',
      dimensions: 'ga:pagePath'
    })
    const rows = data.rows || []
    return rows.map(path => [path[0], Number(path[1])])
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  getActiveUsers,
  getActiveUserLocaltions,
  getActiveUserPageTrackingData,
  getActiveUserDeviceCategory,
  getVisitors,
  getUsedBrowser,
  getUniqueVisitors,
  getVisitorLocation,
  getUniqueVisitorLocation,
  getVisitorTrafficSource,
  getAvrEngagementTime,
  getPageTrackingData
}
