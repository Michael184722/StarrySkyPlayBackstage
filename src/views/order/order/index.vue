<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
			label-width="68px">
			<el-form-item label="商品名称" prop="commodityName">
				<el-input v-model="queryParams.commodityName" placeholder="请输入商品id" clearable
					@keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="购买时间">
                <el-date-picker v-model="dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table v-loading="loading" :data="orderList">
			<el-table-column label="序号" type="index" width="55" align="center" />
			<el-table-column label="头像" align="center" prop="wxAvatar">
				<template slot-scope="scope">
					<ImagePreview :src="scope.row.wxAvatar" :width="50" :height="50" />
				</template>
			</el-table-column>
			<el-table-column label="昵称" align="center" prop="nickName" />
			<el-table-column label="ID" align="center" prop="commodityId" />
			<el-table-column label="手机号" align="center" prop="phone" />
			<el-table-column label="商品名称" align="center" prop="commodityName" />
			<el-table-column label="商品价格" align="center" prop="price" />
			<el-table-column label="商品数量" align="center" prop="num" />
			<el-table-column label="支付方式" align="center" prop="payType">
				<template slot-scope="scope">{{ scope.row.payType == 1 ? '余额' : scope.row.payType == 2 ? '微信' : '/' }}</template>
			</el-table-column>
			<el-table-column label="购买日期" align="center" prop="createTime" />
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
			@pagination="getList" />
	</div>
</template>

<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/order/order";

export default {
	name: "Order",
	data() {
		return {
			// 遮罩层
			loading: true,
			// 选中数组
			ids: [],
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 商城订单信息表格数据
			orderList: [],
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				commodityName: null,
			},
			dateRange: []
		};
	},
	created() {
		this.getList();
	},
	methods: {
		/** 查询商城订单信息列表 */
		getList() {
			this.loading = true;
			listOrder(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
				this.orderList = response.rows;
				this.total = response.total;
				this.loading = false;
			});
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.pageNum = 1;
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.dateRange = [];
			this.resetForm("queryForm");
			this.handleQuery();
		},
	}
};
</script>
