<template>
	<div class="app-container">
		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
					v-hasPermi="['carousel:carousel:add']">新增</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="carouselList">
			<el-table-column label="序号" type="index" align="center" width="55" />
			<el-table-column label="轮播图" align="center">
				<template slot-scope="scope">
					<ImagePreview :width="50" :height="50" :src="scope.row.img" />
				</template>
			</el-table-column>
			<el-table-column label="排序" align="center" prop="sort" />
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
				<template slot-scope="scope">
					<el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
						v-hasPermi="['carousel:carousel:edit']">修改</el-button>
					<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
						v-hasPermi="['carousel:carousel:remove']">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
			:limit.sync="queryParams.pageSize" @pagination="getList" />

		<!-- 添加或修改轮播图信息对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="排序" prop="sort">
					<el-input-number v-model="form.sort" :min="form.id ? 1 : carouselList.length + 1" label="描述文字" />
				</el-form-item>
				<el-form-item label="轮播图" prop="img">
					<ImageUpload  v-model="form.img" :limit="1" />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确 定</el-button>
				<el-button @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { listCarousel, getCarousel, delCarousel, addCarousel, updateCarousel } from "@/api/carousel/carousel";

export default {
	name: "Carousel",
	data() {
		return {
			// 遮罩层
			loading: true,
			// 选中数组
			ids: [],
			// 显示搜索条件
			showSearch: true,
			// 查询条件
			queryParams: {
				pageNum: 1,
				pageSize: 10,
			},
			// 总条数
			total: 0,
			// 轮播图信息表格数据
			carouselList: [],
			// 弹出层标题
			title: "",
			// 是否显示弹出层
			open: false,
			// 表单参数
			form: {},
			// 表单校验
			rules: {
				sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
				img: [{ required: true, message: "请上传轮播图", trigger: "change" }],
			}
		};
	},
	created() {
		this.getList();
	},
	methods: {
		/** 查询轮播图信息列表 */
		getList() {
			this.loading = true;
			listCarousel(this.queryParams).then(response => {
				this.carouselList = response.rows;
				this.total = response.total;
				this.loading = false;
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
				img: null,
				sort: null,
			};
			this.resetForm("form");
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
			this.title = "添加轮播图信息";
		},
		/** 修改按钮操作 */
		handleUpdate(row) {
			this.reset();
			const id = row.id || this.ids
			getCarousel(id).then(response => {
				this.form = response.data;
				this.open = true;
				this.title = "修改轮播图信息";
			});
		},
		/** 提交按钮 */
		submitForm() {
			this.$refs["form"].validate(valid => {
				if (valid) {
					if (this.form.id != null) {
						updateCarousel(this.form).then(response => {
							this.$modal.msgSuccess("修改成功");
							this.open = false;
							this.getList();
						});
					} else {
						addCarousel(this.form).then(response => {
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
			this.$modal.confirm('是否确认删除？').then(function () {
				return delCarousel(ids);
			}).then(() => {
				this.getList();
				this.$modal.msgSuccess("删除成功");
			}).catch(() => { });
		},
	}
};
</script>
