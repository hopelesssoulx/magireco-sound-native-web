<template>
  <div class="index">
    <el-tabs v-model="activeTabName" @tab-click="tabClick">
      <el-tab-pane
        :label="index"
        :name="index"
        v-for="(listDetail, index) in list"
      >
        <div
          v-for="(item, index2) in listDetail"
          @click="fileClick(index + '/' + item)"
        >
          {{ item }}
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as commonApi from "../api/common.js";
export default {
  data() {
    return {
      list: [],
      activeTabName: "",
    };
  },
  created() {
    this.getList();
  },
  methods: {
    fileClick(path) {
      let that = this;
      that.getFile(path);
    },
    tabClick(tab, event) {
      console.log(tab, event);
    },
    getList() {
      let that = this;
      commonApi.getList().then((res) => {
        that.list = res.data;
      });
    },
    getFile(path) {
      let that = this;
      commonApi.getFile(path).then((res) => {
        console.log(res);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  padding: 20px;
  background-color: #f8f8f8;
}
</style>
