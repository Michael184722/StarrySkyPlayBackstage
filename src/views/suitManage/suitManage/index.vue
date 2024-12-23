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
            <el-form-item label="上/下架" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择上/下架" clearable>
                    <el-option label="上架" value="1" />
                    <el-option label="下架" value="0" />
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

        <el-table v-loading="loading" :data="suitManageList" border size="mini">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="套封面" align="center" prop="faceImg">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.faceImg" :width="35" :height="35" />
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
            <el-table-column label="查看等级" align="center" prop="levelName">
                <template slot-scope="scope">{{ scope.row.levelName }}~{{ scope.row.levelUpName }}</template>
            </el-table-column>
            <el-table-column label="上下架状态" align="center" prop="status">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" @change="switchChange($event, scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="上架时间" align="center" prop="upTime" width="150" />
            <el-table-column label="操作" align="center" width="260">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['suitManage:suitManage:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="queryLook(scope.row)" v-hasPermi="['suitManage:suitManage:query']">箱子修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['suitManage:suitManage:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改抽赏套管理对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="1600px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="110px">
                <el-form-item label="排序" prop="remark">
                    <el-input v-model="form.remark" type="number" placeholder="请输入排序" />
                </el-form-item>
                <el-form-item label="套名称" prop="suitName">
                    <el-input v-model="form.suitName" placeholder="请输入套名称" />
                </el-form-item>
                <el-form-item label="套类型" prop="suitType">
                    <el-select v-model="form.suitType" placeholder="请选择套类型" clearable style="width: 100%;" @change="suitTypeChange" :disabled="editType">
                        <el-option v-for="(dict, key, index) in suitTypeData" :key="index" :label="dict" :value="key" />
                    </el-select>
                </el-form-item>
                <el-form-item label="单抽价格" prop="price" v-if="form.suitType != 3 && form.suitType != 5" :rules="[{ required: true, message: '请输入单抽价格', trigger: 'blur' }]">
                    <el-input v-model="form.price" type="number" placeholder="请输入单抽价格" />
                </el-form-item>
                <el-form-item label="单抽积分" prop="integral" v-else-if="form.suitType != 5" :rules="[{ required: true, message: '请输入单抽积分', trigger: 'blur' }]">
                    <el-input v-model="form.integral" type="number" placeholder="请输入单抽积分" />
                </el-form-item>
                <!-- 抽奖次数 -->
                <el-form-item label="抽奖次数" prop="lotteryNum">
                    <el-input v-model="form.lotteryNum" type="number" placeholder="请输入抽奖次数" />
                </el-form-item>
                <el-form-item label="箱子数量" prop="boxNum" v-if="form.suitType != 4 && form.suitType != 5" :rules="[{ required: true, message: '请输入箱子数量', trigger: 'blur' }]">
                    <el-input v-model="form.boxNum" type="number" placeholder="请输入盒子数量" :disabled="editType" />
                </el-form-item>
                <el-form-item label="查看等级上限" prop="levelUpId" :rules="[{ required: true, message: '请选择查看等级上限', trigger: 'change' }]">
                    <el-select v-model="form.levelUpId" placeholder="请选择查看等级" style="width: 100%;" :disabled="form.suitType == 5">
                        <el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="查看等级下限" prop="levelId" :rules="[{ required: true, message: '请选择查看等级下限', trigger: 'change' }]">
                    <el-select v-model="form.levelId" placeholder="请选择查看等级" style="width: 100%;" :disabled="form.suitType == 5">
                        <el-option v-for="(item, index) in levelOptions" :key="index" :label="item.level" :value="item.id" />
                    </el-select>
                </el-form-item>
                <!-- 购买按钮设置 -->
                <el-form-item label="购买按钮" v-if="form.suitType != 5" prop="drawNum" :rules="[{ required: true, type: 'array', message: '请添加购买按钮', trigger: 'change' }]">
                    <template v-if="form.drawNum">
                        <el-tag v-for="(tag, index) in form.drawNum" :key="index" closable @click="clickBtn(index)" @close="form.drawNum = form.drawNum.filter((item, i) => index != i)"
                            class="formEltag">
                            <el-input type="number" :ref="'elInput' + (index + 1)" v-if="active == index" :value="tag" size="mini" style="width: 100px;" @blur="drawNumChangeBlur"
                                @input="(e) => form.drawNum = form.drawNum.map((item, i) => index == i ? e : item)" />
                            <span v-else>{{ tag }}</span>
                        </el-tag>
                    </template>
                    <el-button size="mini" type="primary" v-if="form.drawNum && form.drawNum.length < 4"
                        @click="form.drawNum.push(form.drawNum.length == 0 ? 1 : form.drawNum.length == 1 ? form.drawNum[0] + 2 : form.drawNum.length == 2 ? form.drawNum[1] + 2 : form.drawNum.length == 3 ? form.drawNum[2] + 5 : 100)">新增</el-button>
                </el-form-item>
                <!-- 支付方式 -->
                <el-form-item label="支付方式" v-if="form.suitType != 3 && form.suitType != 5" prop="button" :rules="[{ required: true, type: 'array', message: '请选择支付方式', trigger: 'change' }]">
                    <el-checkbox-group v-model="form.button">
                        <el-checkbox label="微信支付"></el-checkbox>
                        <el-checkbox label="星币支付"></el-checkbox>
                        <el-checkbox label="辰币支付"></el-checkbox>
                    </el-checkbox-group>
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
                <el-divider content-position="center" v-if="form.suitType && !editType">抽赏套商品信息</el-divider>
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5" v-if="form.suitType && !editType">
                        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddWxSuitCommodity">添加</el-button>
                    </el-col>
                    <el-col :span="1.5" style="font-size: 18px;" v-if="form.price && form.wxSuitCommodityList.length != 0">期望值：{{ expectedValue.exVal.toFixed(2) }}元</el-col>
                    <el-col :span="1.5" :offset="1" style="font-size: 18px;" v-if="form.price && form.wxSuitCommodityList.length != 0">盈利/亏损：{{ expectedValue.profitAndLoss.toFixed(2) }}元</el-col>
                </el-row>
                <el-form-item prop="wxSuitCommodityList" label-width="10px" v-if="form.suitType && !editType">
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
                        <el-table-column label="商品倍数" prop="multiple" align="center" v-if="form.suitType == 4 || form.suitType == 5" />
                        <el-table-column label="商品概率" prop="reference" align="center" />
                        <el-table-column label="商品数量" prop="num" v-if="form.suitType != 4 && form.suitType != 5" align="center">
                            <template slot-scope="scope">
                                <template v-if="scope.row.num && scope.row.num != 0">{{ scope.row.num }}</template>
                                <el-form-item v-else :prop="'wxSuitCommodityList.' + scope.$index + '.num'" :rules="{ required: true, message: '请输入商品数量', trigger: 'blur' }">
                                    <el-input v-model="scope.row.num" placeholder="请输入商品数量" />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <template v-if="form.suitType == 4 || form.suitType == 5">
                            <el-table-column label="是否双倍赠送" align="center">
                                <template slot-scope="scope">
                                    <el-switch v-model="scope.row.isDouble" active-value="1" inactive-value="0" :disabled="scope.row.isSend == 1" />
                                    <!-- @change="switchTypeChange($event, scope.row, 'isDouble')" -->
                                </template>
                            </el-table-column>
                        </template>
                        <template v-if="form.suitType == 4 || form.suitType == 5">
                            <el-table-column label="赠送次数" align="center" width="160">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.sendNum" size="mini" type="number" placeholder="请输入赠送次数" />
                                    <!-- @blur="switchTypeChange($event, scope.row, 'sendNum')" -->
                                </template>
                            </el-table-column>
                        </template>
                        <el-table-column label="特效" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.isSpecial" active-value="1" inactive-value="0" />
                                <!-- @change="switchTypeChange($event, scope.row, 'isDouble')" -->
                            </template>
                        </el-table-column>
                        <el-table-column label="是否售卖" prop="isSale" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.isSale" active-value="1" inactive-value="0" :disabled="form.suitType == 4 || form.suitType == 5"
                                    @change="sellChange($event, scope.row)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="是否赠送" prop="isSend" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.isSend" active-value="1" inactive-value="0" :disabled="form.suitType == 4 || form.suitType == 5 || scope.row.isDouble == 1"
                                    @change="giftsChange($event, scope.row)" />
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
                    <el-select v-model="commodityForm.commodityId" filterable placeholder="请选择商品名称" style="width: 100%;" @change="commodityChange(true)">
                        <el-option v-for="dict in goodsOptions" :key="dict.id" :label="dict.commodityName + '(' + dict.price + '元) + ' + dict.levelName" :value="dict.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品等级">
                    <el-input :value="queryProducts(commodityForm.commodityId, 'levelName')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品单价">
                    <el-input :value="queryProducts(commodityForm.commodityId, 'price')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品数量" prop="num" v-if="form.suitType != 4 && form.suitType != 5" :rules="[{ required: true, message: '请输入商品数量', trigger: 'blur' }]">
                    <el-input v-model="commodityForm.num" type="number" placeholder="请输入商品数量" />
                </el-form-item>
                <el-form-item label="参考价" prop="referencePrice">
                    <el-input v-model="commodityForm.referencePrice" type="number" placeholder="请输入商品参考价" />
                </el-form-item>
                <el-form-item label="抽中倍数" prop="multiple" v-if="form.suitType == 4 || form.suitType == 5" :rules="[{ required: true, message: '请输入抽中倍数', trigger: 'blur' }]">
                    <el-input v-model="commodityForm.multiple" type="number" placeholder="请输入倍数" :maxlength="10"
                        @input="commodityForm.multiple = commodityForm.multiple.replace(/[^0-9]/g, '').slice(0, 10)"></el-input>
                </el-form-item>
                <el-form-item label="抽中概率" prop="reference">
                    <el-input v-model="commodityForm.reference" type="number" max="100" placeholder="请输入抽中概率" @input="(val) => { commodityForm.reference = val <= 100 ? val : 100 }">
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
        <el-dialog title="套信息" :visible.sync="openInfo" width="1200px" append-to-body class="suitManage">
            <h3>基本信息</h3>
            <div class="sm-info">
                <div>套名称：{{ lookInfo.suitName }}</div>
                <div>
                    套类型：{{ lookInfo.suitType == 1 ? "全局套" : lookInfo.suitType == 2 ? "打拳套" : lookInfo.suitType == 3 ? "积分池" : lookInfo.suitType == 4 ? "无限池" : lookInfo.suitType == 5 ? "隐藏无限池" : "/" }}
                </div>
                <div v-if="lookInfo.suitType == 3">单抽积分：{{ lookInfo.integral }}积分</div>
                <div v-else>单抽价格：{{ lookInfo.price }}元</div>
                <div>查看等级：{{ lookInfo.levelName }}~{{ lookInfo.levelUpName }}</div>
                <div>上下架：{{ lookInfo.status == 1 ? "上架" : "下架" }}</div>
            </div>
            <el-row :gutter="10" class="mb8" style="margin-top: 30px;">
                <el-col :span="1.5" style="font-size: 18px;" v-if="form.price && form.wxSuitCommodityList.length != 0">期望值：{{ expectedValue.exVal.toFixed(2) }}元</el-col>
                <el-col :span="1.5" :offset="1" style="font-size: 18px;" v-if="form.price && form.wxSuitCommodityList.length != 0">盈利/亏损：{{ expectedValue.profitAndLoss.toFixed(2) }}元</el-col>
            </el-row>
            <h3 style="margin-top: 35px; display: flex; align-items: center;">
                <div>箱子列表（{{ lookInfo.mapList ? lookInfo.mapList.length : 0 }}个）</div>
                <el-button type="primary" size="mini" style="margin-left: 20px;" @click="addNewBox">新增箱子</el-button>
                <el-input v-model="setBoxNum" size="mini" type="number" placeholder="请输入新增数量" style="width: 200px; margin-left: 20px;" />
                <el-button @click="deleAll" size="mini" type="danger" style="margin-left: 20px;">批量删除</el-button>
            </h3>
            <div class="sm-list" v-if="lookInfo.mapList">
                <div class="sm-list-item" v-for="(item, index) in lookInfo.mapList" :key="index">
                    <ImagePreview ref="ImageFace1" :src="lookInfo.faceImg" width="160px" height="150px" />
                    <div style="margin: 10px 0" v-if="item.commodityList[0]">箱子&nbsp;-&nbsp;{{ item.commodityList[0].boxIndex }}</div>
                    <div style="margin: 10px 0" v-else>空箱子</div>
                    <div class="sm-list-item-Fun">
                        <i class="el-icon-zoom-in" style="color: #FFF; font-size: 30px;" v-if="lookInfo.faceImg" @click="lookImage('ImageFace', 1)"></i>
                        <i class="el-icon-edit-outline" style="color: #409EFF; font-size: 30px;" @click="editClick(item, index)"></i>
                        <i class="el-icon-download" style="color: #E6A23C; font-size: 30px;" @click="updateClick(index)"></i>
                        <i class="el-icon-delete" style="color: #F56C6C; font-size: 30px;" @click="deleteBox(item, index)"></i>
                        <!-- v-if="item.commodityList[0] && !item.commodityList[0].id" -->
                    </div>
                </div>
            </div>
            <div class="dialog-submit">
                <el-button type="primary" @click="addProductsToTheBox">确 定</el-button>
                <el-button @click="cancelAddingNewProductsToTheBox">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 箱子详情 -->
        <el-dialog title="箱子信息" :visible.sync="boxType" width="1800px" append-to-body class="suitManage">
            <el-divider content-position="center">箱子新增商品</el-divider>
            <h3>
                商品
                <el-button type="primary" size="mini" style="margin-left: 20px;" @click="addNewGoods">新增商品</el-button>
            </h3>
            <div class="sm-list" style="grid-template-columns: repeat(6, 1fr); gap: 20px 48px;">
                <div class="sm-list-item" v-for="(item, index) in boxInfo.commodityList" :key="index" style="border-radius: 10px;text-align: left;">
                    <ImagePreview :ref="'ImagePreview' + (index + 1)" :src="item.faceImg" width="250px" height="250px" />
                    <div class="sm-list-item-text">{{ item.commodityName }}</div>
                    <div class="sm-list-item-text">
                        <div>原价：{{ item.price }} 元</div>
                        <div>参考价：{{ item.referencePrice }} 元</div>
                    </div>
                    <div class="sm-list-item-text">
                        <div>倍数：{{ item.multiple }}</div>
                        <div>概率：{{ item.reference ? item.reference + "%" : "" }}</div>
                    </div>
                    <div class="sm-list-item-text">
                        <div>等级：{{ item.typeName }}</div>
                    </div>
                    <div class="sm-list-item-text">备注：{{ item.remark }} </div>

                    <div class="sm-list-item-salesType" v-if="lookInfo.suitType == 4 && item.isDouble == 1">双倍赠送<span v-if="item.isSpecial == 1"> / 特效</span></div>
                    <div class="sm-list-item-salesType" v-else-if="item.isSend == 1">赠送<span v-if="item.isSpecial == 1"> / 特效</span></div>
                    <div class="sm-list-item-salesType" v-else-if="item.isSale == 1">售卖<span v-if="item.isSpecial == 1"> / 特效</span></div>

                    <div class="sm-list-item-type" v-if="lookInfo.suitType != 4 && lookInfo.suitType != 5">{{ item.num }}&nbsp;/&nbsp;{{ item.totalNum }}</div>
                    <div class="sm-list-item-tips" v-if="lookInfo.suitType != 4 && lookInfo.suitType != 5 && item.num == 0">已售完</div>
                    <div class="sm-list-item-Fun">
                        <i class="el-icon-zoom-in" style="color: #FFF; font-size: 30px;" v-if="item.faceImg" @click="lookImage('ImagePreview', index + 1)"></i>
                        <i class="el-icon-edit-outline" style="color: #409EFF; font-size: 30px;" @click="editGoods(item, index)"></i>
                        <i class="el-icon-delete" style="color: #F56C6C; font-size: 30px;" @click="delGoods(item, index)"></i>
                    </div>
                </div>
            </div>
            <div class="dialog-submit" style="margin-bottom: 100px;">
                <el-button @click="boxType = false">关 闭</el-button>
            </div>
            <el-divider content-position="center">箱子抽赏信息</el-divider>
            <h3 style="margin-top: 35px">中赏排行</h3>
            <el-table :data="rankValstate.list" border>
                <el-table-column label="ID" align="center" prop="userId" />
                <el-table-column label="排名" align="center">
                    <template slot-scope="scope">
                        {{ scope.$index + 1 }}
                    </template>
                </el-table-column>
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
            <!-- 本地分页 -->
            <div class="pagination" style="display: flex; justify-content: flex-end; margin: 40px auto;">
                <pagination v-show="rankValstate.total > 0" :total="rankValstate.total" :page.sync="rankValstate.pageNum" :limit.sync="rankValstate.pageSize" @pagination="getRankList" />
            </div>

            <h3 style="margin-top: 35px">中赏记录</h3>
            <el-row>
                <el-col :span="1.5">
                    <el-input type="text" v-model="nickName" placeholder="请输入昵称" clearable />
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-input type="text" v-model="commodityName" placeholder="请输入商品名称" clearable />
                </el-col>
                <el-col :span="1.5" :offset="1">
                    <el-button type="primary" @click="recordValstate.pageNum = 1; getRecordList()">搜索</el-button>
                </el-col>
            </el-row>
            <el-table :data="recordValstate.list" border style="margin-top: 10px;">
                <el-table-column label="序号" type="index" align="center" />
                <el-table-column label="ID" align="center" prop="userId" />
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
            <!-- 本地分页 -->
            <div class="pagination" style="display: flex; justify-content: flex-end; margin: 40px auto;">
                <pagination v-show="recordValstate.total > 0" :total="recordValstate.total" :page.sync="recordValstate.pageNum" :limit.sync="recordValstate.pageSize" @pagination="getRecordList" />
            </div>
        </el-dialog>

        <!-- 新增盒子商品 -->
        <el-dialog title="新增商品" :visible.sync="openGoodType" width="1200px" append-to-body class="suitManage">
            <el-form ref="boxProductForm" :model="boxProductForm" :rules="boxProductRules" label-width="120px">
                <el-form-item label="商品名称1" prop="commodityId">
                    <el-select v-model="boxProductForm.commodityId" filterable placeholder="请选择商品名称" style="width: 100%;" @change="commodityChange(false)">
                        <el-option v-for="dict in goodsOptions" :key="dict.id" :label="dict.commodityName + '(' + dict.price + '元) - ' + dict.levelName" :value="dict.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品等级">
                    <el-input :value="queryProducts(boxProductForm.commodityId, 'levelName')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品单价">
                    <el-input :value="queryProducts(boxProductForm.commodityId, 'price')" placeholder="请选择商品" disabled />
                </el-form-item>
                <el-form-item label="商品数量" prop="num" v-if="lookInfo.suitType != 4 && lookInfo.suitType != 5" :rules="[{ required: true, message: '请输入商品数量', trigger: 'blur' }]">
                    <el-input v-model="boxProductForm.num" type="number" placeholder="请输入商品数量" />
                </el-form-item>
                <el-form-item label="抽中倍数" prop="multiple" v-if="lookInfo.suitType == 4 || lookInfo.suitType == 5" :rules="[{ required: true, message: '请输入抽中倍数', trigger: 'blur' }]">
                    <el-input v-model="boxProductForm.multiple" type="number" placeholder="请输入倍数" :maxlength="10"
                        @input="boxProductForm.multiple = boxProductForm.multiple.replace(/[^0-9]/g, '').slice(0, 10)"></el-input>
                </el-form-item>
                <el-form-item label="参考价" prop="referencePrice">
                    <el-input v-model="boxProductForm.referencePrice" type="number" placeholder="请输入商品参考价" />
                </el-form-item>
                <el-form-item label="抽中概率" prop="reference">
                    <el-input v-model="boxProductForm.reference" type="number" max="100" placeholder="请输入抽中概率" @input="(val) => { boxProductForm.reference = val <= 100 ? val : 100 }">
                        <template slot="append">%</template>
                    </el-input>
                </el-form-item>
                <!-- 是否售卖 -->
                <el-form-item label="是否售卖" prop="isSale" :rules="[{ required: true, message: '请选择是否售卖', trigger: 'change' }]">
                    <el-radio-group v-model="boxProductForm.isSale" style="margin-top: 10px" :disabled="lookInfo.suitType == 4"
                        @input="boxProductForm.isSale == '1' ? boxProductForm.isSend = '0' : boxProductForm.isSend = '1'">
                        <el-radio label="1">是</el-radio>
                        <el-radio label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!-- 是否赠送 -->
                <el-form-item label="是否赠送" prop="isSend" :rules="[{ required: true, message: '请选择是否赠送', trigger: 'change' }]" v-if="lookInfo.suitType != 4">
                    <el-radio-group v-model="boxProductForm.isSend" style="margin-top: 10px" :disabled="lookInfo.suitType == 4"
                        @input="boxProductForm.isSend == '1' ? boxProductForm.isSale = '0' : boxProductForm.isSale = '1'">
                        <el-radio label="1">是</el-radio>
                        <el-radio label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!-- 是否双倍赠送 -->
                <el-form-item label="是否双倍赠送" prop="isDouble" v-if="lookInfo.suitType == 4" :rules="[{ required: true, message: '请选择是否双倍赠送', trigger: 'change' }]">
                    <el-radio-group v-model="boxProductForm.isDouble" style="margin-top: 10px">
                        <el-radio label="1">是</el-radio>
                        <el-radio label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="是否开启特效" prop="isSpecial" :rules="[{ required: true, message: '请选择是否开启特效', trigger: 'change' }]">
                    <el-radio-group v-model="boxProductForm.isSpecial" style="margin-top: 10px">
                        <el-radio label="1">是</el-radio>
                        <el-radio label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!-- 赠送次数 -->
                <el-form-item label="赠送次数" prop="sendNum" v-if="boxProductForm.isDouble == 1" :rules="[{ required: true, message: '请输入赠送次数', trigger: 'blur' }]">
                    <el-input v-model="boxProductForm.sendNum" type="number" placeholder="请输入赠送次数" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="boxProductForm.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <!-- 商品图片-->
                <el-form-item label="商品图片">
                    <ImagePreview :src="queryProducts(boxProductForm.commodityId, 'faceImg')" width="300px" :height="boxProductForm.commodityId ? '' : '200px'" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitBoxProductForm">确 定</el-button>
                <el-button @click="cancelBoxProductForm">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { listLevelSet } from "@/api/levelSet/levelSet";
import { listCommodity } from "@/api/commodity/commodity";
import { delSuitCommodity } from "@/api/suitCommodity/suitCommodity";
import { listSuitManage, getSuitManage, delSuitManage, addSuitManage, updateSuitManage, getDetail, updateSuitManageEditBox, delSuitManageBox, listSuitManageRank, listSuitManageRecord } from "@/api/suitManage/suitManage";

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
                status: null,
                suitName: null,
                suitType: null,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                remark: [{ required: true, message: "请输入排序", trigger: "blur" }],
                suitName: [{ required: true, message: "请输入套名称", trigger: "blur" }],
                suitType: [{ required: true, message: "请选择套类型", trigger: "change" }],
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
                5: '隐藏无限池'
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
            levelOptions: [],
            openInfo: false,
            lookInfo: {},
            boxType: false,
            boxInfo: {},
            boxIndex: 0,
            active: null,
            editType: false,
            editRow: {},
            boxProductForm: {},
            boxProductRules: {
                commodityId: [{ required: true, message: "请选择商品", trigger: "change" }],
                referencePrice: [{ required: true, message: "请输入参考价", trigger: "blur" }],
                reference: [{ required: true, message: "请输入抽中概率", trigger: "blur" }],
            },
            openGoodType: false,
            editIndex: null,
            rankValstate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
            },
            recordValstate: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
                list: [],
            },
            setBoxNum: 1,
            nickName: null,
            commodityName: null,
        };
    },
    created() {
        this.getList();
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
                    let reference = item.reference ? Number(this.getPercent(Number(Number(item.reference)))) : 0;
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
        commodityChange(type) {
            type && (this.commodityForm.referencePrice = this.form.suitType == 4 || this.form.suitType == 5 ? this.queryProducts(this.commodityForm.commodityId, 'price') : this.form.suitType == 3 ? this.form.integral : this.form.price);
            !type && (this.boxProductForm.referencePrice = this.lookInfo.suitType == 3 ? this.lookInfo.integral : this.lookInfo.price);
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
                remark: null,
                suitName: null,
                suitType: null,
                price: null,
                integral: null,
                boxNum: 1,
                levelUpId: null,
                levelId: null,
                status: "0",
                upTime: null,
                faceImg: null,
                lotteryNum: 0,
                drawNum: [],
                button: [],
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
        // 按钮设置
        drawNumChangeBlur() {
            this.form.drawNum = this.form.drawNum.map(item => {
                item && (item = Number(item));
                !item && (item = 1);
                item && item < 1 && (item = 1);
                item && item > 10000 && (item = 10000);
                return item;
            });
            this.active = null;
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
            this.editType = false;
            this.getCommodityList();
            this.title = "添加抽赏套管理";
        },
        resetGoods() {
            this.boxProductForm = {
                num: 0,
                commodityId: null,
                referencePrice: null,
                multiple: null,
                reference: null,
                remark: null,
                isSale: null,
                isSend: null,
                isDouble: null,
                sendNum: null,
                isSpecial: null,
            };
            this.resetForm("boxProductForm");
        },
        /** 查看详情 */
        queryLook(row) {
            this.reset();
            this.editRow = row;
            this.setBoxNum = 1;
            const id = row.id || this.ids;
            this.getCommodityList();
            getSuitManage(id).then(response => {
                for (let key in this.form) {
                    this.form[key] = response.data[key];
                };
                this.form.drawNum = response.data.drawNum ? response.data.drawNum.split(',') : [];
                this.form.button = response.data.button ? response.data.button.split(',') : [];
                getDetail(id).then(res => {
                    this.lookInfo = res.data;
                    this.lookInfo.mapList.map(item => {
                        item.commodityList.map(t => {
                            t.oldBoxIndex = t.boxIndex;
                            return t;
                        });
                        return item;
                    });
                    this.openInfo = true;
                });
            });
        },
        // 新增盒子
        addNewBox() {
            this.$modal.confirm('是否确认新增盒子？').then(() => {
                for (let i = 0; i < this.setBoxNum; i++) {
                    let arr = [];
                    let obj = {};
                    if (this.lookInfo.mapList && this.lookInfo.mapList.length) {
                        obj = { ...this.lookInfo.mapList[this.lookInfo.mapList.length - 1] };
                        obj.commodityList.forEach(item => {
                            arr.push({ ...item, id: null, num: item.totalNum, boxIndex: (item.boxIndex + 1) });
                        });
                    } else this.lookInfo.mapList = [];
                    obj.commodityList = arr;
                    this.lookInfo.mapList.push({ ...obj, type: true });
                };
            });
        },
        // 编辑盒子商品信息进行提交
        addProductsToTheBox() {
            this.$modal.confirm('是否确认修改箱子信息？').then(() => {
                let obj = {
                    id: this.lookInfo.id,
                    wxSuitCommodityList: [],
                };
                this.lookInfo.mapList.forEach(item => item.commodityList.forEach(t => obj.wxSuitCommodityList.push({ ...t })));
                updateSuitManageEditBox(obj).then(res => {
                    this.$modal.msgSuccess("修改成功");
                    this.openInfo = false;
                    this.getList();
                });
            });
        },
        // 取消编辑盒子商品信息进行提交
        cancelAddingNewProductsToTheBox() {
            this.openInfo = false;
        },
        // 新增盒子商品
        addNewGoods() {
            this.resetGoods();
            this.commodityReset();
            // lookInfo.suitType == 1 ? "全局套" : lookInfo.suitType == 2 ? "打拳套" : lookInfo.suitType == 3 ? "积分池" : lookInfo.suitType == 4 ? "无限池"
            // if (this.lookInfo.suitType == 1 || this.lookInfo.suitType == 2 || this.lookInfo.suitType == 3) {
            // 是否售卖
            this.boxProductForm.isSale = "1";
            // 是否赠送
            this.boxProductForm.isSend = "0";
            // 是否开启特效
            this.boxProductForm.isSpecial = "0";
            // };
            if (this.lookInfo.suitType == 4) this.boxProductForm.isDouble = '0';
            this.editIndex = null;
            this.openGoodType = true;
        },
        // 查看大图ImagePreview
        lookImage(val, index) {
            this.$refs[val + index][0].$refs.elImage.clickHandler();
        },
        // 修改盒子商品
        editGoods(item, index) {
            this.resetGoods();
            this.commodityReset();
            this.editIndex = index;
            this.boxProductForm = { ...item };
            this.openGoodType = true;
        },
        // 删除商品
        delGoods(row, index) {
            this.$modal.confirm('当前删不进行提交也会删除箱子中的商品，请再次确认是否删除？').then(() => {
                return row.id ? delSuitCommodity(row.id) : this.boxInfo.commodityList.splice(index, 1);
            }).then(() => {
                row.id && this.boxInfo.commodityList.splice(index, 1);
                this.$modal.msgSuccess("删除成功");
            });
        },
        // 箱子修改
        editClick(row, index) {
            this.boxIndex = (index + 1);
            this.boxInfo = { ...row };
            this.rankValstate.pageNum = 1;
            this.recordValstate.pageNum = 1;
            this.nickName = null;
            this.commodityName = null;
            this.getRankList();
            this.getRecordList();
            this.boxType = true;
        },
        updateClick(row, index) {
            this.download('/suitManage/suitManage/exportSuitRecordList', {
                boxIndex: index + 1,
                suitId: this.lookInfo.id,
            }, `${this.lookInfo.suitName + '套的第' + (index + 1) + '箱'}.xlsx`)
        },
        // 查询排行列表
        getRankList() {
            let obj = {
                pageNum: this.rankValstate.pageNum,
                pageSize: this.rankValstate.pageSize,
                suitId: this.lookInfo.id,
                boxIndex: this.boxIndex,
            };

            listSuitManageRank(obj).then(res => {
                this.rankValstate.total = res.total;
                this.rankValstate.list = res.rows;
            });
        },
        // 查询中赏记录
        getRecordList() {
            let obj = {
                nickName: this.nickName,
                commodityName: this.commodityName,
                pageNum: this.recordValstate.pageNum,
                pageSize: this.recordValstate.pageSize,
                suitId: this.lookInfo.id,
                boxIndex: this.boxIndex,
            };
            listSuitManageRecord(obj).then(res => {
                this.recordValstate.total = res.total;
                this.recordValstate.list = res.rows;
            });
        },
        // 箱子删除
        deleteBox(row, index) {
            if (row.commodityList.length == 0) {
                this.$modal.warning("该箱子没有商品，直接提交即可");
                return;
            };
            this.$modal.confirm('当前删除要进行提交，保证箱子下标紊乱，请再次确认是否删除？').then(() => {
                if (!row.type) {
                    delSuitManageBox({ suitId: this.lookInfo.id, boxIndex: row.commodityList[0].oldBoxIndex }).then(res => {
                        this.updateIndexBox(index);
                    });
                }
            })
        },
        updateIndexBox(ind) {
            this.lookInfo.mapList.map((item, index) => {
                if (index > ind) {
                    item.commodityList.map(t => {
                        t.boxIndex = t.boxIndex - 1;
                        return t;
                    });
                }
                return item;
            });
            this.lookInfo.mapList.splice(ind, 1);
            this.$modal.msgSuccess("删除成功");
        },
        deleAll() {
            this.$modal.confirm('是否确定批量删除，删除完成后，请进行提交？').then(() => {
                this.setDelectAll();
            })
        },
        setDelectAll() {
            if (this.lookInfo.mapList.length != 1) {
                delSuitManageBox({ suitId: this.lookInfo.id, boxIndex: this.lookInfo.mapList[1].commodityList[0].oldBoxIndex }).then(res => {
                    this.lookInfo.mapList.splice(1, 1);
                    this.setDelectAll();
                });
            } else this.$modal.msgSuccess("删除成功");
        },
        // 关闭新增商品
        cancelBoxProductForm() {
            this.openGoodType = false;
            this.commodityReset();
        },
        // 给盒子提交新的商品
        submitBoxProductForm() {
            this.$refs["boxProductForm"].validate(valid => {
                if (valid) {
                    let obj = {
                        id: this.boxProductForm.id || null,
                        boxIndex: this.boxIndex,
                        commodityId: this.boxProductForm.commodityId,
                        commodityName: this.queryProducts(this.boxProductForm.commodityId, 'commodityName'),
                        faceImg: this.queryProducts(this.boxProductForm.commodityId, 'faceImg'),
                        isDouble: this.boxProductForm.isDouble,
                        isSale: this.boxProductForm.isSale,
                        isSend: this.boxProductForm.isSend,
                        isSpecial: this.boxProductForm.isSpecial,
                        num: this.boxProductForm.num,
                        price: this.queryProducts(this.boxProductForm.commodityId, 'price'),
                        multiple: this.boxProductForm.multiple,
                        reference: this.boxProductForm.reference,
                        referencePrice: this.boxProductForm.referencePrice,
                        remark: this.boxProductForm.remark,
                        sendNum: this.boxProductForm.sendNum,
                        totalNum: this.lookInfo.suitType != 4 ? this.boxProductForm.num : this.boxProductForm.totalNum,
                        typeName: this.queryProducts(this.boxProductForm.commodityId, 'levelName'),
                    };
                    if (this.editIndex || this.editIndex == 0) {
                        // 修改
                        this.boxInfo.commodityList = this.boxInfo.commodityList.map((item, index) => {
                            if (index == this.editIndex) item = { ...obj };
                            return item;
                        });
                    } else this.boxInfo.commodityList.push({ ...obj });
                    this.$set(this.lookInfo.mapList, this.boxIndex - 1, this.boxInfo);
                    this.openGoodType = false;
                };
            });
        },
        /** 修改按钮操作 */
        async handleUpdate(row) {
            this.reset();
            this.editType = true;
            const id = row.id || this.ids;
            this.getCommodityList();
            await getSuitManage(id).then(response => {
                for (let key in this.form) {
                    this.form[key] = response.data[key];
                };
                this.form.drawNum = response.data.drawNum ? response.data.drawNum.split(',') : [];
                this.form.button = response.data.button ? response.data.button.split(',') : [];
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
                    obj.button = this.form.button.length == 0 ? '' : this.form.button.join(',');
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
                multiple: null,
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
                    if (this.editId) {
                        // 修改提交
                        this.form.wxSuitCommodityList =
                            this.form.wxSuitCommodityList.map(item => item.commodityId === this.editId ? { ...this.commodityForm } : item);
                        this.openGoods = false;
                        console.log(this.form.wxSuitCommodityList, "this.form.wxSuitCommodityList");
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
                            isSpecial: "0"
                        };
                        if (this.form.suitType == 1 || this.form.suitType == 2 || this.form.suitType == 4 || this.form.suitType == 5) {
                            obj.isSale = "1";
                        }
                        this.form.suitType == 3 ? obj.isSale = '1' : "";
                        this.form.suitType == 4 || this.form.suitType == 5 ? obj.sendNum = 0 : "";
                        this.form.wxSuitCommodityList.push(obj);
                        this.openGoods = false;
                        console.log(this.form.wxSuitCommodityList, "this.form.wxSuitCommodityList");
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
                this.form.boxNum = 1;
                this.form.button = [];
                this.form.drawNum = [];
                this.form.price = null;
                this.form.integral = null;
                if(this.form.suitType == 5) {
                    this.form.levelUpId = this.levelOptions[0].id;
                    this.form.levelId = this.levelOptions[this.levelOptions.length - 1].id;
                } else {
                    this.form.levelId = null;
                    this.form.levelUpId = null;
                }
                this.form.wxSuitCommodityList = this.form.wxSuitCommodityList.map(item => {
                    item.isSale = '1';
                    item.isSend = '0';
                    item.isDouble = "0";
                    item.sendNum = null;
                    return item;
                });
                if (this.form.suitType == 4 || this.form.suitType == 5) {
                    this.form.wxSuitCommodityList = this.form.wxSuitCommodityList.map(item => {
                        item.isSale = "1";
                        item.isSend = "0";
                        item.isDouble = "0";
                        item.sendNum = 1;
                        return item;
                    });
                }
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
                overflow: hidden;
                text-align: center;
                position: relative;
                border-radius: 10px;
                box-sizing: border-box;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

                .sm-list-item-text {
                    width: 100%;
                    display: flex;
                    font-size: 12px;
                    padding: 5px 10px;
                    box-sizing: border-box;
                    justify-content: space-between;
                }

                .sm-list-item-salesType {
                    top: 0;
                    right: 0;
                    font-size: 12px;
                    color: #FFFFFF;
                    padding: 5px 20px;
                    position: absolute;
                    background: #9442ffad;
                    border-bottom-left-radius: 10px;
                }

                .sm-list-item-type {
                    left: 50%;
                    top: 230px;
                    font-size: 12px;
                    color: #ffffff;
                    padding: 8px 15px;
                    position: absolute;
                    border-radius: 5px;
                    transform: translate(-50%, -50%);
                    background: rgba(61, 184, 176, 0.67);
                }

                .sm-list-item-tips {
                    top: 0;
                    left: 0;
                    z-index: 10;
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

                .sm-list-item-Fun {
                    top: 0;
                    left: 0;
                    z-index: 20;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    color: #FFFFFF;
                    position: absolute;
                    align-items: center;
                    border-radius: 10px;
                    transition: all 0.3s;
                    background: #00000000;
                    justify-content: space-around;

                    >i {
                        cursor: pointer;
                        transform: translateY(8em);
                    }

                    >i:nth-of-type(1) {
                        transition: all 0.3s;
                    }

                    >i:nth-of-type(2) {
                        transition: all 0.4s;
                    }

                    >i:nth-of-type(3) {
                        transition: all 0.5s;
                    }
                }
            }

            .sm-list-item:hover {
                .sm-list-item-Fun {
                    background: #000000a2;

                    >i {
                        transform: translateY(0%);
                    }
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

.dialog-submit {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    box-sizing: border-box;
    justify-content: center;
}
</style>