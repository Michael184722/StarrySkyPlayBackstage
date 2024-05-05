<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="类型名称" prop="dictLabel">
                <el-input v-model="queryParams.dictLabel" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
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
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="类型名称" align="center" prop="dictLabel" />
            <el-table-column label="类型等级" align="center" prop="dictValue" />
            <el-table-column label="排序" align="center" prop="dictSort" />
            <el-table-column label="状态" align="center" prop="status">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="抽中倍数" align="center" prop="multiple" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="类型名称" prop="dictLabel">
                    <el-input v-model="form.dictLabel" placeholder="请输入商品名称" />
                </el-form-item>
                <el-form-item label="类型等级" prop="dictValue">
                    <el-input v-model="form.dictValue" type="number" placeholder="请输入类型等级" />
                </el-form-item>
                <el-form-item label="显示排序" prop="dictSort">
                    <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="抽中倍数" prop="multiple">
                    <el-input v-model="form.multiple" type="number" placeholder="请输入倍数" :maxlength="10" @input="form.multiple = form.multiple.replace(/[^0-9]/g, '').slice(0, 10)"></el-input>
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
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data";
export default {
    name: "Commodity",
    dicts: ['sys_normal_disable'],
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
            // 商品表格数据
            commodityList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                dictType: 'level',
                dictLabel: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                dictLabel: [
                    { required: true, message: "商品名称不能为空", trigger: "blur" }
                ],
                dictValue: [
                    { required: true, message: "商品等级不能为空", trigger: "blur" }
                ],
                dictSort: [
                    { required: true, message: "排序不能为空", trigger: "blur" }
                ],
                status: [
                    { required: true, message: "商品状态不能为空", trigger: "blur" }
                ],
                multiple: [
                    { required: true, message: "请选择抽奖倍数", trigger: "blur" }
                ],
            },
            // 商品分类树选项
            commodityCateOptions: [],
            // 商品分类树选项（加载完后）
            commodityCateOptionsAfter: []
        }
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询商品列表 */
        getList() {
            this.loading = true;
            listData(this.queryParams).then(response => {
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
                dictCode: void 0,
                dictType: 'level',
                dictLabel: void 0,
                dictValue: void 0,
                dictSort: 1,
                status: "0",
                multiple: void 0,
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
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.title = "添加类型";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const dictCode = row.dictCode || this.ids
            getData(dictCode).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改类型";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.dictCode != null) {
                        updateData(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addData(this.form).then(response => {
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
            const commodityIds = row.dictCode || this.ids;
            this.$modal.confirm('是否确认删除？').then(function () {
                return delData(commodityIds);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
    }
}
</script>