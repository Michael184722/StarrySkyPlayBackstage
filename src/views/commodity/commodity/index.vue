<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
            label-width="68px">
            <el-form-item label="商品名称" prop="commodityName">
                <el-input v-model="queryParams.commodityName" placeholder="请输入商品名称" clearable
                    @keyup.enter.native="handleQuery" />
            </el-form-item>
            <!-- 筛选预售和现货 -->
            <el-form-item label="商品类型" prop="cmType">
                <el-select v-model="queryParams.cmType" placeholder="请选择商品类型" clearable>
                    <el-option label="预售" value="1" />
                    <el-option label="现货" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="是否是隐藏无限套" prop="isHidden" label-width="140px">
                <el-select v-model="isHidden" placeholder="请选择" clearable>
                    <el-option label="是" value="1" />
                    <el-option label="否" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="更新时间">
                <el-date-picker v-model="dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['commodity:commodity:add']">新增</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="commodityList" border size="mini">
            <el-table-column label="序号" align="center" type="index" width="55" />
            <el-table-column label="商品名称" align="center" prop="commodityName" />
            <el-table-column label="封面图片" align="center" prop="faceImg">
                <template slot-scope="scope">
                    <imagePreview :src="scope.row.faceImg" :width="35" :height="35" />
                </template>
            </el-table-column>
            <el-table-column label="商品图片" align="center" prop="img">
                <template slot-scope="scope">
                    <imagePreview :src="scope.row.img" :width="35" :height="35" />
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
            <el-table-column label="限购数量" align="center" prop="quota" />
            <el-table-column label="商品数量" align="center" prop="num" />
            <el-table-column label="查看等级" align="center" prop="levelDownName">
                <template slot-scope="scope">{{ scope.row.levelDownName }}~{{ scope.row.levelUpName }}</template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" />
            <el-table-column label="更新时间" align="center" prop="updateTime" />
            <!-- 上下架 -->
            <el-table-column label="上下架" align="center" prop="status">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.status" active-value="1" inactive-value="0"
                        @change="handleStatusChange(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['commodity:commodity:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['commodity:commodity:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改商城商品管理对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
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
                        <el-option v-for="(item, index) in [{ label: '预售', value: '1' }, { label: '现货', value: '2' }]"
                            :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="查看等级上限" prop="levelUpId">
                    <el-select v-model="form.levelUpId" placeholder="请选择查看等级" style="width: 100%;">
                        <el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="查看等级下限" prop="levelId">
                    <el-select v-model="form.levelId" placeholder="请选择查看等级" style="width: 100%;">
                        <el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="抽奖套" prop="suitId">
                    <el-select v-model="form.suitId" placeholder="请选择商品等级" clearable style="width: 100%;">
                        <el-option v-for="dict in suitManageList" :key="dict.id" :label="dict.suitName"
                            :value="dict.id">
                            <div style="display: flex; align-items: center;">
                                <ImagePreview :src="dict.faceImg" width="30px" height="30px" />
                                <div style="margin-left: 20px;">{{ dict.suitName }}</div>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="支付方式" prop="remark">
                    <el-checkbox-group v-model="form.remark">
                        <el-checkbox label="微信支付"></el-checkbox>
                        <el-checkbox label="星币支付"></el-checkbox>
                        <el-checkbox label="辰币支付"></el-checkbox>
                        <el-checkbox label="积分支付"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="星币" v-if="form.remark.includes('星币支付')" prop="sog"
                    :rules="[{ required: true, message: '请输入星币', trigger: 'blur' }]">
                    <el-input v-model="form.sog" type="number" placeholder="请输入星币" />
                </el-form-item>
                <el-form-item label="辰币" v-if="form.remark.includes('辰币支付')" prop="coin"
                    :rules="[{ required: true, message: '请输入辰币', trigger: 'blur' }]">
                    <el-input v-model="form.coin" type="number" placeholder="请输入辰币" />
                </el-form-item>
                <el-form-item label="积分" v-if="form.remark.includes('积分支付')" prop="points"
                    :rules="[{ required: true, message: '请输入积分', trigger: 'blur' }]">
                    <el-input v-model="form.points" type="number" placeholder="请输入积分" />
                </el-form-item>
                <!-- integralPercent -->
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
import { listSuitManage } from "@/api/suitManage/suitManage";
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
                cmType: null,
                type: '1',
                params: {
                    isHidden: null,
                }
            },
            dateRange: [],
            // 表单参数
            form: {
                remark: [],
                sog: 0,
                coin: "",
                points: "",
            },
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
                levelUpId: [
                    { required: true, message: "请选择查看等级上限", trigger: "change" }
                ],
                levelId: [
                    { required: true, message: "请选择查看等级下限", trigger: "change" }
                ],
                remark: [
                    { required: true, message: "请选择支付方式", trigger: "change" }
                ],
                faceImg: [
                    { required: true, message: "请上传商品封面图片", trigger: "change" }
                ],
                img: [
                    { required: true, message: "请上传商品图", trigger: "change" }
                ],
            },
            levelOptions: [],
            isHidden: null,
            suitManageList: [],
        };
    },
    created() {
        this.getList();
        listLevelSet().then(res => {
            this.levelOptions = res.rows;
        });
        listSuitManage({ suitType: 5 }).then(response => {
            this.suitManageList = response.rows;
        });
    },
    methods: {
        /** 查询商城商品管理列表 */
        getList() {
            this.loading = true;
            if (this.isHidden) {
                this.queryParams.params.isHidden = this.isHidden;
            } else {
                this.queryParams.params.isHidden && (this.queryParams.params.isHidden = null);
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
                price: null,
                quota: null,
                num: null,
                levelUpId: null,
                levelId: null,
                suitId: null,
                remark: [],
                sog: 0,
                coin: "",
                points: "",
                integralPercent: null,
                faceImg: null,
                img: null,
                content: null,
                type: '1',
                cmType: '2'
            };
            this.resetForm("formRef");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.getList();
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.dateRange = [];
            this.isHidden = null;
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
            // this.resetForm("formRef");
            const id = row.id || this.ids
            getCommodity(id).then(response => {
                for(let key in response.data) this.form[key] = response.data[key];
                if(this.form.integralPercent) {
                    this.form.integralPercent.split(',').map(item => {
                        if(item.includes('1-')) this.form.sog = item.split("-")[1];
                        if(item.includes('2-')) this.form.coin = item.split("-")[1];
                        if(item.includes('3-')) this.form.points = item.split("-")[1];
                        // if(item.includes('1-')) this.$set(this.form, 'sog', Number(item.split('-')[1]));
                        // if(item.includes('2-')) this.$set(this.form, 'coin', Number(item.split('-')[1]));
                        // if(item.includes('3-')) this.$set(this.form, 'points', Number(item.split('-')[1]));
                    });
                };
                if (response.data.content && response.data.content.includes('<img src="')) {
                    this.form.content = response.data.content.replace('<img src="', '<img src="' + process.env.VUE_APP_BASE_API);
                };
                this.form.remark = this.form.remark.split(',');
                this.open = true;
                this.title = "修改商城商品管理";
            });
        },
        handleStatusChange(row) {
            let text = row.status === "1" ? "上架" : "下架";
            updateCommodity({ id: row.id, status: row.status }).then(() => {
                this.$modal.msgSuccess(text + "成功");
                this.getList();
            }).catch(function () {
                this.getList();
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["formRef"].validate(valid => {
                if (valid) {
                    let arr = [];
                    let obj = { ...this.form };
                    delete obj.sog;
                    delete obj.coin;
                    delete obj.points;
                    obj.remark.map(item => {
                        if(item == "星币支付") arr.push(this.form.sog);
                        if(item == "辰币支付") arr.push(this.form.coin);
                        if(item == "积分支付") arr.push(this.form.points);
                    });
                    let a = this.form.sog && obj.remark.includes("星币支付") ? "1-" + this.form.sog : "";
                    let b = this.form.coin && obj.remark.includes("辰币支付") ?  ",2-" + this.form.coin : "";
                    let c = this.form.points && obj.remark.includes("积分支付") ? ",3-" + this.form.points : "";
                    obj.integralPercent = a + b + c;
                    obj.remark = obj.remark.length ? obj.remark.join(',') : '';
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
