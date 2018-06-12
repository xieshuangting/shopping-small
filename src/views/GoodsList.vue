<template>
	<div>
		<navHeader></navHeader>
		<navBread>
			<span>Goods</span>
		</navBread>

		<div class="accessory-result-page accessory-page">
			<div class="container">
				<div class="filter-nav">
					<span class="sortby">Sort by:</span>
					<a href="javascript:void(0)" class="default cur">Default</a>
					<a href="javascript:void(0)" class="price" @click="sortGoods">Price <svg class="icon icon-arrow-short"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short"></use></svg></a>
					<a href="javascript:void(0)" class="filterby stopPop" @click='showFilterPop'>Filter by</a>
				</div>

				<div class="accessory-result">
					<!-- filter -->
					<div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
						<dl class="filter-price">
						<dt>Price:</dt>
						<dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked == 'all'}" @click="setPriceFilter('all')">All</a></dd>
						<dd v-for="(price,index) in priceFilter">
							<a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked == index}">{{price.startPrice}}- {{price.endPrice}}</a>
						</dd>
						</dl>
					</div>

					<!-- search result accessories list -->
					<div class="accessory-list-wrap">
						<div class="accessory-list col-4">
							<ul>
								<li v-for="item in goodslist">
									<div class="pic">
										<a href="#"><img v-lazy="'/static/'+item.productImage" alt=""></a>
									</div>
									<div class="main">
										<div class="name">{{item.productName}}</div>
										<div class="price">{{item.salePrice}}</div>
										<div class="btn-area">
											<a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
										</div>
									</div>
								</li>
							</ul>
							<div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
								<img src='./../assets/img/loading-cylon-red.svg' v-show="loading"
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 遮罩 -->
		<div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>

		<modal v-bind:mdShow='mdShow' v-on:close="closeModel">
			<p slot="message">
				请先登录，否则无法加入到购物车
			</p>
			<div slot="btnGroup">
				<a class='btn btn--m' href="javascript:;" @click="mdShow = false">关闭</a>
			</div>
		</modal>
		<modal v-bind:mdShow='mdShowCart' v-on:close="closeModel">
			<p slot="message">
				<svg class="icon-status-ok" width='30px' height='30px'>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
				</svg>
				<span>加入购物车成功！</span>
			</p>
			<div slot="btnGroup">
				<a class='btn btn--m' href="javascript:;" @click="mdShowCart = false">继续购物</a>
				<router-link class="btn btn--m" href="javascript:;" to="/cart">查看购物车</router-link>
			</div>
		</modal>
		<navFooter></navFooter>
	</div>
</template>

<script>
import './../assets/css/base.css'
import './../assets/css/product.css'
import NavHeader from './../components/NavHeader'
import NavFooter from './../components/NavFooter'
import NavBread from './../components/NavBread'
import Modal from './../components/Modal'

export default {
  name: 'goodsList',
  components:{
  	NavHeader,
  	NavFooter,
  	NavBread,
  	Modal
  },
  data () {
    return {
    	sortFlag:true,
    	page:1,
    	pageSize:8,
    	goodslist:[],
    	busy:true,
    	priceFilter:[
			{
				startPrice:'0.00',
				endPrice:'100.00'
			},
			{
				startPrice:'100.00',
				endPrice:'500.00'
			},
			{
				startPrice:'500.00',
				endPrice:'1000.00'
			},
			{
				startPrice:'1000.00',
				endPrice:'5000.00'
			}
    	],
    	priceChecked:'all',
    	filterBy:false,
    	overLayFlag:false,
    	loading:false,
    	mdShow:false,
    	mdShowCart:false
    }
  },
  mounted:function(){
  	this.getGoodsList();
  },
  methods:{
  	getGoodsList:function(flag){
  		var param = {
  			page:this.page,
  			pageSize:this.pageSize,
  			sort:this.sortFlag?1:-1,
  			priceLevel:this.priceChecked
  		}
  		this.loading = true;
  		this.$axios.get('/goods/list',{
  			params:param
  		}).then((response)=>{
  			this.loading = false;
  			var res = response.data;
  			if(res.status == '0'){
  				if(flag){
	  				this.goodslist = this.goodslist.concat(res.result.list);
	  				if(res.result.count == 0){
	  					this.busy = true;
	  				}else{
	  					this.busy = false;
	  				}
  				}else{
	  				this.goodslist = res.result.list;
	  				this.busy = false;
  				}
  			}else{
  				this.goodslist = [];
  			}	
  		})
  	},
  	showFilterPop(){
	  	this.filterBy = true;
	  	this.overLayFlag = true;
  	},
  	closePop(){
	  	this.filterBy = false;
	  	this.overLayFlag = false;
  	},
  	setPriceFilter(index){
	  	this.priceChecked = index;
	  	this.closePop();
	  	this.page = 1;
	  	this.getGoodsList();
  	},
  	sortGoods(){
  		this.sortFlag = !this.sortFlag;
  		this.page = 1;
  		this.getGoodsList();
  	},
  	loadMore: function() {
      this.busy = true;
      setTimeout(() => {
        this.page++;
        this.getGoodsList(true);
      }, 500);
    },
    addCart(productId){
    	this.$axios.post("/goods/addCart",{
    		productId:productId
    	}).then((res)=>{
    		var res = res.data;
    		if(res.status == 0){
    			this.$store.commit('updataCartCount',1);
    			this.mdShowCart = true
    		}else{
    			this.mdShow = true;
    		}
    	})
    },
    closeModel(){
    	this.mdShow = false;
    }
  }
}
</script>

<style>
	.btn:hover{
		background:#ffe5e6;
		transition: all .3s ease-out;
	}
</style>