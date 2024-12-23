<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="充值金额" prop="money">
                <el-input v-model="queryParams.money" placeholder="请输入充值金额" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
                <el-input v-model="queryParams.sort" placeholder="请输入排序" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['rechargeSet:rechargeSet:add']">新增</el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['rechargeSet:rechargeSet:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['rechargeSet:rechargeSet:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['rechargeSet:rechargeSet:export']">导出</el-button>
            </el-col> -->
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="rechargeSetList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="金额" align="center" prop="money" />
            <el-table-column label="赠送金额" align="center" prop="sendMoney" />
            <el-table-column label="赠送次数" align="center" prop="sendNum" />
            <el-table-column label="排序" align="center" prop="sort" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['rechargeSet:rechargeSet:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['rechargeSet:rechargeSet:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改充值设置对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="充值金额" prop="money">
                    <el-input v-model="form.money" type="number" placeholder="请输入充值金额" />
                </el-form-item>
                <el-form-item label="赠送金额" prop="sendMoney">
                    <el-input v-model="form.sendMoney" type="number" placeholder="请输入赠送金额" />
                </el-form-item>
                <el-form-item label="赠送次数" prop="sendNum">
                    <el-input v-model="form.sendNum" type="number" placeholder="请输入赠送次数" />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input v-model="form.sort" type="number" placeholder="请输入排序" />
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
import { listRechargeSet, getRechargeSet, delRechargeSet, addRechargeSet, updateRechargeSet } from "@/api/rechargeSet/rechargeSet";

export default {
    name: "RechargeSet",
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
            // 充值设置表格数据
            rechargeSetList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                money: null,
                sort: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                money: [
                    { required: true, message: "充值金额不能为空", trigger: "blur" }
                ],
                sort: [
                    { required: true, message: "排序不能为空", trigger: "blur" }
                ],
            }
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询充值设置列表 */
        getList() {
            this.loading = true;
            listRechargeSet(this.queryParams).then(response => {
                this.rechargeSetList = response.rows;
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
                money: null,
                sendMoney: null,
                sendNum: null,
                sort: null,
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
            this.title = "添加充值设置";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getRechargeSet(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改充值设置";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateRechargeSet(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addRechargeSet(this.form).then(response => {
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
            this.$modal.confirm('是否确认删除充值设置编号为"' + ids + '"的数据项？').then(function () {
                return delRechargeSet(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('rechargeSet/rechargeSet/export', {
                ...this.queryParams
            }, `rechargeSet_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>
