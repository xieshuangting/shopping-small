var express = require('express');
var router = express.Router();  // 拿到express框架的路由
var mongoose = require('mongoose');
var Goods = require('../models/goods');

// 链接MongoDB数据库,数据库的名称叫goodsmall
mongoose.connect('mongodb://127.0.0.1:27017/goodsmall');   // 若是带账号密码的：'mongodb://root:123456@127.0.0.1:27017/goodsmall'

// 连接成功操作
mongoose.connection.on("connected",function(){
    console.log("MongoDB connected success.")
})

// 连接失败操作
mongoose.connection.on("error",function(){
    console.log("MongoDB connected fail.")
})

// 连接断开操作
mongoose.connection.on("disconnected",function(){
    console.log("MongoDB connected disconnected.")
})

// 二级路由
/* GET goods page. */
router.get('/list', function(req, res, next) {
	let page = parseInt(req.param("page"));
	let pageSize = parseInt(req.param("pageSize"));
	let sort = req.param('sort');
	let priceLevel = req.param('priceLevel');
	let skip = (page-1)*pageSize;
	var priceGt = '',priceLte = '';
	let params = {};

	if(priceLevel != 'all'){
		switch(priceLevel){
			case '0':priceGt = 0;priceLte = 100;break;
			case '1':priceGt = 100;priceLte = 500;break;
			case '2':priceGt = 500;priceLte = 1000;break;
			case '3':priceGt = 1000;priceLte = 5000;break;
		}
		params = {
			salePrice:{
				$gt:priceGt,
				$lte:priceLte
			}
		}
	}

	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	goodsModel.sort({'salePrice':sort});
	goodsModel.exec(function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:{
					count:doc.length,
					list:doc
				}
			})
		}
	})
});

router.post("/addCart",function(req,res,next){
	var userId = '100000077',productId = req.body.productId;
	var User = require('../models/users.js');
	User.findOne({userId:userId},function(err,userDoc){
		if(err){
			res.json({
				status:"1",
				msg:err.message
			})
		}else{
			console.log("userDoc:"+userDoc);
			if(userDoc){
				let goodsItem = '';
				userDoc.cartList.forEach(function(item){
					if(item.productId == productId){
						goodsItem = item;
						item.productNum = parseInt(item.productNum) + 1;
					}
				});
				if(goodsItem){
					userDoc.save(function(err2,doc2){
						if(err2){
							res.json({
								status:'1',
								msg:err2.message
							})
						}else{
							res.json({
								status:'0',
								msg:'',
								result:'suc'
							})
						}
					})
				}else{
					Goods.findOne({productId:productId},function(err1,doc){
						if(err1){
							res.json({
								status:'1',
								msg:err1.message
							})
						}else{
							if(doc){
								doc.productNum = '1';
								doc.checked = '1';
								userDoc.cartList.push(doc);
								userDoc.save(function(err2,doc2){
									if(err2){
										res.json({
											status:'1',
											msg:err2.message
										})
									}else{
										res.json({
											status:'0',
											msg:'',
											result:'suc'
										})
									}
								})
							}
						}
					})
				}
			}
		}
	})
})


module.exports = router;


// 启动express
// node server/bin/www 或 pm2方式 或 webstorm 等
// localhost:3000/goods/    // '/goods'是app.js中的一级路由，'/'是本页的二级路由;链接成功页面出现'hello,goods list'