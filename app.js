const Koa = require('koa')
const fs = require('fs')
const { promisify } = require('util')
const si = require('systeminformation')
const readFile = promisify(fs.readFile)
const app = new Koa()

async function getSocTemp () {
  const content = await readFile('/etc/armbianmonitor/datasources/soctemp', 'utf8')
  const result = Number(content.trim())
  return (result / 1000).toFixed(2)
}

function getSocTempSync () {
  const content = fs.readFileSync('/etc/armbianmonitor/datasources/soctemp', 'utf8')
  const result = Number(content.trim())
  return (result / 1000).toFixed(2)
}

app.use(async (ctx, next) => {
  try {
    await next()
    if (ctx.body) return
    ctx.body = {
      message: 'OK'
    }
  } catch (e) {
    ctx.status = 500
    ctx.body = {
      message: e.message
    }
  }
})

app.use(async (ctx, next) => {
  if (ctx.path !== '/api/soctemp') return next()
  const num = await getSocTemp()
  ctx.body = {
    num: num,
    text: `${num}°C`
  }
})

app.use(async (ctx, next) => {
  if (ctx.path !== '/api/soctemp/sync') return next()
  const num = getSocTempSync()
  ctx.body = {
    num: num,
    text: `${num}°C`
  }
})

app.use(async (ctx, next) => {
  if (ctx.path !== '/api/sysinfo') return next()
  const features = Object.assign({
    cpu: 1,
    system: 1,
    cpuTemperature: 1,
    mem: 1
  }, ctx.query)
  const featureKeys = Object.keys(features)
  const results = await Promise.all(featureKeys.map(f => {
    if (si[f] && typeof si[f] === 'function') return si[f]()
    return Promise.resolve()
  }))
  featureKeys.map((f, i) => {
    features[f] = results[i]
  })
  ctx.body = features
})

app.listen(process.env.PORT || 9999)
