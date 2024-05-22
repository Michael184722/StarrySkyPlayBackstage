<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="118px">
            <el-form-item label="微信号/微信群号" prop="wxNo">
                <el-input v-model="queryParams.wxNo" placeholder="请输入微信号/微信群号" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['customService:customService:add']">新增</el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['customService:customService:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['customService:customService:remove']">删除</el-button>
            </el-col> -->
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['customService:customService:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="customServiceList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="微信号/微信群号" align="center" prop="wxNo" />
            <el-table-column label="二维码图片" align="center" prop="img">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.img" width="50px" height="50px"/>
                </template>
            </el-table-column>
            <el-table-column label="类型" align="center" prop="type">
                <template slot-scope="scope">
                    {{ scope.row.type == 1 ? '微信号' : scope.row.type == 2 ? '微信群号' : '' }}
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['customService:customService:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['customService:customService:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改客服信息设置对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="130px">
                <el-form-item label="微信号/微信群号" prop="wxNo">
                    <el-input v-model="form.wxNo" placeholder="请输入微信号/微信群号" />
                </el-form-item>
                <el-form-item label="类型" prop="type">
                    <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                        <el-option label="微信号" value="1" />
                        <el-option label="微信群号" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="二维码图片" prop="img">
                    <ImageUpload v-model="form.img" :limit="1" />
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
import { listCustomService, getCustomService, delCustomService, addCustomService, updateCustomService } from "@/api/customService/customService";

export default {
    name: "CustomService",
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
            // 客服信息设置表格数据
            customServiceList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                wxNo: null,
                img: null,
                type: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                wxNo: [{ required: true, message: "微信号/微信群号不能为空", trigger: "blur"}],
                img: [{ required: true, message: "二维码图片不能为空", trigger: "change"}],
                type: [{ required: true, message: "类型不能为空", trigger: "change"}],
            }
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询客服信息设置列表 */
        getList() {
            this.loading = true;
            listCustomService(this.queryParams).then(response => {
                this.customServiceList = response.rows;
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
                wxNo: null,
                img: null,
                type: null,
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
            this.title = "添加客服信息设置";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids
            getCustomService(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改客服信息设置";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateCustomService(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addCustomService(this.form).then(response => {
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
            this.$modal.confirm('是否确认删除客服信息设置编号为"' + ids + '"的数据项？').then(function () {
                return delCustomService(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('customService/customService/export', {
                ...this.queryParams
            }, `customService_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>
