<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="ID" prop="userId">
                <el-input v-model="queryParams.userId" placeholder="请输入小程序用户ID" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="福袋金额" prop="money">
                <el-input v-model="queryParams.money" placeholder="请输入福袋金额" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <!-- <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['bagRecord:bagRecord:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['bagRecord:bagRecord:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['bagRecord:bagRecord:remove']">删除</el-button>
            </el-col> -->
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['bagRecord:bagRecord:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="bagRecordList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="用户ID" align="center" prop="userId" />
            <!-- <el-table-column label="福袋id" align="center" prop="bagId" /> -->
            <el-table-column label="福袋金额" align="center" prop="money" />
            <el-table-column label="状态" align="center" prop="status">
                <template slot-scope="scope">
                    {{ scope.row.status == 0 ? '未使用' : '已使用' }}
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <!-- <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['bagRecord:bagRecord:edit']">修改</el-button> -->
                    <el-button size="mini" type="text" icon="el-icon-delete" v-if="scope.row.status == 0" @click="handleDelete(scope.row)" v-hasPermi="['bagRecord:bagRecord:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改福袋赠送记录对话框 -->
        <!-- <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="小程序用户id" prop="openId">
                    <el-input v-model="form.openId" placeholder="请输入小程序用户id" />
                </el-form-item>
                <el-form-item label="福袋id" prop="bagId">
                    <el-input v-model="form.bagId" placeholder="请输入福袋id" />
                </el-form-item>
                <el-form-item label="福袋金额" prop="money">
                    <el-input v-model="form.money" placeholder="请输入福袋金额" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="删除标志" prop="delFlag">
                    <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog> -->
    </div>
</template>

<script>
import { listBagRecord, getBagRecord, delBagRecord, addBagRecord, updateBagRecord } from "@/api/bagRecord/bagRecord";

export default {
    name: "BagRecord",
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
            // 福袋赠送记录表格数据
            bagRecordList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                userId: null,
                nickName: null,
                money: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                openId: [
                    { required: true, message: "小程序用户id不能为空", trigger: "blur" }
                ],
                money: [
                    { required: true, message: "福袋金额不能为空", trigger: "blur" }
                ],
            }
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询福袋赠送记录列表 */
        getList() {
            this.loading = true;
            listBagRecord(this.queryParams).then(response => {
                this.bagRecordList = response.rows;
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
                openId: null,
                bagId: null,
                money: null,
                status: null,
                createBy: null,
                createTime: null,
                updateBy: null,
                updateTime: null,
                remark: null,
                delFlag: null
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
            this.title = "添加福袋赠送记录";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getBagRecord(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改福袋赠送记录";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateBagRecord(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addBagRecord(this.form).then(response => {
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
                return delBagRecord(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('bagRecord/bagRecord/export', {
                ...this.queryParams
            }, `bagRecord_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>
