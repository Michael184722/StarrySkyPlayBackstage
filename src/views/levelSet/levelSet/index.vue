<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
            label-width="68px">
            <el-form-item label="等级" prop="level">
                <el-input v-model="queryParams.level" placeholder="请输入等级" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['levelSet:levelSet:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                    v-hasPermi="['levelSet:levelSet:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="levelSetList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="消费金额" align="center" prop="money">
                <template slot-scope="scope">{{ scope.row.startMoney }} - {{ scope.row.endMoney }}</template>
            </el-table-column>
            <el-table-column label="等级" align="center" prop="level" />
            <el-table-column label="赠送商品" align="center" prop="commodityName" />
            <el-table-column label="备注" align="center" prop="remark" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['levelSet:levelSet:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['levelSet:levelSet:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
            @pagination="getList" />

        <!-- 添加或修改会员等级设置对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="开始金额" prop="startMoney">
                    <el-input v-model="form.startMoney" type="number" :max="999999999999999" placeholder="请输入开始金额" maxlength="15" @input="form.startMoney = form.startMoney.replace(/\D/g, '').slice(0, 15)" />
                </el-form-item>
                <el-form-item label="结束金额" prop="endMoney">
                    <el-input v-model="form.endMoney" type="number" :max="999999999999999" placeholder="请输入结束金额" maxlength="15" @input="form.endMoney = form.endMoney.replace(/\D/g, '').slice(0, 15)" />
                </el-form-item>
                <el-form-item label="等级" prop="level">
                    <el-input v-model="form.level" placeholder="请输入等级" />
                </el-form-item>
                <el-form-item label="赠送商品">
                    <el-select v-model="form.commodityId" placeholder="请选择" filterable style="width: 100%;" clearable>
                        <el-option v-for="item in [...commodityList]" :key="item.id" :label="item.commodityName + (item.price ? '(' + item.price + '元)' : '')" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listCommodity } from "@/api/commodity/commodity";
import { listLevelSet, getLevelSet, delLevelSet, addLevelSet, updateLevelSet } from "@/api/levelSet/levelSet";

export default {
    name: "LevelSet",
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
            // 会员等级设置表格数据
            levelSetList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                level: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                startMoney: [
                    { required: true, message: "请输入开始金额", trigger: "blur" }
                ],
                endMoney: [
                    { required: true, message: "请输入结束金额", trigger: "blur" }
                ],
                level: [
                    { required: true, message: "请输入等级", trigger: "blur" }
                ],
            },
            commodityList: []
        };
    },
    created() {
        this.getList();
        listCommodity().then(res => {
            this.commodityList = res.rows;
        });
    },
    methods: {
        /** 查询会员等级设置列表 */
        getList() {
            this.loading = true;
            listLevelSet(this.queryParams).then(response => {
                this.levelSetList = response.rows;
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
                level: null,
                createBy: null,
                createTime: null,
                updateBy: null,
                updateTime: null,
                remark: null,
                delFlag: null,
                commodityId: null,
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
            this.title = "添加会员等级设置";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getLevelSet(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改会员等级设置";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateLevelSet(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addLevelSet(this.form).then(response => {
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
            this.$modal.confirm('是否确认删除会员等级设置编号为"' + ids + '"的数据项？').then(function () {
                return delLevelSet(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('levelSet/levelSet/export', {
                ...this.queryParams
            }, `levelSet_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>
