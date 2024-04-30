<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="ID" prop="userId">
                <el-input v-model="queryParams.userId" placeholder="请输入ID" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="流水排序" prop="water">
                <el-select v-model="water" placeholder="请选择流水排序">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="余额排序" prop="balance">
                <el-select v-model="balance" placeholder="请选择余额排序">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="创建日期" prop="daterange">
                <el-date-picker clearable v-model="daterange" value-format="yyyy-MM-dd" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <!-- <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['wxUser:wxUser:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['wxUser:wxUser:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['wxUser:wxUser:remove']">删除</el-button>
            </el-col> -->
            <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['wxUser:wxUser:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="wxUserList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="ID" align="center" prop="userId" width="150" />
            <el-table-column label="头像" align="center" prop="wxAvatar">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.wxAvatar" :width="50" :height="50" />
                </template>
            </el-table-column>
            <el-table-column label="昵称" align="center" prop="nickName" width="150" />
            <el-table-column label="性别" align="center" prop="sex" width="80">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.sex === 1">男</el-tag>
                    <el-tag v-else-if="scope.row.sex === 2">女</el-tag>
                    <div v-else>/</div>
                </template>
            </el-table-column>
            <el-table-column label="手机号" align="center" prop="phone" width="110" />
            <el-table-column label="姓名" align="center" prop="name" width="110" />

            <el-table-column label="身份证号" align="center" prop="idNo" width="170" />

            <el-table-column label="出生年月" align="center" prop="birth" />
            <el-table-column label="余额" align="center" prop="balance" width="100" />
            <el-table-column label="流水金额" align="center" prop="water" width="150" />
            <el-table-column label="积分余额" align="center" prop="integral" width="150" />
            <el-table-column label="等级" align="center" prop="levelName" width="100" />
            <el-table-column label="双倍次数" align="center" prop="doubleNum" />
            <el-table-column label="攀塔层数" align="center" prop="towerLayer" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
            <el-table-column label="是否参与流水排行" align="center" prop="isWarter" width="130">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.isWarter" active-value="1" inactive-value="0" @change="switchChange($event, scope.row, 'isWarter')" />
                </template>
            </el-table-column>
            <el-table-column label="封号" align="center" prop="delFlag">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.delFlag" active-value="2" inactive-value="0" @change="switchChange($event, scope.row, 'delFlag')" />
                </template>
            </el-table-column>
            <el-table-column label="回收账号" align="center" prop="delFlag">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.isInner" active-value="1" inactive-value="0" @change="switchChange($event, scope.row, 'isInner')" />
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="260">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-view" @click="lookUseInfo(scope.row)" v-hasPermi="['wxUser:wxUser:query']">查看</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['wxUser:wxUser:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleGift(scope.row)" v-hasPermi="['wxUser:wxUser:edit']">赠送</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="clearCase(scope.row)" v-hasPermi="['wxUser:wxUser:edit']">清空箱子</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改小程序用户信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="130px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入姓名" disabled />
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-select v-model="form.sex" placeholder="请选择性别" disabled style="width: 100%">
                        <el-option label="男" value="1" />
                        <el-option label="女" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号" disabled />
                </el-form-item>
                <el-form-item label="出生年月" prop="birth">
                    <el-input v-model="form.birth" placeholder="请输入出生年月" disabled />
                </el-form-item>
                <el-form-item label="身份证号" prop="idNo">
                    <el-input v-model="form.idNo" placeholder="请输入身份证号" disabled />
                </el-form-item>
                <el-form-item label="昵称" prop="nickName">
                    <el-input v-model="form.nickName" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="余额" prop="balance">
                    <el-input v-model="form.balance" placeholder="请输入余额" />
                </el-form-item>
                <el-form-item label="总金额" prop="totalMoney">
                    <el-input v-model="form.totalMoney" placeholder="请输入总金额">
                        <template slot="append">
                            <el-tooltip class="item" effect="dark" content="修改总金额等级会跟着发生变化" placement="top">
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="积分余额" prop="integral">
                    <el-input v-model="form.integral" placeholder="请输入现有积分" />
                </el-form-item>
                <el-form-item label="流水金额" prop="water">
                    <el-input v-model="form.water" placeholder="请输入流水金额" />
                </el-form-item>
                <el-form-item label="是否参与流水排行" prop="isWarter">
                    <el-switch v-model="form.isWarter" active-value="1" inactive-value="0" />
                </el-form-item>
                <el-form-item label="头像" prop="wxAvatar">
                    <ImageUpload v-model="form.wxAvatar" :limit="1" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 用户详情 -->
        <el-dialog title="基本信息" :visible.sync="openUseInfo" v-if="openUseInfo" width="1500px" append-to-body>
            <div class="form-box">
                <ImagePreview :src="info.wxAvatar" :width="150" :height="150" />
                <div class="form-box-con">
                    <div class="form-box-con-item">ID：{{ info.userId }}</div>
                    <div class="form-box-con-item">昵称：{{ info.nickName }}</div>
                    <div class="form-box-con-item">姓名：{{ info.name }}</div>
                    <div class="form-box-con-item">手机号：{{ info.phone }}</div>
                    <div class="form-box-con-item">性别：{{ info.sex == 1 ? '男' : '女' }}</div>
                    <div class="form-box-con-item">出生年月：{{ info.birth }}</div>
                    <div class="form-box-con-item">身份证号：{{ info.idNo }}</div>
                    <div class="form-box-con-item">等级：{{ info.levelName }}</div>
                    <div class="form-box-con-item">余额：{{ info.balance }}</div>
                    <div class="form-box-con-item">总金额：{{ info.totalMoney }}</div>
                    <div class="form-box-con-item">积分余额：{{ info.integral }}</div>
                    <div class="form-box-con-item">流水金额：{{ info.water }}</div>
                    <div class="form-box-con-item">是否参与流水排行：{{ info.isWarter == 1 ? '是' : '否' }}</div>
                    <div class="form-box-con-item">创建时间：{{ info.createTime }}</div>
                </div>
            </div>
            <div class="form-title">
                <el-row>
                    <el-col :span="1.5">存储余额</el-col>
                    <el-col :span="1.5" :offset="1">
                        <el-date-picker v-model="baRange" size="mini" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-col>
                    <el-col :span="1.5" :offset="1">
                        <el-button type="primary" size="mini" @click="kookBalance">查询</el-button>
                    </el-col>
                </el-row>
            </div>
            <el-table :data="baList">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 日期 -->
                <el-table-column label="日期" prop="recordDate" align="center" />
                <!-- 背包余额 -->
                <el-table-column label="背包余额" prop="totalPrice" align="center" />
                <!-- 当天余额 -->
                <el-table-column label="当天余额" prop="balance" align="center" />
                <!-- 当天积分 -->
                <el-table-column label="当天积分" prop="integral" align="center" />
                <!-- 总余额 -->
                <el-table-column label="总余额(不含积分)" align="center">
                    <template slot-scope="scope">
                        {{ Number((Number(scope.row.totalPrice) + Number(scope.row.balance)).toFixed(2)) }}
                    </template>
                </el-table-column>
            </el-table>
            <pagination v-show="baTotal > 0" :total="baTotal" :page.sync="balanceQuery.pageNum" :limit.sync="balanceQuery.pageSize" @pagination="kookBalance" />


            <div class="form-title">赠送商品</div>
            <el-table :data="info.userSendCommodities" max-height="500">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 商品名称 -->
                <el-table-column label="商品名称" prop="commodityName" align="center" />
                <!-- 商品图片 -->
                <el-table-column label="商品图片" prop="commodityImg" align="center">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.faceImg" :width="50" :height="50" />
                    </template>
                </el-table-column>
                <!-- 商品价格 -->
                <el-table-column label="商品价格" prop="price" align="center" />
                <!-- 赠送时间 -->
                <el-table-column label="赠送时间" prop="createTime" align="center" />
            </el-table>

            <div class="form-title">收货地址</div>
            <el-table :data="info.wxUserAddresses" max-height="500">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 姓名 -->
                <el-table-column label="姓名" align="center" prop="name" />
                <!-- 手机号 -->
                <el-table-column label="手机号" align="center" prop="phone" />
                <!-- 地区 -->
                <el-table-column label="地区" align="center" prop="region" />
                <!-- 详细地址 -->
                <el-table-column label="详细地址" align="center" prop="address" />
            </el-table>
            <div class="form-title">充值记录</div>
            <el-table :data="info.wxUserRecharges" max-height="500">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 充值金额 -->
                <el-table-column label="充值金额" align="center" prop="money" />
                <!-- 充值时间 -->
                <el-table-column label="充值时间" align="center" prop="createTime" />
                <!-- 充值方式 -->
                <el-table-column label="充值方式" align="center" prop="rechargeType">
                    <template>微信</template>
                </el-table-column>
            </el-table>
            <div class="form-title">交易记录</div>
            <el-table :data="info.wxTradeRecords" max-height="500">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 交易场所 -->
                <el-table-column label="交易场所" align="center" prop="floor">
                    <template slot-scope="scope">
                        <!-- 1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区 -->
                        <el-tag v-if="scope.row.floor == 1">商城</el-tag>
                        <el-tag v-if="scope.row.floor == 2">全局套</el-tag>
                        <el-tag v-if="scope.row.floor == 3">打拳套</el-tag>
                        <el-tag v-if="scope.row.floor == 4">无限池</el-tag>
                        <el-tag v-if="scope.row.floor == 5">攀塔</el-tag>
                        <el-tag v-if="scope.row.floor == 9">交易区</el-tag>
                    </template>
                </el-table-column>
                <!-- 交易方式 -->
                <el-table-column label="交易方式" align="center" prop="tradeType">
                    <template slot-scope="scope">
                        {{ scope.row.type == 1 ? "微信支付" : scope.row.type == 2 ? "余额支付" : "" }}
                    </template>
                </el-table-column>
                <!-- 交易金额 -->
                <el-table-column label="交易金额" align="center" prop="money" />
                <!-- 支出/收入 -->
                <el-table-column label="支出/收入" align="center" prop="payType">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.payType == 1">支出</el-tag>
                        <el-tag v-if="scope.row.payType == 2">收入</el-tag>
                    </template>
                </el-table-column>
                <!-- 交易商品名称 -->
                <el-table-column label="交易商品名称" align="center" prop="commodityName" />
                <!-- 交易人昵称/被交易人 -->
                <el-table-column label="交易人昵称/被交易人" align="center" prop="nickName">
                    <template slot-scope="scope">
                        {{ scope.row.nickName ? scope.row.nickName : "平台" }}
                    </template>
                </el-table-column>
                <!-- 头像 -->
                <el-table-column label="头像" align="center" prop="wxAvatar">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.wxAvatar" :width="50" :height="50" />
                    </template>
                </el-table-column>
                <!-- 交易时间 -->
                <el-table-column label="交易时间" align="center" prop="createTime" />
            </el-table>
            <div class="form-title">积分记录</div>
            <el-table :data="info.wxIntegralRecords" max-height="500">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 交易场所 -->
                <el-table-column label="交易场所" align="center" prop="floor">
                    <template slot-scope="scope">
                        <!-- 1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-积分池 -->
                        <el-tag v-if="scope.row.floor == 1">商城</el-tag>
                        <el-tag v-if="scope.row.floor == 2">全局套</el-tag>
                        <el-tag v-if="scope.row.floor == 3">打拳套</el-tag>
                        <el-tag v-if="scope.row.floor == 4">无限池</el-tag>
                        <el-tag v-if="scope.row.floor == 5">攀塔</el-tag>
                        <el-tag v-if="scope.row.floor == 9">积分池</el-tag>
                    </template>
                </el-table-column>
                <!-- 交易金额 -->
                <el-table-column label="交易金额" align="center" prop="money" />
                <!-- 交易积分 -->
                <el-table-column label="交易积分" align="center" prop="integral" />
                <!-- 交易商品名称 -->
                <el-table-column label="交易商品名称" align="center" prop="commodityName" />
                <!-- 交易商品图片 -->
                <el-table-column label="交易商品图片" align="center" prop="img">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.img" :width="50" :height="50" />
                    </template>
                </el-table-column>
                <!-- 交易时间 -->
                <el-table-column label="交易时间" align="center" prop="createTime" />
            </el-table>
            <div class="form-title">发货记录</div>
            <el-table :data="info.wxUserLogistics" max-height="500">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="商品名称" align="center" prop="commodityName" />
                <el-table-column label="商品数量" align="center" prop="num" />
                <el-table-column label="商品总价" align="center" prop="totalMoney" />
                <el-table-column label="物流单号" align="center" prop="logisticsNo" />
                <el-table-column label="物流公司" align="center" prop="logisticsCompany" />
                <el-table-column label="收货人姓名" align="center" prop="name" />
                <el-table-column label="收获人手机号" align="center" prop="phone" />
                <el-table-column label="收货人地区" align="center" prop="region" />
                <el-table-column label="收货人地址" align="center" prop="address" />
                <el-table-column label="发货时间" align="center" prop="updateTime">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" align="center" prop="status">
                    <template slot-scope="scope">
                        <template v-for="(item, index) in [{ value: 0, label: '待审核' }, { value: 1, label: '审核通过' }, { value: 2, label: '审核不通过' }]">
                            <el-tag v-if="item.value == scope.row.status" :key="index" :type="item.value === 2 ? 'danger' : item.value === 1 ? 'success' : ''">{{ item.label }}</el-tag>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <el-dialog title="赠送商品" :visible.sync="giveType" v-if="giveType" width="400px" append-to-body>
            <el-form ref="give" :model="give" :rules="giveRules" label-width="80px">
                <el-form-item label="赠送商品" prop="commodityId">
                    <el-select v-model="give.commodityId" filterable placeholder="请选择赠送商品" style="width: 100%">
                        <el-option v-for="(item, index) in commodityList" :key="index" :label="item.commodityName" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitGive">确 定</el-button>
                <el-button @click="cancelGive">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { listCommodity } from "@/api/commodity/commodity";
import { listWxUser, getWxUser, delWxUser, addWxUser, updateWxUser, giveGoods, getBalance, delCase } from "@/api/wxUser/wxUser";

export default {
    name: "WxUser",
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
            // 小程序用户信息表格数据
            wxUserList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                nickName: null,
                wxAvatar: null,
                name: null,
                phone: null,
                sex: null,
                birth: null,
                idNo: null,
                balance: null,
                integral: null,
                historyIntegral: null,
                water: null,
                isWarter: null,
                userId: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
            },
            water: null,
            balance: null,
            daterange: [],
            openUseInfo: false,
            info: {},
            commodityList: [],
            giveType: false,
            give: {},
            giveRules: {
                commodityId: [{ required: true, message: "请选择赠送商品", trigger: "change" }],
            },
            balanceQuery: {
                openId: null,
                pageNum: 1,
                pageSize: 10,
            },
            baRange: [],
            baList: [],
            baTotal: 0,
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询小程序用户信息列表 */
        getList() {
            this.loading = true;
            this.water && (this.queryParams.params.water = this.water);
            this.balance && (this.queryParams.params.balance = this.balance);
            listWxUser(this.addDateRange(this.queryParams, this.daterange)).then(response => {
                this.wxUserList = response.rows;
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
                openId: null,
                idNo: null,
                nickName: null,
                wxAvatar: null,
                name: null,
                phone: null,
                sex: null,
                birth: null,
                balance: null,
                totalMoney: null,
                integral: null,
                water: null,
                isWarter: '1',
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
            this.ids = selection.map(item => item.openId)
            this.single = selection.length !== 1
            this.multiple = !selection.length
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.title = "添加小程序用户信息";
        },
        lookUseInfo(row) {
            this.balanceQuery = {
                openId: row.openId,
                pageNum: 1,
                pageSize: 10,
            };
            this.baRange = [];
            this.kookBalance();
            getWxUser(row.openId).then(response => {
                this.info = response.data;
                this.openUseInfo = true;
            });
        },
        kookBalance() {
            getBalance(this.addDateRange(this.balanceQuery, this.baRange)).then(res => {
                console.log(res, "PPPP");
                this.baList = res.rows;
                this.baTotal = res.total;
            });
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const openId = row.openId || this.ids
            getWxUser(openId).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改小程序用户信息";
            });
        },
        switchChange(e, row, val) {
            let obj = { openId: row.openId }; obj[val] = e;
            updateWxUser(obj).then(res => {
                if (res.code == 200) {
                    this.$modal.msgSuccess("修改成功");
                    this.getList();
                }
            })
        },
        giftReset() {
            this.give = {
                openId: null,
                commodityId: null,
            };
            this.resetForm("give");
        },
        handleGift(row) {
            this.giftReset();
            console.log(row, "row");
            listCommodity().then(res => {
                this.give.openId = row.openId;
                this.commodityList = res.rows;
                this.giveType = true;
            });
        },
        clearCase(row) {
            this.$modal.confirm('是否确认清空当前用户的箱子？').then(function () {
                return delCase(row.openId);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("清除成功");
            }).catch(() => { });
        },
        cancelGive() {
            this.giveType = false;
            this.giftReset();
        },
        submitGive() {
            this.$refs["give"].validate(valid => {
                if (valid) {
                    giveGoods(this.give).then(res => {
                        if (res.code == 200) {
                            this.$modal.msgSuccess("赠送成功");
                            this.giveType = false;
                            this.getList();
                        }
                    })
                }
            })
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.openId != null) {
                        updateWxUser(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addWxUser(this.form).then(response => {
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
            const openIds = row.openId || this.ids;
            this.$modal.confirm('是否确认删除？').then(function () {
                return delWxUser(openIds);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download('wxUser/wxUser/export', {
                ...this.queryParams
            }, `wxUser_${new Date().getTime()}.xlsx`)
        }
    }
};
</script>


<style lang="scss" scoped>
.form-box {
    width: 95%;
    display: flex;
    margin: 0 auto;
    align-items: center;
    box-sizing: border-box;

    .form-box-con {
        display: grid;
        gap: 20px 80px;
        margin-left: 40px;
        box-sizing: border-box;
        grid-template-columns: repeat(4, 1fr);
    }
}

.form-title {
    font-size: 18px;
    color: #303133;
    margin-top: 60px;
    line-height: 24px;
    margin-bottom: 20px;
}
</style>