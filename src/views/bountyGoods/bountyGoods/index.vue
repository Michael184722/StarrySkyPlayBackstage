<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="商品名称" prop="commodityName">
                <el-input v-model="queryParams.commodityName" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="商品等级" prop="level">
                <el-select v-model="queryParams.level" placeholder="请选择商品等级" clearable>
                    <el-option v-for="dict in dict.type.level" :key="dict.label" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <!-- 筛选预售和现货 -->
            <el-form-item label="商品类型" prop="cmType">
                <el-select v-model="queryParams.cmType" placeholder="请选择商品类型" clearable>
                    <el-option label="预售" value="1" />
                    <el-option label="现货" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="金额排序" prop="price">
                <el-select v-model="price" placeholder="请选择排序" clearable>
                    <el-option label="正序" value="0" />
                    <el-option label="倒序" value="1" />
                </el-select>
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

        <el-table v-loading="loading" :data="commodityList" border size="mini">
            <el-table-column label="序号" align="center" type="index" width="55" />
            <el-table-column label="商品名称" align="center" prop="commodityName" />
            <el-table-column label="商品图片" align="center" prop="faceImg">
                <template slot-scope="scope">
                    <imagePreview :src="scope.row.faceImg" :width="35" :height="35" />
                </template>
            </el-table-column>
            <!-- 商品类型 -->
            <el-table-column label="商品类型" align="center" prop="cmType">
                <template slot-scope="scope">
                    <span v-if="scope.row.cmType === '1'">预售</span>
                    <span v-else-if="scope.row.cmType === '2'">现货</span>
                </template>
            </el-table-column>
            <el-table-column label="价格(元)" align="center" prop="price" />
            <el-table-column label="商品等级" align="center" prop="levelName" />
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
                <el-form-item label="商品等级" prop="level">
                    <el-select v-model="form.level" placeholder="请选择商品等级" clearable style="width: 100%;">
                        <el-option v-for="dict in dict.type.level" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="抽奖套" prop="suitId">
                    <el-select v-model="form.suitId" placeholder="请选择商品等级" clearable style="width: 100%;">
                        <el-option v-for="dict in suitManageList" :key="dict.id" :label="dict.suitName" :value="dict.id">
                            <div style="display: flex; align-items: center;">
                                <ImagePreview :src="dict.faceImg" width="30px" height="30px" />
                                <div style="margin-left: 20px;">{{ dict.suitName }}</div>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品价格" prop="price">
                    <el-input v-model="form.price" type="number" placeholder="请输入价格">
                        <template slot="append">元</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="预售/现货" prop="cmType">
                    <el-select v-model="form.cmType" placeholder="请选择" style="width: 100%;">
                        <el-option v-for="(item, index) in [{ label: '预售', value: '1' }, { label: '现货', value: '2' }]" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品图片" prop="faceImg">
                    <ImageUpload v-model="form.faceImg" :limit="1" />
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
import { listSuitManage } from "@/api/suitManage/suitManage";
import { listCommodity, getCommodity, delCommodity, addCommodity, updateCommodity } from "@/api/commodity/commodity";

export default {
    name: "Commodity",
    dicts: ['level'],
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
                cmType: null,
                level: null,
                type: "2",
                params: {
                    price: null
                }
            },
            price: null,
            dateRange: [],
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                commodityName: [
                    { required: true, message: "商品名称不能为空", trigger: "blur" }
                ],
                level: [
                    { required: true, message: "商品等级不能为空", trigger: "change" }
                ],
                price: [
                    { required: true, message: "商品价格不能为空", trigger: "blur" }
                ],
                cmType: [
                    { required: true, message: "请选择预售或现货", trigger: "change" }
                ],
                faceImg: [
                    { required: true, message: "请上传商品图", trigger: "change" }
                ],
            },
            suitManageList: [],
        };
    },
    created() {
        this.getList();
        listSuitManage({ suitType: 5 }).then(response => {
            this.suitManageList = response.rows;
            console.log(this.suitManageList, "suitManageList");
        });
    },
    methods: {
        /** 查询商城商品管理列表 */
        getList() {
            this.loading = true;
            if(this.price) {
                this.queryParams.params.price = this.price;
            } else {
                this.queryParams.params.price && (this.queryParams.params.price = null);
            }
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
                level: null,
                suitId: null,
                price: null,
                faceImg: null,
                content: null,
                type: "2",
                cmType: "2",
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
            this.price = null;
            this.dateRange = [];
            this.queryParams.params.price && (this.queryParams.params.price = null);
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
                this.form.level = response.data.level.toString();
                this.form.suitId = Number(response.data.suitId);
                this.open = true;
                this.title = "修改商城商品管理";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateCommodity(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addCommodity(this.form).then(response => {
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
