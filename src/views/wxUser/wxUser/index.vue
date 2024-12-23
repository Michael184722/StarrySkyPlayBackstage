<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-width="88px">
            <el-form-item label="ID" prop="userId">
                <el-input v-model="queryParams.userId" placeholder="请输入ID" clearable @keyup.enter.native="handleQuery"
                    style="width: 200px" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery"
                    style="width: 200px" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable @keyup.enter.native="handleQuery"
                    style="width: 200px" />
            </el-form-item>
            <el-form-item label="流水排序" prop="water">
                <el-select v-model="water" placeholder="请选择流水排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="余额排序" prop="balance">
                <el-select v-model="balance" placeholder="请选择余额排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="等级排序" prop="level">
                <el-select v-model="level" placeholder="请选择等级排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="积分排序" prop="integral">
                <el-select v-model="integral" placeholder="请选择积分排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="背包总余额排序" prop="totalPrice" label-width="120px">
                <el-select v-model="totalPrice" placeholder="请选择背包总余额排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="辰币排序" prop="coin">
                <el-select v-model="coin" placeholder="请选择辰币排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="亏损排序" prop="loss">
                <el-select v-model="loss" placeholder="请选择亏损排序" clearable style="width: 200px">
                    <el-option label="升序" value="1" />
                    <el-option label="降序" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item label="创建日期" prop="daterange">
                <el-date-picker clearable v-model="daterange" value-format="yyyy-MM-dd" type="daterange"
                    range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 220px" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button size="mini" type="warning" plain icon="el-icon-download" @click="handleExport"
                    v-hasPermi="['wxUser:wxUser:export']">导出</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button size="mini" type="danger" plain @click="removeDate"
                    v-hasPermi="['wxUser:wxUser:export']">全部流水-删除</el-button>
            </el-col>
            <el-col :span="1.5" :offset="1">
                <el-button type="text" @click="copyText(totalBalance)">总余额：{{ totalBalance }} 元</el-button>
            </el-col>
            <el-col :span="1.5" :offset="1">
                <el-button type="text" @click="copyText(coinTotal)">辰币总余额：{{ coinTotal }} 元</el-button>
            </el-col>
            <el-col :span="1.5" :offset="1">
                <el-button type="text" @click="copyText(totalScore)">总积分：{{ totalScore }}</el-button>
            </el-col>
            <el-col :span="1.5" :offset="1">
                <el-button type="text" @click="copyText(totalBalBack)">背包总余额：{{ totalBalBack }} 元</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="wxUserList" border size="mini">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="ID" align="center" prop="userId" width="130">
                <template slot-scope="scope">
                    <el-link type="primary" @click="copyText(scope.row.userId)">{{ scope.row.userId }}</el-link>
                </template>
            </el-table-column>
            <el-table-column label="头像" align="center" prop="wxAvatar">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.wxAvatar" :width="35" :height="35" />
                </template>
            </el-table-column>
            <el-table-column label="昵称" align="center" prop="nickName" width="100" show-overflow-tooltip />
            <el-table-column label="性别" align="center" prop="sex" width="80">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.sex == 1">男</el-tag>
                    <el-tag v-else-if="scope.row.sex == 2">女</el-tag>
                    <div v-else>/</div>
                </template>
            </el-table-column>
            <el-table-column label="手机号" align="center" prop="phone" width="110">
                <template slot-scope="scope">
                    <el-link type="primary" @click="copyText(scope.row.phone)">{{ scope.row.phone }}</el-link>
                </template>
            </el-table-column>
            <el-table-column label="姓名" align="center" prop="name" width="100" />
            <el-table-column label="身份证号" align="center" prop="idNo" width="150" />
            <el-table-column label="出生年月" align="center" prop="birth" width="100" />
            <el-table-column label="余额" align="center" prop="balance" width="80" />
            <el-table-column label="辰币余额" align="center" prop="coin" width="100" />
            <el-table-column label="亏损" align="center" prop="loss" width="100" />
            <el-table-column label="流水金额" align="center" prop="water" width="100" />
            <el-table-column label="积分余额" align="center" prop="integral" width="100" />
            <el-table-column label="背包总余额" align="center" prop="totalPrice" width="100" />
            <el-table-column label="等级" align="center" prop="levelName" width="80" />
            <el-table-column label="双倍次数" align="center" prop="doubleNum" width="80" />
            <el-table-column label="攀塔层数" align="center" prop="towerLayer" width="80" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="140" />
            <el-table-column label="流水排行" align="center" prop="isWarter" width="75" fixed="right">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.isWarter" active-value="1" inactive-value="0"
                        @change="switchChange($event, scope.row, 'isWarter')" />
                </template>
            </el-table-column>
            <el-table-column label="封号" align="center" prop="delFlag" width="75" fixed="right">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.delFlag" active-value="2" inactive-value="0"
                        @change="switchChange($event, scope.row, 'delFlag')" />
                </template>
            </el-table-column>
            <el-table-column label="回收账号" align="center" prop="isInner" width="80" fixed="right">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.isInner" active-value="1" inactive-value="0"
                        @change="switchChange($event, scope.row, 'isInner')" />
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" @click="lookUseInfo(scope.row)"
                        v-hasPermi="['wxUser:wxUser:query']">查看</el-button>
                    <el-button size="mini" type="text" @click="handleUpdate(scope.row)"
                        v-hasPermi="['wxUser:wxUser:edit']">修改</el-button>
                    <el-dropdown>
                        <el-button size="mini" type="text">
                            更多菜单<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>
                                <el-button size="mini" type="text"
                                    @click="tranValidate.row = scope.row; tranValidate.pageNum = 1; tranValidate.datetimerange = []; transactionRecords()"
                                    v-hasPermi="['wxUser:wxUser:query']">交易记录</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text"
                                    @click="purchValidate.row = scope.row; purchValidate.pageNum = 1; purchValidate.floor = null; purchValidate.datetimerange = []; purchaseRecords()"
                                    v-hasPermi="['wxUser:wxUser:query']">购买记录</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text"
                                    @click="integValidate.row = scope.row; integValidate.pageNum = 1; integValidate.state = null; integValidate.floor = null; integValidate.orderState = null; integValidate.datetimerange = []; integralRecord()"
                                    v-hasPermi="['wxUser:wxUser:query']">积分记录</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text"
                                    @click="shipValidate.row = scope.row; shipValidate.pageNum = 1; shippingRecords()"
                                    v-hasPermi="['wxUser:wxUser:query']">发货记录</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text"
                                    @click="subUserValidate.row = scope.row; subUserValidate.pageNum = 1; subordinateUsers()"
                                    v-hasPermi="['wxUser:wxUser:query']">下级用户</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text"
                                    @click="packageValidate.row = scope.row; packageValidate.cmType = ''; packageValidate.orderType = 1; packageValidate.openOrFold = 2; packageValidate.pageNum = 1; getUserPackage()"
                                    v-hasPermi="['wxUser:wxUser:query']">用户背包</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text" @click="handleGift(scope.row)"
                                    v-hasPermi="['wxUser:wxUser:edit']">福利赠送</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button size="mini" type="text" @click="clearCase(scope.row)"
                                    v-hasPermi="['wxUser:wxUser:edit']">清空箱子</el-button>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" small :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改小程序用户信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="70px" size="mini">
                <el-form-item label="用户姓名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入姓名" disabled />
                </el-form-item>
                <el-form-item label="用户性别" prop="sex">
                    <el-select v-model="form.sex" placeholder="请选择性别" disabled style="width: 100%">
                        <el-option label="男" value="1" />
                        <el-option label="女" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号" disabled />
                </el-form-item>
                <el-form-item label="出生年月" prop="birth">
                    <el-input v-model="form.birth" placeholder="请输入出生年月" disabled />
                </el-form-item>
                <el-form-item label="身份证号" prop="idNo">
                    <el-input v-model="form.idNo" placeholder="请输入身份证号" disabled />
                </el-form-item>
                <el-form-item label="用户昵称" prop="nickName">
                    <el-input v-model="form.nickName" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="用户余额" prop="balance">
                    <el-input v-model="form.balance" type="number" placeholder="请输入余额" />
                </el-form-item>
                <el-form-item label="辰币余额" prop="coin">
                    <el-input v-model="form.coin" type="number" placeholder="请输入余额" />
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
                <el-form-item label="流水排行" prop="isWarter">
                    <el-switch v-model="form.isWarter" active-value="1" inactive-value="0" />
                </el-form-item>
                <el-form-item label="用户头像" prop="wxAvatar">
                    <ImagePreview :src="form.wxAvatar" :limit="1" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
                <el-button @click="cancel" size="small">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 用户详情 -->
        <el-dialog title="基本信息" :visible.sync="openUseInfo" v-if="openUseInfo" width="1000px" append-to-body>
            <div class="form-box">
                <ImagePreview :src="info.wxAvatar" :width="150" :height="150" />
                <div class="form-box-con">
                    <el-descriptions style="width: 100%;" size="small" :column="3" border>
                        <el-descriptions-item>
                            <template slot="label">
                                ID
                            </template>
                            {{ info.userId }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                昵称
                            </template>
                            {{ info.nickName }}嘎嘎嘎发
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                <i class="el-icon-user"></i>
                                姓名
                            </template>
                            {{ info.name }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                <i class="el-icon-mobile-phone"></i>
                                手机号
                            </template>
                            {{ info.phone }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                性别
                            </template>
                            {{ info.sex == 1 ? '男' : '女' }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                <i class="el-icon-date"></i>
                                出生年月
                            </template>
                            {{ info.birth }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                <i class="el-icon-postcard"></i>
                                身份证号
                            </template>
                            {{ info.idNo }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                等级
                            </template>
                            {{ info.levelName }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                <i class="el-icon-wallet"></i>
                                余额
                            </template>
                            {{ info.balance }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                消费金额
                            </template>
                            {{ info.totalMoney }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                积分余额
                            </template>
                            {{ info.integral }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                流水金额
                            </template>
                            {{ info.water }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                是否参与流水排行
                            </template>
                            {{ info.isWarter == 1 ? '是' : '否' }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                创建时间
                            </template>
                            {{ info.createTime }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template slot="label">
                                距离升级还差
                            </template>
                            {{ (info.endMoney - info.totalMoney) || 0 }} 星币
                        </el-descriptions-item>
                    </el-descriptions>
                    <!-- <div class="form-box-con-item">ID：{{ info.userId }}</div>
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
                    <div class="form-box-con-item">距离升级还差：{{ (info.endMoney - info.totalMoney) || 0 }} 星币</div> -->
                </div>
            </div>
            <div class="form-title">
                <el-row>
                    <el-col :span="1.5">存储余额</el-col>
                    <el-col :span="1.5" :offset="1">
                        <el-date-picker v-model="baRange" size="mini" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-col>
                    <el-col :span="1.5" :offset="1">
                        <el-button type="primary" size="mini" @click="kookBalance">查询</el-button>
                    </el-col>
                </el-row>
            </div>
            <el-table :data="baList" border size="mini">
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
            <pagination v-show="baTotal > 0" small :total="baTotal" :page.sync="balanceQuery.pageNum"
                :limit.sync="balanceQuery.pageSize" @pagination="kookBalance" />

            <div class="form-title">收货地址</div>
            <el-table :data="info.wxUserAddresses" max-height="500" border size="mini">
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
            <el-row>
                <el-col :span="1.5">
                    <el-select v-model="rechargeRecord.type" placeholder="请选择支付方式" size="mini" clearable
                        style="width: 130px;">
                        <el-option label="微信" value="1"></el-option>
                        <el-option label="平台" value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="rechargeRecord.status" placeholder="请选择支付状态" size="mini" clearable
                        style="width: 135px;">
                        <el-option label="成功支付" value="1"></el-option>
                        <el-option label="取消支付" value="0"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="rechargeRecord.moneyType" placeholder="请选择币种" size="mini" clearable
                        style="width: 135px;">
                        <el-option label="星币" value="1"></el-option>
                        <el-option label="辰币" value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-date-picker v-model="rechargeRecord.createTime" type="datetimerange"
                        value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" size="mini" style="width: 280px;" />
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-button type="primary" @click="rechClickQuery" size="mini">查询</el-button>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <div style="line-height: 25px;">总充值金额：{{ totalValue }} 元</div>
                </el-col>
            </el-row>
            <el-table :data="rechargeRecord.list" max-height="500" border size="mini" style="margin-top: 20px;">
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
                <el-table-column label="充值币种" align="center" prop="type">
                    <template slot-scope="scope">{{ scope.row.moneyType == 1 ? "星币" : "辰币" }}</template>
                </el-table-column>
                <el-table-column label="支付状态" align="center" prop="type">
                    <template slot-scope="scope">{{ scope.row.status == 1 ? "成功支付" : scope.row.status == 0 ? "取消支付" :
                        "/" }}</template>
                </el-table-column>
                <el-table-column label="赠送辰币额度" align="center">
                    <template slot-scope="scope">{{ scope.row.sendMoney }}</template>
                </el-table-column>
                <!-- 新余额 -->
                <el-table-column label="新余额" align="center">
                    <template slot-scope="scope">{{ scope.row.newMoney }}</template>
                </el-table-column>
                <!-- 旧余额 -->
                <el-table-column label="旧余额" align="center">
                    <template slot-scope="scope">{{ scope.row.oldMoney }}</template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <el-dialog title="赠送" :visible.sync="giveType" v-if="giveType" width="800px" append-to-body>
            <el-form ref="give" :model="give" :rules="giveRules" label-width="80px" size="mini">
                <!-- 福袋和商品切换 -->
                <el-form-item label="赠送类型" prop="type">
                    <el-radio-group v-model="give.type">
                        <el-radio :label="1">福袋</el-radio>
                        <el-radio :label="2">商品</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!-- 选择福袋 -->
                <el-form-item label="选择福袋" prop="bagId" v-if="give.type == 1"
                    :rules="[{ required: true, message: '请选择福袋', trigger: 'change' }]">
                    <el-select v-model="give.bagId" filterable placeholder="请选择福袋" style="width: 100%">
                        <el-option v-for="(item, index) in bagList" :key="index" :label="item.name"
                            :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="赠送商品" prop="commodityId" v-if="give.type == 2"
                    :rules="[{ required: true, message: '请选择赠送商品', trigger: 'change' }]">
                    <el-select v-model="give.commodityId" filterable placeholder="请选择赠送商品" style="width: 100%"
                        @change="giveChange(give.commodityId)">
                        <el-option v-for="(item, index) in commodityList" :key="index"
                            :label="item.commodityName + '(' + item.price + '元)'" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品图片" v-if="give.type == 2">
                    <ImagePreview :src="giveImg" :width="100" :height="100" />
                </el-form-item>
            </el-form>
            <div class="dialog-submit" style="margin-bottom: 20px;">
                <el-button type="primary" @click="submitGive" size="small">确 定</el-button>
                <el-button @click="cancelGive" size="small">取 消</el-button>
            </div>
            <el-divider content-position="center">已赠送商品</el-divider>
            <el-table :data="giveVal.list" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="ID" prop="userId" align="center" />
                <!-- 商品名称 -->
                <el-table-column label="商品名称" prop="commodityName" align="center" />
                <!-- 商品图片 -->
                <el-table-column label="商品图片" prop="commodityImg" align="center">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.faceImg" :width="35" :height="35" />
                    </template>
                </el-table-column>
                <!-- 商品价格 -->
                <el-table-column label="商品价格" prop="price" align="center" />
                <!-- 赠送时间 -->
                <el-table-column label="赠送时间" prop="createTime" align="center" />
            </el-table>
            <pagination v-show="giveVal.total > 0" small :total="giveVal.total" :page.sync="giveVal.pageNum"
                :limit.sync="giveVal.pageSize" @pagination="getGivenGoods" />
        </el-dialog>
        <!-- 交易记录 -->
        <el-dialog title="交易记录" :visible.sync="tranValidate.type" v-if="tranValidate.type" width="1600px"
            append-to-body>
            <el-row>
                <el-col :span="2.5">
                    <el-select v-model="tranValidate.state" placeholder="请选择交易类型" clearable size="mini">
                        <el-option v-for="item in [{ value: 1, label: '平台' }, { value: 2, label: '非平台' }]"
                            :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-date-picker v-model="tranValidate.datetimerange" type="datetimerange"
                        value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" clearable size="mini" /></el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" size="mini"
                        @click="transactionRecords">搜索</el-button></el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 4px;">
                    <div style="height: 100%; display: flex;align-items: center;">收入：{{ tranValidate.inMoney }}</div>
                </el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 4px;">
                    <div style="height: 100%; display: flex;align-items: center;">支出：{{ tranValidate.payMoney }}</div>
                </el-col>
            </el-row>
            <el-table :data="tranValidate.list" max-height="650" style="margin-top: 30px;" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 交易场所 -->
                <el-table-column label="交易场所" align="center" prop="floor" width="80">
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
                <el-table-column label="交易方式" align="center" prop="tradeType" width="80">
                    <template slot-scope="scope">
                        {{ scope.row.type == 1 ? "微信支付" : scope.row.type == 2 ? "余额支付" : "" }}
                    </template>
                </el-table-column>
                <!-- 交易金额 -->
                <el-table-column label="交易金额" align="center" prop="money" width="80" />
                <!-- 支出/收入 -->
                <el-table-column label="支出/收入" align="center" prop="payType" width="130">
                    <template slot-scope="scope">
                        <el-tag>{{ scope.row.payType }}：{{ scope.row.money }}</el-tag>
                    </template>
                </el-table-column>
                <!-- 支付前余额 -->
                <el-table-column label="支付前余额" align="center" prop="oldMoney" width="100" />
                <!-- 支付后余额 -->
                <el-table-column label="支付后余额" align="center" prop="newMoney" width="100" />
                <el-table-column label="支付前的辰币" align="center" prop="oldCoin" width="100" />
                <el-table-column label="支付后的辰币" align="center" prop="newCoin" width="100" />
                <el-table-column label="支付前的积分" align="center" prop="oldIntegral" width="100" />
                <el-table-column label="支付后的积分" align="center" prop="newIntegral" width="100" />
                <el-table-column label="交易商品名称" align="center" prop="commodityName" width="100">
                    <!-- 交易商品名称 -->
                    <template slot-scope="scope">
                        <el-popover placement="right" trigger="click">
                            <el-table v-if="scope.row.commodityList && scope.row.commodityList.length"
                                :data="scope.row.commodityList" border size="mini">
                                <el-table-column width="200" property="commodityName" label="商品名称"
                                    show-overflow-tooltip />
                                <el-table-column width="100" label="商品等级" align="center" property="levelName" />
                                <el-table-column width="100" label="中奖数量" align="center" property="totalNum" />
                                <el-table-column width="100" label="中奖总价" align="center" property="totalPrice">
                                    <template slot-scope="scope">
                                        {{ Number(scope.row.totalPrice) }}
                                    </template>
                                </el-table-column>
                                <el-table-column width="100" label="商品图片" align="center" property="faceImg">
                                    <template slot-scope="scope">
                                        <ImagePreview :src="scope.row.faceImg" width="35px" height="35px" />
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
                <el-table-column label="头像" align="center" prop="wxAvatar" width="80">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.wxAvatar" :width="35" :height="35" />
                    </template>
                </el-table-column>
                <!-- 交易时间 -->
                <el-table-column label="交易时间" align="center" prop="createTime" width="150" />
            </el-table>
            <pagination v-show="tranValidate.total > 0" small :total="tranValidate.total"
                :page.sync="tranValidate.pageNum" :limit.sync="tranValidate.pageSize"
                @pagination="transactionRecords" />
        </el-dialog>
        <!-- 交易记录 -->
        <el-dialog title="购买记录" :visible.sync="purchValidate.type" v-if="purchValidate.type" width="1200px"
            append-to-body>
            <el-row>
                <el-col :span="2.5">
                    <el-select v-model="purchValidate.floor" placeholder="请选择交易场所" clearable size="mini">
                        <el-option label="商城" value="1" />
                        <el-option label="全局套" value="2" />
                        <el-option label="打拳套" value="3" />
                        <el-option label="无限池" value="4" />
                        <el-option label="攀塔" value="5" />
                        <el-option label="积分池" value="6" />
                        <el-option label="兑换套" value="7" />
                        <el-option label="发货" value="8" />
                        <el-option label="交易区" value="9" />
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-date-picker v-model="purchValidate.datetimerange" type="datetimerange"
                        value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" clearable size="mini" />
                </el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" size="mini"
                        @click="purchaseRecords">搜索</el-button></el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 3px;">
                    <div style="height: 100%; display: flex;align-items: center;">收入：{{ purchValidate.inMoney }}</div>
                </el-col>
                <el-col :span="1.5" :offset="1" style="margin-top: 3px;">
                    <div style="height: 100%; display: flex;align-items: center;">支出：{{ purchValidate.payMoney }}</div>
                </el-col>
            </el-row>
            <el-table :data="purchValidate.list" max-height="650" style="margin-top: 30px;" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 交易场所 -->
                <el-table-column label="交易场所" align="center" prop="floor">
                    <template slot-scope="scope">
                        <!-- 1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区 -->
                        {{ scope.row.floor }}
                        <el-tag v-if="scope.row.floor == 1">商城</el-tag>
                        <el-tag v-if="scope.row.floor == 2">全局套</el-tag>
                        <el-tag v-if="scope.row.floor == 3">打拳套</el-tag>
                        <el-tag v-if="scope.row.floor == 4">无限池</el-tag>
                        <el-tag v-if="scope.row.floor == 5">攀塔</el-tag>
                        <el-tag v-if="scope.row.floor == 6">积分池</el-tag>
                        <el-tag v-if="scope.row.floor == 7">兑换套</el-tag>
                        <el-tag v-if="scope.row.floor == 8">发货</el-tag>
                        <el-tag v-if="scope.row.floor == 9">交易区</el-tag>
                    </template>
                </el-table-column>
                <!-- 交易方式 -->
                <el-table-column label="交易方式" align="center" prop="tradeType">
                    <template slot-scope="scope">
                        {{ scope.row.type == 1 ? "微信支付" : scope.row.type == 2 ? "余额支付" : scope.row.type == 3 ? "辰币支付" :
                            scope.row.type == 4 ? "商品兑换" : "" }}
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
                <el-table-column label="支付前余额" align="center" prop="oldMoney">
                    <template slot-scope="scope">{{ scope.row.floor == 7 ? '/' : scope.row.oldMoney }}</template>
                </el-table-column>
                <!-- 支付后余额 -->
                <el-table-column label="支付后余额" align="center" prop="newMoney">
                    <template slot-scope="scope">{{ scope.row.floor == 7 ? '/' : scope.row.newMoney }}</template>
                </el-table-column>
                <!-- 交易商品名称 -->
                <el-table-column label="交易商品名称" align="center" prop="commodityName">
                    <template slot-scope="scope">
                        <el-popover placement="right" trigger="click">
                            <el-table v-if="scope.row.commodityList && scope.row.commodityList.length"
                                :data="scope.row.commodityList" border size="mini">
                                <el-table-column width="200" property="commodityName" label="商品名称"
                                    show-overflow-tooltip />
                                <el-table-column label="商品等级" align="center" property="levelName" />
                                <el-table-column label="中奖数量" align="center" property="totalNum" />
                                <el-table-column label="中奖总价" align="center" property="totalPrice">
                                    <template slot-scope="scope">
                                        {{ Number(scope.row.totalPrice) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="商品图片" align="center" property="faceImg">
                                    <template slot-scope="scope">
                                        <ImagePreview :src="scope.row.faceImg" width="35px" height="35px" />
                                    </template>
                                </el-table-column>
                            </el-table>
                            <el-button slot="reference" type="primary" size="mini">查看</el-button>
                        </el-popover>
                    </template>
                </el-table-column>
                <!-- 交易人昵称/被交易人 -->
                <el-table-column label="交易人昵称/被交易人" align="center" prop="nickName" width="150">
                    <template slot-scope="scope">
                        {{ scope.row.nickName ? scope.row.nickName : "平台" }}
                    </template>
                </el-table-column>
                <!-- 头像 -->
                <el-table-column label="头像" align="center" prop="wxAvatar">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.wxAvatar" :width="35" :height="35" />
                    </template>
                </el-table-column>
                <!-- 交易时间 -->
                <el-table-column label="交易时间" align="center" prop="createTime" width="150" />
            </el-table>
            <pagination v-show="purchValidate.total > 0" small :total="purchValidate.total"
                :page.sync="purchValidate.pageNum" :limit.sync="purchValidate.pageSize" @pagination="purchaseRecords" />
        </el-dialog>
        <!-- 积分记录 -->
        <el-dialog title="积分记录" :visible.sync="integValidate.type" v-if="integValidate.type" width="1150px"
            append-to-body>
            <el-row>
                <el-col :span="1.5">
                    <el-date-picker v-model="integValidate.datetimerange" type="datetimerange"
                        value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" clearable size="mini" style="width: 240px" />
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="integValidate.floor" placeholder="请选择交易场所" clearable size="mini">
                        <el-option label="商城" value="1" />
                        <el-option label="全局套" value="2" />
                        <el-option label="打拳套" value="3" />
                        <el-option label="无限池" value="4" />
                        <el-option label="攀塔" value="5" />
                        <el-option label="充值" value="6" />
                        <el-option label="积分池" value="7" />
                        <el-option label="下级反馈" value="9" />
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="integValidate.orderState" placeholder="请选择排序" clearable size="mini">
                        <el-option label="升序" value="1" />
                        <el-option label="降序" value="0" />
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" size="mini"
                        @click="integralRecord">搜索</el-button></el-col>
                <el-col :span="1.5" :offset="1">
                    <div style="height: 100%; display: flex;align-items: center;">收入：{{ integValidate.inIntegral }}
                    </div>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <div style="height: 100%; display: flex;align-items: center;">支出：{{ integValidate.payIntegral }}
                    </div>
                </el-col>
            </el-row>
            <el-table :data="integValidate.list" style="margin-top: 30px;" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <!-- 交易场所 -->
                <el-table-column label="交易场所" align="center" prop="floor">
                    <template slot-scope="scope">
                        <!-- 1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，6-积分池 -->
                        <el-tag v-if="scope.row.floor == 1">商城</el-tag>
                        <el-tag v-if="scope.row.floor == 2">全局套</el-tag>
                        <el-tag v-if="scope.row.floor == 3">打拳套</el-tag>
                        <el-tag v-if="scope.row.floor == 4">无限池</el-tag>
                        <el-tag v-if="scope.row.floor == 5">攀塔</el-tag>
                        <el-tag v-if="scope.row.floor == 6">充值</el-tag>
                        <el-tag v-if="scope.row.floor == 7">积分池</el-tag>
                        <el-tag v-if="scope.row.floor == 9">下级反馈积分</el-tag>
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
                <el-table-column label="交易商品名称" align="center" prop="commodityName" width="150" show-overflow-tooltip />
                <!-- 交易商品图片 -->
                <el-table-column label="交易商品图片" align="center" prop="img">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.img" :width="35" :height="35" />
                    </template>
                </el-table-column>
                <!-- 交易时间 -->
                <el-table-column label="交易时间" align="center" prop="createTime" width="150" />
            </el-table>
            <pagination v-show="integValidate.total > 0" small :total="integValidate.total"
                :page.sync="integValidate.pageNum" :limit.sync="integValidate.pageSize" @pagination="integralRecord" />
        </el-dialog>
        <!-- 发货记录 -->
        <el-dialog title="发货记录" :visible.sync="shipValidate.type" v-if="shipValidate.type" width="1220px"
            append-to-body>
            <el-table :data="shipValidate.list" max-height="650" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="商品名称" align="center" prop="commodityName">
                    <template slot-scope="scope">
                        <el-popover placement="right" trigger="click">
                            <el-table v-if="scope.row.commodityName"
                                :data="scope.row.commodityName.split(',').map(item => { return { commodityName: item } })"
                                border size="mini">
                                <el-table-column width="400" property="commodityName" align="center"
                                    label="商品名称"></el-table-column>
                            </el-table>
                            <el-button slot="reference" type="primary" size="mini">查看</el-button>
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column label="商品数量" align="center" prop="num" />
                <el-table-column label="商品总价" align="center" prop="totalMoney" />
                <el-table-column label="物流单号" align="center" prop="logisticsNo" />
                <el-table-column label="物流公司" align="center" prop="logisticsCompany" show-overflow-tooltip
                    width="150" />
                <el-table-column label="收货人姓名" align="center" prop="name" width="90" />
                <el-table-column label="收获人手机号" align="center" prop="phone" width="100" />
                <el-table-column label="收货人地区" align="center" prop="region" show-overflow-tooltip width="150" />
                <el-table-column label="收货人地址" align="center" prop="address" show-overflow-tooltip width="150" />
                <el-table-column label="发货时间" align="center" prop="updateTime">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" align="center" prop="status">
                    <template slot-scope="scope">
                        <template
                            v-for="(item, index) in [{ value: 0, label: '待审核' }, { value: 1, label: '审核通过' }, { value: 2, label: '审核不通过' }]">
                            <el-tag v-if="item.value == scope.row.status" :key="index"
                                :type="item.value === 2 ? 'danger' : item.value === 1 ? 'success' : ''">{{ item.label
                                }}</el-tag>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
            <pagination v-show="shipValidate.total > 0" small :total="shipValidate.total"
                :page.sync="shipValidate.pageNum" :limit.sync="shipValidate.pageSize" @pagination="shippingRecords" />
        </el-dialog>
        <!-- 背包 -->
        <el-dialog title="背包" :visible.sync="packageValidate.type" v-if="packageValidate.type" width="950px"
            append-to-body>
            <el-row>
                <el-col :span="1.5">
                    <el-select v-model="packageValidate.cmType" clearable size="mini">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="预售" value="1"></el-option>
                        <el-option label="现货" value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="packageValidate.orderType" clearable size="mini">
                        <el-option label="时间" :value="1"></el-option>
                        <el-option label="价格" :value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-select v-model="packageValidate.openOrFold" clearable size="mini">
                        <el-option label="展开" :value="1"></el-option>
                        <el-option label="折叠" :value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1.5" :offset="1"><el-button type="primary" @click="getUserPackage"
                        size="mini">搜索</el-button></el-col>
            </el-row>
            <el-table :data="packageValidate.list" max-height="650" style="margin-top: 20px;" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="商品名称" align="center" prop="commodityName" width="200" show-overflow-tooltip />
                <!-- 商品图片 -->
                <el-table-column label="商品图片" align="center" prop="commodityImg">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.commodityImg" :width="35" :height="35" />
                    </template>
                </el-table-column>
                <el-table-column label="商品数量" align="center" prop="num" v-if="packageValidate.openOrFold == 2" />
                <el-table-column label="商品总价" align="center" prop="price" sortable />
                <!-- 商品等级 -->
                <el-table-column label="商品等级" align="center" prop="levelName" />
                <!-- 操作 -->
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" v-if="packageValidate.openOrFold == 1"
                            @click="handleSubUser(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <pagination v-if="packageValidate.openOrFold == 1" small v-show="packageValidate.total > 0"
                :total="packageValidate.total" :page.sync="packageValidate.pageNum"
                :limit.sync="packageValidate.pageSize" @pagination="getUserPackage" />
        </el-dialog>
        <el-dialog title="下级用户" :visible.sync="subUserValidate.type" v-if="subUserValidate.type" width="600px"
            append-to-body>
            <el-table :data="subUserValidate.list" max-height="650" border size="mini">
                <!-- 序号 -->
                <el-table-column label="序号" type="index" align="center" width="55" />
                <el-table-column label="ID" align="center" prop="userId" />
                <el-table-column label="头像" align="center">
                    <template slot-scope="scope">
                        <ImagePreview :src="scope.row.avatar" :width="35" :height="35" />
                    </template>
                </el-table-column>
                <el-table-column label="昵称" align="center" prop="nickName" />
                <el-table-column label="积分奖励" align="center" prop="integral" />
            </el-table>
            <pagination v-show="subUserValidate.total > 0" small :total="subUserValidate.total"
                :page.sync="subUserValidate.pageNum" :limit.sync="subUserValidate.pageSize"
                @pagination="subordinateUsers" />
        </el-dialog>
    </div>
</template>

<script>
import Big from 'big.js';
import { listBag } from "@/api/bag/bag";
import { addBagRecord } from "@/api/bagRecord/bagRecord";
import { listCommodity } from "@/api/commodity/commodity";
import {
    listWxUser,
    getWxUser,
    delWxUser,
    addWxUser,
    updateWxUser,
    updateWxUserDate,
    giveGoods,
    getBalance,
    delCase,
    listGivenGoods,
    listTradeRecord,
    listPresent,
    listIntegralRecord,
    listSendRecord,
    listTradeStatistics,
    listPresentStatistics,
    listIntegralRecordStatistics,
    listUserPackage,
    getNextUsers,
    clearTheFlowingWater,
    resetUser
} from "@/api/wxUser/wxUser";

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
                // balance: null,
                // integral: null,
                historyIntegral: null,
                // water: null,
                isWarter: null,
                userId: null,
                params: {
                    water: null,
                    level: null,
                    balance: null,
                    integral: null,
                    totalPrice: null,
                }
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
            },
            loss: null,
            coin: null,
            water: null,
            level: null,
            balance: null,
            integral: null,
            totalPrice: null,
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
                floor: null,
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
                floor: null,
                orderState: null,
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
            // 总余额
            totalBalance: 0,
            // 辰币余额
            coinTotal: 0,
            // 总积分
            totalScore: 0,
            // 背包总余额
            totalBalBack: 0,
            giveImg: null,
            // 查询充值记录条件
            rechargeRecord: {
                type: null,
                status: null,
                moneyType: null,
                createTime: [],
                list: []
            }
        };
    },
    created() {
        this.getList();
    },
    computed: {
        totalValue() {
            let val = 0;
            if (this.rechargeRecord.list && this.rechargeRecord.list.length) {
                this.rechargeRecord.list.forEach(item => {
                    val += Number(item.money);
                });
            };
            return val;
        }
    },
    methods: {
        // 查询充值记录
        rechClickQuery() {
            let arr = [];
            console.log(this.rechargeRecord.type == "", "PPP");
            if (this.rechargeRecord.type == "") this.rechargeRecord.type = null;
            if (this.rechargeRecord.status == '') this.rechargeRecord.status = null;
            if (this.rechargeRecord.moneyType == '') this.rechargeRecord.moneyType = null;
            if (this.rechargeRecord.createTime == null) this.rechargeRecord.createTime = [];

            this.info.wxUserRecharges.forEach(item => {
                if (this.rechargeRecord.type == null && this.rechargeRecord.status == null && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length == 0) {
                    arr.push(item);
                };
                if (this.rechargeRecord.type && this.rechargeRecord.status == null && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length == 0) {
                    if (item.type == this.rechargeRecord.type) arr.push(item);
                };
                if (this.rechargeRecord.type == null && this.rechargeRecord.status && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length == 0) {
                    if (item.status == this.rechargeRecord.status) arr.push(item);
                };
                if (this.rechargeRecord.type == null && this.rechargeRecord.status == null && this.rechargeRecord.moneyType && this.rechargeRecord.createTime.length == 0) {
                    if (item.moneyType == this.rechargeRecord.moneyType) arr.push(item);
                }
                if (this.rechargeRecord.type == null && this.rechargeRecord.status == null && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length) {
                    let a = new Date(item.createTime).getTime();
                    let b = new Date(this.rechargeRecord.createTime[0]).getTime();
                    let c = new Date(this.rechargeRecord.createTime[1]).getTime();
                    if (a >= b && a <= c) arr.push(item);
                };
                // 1 2
                if (this.rechargeRecord.type && this.rechargeRecord.status && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length == 0) {
                    if (item.type == this.rechargeRecord.type && item.status == this.rechargeRecord.status) arr.push(item);
                };
                // 1 3
                if (this.rechargeRecord.type && this.rechargeRecord.status == null && this.rechargeRecord.moneyType && this.rechargeRecord.createTime.length == 0) {
                    if (item.type == this.rechargeRecord.type && item.moneyType == this.rechargeRecord.moneyType) arr.push(item);
                };
                // 2 3
                if (this.rechargeRecord.type == null && this.rechargeRecord.status && this.rechargeRecord.moneyType && this.rechargeRecord.createTime.length == 0) {
                    if (item.status == this.rechargeRecord.status && item.moneyType == this.rechargeRecord.moneyType) arr.push(item);
                };
                // 1 2 3
                if (this.rechargeRecord.type && this.rechargeRecord.status && this.rechargeRecord.moneyType && this.rechargeRecord.createTime.length == 0) {
                    if (item.type == this.rechargeRecord.type && item.status == this.rechargeRecord.status && item.moneyType == this.rechargeRecord.moneyType) arr.push(item);
                }
                // 1 4
                if (this.rechargeRecord.type && this.rechargeRecord.status == null && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length) {
                    if (item.type == this.rechargeRecord.type) {
                        let a = new Date(item.createTime).getTime();
                        let b = new Date(this.rechargeRecord.createTime[0]).getTime();
                        let c = new Date(this.rechargeRecord.createTime[1]).getTime();
                        if (a >= b && a <= c) arr.push(item);
                    }
                };
                // 2 4
                if (this.rechargeRecord.type == null && this.rechargeRecord.status && this.rechargeRecord.moneyType == null && this.rechargeRecord.createTime.length) {
                    if (item.status == this.rechargeRecord.status) {
                        let a = new Date(item.createTime).getTime();
                        let b = new Date(this.rechargeRecord.createTime[0]).getTime();
                        let c = new Date(this.rechargeRecord.createTime[1]).getTime();
                        if (a >= b && a <= c) arr.push(item);
                    }
                };
                // 3 4
                if (this.rechargeRecord.type == null && this.rechargeRecord.status == null && this.rechargeRecord.moneyType && this.rechargeRecord.createTime.length) {
                    if (item.moneyType == this.rechargeRecord.moneyType) {
                        let a = new Date(item.createTime).getTime();
                        let b = new Date(this.rechargeRecord.createTime[0]).getTime();
                        let c = new Date(this.rechargeRecord.createTime[1]).getTime();
                        if (a >= b && a <= c) arr.push(item);
                    }
                };
                // 1 2 3 4
                if (this.rechargeRecord.type && this.rechargeRecord.status && this.rechargeRecord.moneyType && this.rechargeRecord.createTime.length) {
                    if (item.type == this.rechargeRecord.type && item.status == this.rechargeRecord.status) {
                        let a = new Date(item.createTime).getTime();
                        let b = new Date(this.rechargeRecord.createTime[0]).getTime();
                        let c = new Date(this.rechargeRecord.createTime[1]).getTime();
                        if (a >= b && a <= c) arr.push(item);
                    }
                };
            });
            this.rechargeRecord.list = [...arr];
        },
        copyText(textToCopy) {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.$message.success('复制成功');
            } catch (err) {
                this.$message.error('复制失败');
            }
            document.body.removeChild(textArea);
        },
        giveChange(id) {
            id ? this.commodityList.forEach(item => {
                if (item.id == id) this.giveImg = item.faceImg;
            }) : this.giveImg = null;
        },
        /** 查询小程序用户信息列表 */
        getList() {
            this.loading = true;
            if (this.water) {
                this.queryParams.params.water = this.water;
            } else {
                this.queryParams.params.water = null;
            };
            if (this.level) {
                this.queryParams.params.level = this.level;
            } else {
                this.queryParams.params.level = null;
            };
            if (this.balance) {
                this.queryParams.params.balance = this.balance;
            } else {
                this.queryParams.params.balance = null;
            };
            if (this.integral) {
                this.queryParams.params.integral = this.integral;
            } else {
                this.queryParams.params.integral = null;
            };
            if (this.totalPrice) {
                this.queryParams.params.totalPrice = this.totalPrice;
            } else {
                this.queryParams.params.totalPrice = null;
            };
            if (this.coin) {
                this.queryParams.params.coin = this.coin;
            } else {
                this.queryParams.params.coin = null;
            };
            if (this.loss) {
                this.queryParams.params.loss = this.loss;
            } else {
                this.queryParams.params.loss = null;
            };
            listWxUser(this.addDateRange(this.queryParams, this.daterange)).then(response => {
                this.wxUserList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
            this.getTotal();
        },
        // 获取计算总计
        getTotal() {
            listWxUser({ pageNum: 1, pageSize: 10000 }, false).then(response => {
                this.coinTotal = 0;
                this.totalScore = 0;
                this.totalBalance = 0;
                this.totalBalBack = 0;
                response.rows.map((item, index) => {
                    if (item.isInner != 1 && item.isWarter != 0) {
                        const a = new Big(this.totalScore);
                        const b = new Big(this.totalBalance);
                        const c = new Big(this.totalBalBack);
                        const d = new Big(Number(item.integral));
                        const e = new Big(Number(item.balance));
                        const f = new Big(Number(item.totalPrice));
                        const g = new Big(Number(item.coin));
                        const h = new Big(Number(this.coinTotal));
                        this.coinTotal = Number(h.plus(g).toString());
                        this.totalScore = Number(a.plus(d).toString());
                        this.totalBalance = Number(b.plus(e).toString());
                        this.totalBalBack = Number(c.plus(f).toString());
                        // this.getBagList(item.openId, index == response.rows.length - 1);
                    }
                    return item;
                });
            });
        },
        // 查询背包所有数据
        // getBagList(openId, type) {
        //     listUserPackage({ cmType: '', orderType: 1, openOrFold: 2, openId }, false).then(response => {
        //         response.rows.forEach(item => {
        //             const a = new Big(this.totalBalBack);
        //             const b = new Big(Number(item.num));
        //             const c = new Big(Number(item.price));
        //             this.totalBalBack = Number(a.plus(Number(b.times(c).toString())).toString());
        //         });
        //     })
        // },
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
                coin: null,
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
            this.water = null;
            this.level = null;
            this.balance = null;
            this.integral = null;
            this.totalPrice = null;
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
            this.rechargeRecord.list = [];
            this.rechargeRecord.type = null;
            this.rechargeRecord.status = null;
            this.rechargeRecord.createTime = [];
            this.kookBalance();
            getWxUser(row.openId).then(response => {
                this.info = response.data;
                this.rechargeRecord.list = response.data.wxUserRecharges;
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
                floor: this.purchValidate.floor,
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
                floor: this.integValidate.floor,
                pageNum: this.integValidate.pageNum,
                pageSize: this.integValidate.pageSize,
                openId: this.integValidate.row.openId,
                orderState: this.integValidate.orderState,
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
        handleSubUser(row) {
            this.$modal.confirm("确定是否删除？").then(() => {
                return resetUser({ id: row.id, delFlag: '2' });
            }).then(() => {
                this.$modal.msgSuccess("删除成功");
                this.packageValidate.pageNum = 1;
                this.getUserPackage();
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
            this.giveVal.row = row;
            this.giveVal.pageNum = 1;
            this.giftReset();
            this.getGivenGoods();
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
                        updateWxUserDate(this.form).then(response => {
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
        },
        // 删除所有流水记录
        removeDate() {
            this.$modal.confirm('是否确认已经导出数据，再清除流水记录？').then(() => {
                return clearTheFlowingWater();
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("清除成功");
            }).catch(() => { });
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
        flex: 1;
        // display: grid;
        // gap: 20px 80px;
        margin-left: 40px;
        box-sizing: border-box;
        // grid-template-columns: repeat(4, 1fr);
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