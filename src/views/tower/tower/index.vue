<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
			label-width="68px">
			<el-form-item label="ID" prop="id">
				<el-input v-model="queryParams.id" placeholder="请输入用户ID" clearable
					@keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="套名称" prop="name">
				<el-input v-model="queryParams.name" placeholder="请输入套名称" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="上/下架" prop="status">
				<el-select v-model="queryParams.status" placeholder="请选择上/下架" clearable>
					<el-option label="上架" value="1" />
					<el-option label="下架" value="0" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
					v-hasPermi="['tower:tower:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
					v-hasPermi="['tower:tower:export']">导出</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="towerList" border size="mini">
			<el-table-column label="序号" type="index" width="55" align="center" />
			<el-table-column label="ID" align="center" prop="id" />
			<el-table-column label="套封面" align="center" prop="faceImg">
				<template slot-scope="scope">
					<ImagePreview :src="scope.row.faceImg" :width="35" :height="35" />
				</template>
			</el-table-column>
			<el-table-column label="套名称" align="center" prop="name" />
			<el-table-column label="单抽价格" align="center" prop="price" />
			<el-table-column label="查看等级" align="center" prop="levelId" />
			<!-- <el-table-column label="限制数量" align="center" prop="lotteryNum" /> -->

			<el-table-column label="上下架状态" align="center" prop="status">
				<template slot-scope="scope">
					<el-switch v-model="scope.row.status" active-value="1" inactive-value="0"
						@change="switchChange($event, scope.row)" />
				</template>
			</el-table-column>
			<el-table-column label="上架时间" align="center" prop="upTime" width="180">
				<template slot-scope="scope">
					<span>{{ parseTime(scope.row.upTime, '{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
				<template slot-scope="scope">
					<el-button size="mini" type="text" @click="towerInformation(scope.row)"
						v-hasPermi="['tower:tower:edit']">塔信息</el-button>
					<el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
						v-hasPermi="['tower:tower:edit']">修改</el-button>
					<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
						v-hasPermi="['tower:tower:remove']">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
			:limit.sync="queryParams.pageSize" @pagination="getList" />

		<!-- 添加或修改攀塔套管理对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="套名称" prop="name">
					<el-input v-model="form.name" placeholder="请输入套名称" />
				</el-form-item>
				<el-form-item label="单抽价格" prop="price">
					<el-input v-model="form.price" placeholder="请输入单抽价格" />
				</el-form-item>
				<el-form-item label="查看等级" prop="levelId">
					<el-select v-model="form.levelId" placeholder="请选择查看等级" style="width: 100%;">
						<el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level"
							:value="item.id" />
					</el-select>
				</el-form-item>
				<!-- <el-form-item label="抽奖次数" prop="lotteryNum">
					<el-input v-model="form.lotteryNum" type="number" placeholder="请输入抽奖次数" />
				</el-form-item> -->
				<el-form-item label="上架时间" prop="upTime">
					<el-date-picker clearable v-model="form.upTime" type="date" value-format="yyyy-MM-dd"
						placeholder="请选择上架时间" style="width: 100%;" />
				</el-form-item>
				<el-form-item label="封面图片" prop="faceImg">
					<ImageUpload v-model="form.faceImg" :limit="1" />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确 定</el-button>
				<el-button @click="cancel">取 消</el-button>
			</div>
		</el-dialog>

		<el-dialog title="塔信息" :visible.sync="towerInfoType" width="1300px" append-to-body>
			<dl-tow v-if="towerInfoType" :id="towerInfo.id"></dl-tow>
		</el-dialog>
		<!-- <el-col>
						<dl-tow v-if="open" :id="form.id"></dl-tow>
					</el-col> -->
	</div>
</template>

<script>
import { listLevelSet } from "@/api/levelSet/levelSet";
import towerManage from "../../towerManage/towerManage/index.vue";
import { listTower, getTower, delTower, addTower, updateTower } from "@/api/tower/tower";

export default {
	name: "Tower",
	components: {
		DlTow: towerManage,
	},
	data() {
		return {
			// 遮罩层
			loading: true,
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 攀塔套管理表格数据
			towerList: [],
			// 弹出层标题
			title: "",
			// 是否显示弹出层
			open: false,
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				name: null,
				id: null,
				status: null,
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {
				name: [{ required: true, message: "请输入", trigger: 'blur' }],
				price: [{ required: true, message: "请输入", trigger: 'blur' }],
				levelId: [{ required: true, message: "请输入", trigger: 'blur' }],
				// lotteryNum: [{ required: true, message: "请输入", trigger: 'blur' }],
				faceImg: [{ required: true, message: "请输入", trigger: 'blur' }],
			},
			levelOptions: [],
			towerInfo: null,
			towerInfoType: false,
		};
	},
	created() {
		this.getList();
	},
	methods: {
		/** 查询攀塔套管理列表 */
		getList() {
			this.loading = true;
			listTower(this.queryParams).then(response => {
				this.towerList = response.rows;
				this.total = response.total;
				this.loading = false;
			});
			listLevelSet().then(res => {
				this.levelOptions = res.rows;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				id: null,
				name: null,
				price: null,
				levelId: null,
				faceImg: null,
				lotteryNum: 0,
			};
			this.resetForm("form");
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.pageNum = 1;
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.resetForm("queryForm");
			this.handleQuery();
		},
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.id)
			this.single = selection.length !== 1
			this.multiple = !selection.length
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
			this.title = "添加攀塔套管理";
		},
		/** 塔信息 */
		towerInformation(row) {
			this.towerInfo = row;
			this.$nextTick(() => {
				this.towerInfoType = true;
			});
		},
		/** 修改按钮操作 */
		handleUpdate(row) {
			this.reset();
			const id = row.id || this.ids
			getTower(id).then(response => {
				this.form = response.data;
				this.open = true;
				this.title = "修改攀塔套管理";
			});
		},
		/** 上下架 */
		switchChange(e, row) {
			let obj = {
				status: e,
				id: row.id
			};
			e == "1" ? obj.upTime = this.parseTime(new Date()) : "";
			updateTower(obj).then(response => {
				this.$modal.msgSuccess(e == "1" ? "上架" : "下架");
				this.getList();
			}).catch(() => this.getList());
		},
		/** 提交按钮 */
		submitForm() {
			this.$refs["form"].validate(valid => {
				if (valid) {
					if (this.form.id != null) {
						updateTower(this.form).then(response => {
							this.$modal.msgSuccess("修改成功");
							this.open = false;
							this.getList();
						});
					} else {
						addTower(this.form).then(response => {
							this.$modal.msgSuccess("新增成功");
							this.open = false;
							this.getList();
						});
					}
				}
			});
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			const ids = row.id || this.ids;
			this.$modal.confirm('是否确认删除攀塔套管理编号为"' + ids + '"的数据项？').then(function () {
				return delTower(ids);
			}).then(() => {
				this.getList();
				this.$modal.msgSuccess("删除成功");
			}).catch(() => { });
		},
		/** 导出按钮操作 */
		handleExport() {
			this.download('tower/tower/export', {
				...this.queryParams
			}, `tower_${new Date().getTime()}.xlsx`)
		}
	}
};
</script>
