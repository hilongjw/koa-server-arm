const Koa = require('koa')

const app = new Koa()

app.use((ctx, next) => {
  ctx.body = {
    message: 'OK'
  }
})

app.listen(process.env.PORT || 9999)
