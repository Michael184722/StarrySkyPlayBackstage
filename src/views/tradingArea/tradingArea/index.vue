<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="ID" prop="openId">
                <el-input v-model="queryParams.openId" placeholder="请输入ID" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="商品名称" prop="commodityName">
                <el-input v-model="queryParams.commodityName" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="商品等级" prop="level">
                <el-select v-model="queryParams.level" placeholder="请选择商品等级" clearable>
                    <el-option v-for="dict in dict.type.level" :key="dict.value" :label="dict.label" :value="dict.label" />
                </el-select>
            </el-form-item>
            <el-form-item label="类型" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择类型" clearable>
                    <el-option label="已成交" value="1" />
                    <el-option label="未成交" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="成交时间">
                <el-date-picker clearable v-model="buyTime" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item label="发布时间">
                <el-date-picker clearable v-model="daterange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <!-- <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['tradingArea:tradingArea:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['tradingArea:tradingArea:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['tradingArea:tradingArea:remove']">删除</el-button>
            </el-col> -->
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['tradingArea:tradingArea:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="tradingAreaList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="ID" align="center" prop="userId" />
            <el-table-column label="头像" align="center" prop="avatar">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.avatar" width="50px" height="50px" />
                </template>
            </el-table-column>
            <el-table-column label="昵称" align="center" prop="nickName" />
            <el-table-column label="商品名称" align="center" prop="commodityName" />
            <el-table-column label="数量" align="center" prop="num" />
            <el-table-column label="商品等级" align="center" prop="level">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.level" :value="scope.row.level" />
                </template>
            </el-table-column>
            <el-table-column label="类型" align="center" prop="status">
                <template slot-scope="scope">
                    <template v-for="(item, index) in [{label: '已成交', value: 1},{label: '未成交', value: 0}]">
                        <el-tag :key="index" v-if="item.value == scope.row.status" :type=" scope.row.status == 0 && 'danger'">{{item.label}}</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="一口价" align="center" prop="price" />
            <el-table-column label="成交ID" align="center" prop="buyOpenId" />
            <el-table-column label="成交头像" align="center" prop="dealAvatar">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.dealAvatar" width="50px" height="50px" />
                </template>
            </el-table-column>
            <el-table-column label="成交昵称" align="center" prop="dealNickName" />
            <el-table-column label="成交时间" align="center" prop="buyTime" width="180">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.buyTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="发布时间" align="center" prop="createTime" width="180">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改交易区对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="小程序用户id" prop="openId">
                    <el-input v-model="form.openId" placeholder="请输入小程序用户id" />
                </el-form-item>
                <el-form-item label="一口价" prop="price">
                    <el-input v-model="form.price" placeholder="请输入一口价" />
                </el-form-item>
                <el-form-item label="用户背包id(多个用逗号分割)" prop="packageIds">
                    <el-input v-model="form.packageIds" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="购买用户id" prop="buyOpenId">
                    <el-input v-model="form.buyOpenId" placeholder="请输入购买用户id" />
                </el-form-item>
                <el-form-item label="成交时间" prop="buyTime">
                    <el-date-picker clearable v-model="form.buyTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择成交时间">
                    </el-date-picker>
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
        </el-dialog>
    </div>
</template>

<script>
import { listTradingArea, getTradingArea, delTradingArea, addTradingArea, updateTradingArea } from "@/api/tradingArea/tradingArea";

export default {
    name: "TradingArea",
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
            // 交易区表格数据
            tradingAreaList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                openId: null,
                nickName: null,
                commodityName: null,
                level: null,
                status: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                openId: [
                    { required: true, message: "小程序用户id不能为空", trigger: "blur" }
                ],
                price: [
                    { required: true, message: "一口价不能为空", trigger: "blur" }
                ],
            },
            daterange: [],
            buyTime: [],
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询交易区列表 */
        getList() {
            this.loading = true;
            if(this.buyTime.length) {
                this.queryParams.params.buyTimeBegin = this.buyTime[0];
                this.queryParams.params.buyTimeEnd = this.buyTime[1];
            };
            listTradingArea(this.addDateRange(this.queryParams, this.daterange)).then(response => {
                this.tradingAreaList = response.rows;
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
                price: null,
                packageIds: null,
                buyOpenId: null,
                status: null,
                buyTime: null,
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
            this.queryParams.params && delete this.queryParams.params;
            this.daterange = [];
            this.buyTime = [];
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
            this.title = "添加交易区";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getTradingArea(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改交易区";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateTradingArea(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addTradingArea(this.form).then(response => {
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
            this.$modal.confirm('是否确认删除交易区编号为"' + ids + '"的数据项？').then(function () {
                return delTradingArea(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('tradingArea/tradingArea/export', {
                ...this.queryParams
            }, `tradingArea_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>
