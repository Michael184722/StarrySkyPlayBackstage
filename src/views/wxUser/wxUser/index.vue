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
            <el-table-column label="昵称" align="center" prop="nickName" width="200" />
            <el-table-column label="性别" align="center" prop="sex" width="80">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.sex == 1">男</el-tag>
                    <el-tag v-else-if="scope.row.sex == 2">女</el-tag>
                    <div v-else>/</div>
                </template>
            </el-table-column>
            <el-table-column label="手机号" align="center" prop="phone" width="150" />
            <el-table-column label="姓名" align="center" prop="name" width="150" />
            <el-table-column label="身份证号" align="center" prop="idNo" width="200" />
            <el-table-column label="出生年月" align="center" prop="birth" width="200" />
            <el-table-column label="余额" align="center" prop="balance" width="150" />
            <el-table-column label="流水金额" align="center" prop="water" width="200" />
            <el-table-column label="积分余额" align="center" prop="integral" width="200" />
            <el-table-column label="等级" align="center" prop="levelName" width="150" />
            <el-table-column label="双倍次数" align="center" prop="doubleNum" width="100" />
            <el-table-column label="攀塔层数" align="center" prop="towerLayer" width="100" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="200" />
            <el-table-column label="是否参与流水排行" align="center" prop="isWarter" width="150">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.isWarter" active-value="1" inactive-value="0" @change="switchChange($event, scope.row, 'isWarter')" />
                </template>
            </el-table-column>
            <el-table-column label="封号" align="center" prop="delFlag" width="150">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.delFlag" active-value="2" inactive-value="0" @change="switchChange($event, scope.row, 'delFlag')" />
                </template>
            </el-table-column>
            <el-table-column label="回收账号" align="center" prop="isInner" width="150">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.isInner" active-value="1" inactive-value="0" @change="switchChange($event, scope.row, 'isInner')" />
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="720" fixed="right">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-view" @click="lookUseInfo(scope.row)" v-hasPermi="['wxUser:wxUser:query']">查看</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view" @click="tranValidate.row = scope.row; tranValidate.pageNum = 1; tranValidate.datetimerange = []; transactionRecords()"
                        v-hasPermi="['wxUser:wxUser:query']">交易记录</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view"
                        @click="purchValidate.row = scope.row; purchValidate.pageNum = 1; purchValidate.state = null; purchValidate.datetimerange = []; purchaseRecords()"
                        v-hasPermi="['wxUser:wxUser:query']">购买记录</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view"
                        @click="integValidate.row = scope.row; integValidate.pageNum = 1; integValidate.state = null; integValidate.datetimerange = []; integralRecord()"
                        v-hasPermi="['wxUser:wxUser:query']">积分记录</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view" @click="shipValidate.row = scope.row; shipValidate.pageNum = 1; shippingRecords()"
                        v-hasPermi="['wxUser:wxUser:query']">发货记录</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view" @click="subUserValidate.row = scope.row; subUserValidate.pageNum = 1; subordinateUsers()"
                        v-hasPermi="['wxUser:wxUser:query']">下级用户</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view"
                        @click="packageValidate.row = scope.row; packageValidate.cmType = ''; packageValidate.orderType = 1; packageValidate.openOrFold = 2; packageValidate.pageNum = 1; getUserPackage()"
                        v-hasPermi="['wxUser:wxUser:query']">背包</el-button>
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
                    <el-input v-model="form.balance" type="number" placeholder="请输入余额" />
                </el-form-item>
                <el-form-item label="消费金额" prop="totalMoney">
                    <el-input v-model="form.totalMoney" type="number" placeholder="请输入总金额">
                        <template slot="append">
                            <el-tooltip class="item" effect="dark" content="修改消费金额等级会跟着发生变化" placement="top">
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="积分余额" prop="integral">
                    <el-input v-model="form.integral" type="number" placeholder="请输入现有积分" />
                </el-form-item>
                <el-form-item label="流水金额" prop="water">
                    <el-input v-model="form.water" type="number" placeholder="请输入流水金额" />
                </el-form-item>
                <el-form-item label="是否参与流水排行" prop="isWarter">
                    <el-switch v-model="form.isWarter" active-value="1" inactive-value="0" />
                </el-form-item>
                <el-form-item label="头像" prop="wxAvatar">
                    <ImagePreview :src="form.wxAvatar" :limit="1" />
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
                    <div class="form-box-con-item">消费金额：{{ info.totalMoney }}</div>
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
                <el-table-column label="充值方式" align="center" prop="type">
                    <template slot-scope="scope">{{ scope.row.type == 1 ? "微信" : "平台" }}</template>
                </el-table-column>
                <!-- 新余额 -->
                <el-table-column label="新余额" align="center">
                    <template slot-scope="scope">{{  scope.row.type == 1 ? '/' : scope.row.newMoney }}</template>
                </el-table-column>
                <!-- 旧余额 -->
                <el-table-column label="旧余额" align="center">
                    <template slot-scope="scope">{{  scope.row.type == 1 ? '/' : scope.row.oldMoney }}</template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <el-dialog title="赠送" :visible.sync="giveType" v-if="giveType" width="1500px" append-to-body>
            <el-form ref="give" :model="give" :rules="giveRules" label-width="80px">
                <!-- 福袋和商品切换 -->
                <el-form-item label="赠送类型" prop="type">
                    <el-radio-group v-model="give.type">
                        <el-radio :label="1">福袋</el-radio>
                        <el-radio :label="2">商品</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!-- 选择福袋 -->
                <el-form-item label="选择福袋" prop="bagId" v-if="give.type == 1" :rules="[{ required: true, message: '请选择福袋', trigger: 'change' }]">
                    <el-select v-model="give.bagId" filterable placeholder="请选择福袋" style="width: 100%">
                        <el-option v-for="(item, index) in bagList" :key="index" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="赠送商品" prop="commodityId" v-if="give.type == 2" :rules="[{ required: true, message: '请选择赠送商品', trigger: 'change' }]">
                    <el-select v-model="give.commodityId" filterable placeholder="请选择赠送商品" style="width: 100%">
                        <el-option v-for="(item, index) in commodityList" :key="index" :label="item.commodityName" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="dialog-submit" style="margin-bottom: 50px;">
                <el-button type="primary" @click="submitGive">确 定</el-button>
                <el-button @click="cancelGive">取 消</el-button>
            </div>
            <el-divider content-position="center">已赠送商品</el-divider>
            <el-table :data="giveVal.list" max-height="580">
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
            <pagination v-show="giveVal.total > 0" :total="giveVal.total" :page.sync="giveVal.pageNum" :limit.sync="giveVal.pageSize" @pagination="getGivenGoods" />
        </el-dialog>
        <!-- 交易记录 -->
        <el-dialog title="交易记录" :visible.sync="tranValidate.type" v-if="tranValidate.type" width="1600px" append-to-body>
            <el-row>
                <el-col :span="2.5">
                    <el-select v-model="tranValidate.state" placeholder="请选择交易类型" clearable>
                        <el-option v-for="item in [{ value: 1, label: '平台' }, { value: 2, label: '非平台' }]" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-date-picker v-model="tranValidate.datetimerange" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        clearable /></el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" size="small" @click="transactionRecords">搜索</el-button></el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 6px;">
                    <div style="height: 100%; display: flex;align-items: center;">收入：{{ tranValidate.inMoney }}</div>
                </el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 6px;">
                    <div style="height: 100%; display: flex;align-items: center;">支出：{{ tranValidate.payMoney }}</div>
                </el-col>
            </el-row>
            <el-table :data="tranValidate.list" max-height="650" style="margin-top: 30px;">
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
                        <el-tag>{{ scope.row.payType }}：{{ scope.row.money }}</el-tag>
                    </template>
                </el-table-column>
                <!-- 支付前余额 -->
                <el-table-column label="支付前余额" align="center" prop="oldMoney" />
                <!-- 支付后余额 -->
                <el-table-column label="支付后余额" align="center" prop="newMoney" />
                <!-- 交易商品名称 -->
                <el-table-column label="交易商品名称" align="center" prop="commodityName">
                    <template slot-scope="scope">
                        <el-popover placement="right" trigger="click">
                            <el-table v-if="scope.row.commodityList.length" :data="scope.row.commodityList">
                                <el-table-column width="200" property="commodityName" label="商品名称"></el-table-column>
                                <el-table-column width="200" label="商品等级" align="center" property="levelName" />
                                <el-table-column width="200" label="中奖数量" align="center" property="totalNum" />
                                <el-table-column width="200" label="中奖总价" align="center" property="totalPrice">
                                    <template slot-scope="scope">
                                        {{ Number(scope.row.totalPrice) }}
                                    </template>
                                </el-table-column>
                                <el-table-column width="200" label="商品图片" align="center" property="faceImg">
                                    <template slot-scope="scope">
                                        <ImagePreview :src="scope.row.faceImg" width="50px" height="50px" />
                                    </template>
                                </el-table-column>
                            </el-table>
                            <el-button slot="reference" type="primary" size="mini">查看</el-button>
                        </el-popover>
                    </template>
                </el-table-column>
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
            <pagination v-show="tranValidate.total > 0" :total="tranValidate.total" :page.sync="tranValidate.pageNum" :limit.sync="tranValidate.pageSize" @pagination="transactionRecords" />
        </el-dialog>
        <!-- 交易记录 -->
        <el-dialog title="购买记录" :visible.sync="purchValidate.type" v-if="purchValidate.type" width="1600px" append-to-body>
            <el-row>
                <el-col :span="2.5">
                    <el-select v-model="purchValidate.state" placeholder="请选择交易类型" clearable>
                        <el-option v-for="item in [{ value: 1, label: '平台' }, { value: 2, label: '非平台' }]" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-date-picker v-model="purchValidate.datetimerange" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        clearable />
                </el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" size="small" @click="purchaseRecords">搜索</el-button></el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 6px;">
                    <div style="height: 100%; display: flex;align-items: center;">收入：{{ purchValidate.inMoney }}</div>
                </el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 6px;">
                    <div style="height: 100%; display: flex;align-items: center;">支出：{{ purchValidate.payMoney }}</div>
                </el-col>
            </el-row>
            <el-table :data="purchValidate.list" max-height="650" style="margin-top: 30px;">
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
                        <el-tag>{{ scope.row.payType }}：{{ scope.row.money }}</el-tag>
                    </template>
                </el-table-column>
                <!-- 支付前余额 -->
                <el-table-column label="支付前余额" align="center" prop="oldMoney" />
                <!-- 支付后余额 -->
                <el-table-column label="支付后余额" align="center" prop="newMoney" />
                <!-- 交易商品名称 -->
                <el-table-column label="交易商品名称" align="center" prop="commodityName">
                    <template slot-scope="scope">
                        <el-popover placement="right" trigger="click">
                            <el-table v-if="scope.row.commodityList.length" :data="scope.row.commodityList">
                                <el-table-column width="200" property="commodityName" label="商品名称"></el-table-column>
                                <el-table-column width="200" label="商品等级" align="center" property="levelName" />
                                <el-table-column width="200" label="中奖数量" align="center" property="totalNum" />
                                <el-table-column width="200" label="中奖总价" align="center" property="totalPrice">
                                    <template slot-scope="scope">
                                        {{ Number(scope.row.totalPrice) }}
                                    </template>
                                </el-table-column>
                                <el-table-column width="200" label="商品图片" align="center" property="faceImg">
                                    <template slot-scope="scope">
                                        <ImagePreview :src="scope.row.faceImg" width="50px" height="50px" />
                                    </template>
                                </el-table-column>
                            </el-table>
                            <el-button slot="reference" type="primary" size="mini">查看</el-button>
                        </el-popover>
                    </template>
                </el-table-column>
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
            <pagination v-show="purchValidate.total > 0" :total="purchValidate.total" :page.sync="purchValidate.pageNum" :limit.sync="purchValidate.pageSize" @pagination="purchaseRecords" />
        </el-dialog>
        <!-- 积分记录 -->
        <el-dialog title="积分记录" :visible.sync="integValidate.type" v-if="integValidate.type" width="1500px" append-to-body>
            <el-row>
                <el-col :span="1.5"><el-date-picker v-model="integValidate.datetimerange" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" clearable /></el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" @click="integralRecord">搜索</el-button></el-col>
                <el-col :span="1.5" :offset="1">
                    <div style="height: 100%; display: flex;align-items: center;">收入：{{ integValidate.inIntegral }}</div>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <div style="height: 100%; display: flex;align-items: center;">支出：{{ integValidate.payIntegral }}</div>
                </el-col>
            </el-row>
            <el-table :data="integValidate.list" max-height="650" style="margin-top: 30px;">
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
                <el-table-column label="交易积分" align="center">
                    <template slot-scope="scope">
                        <el-tag>{{ (scope.row.floor == 6 ? '支出：' : '收入：') + scope.row.integral }}</el-tag>
                    </template>
                </el-table-column>
                <!-- 交易前余额 -->
                <el-table-column label="交易前余额" align="center" prop="oldMoney" />
                <!-- 交易后余额 -->
                <el-table-column label="交易后余额" align="center" prop="newMoney" />
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
            <pagination v-show="integValidate.total > 0" :total="integValidate.total" :page.sync="integValidate.pageNum" :limit.sync="integValidate.pageSize" @pagination="integralRecord" />
        </el-dialog>
        <!-- 发货记录 -->
        <el-dialog title="发货记录" :visible.sync="shipValidate.type" v-if="shipValidate.type" width="1500px" append-to-body>
            <el-table :data="shipValidate.list" max-height="650">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="商品名称" align="center" prop="commodityName">
                    <template slot-scope="scope">
                        <el-popover placement="right" trigger="click">
                            <el-table v-if="scope.row.commodityName" :data="scope.row.commodityName.split(',').map(item => { return { commodityName: item } })">
                                <el-table-column width="400" property="commodityName" align="center" label="商品名称"></el-table-column>
                            </el-table>
                            <el-button slot="reference" type="primary" size="mini">查看</el-button>
                        </el-popover>
                    </template>
                </el-table-column>
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
            <pagination v-show="shipValidate.total > 0" :total="shipValidate.total" :page.sync="shipValidate.pageNum" :limit.sync="shipValidate.pageSize" @pagination="shippingRecords" />
        </el-dialog>
        <!-- 背包 -->
        <el-dialog title="背包" :visible.sync="packageValidate.type" v-if="packageValidate.type" width="1500px" append-to-body>
            <el-row>
                <el-col :span="1.5">
                    <el-select v-model="packageValidate.cmType" clearable>
                        <el-option label="全部" value=""></el-option>
                        <el-option label="预售" value="1"></el-option>
                        <el-option label="现货" value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="packageValidate.orderType" clearable>
                        <el-option label="时间" :value="1"></el-option>
                        <el-option label="价格" :value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="packageValidate.openOrFold" clearable>
                        <el-option label="展开" :value="1"></el-option>
                        <el-option label="折叠" :value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" @click="getUserPackage">搜索</el-button></el-col>
            </el-row>
            <el-table :data="packageValidate.list" max-height="650">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="商品名称" align="center" prop="commodityName" />
                <!-- 商品图片 -->
                <el-table-column label="商品图片" align="center" prop="commodityImg">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.commodityImg" :width="50" :height="50" />
                    </template>
                </el-table-column>
                <el-table-column label="商品数量" align="center" prop="num" v-if="packageValidate.openOrFold == 2" />
                <el-table-column label="商品总价" align="center" prop="price" />
                <!-- 商品等级 -->
                <el-table-column label="商品等级" align="center" prop="levelName" />
            </el-table>
            <pagination v-if="packageValidate.openOrFold == 1" v-show="packageValidate.total > 0" :total="packageValidate.total" :page.sync="packageValidate.pageNum"
                :limit.sync="packageValidate.pageSize" @pagination="getUserPackage" />
        </el-dialog>
        <el-dialog title="发货记录" :visible.sync="subUserValidate.type" v-if="subUserValidate.type" width="1500px" append-to-body>
            <el-table :data="subUserValidate.list" max-height="650">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="头像" align="center">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.avatar" :width="50" :height="50" />
                    </template>
                </el-table-column>
                <el-table-column label="昵称" align="center" prop="nickName" />
                <el-table-column label="积分奖励" align="center" prop="integral" />
            </el-table>
            <pagination v-show="subUserValidate.total > 0" :total="subUserValidate.total" :page.sync="subUserValidate.pageNum" :limit.sync="subUserValidate.pageSize" @pagination="subordinateUsers" />
        </el-dialog>
    </div>
</template>

<script>
import { listBag } from "@/api/bag/bag";
import { addBagRecord } from "@/api/bagRecord/bagRecord";
import { listCommodity } from "@/api/commodity/commodity";
import { listWxUser, getWxUser, delWxUser, addWxUser, updateWxUser, giveGoods, getBalance, delCase, listGivenGoods, listTradeRecord, listPresent, listIntegralRecord, listSendRecord, listTradeStatistics, listPresentStatistics, listIntegralRecordStatistics, listUserPackage, getNextUsers } from "@/api/wxUser/wxUser";

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
            giveVal: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
                row: {},
            },
            give: {},
            giveRules: {},
            balanceQuery: {
                openId: null,
                pageNum: 1,
                pageSize: 10,
            },
            baRange: [],
            baList: [],
            baTotal: 0,

            tranValidate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
                row: {},
                type: false,
                state: null,
                datetimerange: [],
                inMoney: 0,
                payMoney: 0,
            },
            purchValidate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
                row: {},
                type: false,
                state: null,
                datetimerange: [],
                inMoney: 0,
                payMoney: 0,
            },
            integValidate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
                row: {},
                type: false,
                datetimerange: [],
                inIntegral: 0,
                payIntegral: 0,
            },
            shipValidate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
                row: {},
                type: false,
            },
            bagList: [],
            packageValidate: {
                pageNum: 1,
                pageSize: 10,
                cmType: '', // 1-预售 2-现货
                orderType: 1, // 1-时间 2-价格
                openOrFold: 2, // 2-折叠 1-展开
                total: 0,
                list: [],
                row: {},
                type: false,
            },
            subUserValidate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
                row: {},
                type: false,
            },
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
        // 查看
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
        // 交易记录
        transactionRecords() {
            this.queryTradeStatistics();
            let obj = {
                state: this.tranValidate.state,
                openId: this.tranValidate.row.openId,
                pageNum: this.tranValidate.pageNum,
                pageSize: this.tranValidate.pageSize,
            };
            if (this.tranValidate.datetimerange.length) {
                obj.beginTime = this.tranValidate.datetimerange[0];
                obj.endTime = this.tranValidate.datetimerange[1];
            }
            listTradeRecord(obj).then(res => {
                this.tranValidate.list = res.rows;
                this.tranValidate.total = res.total;
                this.tranValidate.type = true;
            });
        },
        // 查询交易统计
        queryTradeStatistics() {
            listTradeStatistics(this.addDateRange({ openId: this.tranValidate.row.openId }, this.tranValidate.datetimerange)).then(res => {
                this.tranValidate.inMoney = res.data.inMoney;
                this.tranValidate.payMoney = res.data.payMoney;
            });
        },
        // 购买记录
        purchaseRecords() {
            this.queryPresentStatistics();
            let obj = {
                state: this.purchValidate.state,
                openId: this.purchValidate.row.openId,
                pageNum: this.purchValidate.pageNum,
                pageSize: this.purchValidate.pageSize,
            };
            if (this.purchValidate.datetimerange.length) {
                obj.beginTime = this.purchValidate.datetimerange[0];
                obj.endTime = this.purchValidate.datetimerange[1];
            }
            listPresent(obj).then(res => {
                this.purchValidate.list = res.rows;
                this.purchValidate.total = res.total;
                this.purchValidate.type = true;
            });
        },
        // 查询购买记录统计
        queryPresentStatistics() {
            listPresentStatistics(this.addDateRange({ openId: this.purchValidate.row.openId }, this.purchValidate.datetimerange)).then(res => {
                this.purchValidate.inMoney = res.data.inMoney;
                this.purchValidate.payMoney = res.data.payMoney;
            });
        },
        // 积分记录
        integralRecord() {
            this.queryTradeRecordStatistics();
            listIntegralRecord(this.addDateRange({
                openId: this.integValidate.row.openId,
                pageNum: this.integValidate.pageNum,
                pageSize: this.integValidate.pageSize,
            }, this.integValidate.datetimerange)).then(res => {
                this.integValidate.list = res.rows;
                this.integValidate.total = res.total;
                this.integValidate.type = true;
            });
        },
        // 查询积分记录统计
        queryTradeRecordStatistics() {
            listIntegralRecordStatistics(this.addDateRange({ openId: this.integValidate.row.openId }, this.integValidate.datetimerange)).then(res => {
                this.integValidate.inIntegral = res.data.inIntegral;
                this.integValidate.payIntegral = res.data.payIntegral;
            });
        },
        // 发货记录
        shippingRecords() {
            listSendRecord({
                openId: this.shipValidate.row.openId,
                pageNum: this.shipValidate.pageNum,
                pageSize: this.shipValidate.pageSize,
            }).then(res => {
                this.shipValidate.list = res.rows;
                this.shipValidate.total = res.total;
                this.shipValidate.type = true;
            });
        },
        kookBalance() {
            getBalance(this.addDateRange(this.balanceQuery, this.baRange)).then(res => {
                this.baList = res.rows;
                this.baTotal = res.total;
            });
        },
        // 查询下级用户
        subordinateUsers() {
            getNextUsers({
                openId: this.subUserValidate.row.openId,
                pageNum: this.subUserValidate.pageNum,
                pageSize: this.subUserValidate.pageSize,
            }).then(res => {
                this.subUserValidate.list = res.rows;
                this.subUserValidate.total = res.total;
                this.subUserValidate.type = true;
            });
        },
        // 查询背包
        getUserPackage() {
            let obj = {
                openId: this.packageValidate.row.openId,
                cmType: this.packageValidate.cmType,
                orderType: this.packageValidate.orderType,
                openOrFold: this.packageValidate.openOrFold,
            };
            if (this.packageValidate.openOrFold == 1) {
                obj.pageNum = this.packageValidate.pageNum;
                obj.pageSize = this.packageValidate.pageSize;
            }
            listUserPackage(obj).then(res => {
                this.packageValidate.list = res.rows;
                this.packageValidate.total = res.total;
                this.packageValidate.type = true;
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
                type: 2,
                bagId: null,
                openId: null,
                commodityId: null,
            };
            this.resetForm("give");
        },
        handleGift(row) {
            this.giftReset();
            this.getGivenGoods();
            this.giveVal.row = row;
            listBag().then(res => {
                this.bagList = res.rows;
            })
            listCommodity().then(res => {
                this.give.openId = row.openId;
                this.commodityList = res.rows;
                this.giveType = true;
            });
        },
        // 获取已赠送商品列表
        getGivenGoods() {
            listGivenGoods({
                pageNum: this.giveVal.pageNum,
                pageSize: this.giveVal.pageSize,
                openId: this.giveVal.row.openId,
            }).then(res => {
                this.giveVal.list = res.rows;
                this.giveVal.total = res.total;
            })
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
                    if (this.give.type == 1) {
                        addBagRecord({ openId: this.give.openId, bagId: this.give.bagId }).then(res => {
                            this.$modal.msgSuccess("赠送成功");
                            this.giveType = false;
                            this.getList();
                        });
                    } else {
                        giveGoods({ openId: this.give.openId, commodityId: this.give.commodityId }).then(res => {
                            if (res.code == 200) {
                                this.$modal.msgSuccess("赠送成功");
                                this.giveType = false;
                                this.getList();
                            }
                        });
                    }
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

.dialog-submit {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    box-sizing: border-box;
    justify-content: center;
}
</style>