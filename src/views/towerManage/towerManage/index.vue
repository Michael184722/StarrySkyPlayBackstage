<template>
    <div class="app-container">
        <!-- <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="单价" prop="price">
                <el-input v-model="queryParams.price" placeholder="请输入单价" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form> -->

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['towerManage:towerManage:add']">新增</el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['towerManage:towerManage:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['towerManage:towerManage:remove']">删除</el-button>
            </el-col> -->
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['towerManage:towerManage:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="towerManageList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="层数" align="center" prop="layers" />
            <el-table-column label="单价" align="center" prop="price" />

            <el-table-column label="升级物品名称" align="center" prop="upCommodityName">
                <template slot-scope="scope">
                    {{ scope.row.upCommodityName || "无" }}
                </template>
            </el-table-column>
            <el-table-column label="升级物品图片" align="center" prop="upCommodityImg">
                <template slot-scope="scope">
                    <image-preview v-if="scope.row.upCommodityImg" :src="scope.row.upCommodityImg" :width="50" :height="50" />
                    <span v-else>无</span>
                </template>
            </el-table-column>
            <el-table-column label="降级物品名称" align="center" prop="downCommodityName">
                <template slot-scope="scope">
                    {{ scope.row.downCommodityName || "无" }}
                </template>
            </el-table-column>
            <el-table-column label="降级物品图片" align="center" prop="downCommodityImg">
                <template slot-scope="scope">
                    <image-preview v-if="scope.row.downCommodityImg" :src="scope.row.downCommodityImg" :width="50" :height="50" />
                    <span v-else>无</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-view" @click="handleUpdate(scope.row, true)" v-hasPermi="['towerManage:towerManage:query']">查看</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row, false)" v-hasPermi="['towerManage:towerManage:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['towerManage:towerManage:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改攀塔信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="1400px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="层数" :prop="!editType ? 'layers' : ''">
                    <el-input v-model="form.layers" type="number" placeholder="请输入层数" :disabled="editType" />
                </el-form-item>
                <el-form-item label="单价" :prop="!editType ? 'price' : ''">
                    <el-input v-model="form.price" type="number" placeholder="请输入单价" :disabled="editType" />
                </el-form-item>
                <!-- 封面图 -->
                <el-form-item label="封面图" prop="faceImg">
                    <ImageUpload v-model="form.faceImg" :disabled="editType" :limit="1" />
                </el-form-item>
                <el-divider content-position="center">攀塔商品信息信息</el-divider>
                <el-row :gutter="10" class="mb8" v-if="!editType">
                    <el-col :span="1.5">
                        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddWxSuitCommodity">添加</el-button>
                    </el-col>
                </el-row>
                <el-form-item :prop="!editType ? 'wxTowerCommodityList' : ''" label=" " label-width="10px">
                    <el-table :data="form.wxTowerCommodityList" ref="wxSuitCommodity">
                        <el-table-column label="序号" align="center" type="index" width="50" />
                        <el-table-column label="商品名称" prop="commodityName" align="center">
                            <template slot-scope="scope">{{ queryProducts(scope.row.commodityId, "commodityName") }}</template>
                        </el-table-column>
                        <el-table-column label="商品图片" prop="img" align="center">
                            <template slot-scope="scope">
                                <ImagePreview :src="queryProducts(scope.row.commodityId, 'faceImg')" :width="50" :height="50" />
                            </template>
                        </el-table-column>
                        <el-table-column label="商品等级" prop="levelName" align="center">
                            <template slot-scope="scope">{{ queryProducts(scope.row.commodityId, "levelName") }}</template>
                        </el-table-column>
                        <el-table-column label="商品原价" prop="price" align="center">
                            <template slot-scope="scope">{{ queryProducts(scope.row.commodityId, "price") }}</template>
                        </el-table-column>
                        <el-table-column label="商品参考价" prop="referencePrice" align="center" />
                        <el-table-column label="商品概率" prop="reference" align="center" />
                        <el-table-column label="类型" prop="type" align="center">
                            <template slot-scope="scope">
                                <el-form-item :prop="'wxTowerCommodityList.' + scope.$index + '.type'" :rules="{ required: true, message: '选择商品类型', trigger: 'blur' }">
                                    <el-select v-model="scope.row.type" placeholder="请选择类型" clearable :disabled="editType">
                                        <el-option label="升级物品" value="1" :disabled="disabledChange(1)" />
                                        <el-option label="降级类型" value="2" :disabled="disabledChange(2)" />
                                        <el-option label="赠送物品" value="3" />
                                        <el-option label="售卖物品" value="4" />
                                    </el-select>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="备注" prop="remark" align="center" />
                        <el-table-column label="操作" align="center" v-if="!editType">
                            <template slot-scope="scope">
                                <el-button size="mini" type="text" icon="el-icon-edit" @click="commodityUpdate(scope.row)">修改</el-button>
                                <el-button size="mini" type="text" icon="el-icon-delete" @click="commodityDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" v-if="!editType">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 添加商品 -->
        <el-dialog :title="prTitle" :visible.sync="openGoods" width="800px" append-to-body>
            <el-form ref="commodityForm" :model="commodityForm" :rules="commodityRules" label-width="100px">
                <el-form-item label="商品名称" prop="commodityId">
                    <el-select v-model="commodityForm.commodityId" placeholder="请选择商品名称" style="width: 100%;">
                        <el-option v-for="dict in goodsOptions" :key="dict.id" :label="dict.commodityName" :value="dict.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品等级">
                    <el-input :value="queryProducts(commodityForm.commodityId, 'levelName')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品单价">
                    <el-input :value="queryProducts(commodityForm.commodityId, 'price')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="参考价" prop="referencePrice">
                    <el-input v-model="commodityForm.referencePrice" type="number" placeholder="请输入商品参考价" />
                </el-form-item>
                <el-form-item label="抽中概率" prop="reference">
                    <el-input v-model="commodityForm.reference" type="number" placeholder="请输入抽中概率">
                        <template slot="append">%</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="commodityForm.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <!-- 商品图片-->
                <el-form-item label="商品图片">
                    <ImagePreview :src="queryProducts(commodityForm.commodityId, 'faceImg')" width="300px" :height="commodityForm.commodityId ? '' : '200px'" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitGoodsForm">确 定</el-button>
                <el-button @click="cancelGoods">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { listCommodity } from "@/api/commodity/commodity";
import { listTowerManage, getTowerManage, delTowerManage, addTowerManage, updateTowerManage } from "@/api/towerManage/towerManage";

export default {
    name: "TowerManage",
    data() {
        return {
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 子表选中数据
            checkedWxTowerCommodity: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 攀塔信息表格数据
            towerManageList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                price: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                layers: [{ required: true, message: "请输入攀塔层数", trigger: "blur" }],
                price: [{ required: true, message: "请输入单价", trigger: "blur" }],
                faceImg: [{ required: true, message: "请添加封面图", trigger: "change" }],
                wxTowerCommodityList: [{ required: true, type: "array", message: "请添加商品", trigger: "change" }],
            },
            openGoods: false,
            commodityForm: {},
            commodityRules: {
                commodityId: [{ required: true, message: "请选择商品", trigger: "change" }],
                referencePrice: [{ required: true, message: "请输入参考价", trigger: "blur" }],
                reference: [{ required: true, message: "请输入抽中概率", trigger: "blur" }],
            },
            goodsOptions: [],
            prTitle: null,
            editId: null,
            editType: false,
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询攀塔信息列表 */
        getList() {
            this.loading = true;
            listTowerManage(this.queryParams).then(response => {
                this.towerManageList = response.rows;
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
                layers: null,
                price: null,
                faceImg: null,
                wxTowerCommodityList: [],
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
            this.getCommodityList();
            this.title = "添加攀塔信息";
        },
        /** 修改按钮操作 */
        handleUpdate(row, type) {
            this.reset();
            this.editType = type;
            const id = row.id || this.ids;
            this.getCommodityList();
            getTowerManage(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = `${type ? '查看' : '修改'}修改攀塔信息`;
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id != null) {
                        updateTowerManage(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addTowerManage(this.form).then(response => {
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
                return delTowerManage(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('towerManage/towerManage/export', {
                ...this.queryParams
            }, `towerManage_${new Date().getTime()}.xlsx`)
        },

        /** 查询商品列表 */
        getCommodityList() {
            listCommodity({ type: '2' }).then(res => {
                this.goodsOptions = res.rows;
            });
        },
        /** 商品选择 */
        queryProducts(id, val) {
            let str = this.goodsOptions.find(item => item.id == id);
            return str ? str[val] : null;
        },
        /** 抽赏套商品信息添加按钮操作 */
        handleAddWxSuitCommodity() {
            this.getCommodityList();
            this.commodityReset();
            this.prTitle = "新增商品";
            this.editId = null;
            this.openGoods = true;
        },
        /** 抽赏套商品信息修改按钮操作 */
        commodityUpdate(row) {
            this.getCommodityList();
            this.commodityReset();
            this.prTitle = "修改商品";
            this.editId = row.commodityId;
            this.commodityForm = { ...row };
            this.openGoods = true;
        },
        commodityDelete(row) {
            // 本地删除
            this.$modal.confirm('是否确认删除？').then(() => {
                return this.form.wxTowerCommodityList.splice(this.form.wxTowerCommodityList.findIndex(item => item.commodityId === row.commodityId), 1);
            }).then(() => {
                this.$modal.msgSuccess("删除成功");
            });
        },
        /** 关闭商品弹框 */
        cancelGoods() {
            this.openGoods = false;
            this.commodityReset();
        },
        /** 商品表单重置 */
        commodityReset() {
            this.commodityForm = {
                commodityId: null,
                referencePrice: null,
                reference: null,
                remark: null,
                type: '4'
            };
            this.resetForm("commodityForm");
        },
        /** 提交数据 */
        submitGoodsForm() {
            this.$refs["commodityForm"].validate(valid => {
                if (valid) {
                    if (this.editId) {
                        // 修改提交
                        this.form.wxTowerCommodityList = this.form.wxTowerCommodityList.map(item => item.commodityId === this.editId ? { ...this.commodityForm } : item);
                        this.openGoods = false;
                    } else {
                        if (this.form.wxTowerCommodityList.find(item => item.commodityId === this.commodityForm.commodityId)) {
                            this.$message.error("商品已存在，请勿重复添加！");
                            return;
                        };
                        // 新增提交
                        this.form.wxTowerCommodityList.push({
                            ...this.commodityForm,
                            type: '4',
                        });
                        this.openGoods = false;
                    };
                }
            });
        },
        disabledChange(val) {
            return this.form.wxTowerCommodityList.find(item => item.type == val) ? true : false;
        }
    }
};
</script>
