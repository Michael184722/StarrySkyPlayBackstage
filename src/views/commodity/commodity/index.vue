<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="商品名称" prop="commodityName">
                <el-input v-model="queryParams.commodityName" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="更新时间">
                <el-date-picker v-model="dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['commodity:commodity:add']">新增</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="commodityList">
            <el-table-column label="序号" align="center" type="index" width="55" />
            <el-table-column label="商品名称" align="center" prop="commodityName" />
            <el-table-column label="封面图片" align="center" prop="faceImg">
                <template slot-scope="scope">
                    <imagePreview :src="scope.row.faceImg" :width="50" :height="50" />
                </template>
            </el-table-column>
            <el-table-column label="商品图片" align="center" prop="img">
                <template slot-scope="scope">
                    <imagePreview :src="scope.row.img" :width="50" :height="50" />
                </template>
            </el-table-column>
            <el-table-column label="价格(元)" align="center" prop="price" />
            <el-table-column label="限购数量" align="center" prop="quota" />
            <el-table-column label="商品数量" align="center" prop="num" />
            <el-table-column label="创建时间" align="center" prop="createTime" />
            <el-table-column label="更新时间" align="center" prop="updateTime" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['commodity:commodity:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['commodity:commodity:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改商城商品管理对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="商品名称" prop="commodityName">
                    <el-input v-model="form.commodityName" placeholder="请输入商品名称" />
                </el-form-item>
                <el-form-item label="商品价格" prop="price">
                    <el-input v-model="form.price" type="number" placeholder="请输入价格">
                        <template slot="append">元</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="限购数量" prop="quota">
                    <el-input v-model="form.quota" type="number" placeholder="请输入限购数量" />
                </el-form-item>
                <el-form-item label="商品数量" prop="num">
                    <el-input v-model="form.num" type="number" placeholder="请输入商品数量" />
                </el-form-item>
                <el-form-item label="预售/现货" prop="cmType">
                    <el-select v-model="form.cmType" placeholder="请选择" style="width: 100%;">
                        <el-option v-for="(item, index) in [{ label: '预售', value: '1' }, { label: '现货', value: '2' }]" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="查看等级" prop="levelId">
                    <el-select v-model="form.levelId" placeholder="请选择查看等级" style="width: 100%;">
                        <el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="封面图片" prop="faceImg">
                    <ImageUpload v-model="form.faceImg" :limit="1" />
                </el-form-item>
                <el-form-item label="商品图片" prop="img">
                    <ImageUpload v-model="form.img" />
                </el-form-item>
                <el-form-item label="商品详情">
                    <editor v-model="form.content" :min-height="192" />
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
import { listLevelSet } from "@/api/levelSet/levelSet";
import { listCommodity, getCommodity, delCommodity, addCommodity, updateCommodity } from "@/api/commodity/commodity";

export default {
    name: "Commodity",
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
            // 商城商品管理表格数据
            commodityList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                commodityName: null,
                type: '1',
            },
            dateRange: [],
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                commodityName: [
                    { required: true, message: "商品名称不能为空", trigger: "blur" }
                ],
                price: [
                    { required: true, message: "商品价格不能为空", trigger: "blur" }
                ],
                quota: [
                    { required: true, message: "限购数量不能为空", trigger: "blur" }
                ],
                num: [
                    { required: true, message: "商品库存不能为空", trigger: "blur" }
                ],
                cmType: [
                    { required: true, message: "请选择预售或现货", trigger: "change" }
                ],
                levelId: [
                    { required: true, message: "请选择查看等级", trigger: "change" }
                ],
                faceImg: [
                    { required: true, message: "请上传商品封面图片", trigger: "change" }
                ],
                img: [
                    { required: true, message: "请上传商品图", trigger: "change" }
                ],
            },
            levelOptions: [],
        };
    },
    created() {
        this.getList();
        listLevelSet().then(res => {
            this.levelOptions = res.rows;
        });
    },
    methods: {
        /** 查询商城商品管理列表 */
        getList() {
            this.loading = true;
            listCommodity(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
                this.commodityList = response.rows;
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
                commodityName: null,
                price: null,
                quota: null,
                num: null,
                levelId: null,
                faceImg: null,
                img: null,
                content: null,
                type: '1',
                cmType: '2'
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
            this.dateRange = [];
            this.resetForm("queryForm");
            this.handleQuery();
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.title = "添加商城商品管理";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getCommodity(id).then(response => {
                this.form = response.data;
                if (response.data.content && response.data.content.includes('<img src="')) {
                    this.form.content = response.data.content.replace('<img src="', '<img src="' + process.env.VUE_APP_BASE_API);
                };
                this.open = true;
                this.title = "修改商城商品管理";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    let obj = { ...this.form };
                    obj.content && (obj.content = obj.content.replace(process.env.VUE_APP_BASE_API, ""));
                    if (obj.id != null) {
                        updateCommodity(obj).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addCommodity(obj).then(response => {
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
                return delCommodity(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
    }
};
</script>
