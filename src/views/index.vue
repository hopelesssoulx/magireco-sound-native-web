<template>
  <div class="index">
    <el-tabs @tab-click="catrgoryChange">
      <el-tab-pane
        v-for="(category, item, idx) in soundNative"
        :label="item"
      ></el-tab-pane>
    </el-tabs>

    <el-tabs @tab-click="sectionChange">
      <el-tab-pane
        v-for="(category, item, idx) in categoryData"
        :label="item"
      ></el-tab-pane>
    </el-tabs>

    <el-table v-if="list.length" :data="list" stripe height="770">
      <el-table-column type="selection" fixed />
      <!-- <el-table-column prop="name" label="文件名" fixed width="260" /> -->
      <el-table-column label="文件名" fixed width="260">
        <template #default="scope">
          <div @click="fileClick(scope)">
            {{ scope.row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="" fixed width="360">
        <template #default="scope">
          <div>
            <audio controls :src="audioList[scope.$index]"></audio>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="character" label="角色" />
      <el-table-column prop="ori" label="原文" />
      <el-table-column prop="chs" label="中文" />
      <el-table-column prop="eng" label="英语" />
      <el-table-column prop="otherLanguage" label="其他语言" />
      <el-table-column prop="remark" label="备注" />
    </el-table>
  </div>
</template>

<script>
import * as commonApi from "../api/common.js";
import { hcaStr } from "../utils/hcaStr";
export default {
  data() {
    return {
      soundNative: {},
      category: "",
      categoryData: {},
      section: "",
      list: [],
      audioList: [],
      currentClick: -1,

      hcaJsUrl: new URL(hcaStr, document.baseURI),
    };
  },
  created() {
    this.getSoundNative();

    // console.log(JSON.parse(JSON.stringify()));
  },
  methods: {
    catrgoryChange(tab, event) {
      let that = this;
      that.category = tab.props.label;
      that.categoryData = that.soundNative[that.category];
    },
    sectionChange(tab, event) {
      let that = this;
      that.section = tab.props.label;
      that.list = that.categoryData[that.section];
    },
    fileClick(scope) {
      let that = this;
      that.currentClick = scope.$index;
      that.getFile(that.section + "/" + scope.row.name);
    },

    getSoundNative() {
      let that = this;
      commonApi.getList().then((res) => {
        that.soundNative = res.data;
      });
    },
    async getFile(path) {
      let that = this;
      let res = await fetch("http://127.0.0.1:16168/getFile/" + path);
      that.decryptAndDecode(res);
    },
    async decryptAndDecode(hca) {
      let that = this;
      let res = await fetch(that.hcaJsUrl.href);
      let blob = new Blob([await res.arrayBuffer()], {
        type: "text/javascript",
      });
      let hcaJsObjUrl = URL.createObjectURL(blob);
      let hcaJsModule = await import(hcaJsObjUrl);
      let HCAWorker = hcaJsModule.HCAWorker;
      let worker = await HCAWorker.create(hcaJsObjUrl);

      let ab = await hca.arrayBuffer();
      let buffer = new Uint8Array(ab);

      let decrypted = await worker.decrypt(
        buffer.slice(0),
        "0x01395C51",
        "0x00000000"
      );
      let wav = await worker.decode(decrypted, 16);
      await worker.shutdown();

      let tmpUrl = URL.createObjectURL(
        new Blob([wav], { type: "audio/x-wav" })
      );

      that.audioList[that.currentClick] = tmpUrl;
    },
  },
};
</script>

<style lang="scss" scoped></style>
