<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="小程序用户id" prop="openId">
        <el-input
          v-model="queryParams.openId"
          placeholder="请输入小程序用户id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易场所：1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区" prop="floor">
        <el-input
          v-model="queryParams.floor"
          placeholder="请输入交易场所：1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易金额" prop="money">
        <el-input
          v-model="queryParams.money"
          placeholder="请输入交易金额"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品id(多个用逗号分割)" prop="commodityId">
        <el-input
          v-model="queryParams.commodityId"
          placeholder="请输入商品id(多个用逗号分割)"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易人/被交易人" prop="tradeNick">
        <el-input
          v-model="queryParams.tradeNick"
          placeholder="请输入交易人/被交易人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['tradeRecord:tradeRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['tradeRecord:tradeRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['tradeRecord:tradeRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['tradeRecord:tradeRecord:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tradeRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="小程序用户id" align="center" prop="openId" />
      <el-table-column label="交易场所：1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区" align="center" prop="floor" />
      <el-table-column label="充值方式：微信支付，余额支付" align="center" prop="type" />
      <el-table-column label="交易金额" align="center" prop="money" />
      <el-table-column label="支出/收入" align="center" prop="payType" />
      <el-table-column label="商品id(多个用逗号分割)" align="center" prop="commodityId" />
      <el-table-column label="交易人/被交易人" align="center" prop="tradeNick" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['tradeRecord:tradeRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['tradeRecord:tradeRecord:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改用户交易记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="小程序用户id" prop="openId">
          <el-input v-model="form.openId" placeholder="请输入小程序用户id" />
        </el-form-item>
        <el-form-item label="交易场所：1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区" prop="floor">
          <el-input v-model="form.floor" placeholder="请输入交易场所：1-商城、2-全局套，3-打拳套，4-无限池，5-攀塔，9-交易区" />
        </el-form-item>
        <el-form-item label="交易金额" prop="money">
          <el-input v-model="form.money" placeholder="请输入交易金额" />
        </el-form-item>
        <el-form-item label="商品id(多个用逗号分割)" prop="commodityId">
          <el-input v-model="form.commodityId" placeholder="请输入商品id(多个用逗号分割)" />
        </el-form-item>
        <el-form-item label="交易人/被交易人" prop="tradeNick">
          <el-input v-model="form.tradeNick" placeholder="请输入交易人/被交易人" />
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
import { listTradeRecord, getTradeRecord, delTradeRecord, addTradeRecord, updateTradeRecord } from "@/api/tradeRecord/tradeRecord";

export default {
  name: "TradeRecord",
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
      // 用户交易记录表格数据
      tradeRecordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        openId: null,
        floor: null,
        type: null,
        money: null,
        payType: null,
        commodityId: null,
        tradeNick: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        openId: [
          { required: true, message: "小程序用户id不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户交易记录列表 */
    getList() {
      this.loading = true;
      listTradeRecord(this.queryParams).then(response => {
        this.tradeRecordList = response.rows;
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
        floor: null,
        type: null,
        money: null,
        payType: null,
        commodityId: null,
        tradeNick: null,
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户交易记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTradeRecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改用户交易记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTradeRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTradeRecord(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除用户交易记录编号为"' + ids + '"的数据项？').then(function() {
        return delTradeRecord(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('tradeRecord/tradeRecord/export', {
        ...this.queryParams
      }, `tradeRecord_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
