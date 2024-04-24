<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="套名称" prop="suitName">
                <el-input v-model="queryParams.suitName" placeholder="请输入套名称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="套类型" prop="suitType">
                <el-select v-model="queryParams.suitType" placeholder="请选择套类型" clearable>
                    <el-option v-for="(dict, key, index) in suitTypeData" :key="index" :label="dict" :value="key" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['suitManage:suitManage:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['suitManage:suitManage:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="suitManageList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="套封面" align="center" prop="faceImg">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.faceImg" :width="50" :height="50" />
                </template>
            </el-table-column>
            <el-table-column label="套名称" align="center" prop="suitName" />
            <el-table-column label="套类型" align="center" prop="suitType">
                <template slot-scope="scope">{{ suitTypeData[scope.row.suitType] }}</template>
            </el-table-column>
            <el-table-column label="单抽价格" align="center" prop="price">
                <template slot-scope="scope">{{ scope.row.price ? scope.row.price + "元" : '/' }}</template>
            </el-table-column>
            <el-table-column label="单抽积分" align="center" prop="integral">
                <template slot-scope="scope">{{ scope.row.integral ? scope.row.integral + "积分" : '/' }}</template>
            </el-table-column>
            <el-table-column label="箱子数量" align="center" prop="boxNum" />
            <el-table-column label="箱子剩余数量" align="center" prop="surNum" />
            <el-table-column label="查看等级" align="center" prop="levelName" />
            <el-table-column label="上下架状态" align="center" prop="status">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" @change="switchChange($event, scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="上架时间" align="center" prop="upTime" width="150" />
            <el-table-column label="操作" align="center" width="180">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-view" @click="queryLook(scope.row)" v-hasPermi="['suitManage:suitManage:query']">查看</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['suitManage:suitManage:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['suitManage:suitManage:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改抽赏套管理对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="1600px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="套名称" prop="suitName">
                    <el-input v-model="form.suitName" placeholder="请输入套名称" />
                </el-form-item>
                <el-form-item label="套类型" prop="suitType">
                    <el-select v-model="form.suitType" placeholder="请选择套类型" clearable style="width: 100%;" @change="suitTypeChange">
                        <el-option v-for="(dict, key, index) in suitTypeData" :key="index" :label="dict" :value="key" />
                    </el-select>
                </el-form-item>
                <el-form-item label="单抽价格" prop="price" v-if="form.suitType != 3" :rules="[{ required: true, message: '请输入单抽价格', trigger: 'blur' }]">
                    <el-input v-model="form.price" type="number" placeholder="请输入单抽价格" />
                </el-form-item>
                <el-form-item label="单抽积分" prop="integral" v-else :rules="[{ required: true, message: '请输入单抽积分', trigger: 'blur' }]">
                    <el-input v-model="form.integral" type="number" placeholder="请输入单抽积分" />
                </el-form-item>
                <!-- 抽奖次数 -->
                <el-form-item label="抽奖次数" prop="lotteryNum">
                    <el-input v-model="form.lotteryNum" type="number" placeholder="请输入抽奖次数" />
                </el-form-item>
                <el-form-item label="箱子数量" prop="boxNum" v-if="form.suitType != 4" :rules="[{ required: true, message: '请输入箱子数量', trigger: 'blur' }]">
                    <el-input v-model="form.boxNum" type="number" placeholder="请输入盒子数量" />
                </el-form-item>
                <el-form-item label="查看等级" prop="levelId">
                    <el-select v-model="form.levelId" placeholder="请选择查看等级" style="width: 100%;">
                        <el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level" :value="item.id" />
                    </el-select>
                </el-form-item>
                <!-- 购买按钮设置 -->
                <el-form-item label="购买按钮" prop="drawNum" :rules="[{ required: true, type: 'array', message: '请添加购买按钮', trigger: 'change' }]">
                    <template v-if="form.drawNum">
                        <el-tag v-for="(tag, index) in form.drawNum" :key="index" closable @click="clickBtn(index)" @close="form.drawNum = form.drawNum.filter((item, i) => index != i)"
                            class="formEltag">
                            <el-input type="number" :ref="'elInput' + (index + 1)" v-if="active == index" :value="tag" size="mini" style="width: 100px;" @blur="active = null"
                                @input="(e) => form.drawNum = form.drawNum.map((item, i) => index == i ? e : item)" />
                            <span v-else>{{ tag }}</span>
                        </el-tag>
                    </template>
                    <el-button size="mini" type="primary" v-if="form.drawNum && form.drawNum.length < 4" @click="form.drawNum.push(0)">新增</el-button>
                </el-form-item>
                <el-form-item label="上/下架" prop="status">
                    <el-switch v-model="form.status" active-value="1" inactive-value="0" />
                </el-form-item>
                <el-form-item label="上架时间" prop="upTime">
                    <el-date-picker clearable style="width: 100%" v-model="form.upTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择上架时间" />
                </el-form-item>
                <el-form-item label="封面图片" prop="faceImg">
                    <ImageUpload v-model="form.faceImg" :limit="1" />
                </el-form-item>
                <el-divider content-position="center">抽赏套商品信息</el-divider>
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddWxSuitCommodity">添加</el-button>
                    </el-col>
                    <el-col :span="1.5" :offset="2" style="font-size: 18px;" v-if="form.price && form.wxSuitCommodityList.length != 0">期望值：{{ expectedValue.exVal.toFixed(2) }}元</el-col>
                    <el-col :span="1.5" :offset="1" style="font-size: 18px;" v-if="form.price && form.wxSuitCommodityList.length != 0">盈利/亏损：{{ expectedValue.profitAndLoss.toFixed(2) }}元</el-col>
                </el-row>
                <el-form-item prop="wxSuitCommodityList" label-width="10px">
                    <el-table :data="form.wxSuitCommodityList" ref="wxSuitCommodity">
                        <el-table-column label="序号" align="center" type="index" width="50" />
                        <el-table-column label="商品名称" prop="commodityName" align="center">
                            <template slot-scope="scope">{{ queryProducts(scope.row.commodityId, "commodityName") }}</template>
                        </el-table-column>
                        <el-table-column label="商品图片" prop="img" align="center">
                            <template slot-scope="scope">
                                <ImagePreview :src="queryProducts(scope.row.commodityId, 'faceImg')" width="100px" />
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
                        <el-table-column label="商品数量" prop="num" v-if="form.suitType != 4" align="center">
                            <template slot-scope="scope">{{ scope.row.num }}</template>
                        </el-table-column>
                        <template v-if="form.suitType == 4">
                            <el-table-column label="是否双倍赠送" align="center">
                                <template slot-scope="scope">
                                    <el-switch v-model="scope.row.isDouble" active-value="1" inactive-value="0" :disabled="scope.row.isSend == 1"
                                        @change="switchTypeChange($event, scope.row, 'isDouble')" />
                                </template>
                            </el-table-column>
                        </template>
                        <template v-if="form.suitType == 4">
                            <el-table-column label="赠送次数" align="center" width="160">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.sendNum" size="mini" type="number" placeholder="请输入赠送次数" />
                                    <!-- @blur="switchTypeChange($event, scope.row, 'sendNum')" -->
                                </template>
                            </el-table-column>
                        </template>
                        <el-table-column label="是否售卖" prop="isSale" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.isSale" active-value="1" inactive-value="0" :disabled="form.suitType == 3 || form.suitType == 4" @change="sellChange($event, scope.row)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="是否赠送" prop="isSend" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.isSend" active-value="1" inactive-value="0" :disabled="form.suitType == 3 || form.suitType == 4 || scope.row.isDouble == 1" @change="giftsChange($event, scope.row)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="备注" prop="remark" align="center" />
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <el-button size="mini" type="text" icon="el-icon-edit" @click="commodityUpdate(scope.row)">修改</el-button>
                                <el-button size="mini" type="text" icon="el-icon-delete" @click="commodityDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 添加商品 -->
        <el-dialog :title="prTitle" :visible.sync="openGoods" width="800px" append-to-body>
            <el-form ref="commodityForm" :model="commodityForm" :rules="commodityRules" label-width="100px">
                <el-form-item label="商品名称" prop="commodityId">
                    <el-select v-model="commodityForm.commodityId" filterable placeholder="请选择商品名称" style="width: 100%;">
                        <el-option v-for="dict in goodsOptions" :key="dict.id" :label="dict.commodityName" :value="dict.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品等级">
                    <el-input :value="queryProducts(commodityForm.commodityId, 'levelName')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品单价">
                    <el-input :value="queryProducts(commodityForm.commodityId, 'price')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品数量" prop="num" v-if="form.suitType != 4" :rules="[{ required: true, message: '请输入商品数量', trigger: 'blur' }]">
                    <el-input v-model="commodityForm.num" type="number" placeholder="请输入商品数量" />
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
        <!-- 查看详情 -->
        <el-dialog title="详情" :visible.sync="openInfo" width="800px" append-to-body class="suitManage">
            <h3>基本信息</h3>
            <div class="sm-info">
                <div>套名称：{{ lookInfo.suitName }}</div>
                <div>
                    套类型：{{ lookInfo.suitType == 1 ? "全局套" : lookInfo.suitType == 2 ? "打拳套" : lookInfo.suitType == 3 ? "积分池" : lookInfo.suitType == 3 ? "无限池" : "/" }}
                </div>
                <div v-if="lookInfo.suitType == 3">单抽积分：{{ lookInfo.integral }}积分</div>
                <div v-else>单抽价格：{{ lookInfo.price }}元</div>
                <div>查看等级：{{ lookInfo.levelName }}</div>
                <div>上下架：{{ lookInfo.status == 1 ? "上架" : "下架" }}</div>
            </div>
            <h3 style="margin-top: 35px">箱子列表（{{ lookInfo.boxNum }}个）</h3>
            <div class="sm-list">
                <div class="sm-list-item" v-for="(item, index) in lookInfo.mapList" :key="index" @click="boxInfo = item; boxType = true">
                    <ImagePreview :src="lookInfo.faceImg" :view="false" width="100px" height="100px" />
                    <div style="margin: 5px 0">箱子&nbsp;-&nbsp;{{ index + 1 }}</div>
                </div>
            </div>
        </el-dialog>
        <!-- 箱子详情 -->
        <el-dialog title="箱子详情" :visible.sync="boxType" width="800px" append-to-body class="suitManage">
            <h3>商品</h3>
            <div class="sm-list" style="grid-template-columns: repeat(4, 1fr); gap: 20px 48px;">
                <div class="sm-list-item" v-for="(item, index) in boxInfo.commodityList" :key="index" style="border-radius: 10px;text-align: left;">
                    <ImagePreview :src="item.faceImg" width="150px" height="200px" />
                    <div style="padding-left: 5px; margin-top: 5px">{{ item.commodityName }}</div>
                    <div style="display: flex;justify-content: space-between; font-size: 12px; padding: 5px 5px 10px">
                        <div>参考价:{{ item.referencePrice }}元</div>
                        <div>概率:{{ item.reference ? item.reference + "%" : "" }}</div>
                    </div>
                    <!-- <div style="font-size: 12px">{{ item.remark }}</div> -->
                    <div class="sm-list-item-type">{{ item.typeName }}&nbsp;&nbsp;{{ item.num }}&nbsp;/&nbsp;{{item.totalNum }}</div>
                    <div class="sm-list-item-tips" v-if="item.num == 0">已售完</div>
                </div>
            </div>
            <h3 style="margin-top: 35px">中赏排行</h3>
            <el-table :data="boxInfo.rankList">
                <el-table-column label="排名" align="center" prop="rank" />
                <el-table-column label="头像" align="center" prop="wxAvatar">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.wxAvatar" width="50px" height="50px" />
                    </template>
                </el-table-column>
                <el-table-column label="昵称" align="center" prop="nickName" />
                <el-table-column label="商品名称" align="center" prop="commodityName" />
                <el-table-column label="商品等级" align="center" prop="level" />
                <el-table-column label="中赏次数" align="center" prop="num" />
            </el-table>
            <h3 style="margin-top: 35px">中赏记录</h3>
            <el-table :data="boxInfo.recordList">
                <el-table-column label="序号" type="index" align="center" />
                <el-table-column label="头像" align="center" prop="wxAvatar">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.wxAvatar" width="50px" height="50px" />
                    </template>
                </el-table-column>
                <el-table-column label="昵称" align="center" prop="nickName" />
                <el-table-column label="商品名称" align="center" prop="commodityName" />
                <el-table-column label="商品等级" align="center" prop="level" />
                <el-table-column label="中赏时间" align="center" prop="createTime" />
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
import { listLevelSet } from "@/api/levelSet/levelSet";
import { listCommodity } from "@/api/commodity/commodity";
import { listSuitManage, getSuitManage, delSuitManage, addSuitManage, updateSuitManage, getDetail } from "@/api/suitManage/suitManage";

export default {
    name: "SuitManage",
    data() {
        return {
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 子表选中数据
            checkedWxSuitCommodity: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 抽赏套管理表格数据
            suitManageList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                suitName: null,
                suitType: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                suitName: [{ required: true, message: "请输入套名称", trigger: "blur" }],
                suitType: [{ required: true, message: "请选择套类型", trigger: "change" }],
                levelId: [{ required: true, message: "请输入查看等级", trigger: "blur" }],
                lotteryNum: [{ required: true, message: "请输入抽奖次数", trigger: "blur" }],
                status: [{ required: true, message: "请选择上/下架", trigger: "change" }],
                faceImg: [{ required: true, message: "请上传封面图片", trigger: "change" }],
                wxSuitCommodityList: [{ required: true, type: "array", message: "请添加商品", trigger: "change" }],
            },
            suitTypeData: {
                1: "全局套",
                2: "打拳套",
                3: "积分池",
                4: "无限池",
            },
            prTitle: "",
            openGoods: false,
            commodityForm: {},
            commodityRules: {
                commodityId: [{ required: true, message: "请选择商品", trigger: "change" }],
                referencePrice: [{ required: true, message: "请输入参考价", trigger: "blur" }],
                reference: [{ required: true, message: "请输入抽中概率", trigger: "blur" }],
            },
            goodsOptions: [],
            editId: null,
            suitTypeStutus: false,
            levelOptions: [],
            openInfo: false,
            lookInfo: {},
            boxType: false,
            boxInfo: {},
            active: null,
        };
    },
    created() {
        this.getList();
    },
    watch: {
        'form.suitType'(newVal, oldVal) {
            oldVal == 4 && (this.suitTypeStutus = true);
        }
    },
    computed: {
        expectedValue() {
            let obj = {
                exVal: 0,
                profitAndLoss: 0
            };
            if (this.form.price && this.form.wxSuitCommodityList.length != 0) {
                this.form.wxSuitCommodityList.forEach(item => {
                    let num = this.queryProducts(item.commodityId, "price");
                    let price = num ? Number(Number(num).toFixed(2)) : 0;
                    let reference = item.reference ? Number(this.getPercent(Number(Number(item.reference).toFixed(2))).toFixed(2)) : 0;
                    obj.exVal += Number(Number(price * reference).toFixed(2));
                });
                obj.profitAndLoss = Number(this.form.price) - obj.exVal;
            }
            return obj;
        },
    },
    methods: {
        /** 计算百分值 */
        getPercent(val) {
            return val / 100;
        },
        /** 查询抽赏套管理列表 */
        getList() {
            this.loading = true;
            listSuitManage(this.queryParams).then(response => {
                this.suitManageList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
            listLevelSet().then(res => {
                this.levelOptions = res.rows;
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
                suitName: null,
                suitType: null,
                price: null,
                integral: null,
                boxNum: null,
                levelId: null,
                status: "0",
                upTime: null,
                faceImg: null,
                lotteryNum: 0,
                drawNum: [],
                wxSuitCommodityList: [],
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
        /** 上下架 */
        switchChange(e, row) {
            let obj = {
                status: e,
                id: row.id
            };
            e == "1" ? obj.upTime = this.parseTime(new Date()) : "";
            updateSuitManage(obj).then(response => {
                this.$modal.msgSuccess(e == "1" ? "上架" : "下架");
                this.getList();
            }).catch(() => this.getList());
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.getCommodityList();
            this.title = "添加抽赏套管理";
        },
        /** 查看详情 */
        queryLook(row) {
            const id = row.id || this.ids;
            this.getCommodityList();
            getDetail(id).then(res => {
                this.lookInfo = res.data;
                this.openInfo = true;
            });
        },
        /** 修改按钮操作 */
        async handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            this.getCommodityList();
            await getSuitManage(id).then(response => {
                for (let key in this.form) {
                    this.form[key] = response.data[key];
                };
                this.form.drawNum = response.data.drawNum ? response.data.drawNum.split(',') : [];
                this.open = true;
                this.title = "修改抽赏套管理";
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    let obj = { ...this.form };
                    obj.wxSuitCommodityList.map(item => {
                        obj.suitType == 4 && delete item.num;
                        obj.suitType == 4 && item.sendNum == null && delete item.sendNum;
                        obj.suitType != 4 && delete item.isDouble;
                        return item;
                    });
                    obj.status == 1 && !obj.upTime ? obj.upTime = this.parseTime(new Date()) : '';
                    obj.drawNum = this.form.drawNum.length == 0 ? '' : this.form.drawNum.join(',');
                    const submitType = () => {
                        if (obj.id != null) {
                            updateSuitManage(obj).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addSuitManage(obj).then(response => {
                                this.$modal.msgSuccess("新增成功");
                                this.open = false;
                                this.getList();
                            });
                        }
                    };
                    if (this.queryParams.suitType == 4) {
                        if (this.expectedValue.profitAndLoss < 0) this.$modal.confirm(`对比期望值当前亏损'：${Math.abs(this.expectedValue.profitAndLoss)}元，是否继续提交?`).then(() => submitType());
                        else submitType();
                    } else submitType();
                }
            });
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$modal.confirm('是否确认删除？').then(function () {
                return delSuitManage(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 抽赏套商品信息序号 */
        rowWxSuitCommodityIndex({ row, rowIndex }) {
            row.index = rowIndex + 1;
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
                num: null,
            };
            this.resetForm("commodityForm");
        },
        /** 查询商品列表 */
        getCommodityList() {
            listCommodity({ type: '2' }).then(res => {
                this.goodsOptions = res.rows;
            });
        },
        /** 抽赏套商品信息添加按钮操作 */
        handleAddWxSuitCommodity() {
            this.getCommodityList();
            this.commodityReset();
            this.prTitle = "新增商品";
            this.editId = null;
            this.openGoods = true;
        },
        // 是否售卖
        sellChange(e, row) {
            this.form.wxSuitCommodityList.map(item => {
                if (row.commodityId == item.commodityId) {
                    e == 1 ? item.isSend = '0' : item.isSend = '1';
                };
                return item;
            });
        },
        // 是否赠送
        giftsChange(e, row) {
            this.form.wxSuitCommodityList.map(item => {
                if (row.commodityId == item.commodityId) {
                    e == 1 ? item.isSale = '0' : item.isSale = '1';
                };
                return item;
            });
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
        /** 提交数据 */
        submitGoodsForm() {
            this.$refs["commodityForm"].validate(valid => {
                if (valid) {
                    // if (this.form.wxSuitCommodityList.find(item => item.commodityId === this.commodityForm.commodityId)) {
                    //     this.$message.error('商品已存在,请勿重复添加');
                    //     return;
                    // };
                    if (this.editId) {
                        // 修改提交
                        this.form.wxSuitCommodityList =
                            this.form.wxSuitCommodityList.map(item => item.commodityId === this.editId ? { ...this.commodityForm } : item);
                        this.openGoods = false;
                    } else {
                        if (this.form.wxSuitCommodityList.find(item => item.commodityId === this.commodityForm.commodityId)) {
                            this.$message.error("商品已存在，请勿重复添加！");
                            return;
                        };
                        // 新增提交
                        let obj = {
                            ...this.commodityForm,
                            isSend: "0",
                            isSale: "0",
                            isDouble: "0",
                        };
                        if(this.form.suitType == 1 || this.form.suitType == 2) {
                            obj.isSale = "1";
                        }
                        this.form.suitType == 3 ? obj.isSale = '1' : "";
                        this.form.suitType == 4 ? obj.sendNum = 0 : "";
                        this.form.wxSuitCommodityList.push(obj);
                        this.openGoods = false;
                    };
                }
            });
        },
        commodityDelete(row) {
            // 本地删除
            this.$modal.confirm('是否确认删除？').then(() => {
                return this.form.wxSuitCommodityList.splice(this.form.wxSuitCommodityList.findIndex(item => item.commodityId === row.commodityId), 1);
            }).then(() => {
                this.$modal.msgSuccess("删除成功");
            });
        },
        /** 类型选择限制 */
        suitTypeChange() {
            this.$nextTick(() => {
                if(this.form.suitType == 1 || this.form.suitType == 2) {
                    this.form.wxSuitCommodityList = this.form.wxSuitCommodityList.map(item => {
                        if(item.isSale == 1) item.isSend = "0";
                        else if(item.isSale == 0) item.isSend = "1";
                        item.isDouble = "0";
                        return item;
                    });
                } else if (this.form.suitType == 3 || this.form.suitType == 4) {
                    this.form.wxSuitCommodityList = this.form.wxSuitCommodityList.map(item => {
                        item.isSale = "1";
                        item.isSend = "0";
                        item.isDouble = "0";
                        item.num = 1;
                        return item;
                    });
                } else {
                    this.form.wxSuitCommodityList = this.form.wxSuitCommodityList.map(item => {
                        this.suitTypeStutus && (item.isSale = "0") && (item.num = 1);
                        item.isSend = "0";
                        item.isDouble = "0";
                        return item;
                    });
                };
                this.suitTypeStutus = false;
            });
        },
        clickBtn(index) {
            this.active = index;
            this.$nextTick(() => {
                this.$refs['elInput' + (index + 1)][0].focus();
            });
            // this.$refs.elInput.focus();
        },
        /** 商品选择 */
        queryProducts(id, val) {
            let str = this.goodsOptions.find(item => item.id == id);
            return str ? str[val] : null;
        },
        /** 是否双倍赠送 */
        switchTypeChange(e, row, val) {
            this.form.wxSuitCommodityList.map((item) => {
                if (e == '1') {
                    if (row.commodityId == item.commodityId) item[val] = '1';
                    else item[val] = "0";
                } else item[val] = '0';
                return item;
            });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('suitManage/suitManage/export', {
                ...this.queryParams
            }, `suitManage_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>


<style lang="scss">
.suitManage {
    .el-dialog__body {
        padding: 10px 20px !important;

        .sm-info {
            display: grid;
            gap: 10px 20px;
            padding: 0 20px;
            box-sizing: border-box;
            grid-template-columns: repeat(3, 1fr);
        }

        .sm-list {
            width: 100%;
            display: grid;
            gap: 20px 40px;
            padding: 0 8px;
            padding-bottom: 50px;
            box-sizing: border-box;
            grid-template-columns: repeat(6, 1fr);

            .sm-list-item {
                text-align: center;
                position: relative;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

                .sm-list-item-type {
                    right: 0;
                    top: 173px;
                    padding: 5px;
                    font-size: 12px;
                    color: #FFFFFF;
                    position: absolute;
                    background: #c942ffad;
                    border-top-left-radius: 10px;
                }

                .sm-list-item-tips {
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    color: #FFFFFF;
                    position: absolute;
                    align-items: center;
                    border-radius: 10px;
                    background: #00000086;
                    justify-content: center;
                }
            }
        }
    }
}

.el-form-item__content {
    display: flex;
    align-items: center;
}

.formEltag {
    width: 135px;
    height: 30px;
    display: flex;
    margin-right: 20px;
    align-items: center;
    box-sizing: border-box;
    justify-content: space-between;
}
</style>