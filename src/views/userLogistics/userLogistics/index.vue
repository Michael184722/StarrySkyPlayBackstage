<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="108px">
            <el-form-item label="ID" prop="openId">
                <el-input v-model="queryParams.openId" placeholder="请输入ID" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <!-- 昵称 -->
            <el-form-item label="昵称" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="userPhone">
                <el-input v-model="queryParams.userPhone" placeholder="请输入手机号" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="收货人姓名" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入收货人姓名" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="收获人手机号" prop="phone">
                <el-input v-model="queryParams.phone" placeholder="请输入收获人手机号" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <!-- 商品名称 -->
            <el-form-item label="商品名称" prop="commodityName">
                <el-input v-model="queryParams.commodityName" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="是否包邮" prop="isMail">
                <el-select v-model="queryParams.isMail" placeholder="请选择是否包邮" clearable>
                    <el-option v-for="dict in [{value: 0, label: '否'}, {value: 1, label: '是'}]" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <!-- 审核状态 -->
            <el-form-item label="审核状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择审核状态" clearable>
                    <el-option v-for="(item, index) in [{ value: 0, label: '待审核' }, { value: 1, label: '审核通过' }]" :key="index" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <!-- 申请时间 -->
            <el-form-item label="申请时间">
                <el-date-picker v-model="dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <!-- <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['userLogistics:userLogistics:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['userLogistics:userLogistics:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['userLogistics:userLogistics:remove']">删除</el-button>
            </el-col> -->
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['userLogistics:userLogistics:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userLogisticsList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="ID" align="center" prop="userId" width="200" />
            <el-table-column label="头像" align="center" prop="avatar">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.avatar" width="50px" height="50px" />
                </template>
            </el-table-column>
            <el-table-column label="昵称" align="center" prop="nickName" width="200" />
            <el-table-column label="手机号" align="center" prop="userPhone" width="180" />
            <el-table-column label="商品" align="center" prop="commodityName">
                <template slot-scope="scope">
                    <el-popover placement="right" trigger="click">
                        <el-table v-if="scope.row.userPackageList" :data="scope.row.userPackageList">
                            <el-table-column width="200" align="center" property="commodityName" label="商品名称"></el-table-column>
                            <el-table-column width="100" align="center" property="num" label="商品数量"></el-table-column>
                            <!-- 图片 -->
                            <el-table-column width="100" align="center" label="图片">
                                <template slot-scope="scope">
                                    <ImagePreview :src="scope.row.commodityImg" width="50px" height="50px" />
                                </template>
                            </el-table-column>
                            <!-- 等级 -->
                            <el-table-column width="100" align="center" property="levelName" label="等级"></el-table-column>
                        </el-table>
                        <el-button slot="reference" type="primary" size="mini" @click="">查看</el-button>
                    </el-popover>
                </template>
            </el-table-column>
            <!-- <el-table-column label="商品名称" align="center" prop="commodityName" width="200" /> -->
            <el-table-column label="商品数量" align="center" prop="num" width="200" />
            <el-table-column label="商品总价" align="center" prop="totalMoney" width="200" />
            <el-table-column label="物流单号" align="center" prop="logisticsNo" width="200" />
            <el-table-column label="物流公司" align="center" prop="logisticsCompany" width="200" />
            <el-table-column label="是否包邮" align="center" prop="isMail" width="200">
                <template slot-scope="scope">
                    <template v-for="(item, index) in [{value: 0, label: '否'}, {value: 1, label: '是'}]">
                        <el-tag v-if="item.value === scope.row.isMail" :key="index" :type="item.value === 0 && 'danger'">{{item.label}}</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="审核状态" align="center" prop="status" width="200">
                <template slot-scope="scope">
                    <template v-for="(item, index) in [{value: 0, label: '待审核'}, {value: 1, label: '审核通过'}, {value: 2, label: '审核不通过'}]">
                        <el-tag v-if="item.value == scope.row.status" :key="index" :type="item.value === 2 ? 'danger' : item.value === 1 ? 'success' : ''">{{item.label}}</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="收货人姓名" align="center" prop="name" width="150" />
            <el-table-column label="收获人手机号" align="center" prop="phone" width="150" />
            <el-table-column label="收货人地区" align="center" prop="region" width="300" />
            <el-table-column label="收货人地址" align="center" prop="address" width="400" />
            <el-table-column label="申请时间" align="center" prop="createTime" width="180">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <!-- 处理时间 -->
            <el-table-column label="处理时间" align="center" prop="updateTime" width="180">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" fixed="right" width="180">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" v-if="scope.row.status == 0" @click="handleUpdate(scope.row)" v-hasPermi="['userLogistics:userLogistics:edit']">审核</el-button>
                    <el-tag v-if="scope.row.status == 1">已审核</el-tag>
                    <!-- <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['userLogistics:userLogistics:edit']">修改</el-button> -->
                    <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['userLogistics:userLogistics:remove']">删除</el-button> -->
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改物流信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="物流单号" prop="logisticsNo">
                    <el-input v-model="form.logisticsNo" placeholder="请输入物流单号" />
                </el-form-item>
                <el-form-item label="物流公司" prop="logisticsCompany">
                    <el-input v-model="form.logisticsCompany" placeholder="请输入物流公司" />
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
import { listUserLogistics, getUserLogistics, delUserLogistics, addUserLogistics, updateUserLogistics } from "@/api/userLogistics/userLogistics";

export default {
    name: "UserLogistics",
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
            // 物流信息表格数据
            userLogisticsList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                openId: null,
                logisticsNo: null,
                logisticsCompany: null,
                address: null,
                name: null,
                phone: null,
                region: null,
                totalMoney: null,
                isMail: null,
                commodityId: null,
                status: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                logisticsNo: [
                    { required: true, message: "请输入物流单号", trigger: "blur" }
                ],
                logisticsCompany: [
                    { required: true, message: "请输入物流公司", trigger: "blur" }
                ],
            },
            dateRange: [],
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询物流信息列表 */
        getList() {
            this.loading = true;
            listUserLogistics(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
                this.userLogisticsList = response.rows;
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
                status: "1",
                logisticsNo: null,
                logisticsCompany: null,
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
            this.dateRange = [];
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
            this.title = "添加物流信息";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            this.open = true;
            this.form.id = row.id;
            this.title = "审核";
            // const id = row.id || this.ids
            // getUserLogistics(id).then(response => {
            //     this.form = response.data;
            //     this.open = true;
            //     this.title = "审核";
            // });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateUserLogistics(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addUserLogistics(this.form).then(response => {
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
            this.$modal.confirm('是否确认删除物流信息编号为"' + ids + '"的数据项？').then(function () {
                return delUserLogistics(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('userLogistics/userLogistics/export', {
                ...this.queryParams
            }, `userLogistics_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>
