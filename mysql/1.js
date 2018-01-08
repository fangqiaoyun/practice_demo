const mysql = require('mysql')

// 1.连接
// createConnection(哪台服务器， 用户名， 密码，库)

const db = mysql.createConnection({host: 'localhost', user: 'root', password: '1', database: '20180108'})

// 2.查询
// query(干什么， 回调)
db.query('SELECT * FROM `user_table`;', (err, data) => {
  if (err) console.log('出错了', err)
  else console.log('成功', JSON.stringify(data))
})
