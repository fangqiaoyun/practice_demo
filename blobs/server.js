const express = require('express')
const static = require('express-static')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const multer = require('multer')
// multer解析上传的文件数据
// const ejs = require('ejs')
// const jade = require('jade')
const consolidate = require('consolidate')
const mysql = require('mysql')

const common = require('./lib/common')

// 连接池
const db = mysql.createPool({host: 'localhost', user: 'root', password: '1', database: 'blog'})

const app = express()

app.listen(8080)

// 1.解析cookie
app.use(cookieParser('dfedfgse23dfergsadfed'))

// 2.使用session
let arr = []
for (let i = 0; i < 100000; i++) {
  arr.push('keys_' + Math.random())
}
app.use(cookieSession({name: 'sess_id', keys: arr, maxAge: 20*3600*1000}))

// 3.post数据
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer().any())

// 用户请求
// app.use('/', (req, res, next) => {
//   console.log(req.query, req.body, req.files, req.cookies, req.session)
// })

// 配置模板引擎
  // 输出什么东西
app.set('view engine', 'html')
  // 模板文件放在哪
app.set('views', './template')
  // 哪种模板引擎
app.engine('html', consolidate.ejs)
  
// 接受用户请求
app.get('/', (req, res, next) => {
  // 查询banner的东西
  db.query("SELECT * FROM banner_table", (err, data) => {
    if (err) {
      res.status(500).send('database error').end()
    }
    else {
      res.banners = data
      next()
    }
  })
})

app.get('/', (req, res, next) => {
  // 查询文章列表
  db.query("SELECT ID, title, summery FROM article_table", (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).send('database error').end()
    }
    else {
      console.log(data)
      // 查询新闻列表
      res.articles = data
      next()
      // res.render('index.ejs', {banners: data})
    }
  })
})

app.get('/', (req, res, next) => {
  res.render('index.ejs', {banners: res.banners, articles: res.articles})
})

app.get('/articles', (req, res) => {
  if (req.query.id) {
    console.log(req.query)
    if (req.query.act === 'like') {
      // 增加一个赞
      db.query(`UPDATE article_table SET n_like=n_like+1 WHERE ID=${req.query.id}`, (err, data) => {
        if (err) res.status(500).send('数据库问题').end()
        else {
          // 显示文章
          db.query(`SELECT * FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
            if (err) res.status(500).send('数据有问题').end()
            else {
              if (data.length === 0) res.status(404).send('请求的文章找不到').end()
              else {
                let articleData = data[0]
                articleData.sDate = common.time2date(articleData.post_time)
                articleData.content = articleData.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>')

                res.render('conText.ejs', {
                  article_data: articleData
                })
              }
            }
          })
        }
      })    
    } else {
      // 显示文章
      db.query(`SELECT * FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
        if (err) res.status(500).send('数据有问题').end()
        else {
          if (data.length === 0) res.status(404).send('请求的文章找不到').end()
          else {
            let articleData = data[0]
            articleData.sDate = common.time2date(articleData.post_time)
            articleData.content = articleData.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>')

            res.render('conText.ejs', {
              article_data: articleData
            })
          }
        }
      })
    }
  } else {
    res.status(404).send('文章找不到').end()
  }
  
})
// 4.static数据
app.use(static('./www'))




